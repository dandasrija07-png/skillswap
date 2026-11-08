/**
 * Real-Time Socket.IO & Notification Automated Verification Suite
 * 
 * Tests multi-client real-time messaging, presence tracking,
 * server-side authorization enforcement, and persistent notifications
 * between two student accounts (Aarav Sharma and Priya Iyer)
 * plus an unauthorized third student (Ananya Deshmukh).
 */

import http from 'http';
import { io as ClientIO } from '../../../frontend/node_modules/socket.io-client/build/esm/index.js';
import { app, server, io } from '../server.js';
import { getMemoryStore } from '../config/db.js';

const TEST_PORT = 5066;
const BASE_URL = `http://127.0.0.1:${TEST_PORT}`;

let studentAToken = null;
let studentBToken = null;
let studentCToken = null; // Unauthorized user (no active exchange or session)

let socketA = null;
let socketB = null;
let socketC = null;

const results = [];

function assert(condition, testName, details = '') {
  if (condition) {
    results.push({ name: testName, passed: true, details });
    console.log(`  ✅ [PASS] ${testName}`);
  } else {
    results.push({ name: testName, passed: false, details });
    console.error(`  ❌ [FAIL] ${testName} - ${details}`);
  }
}

async function restPost(path, body, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => null);
  return { status: res.status, data };
}

async function restGet(path, token = null) {
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'GET',
    headers,
  });

  const data = await res.json().catch(() => null);
  return { status: res.status, data };
}

async function restPut(path, body = {}, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => null);
  return { status: res.status, data };
}

function connectSocket(token) {
  return new Promise((resolve, reject) => {
    const socket = ClientIO(BASE_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: false,
    });

    const timer = setTimeout(() => {
      resolve(socket);
    }, 2000);

    socket.on('connect', () => {
      clearTimeout(timer);
      resolve(socket);
    });

    socket.on('connect_error', (err) => {
      clearTimeout(timer);
      resolve({ error: err.message, socket });
    });
  });
}

async function runSocketVerification() {
  console.log('===============================================================');
  console.log('⚡ SKILLSWAP REAL-TIME SOCKET.IO & NOTIFICATION VERIFICATION');
  console.log('===============================================================\n');

  try {
    // 1. Start Server on isolated port
    await new Promise((resolve) => {
      server.listen(TEST_PORT, () => {
        console.log(`📡 Real-Time test server listening on ${BASE_URL}\n`);
        resolve();
      });
    });

    // 2. Authenticate Three Distinct Student Accounts
    console.log('--- 1. REST Authentication & JWT Issuance ---');

    // Student A: Aarav Sharma (ID: 1)
    const loginA = await restPost('/api/auth/login', {
      email: 'aarav.sharma@dtu.ac.in',
      password: 'Password@123',
    });
    studentAToken = loginA.data?.data?.token;
    assert(loginA.status === 200 && studentAToken, 'Student A (Aarav Sharma, ID 1) logged in via REST');

    // Student B: Priya Iyer (ID: 2)
    const loginB = await restPost('/api/auth/login', {
      email: 'priya.iyer@vit.ac.in',
      password: 'Password@123',
    });
    studentBToken = loginB.data?.data?.token;
    assert(loginB.status === 200 && studentBToken, 'Student B (Priya Iyer, ID 2) logged in via REST');

    // Student C: Ananya Deshmukh (ID: 6) - Unauthorized stranger
    const loginC = await restPost('/api/auth/login', {
      email: 'ananya.d@coep.ac.in',
      password: 'Password@123',
    });
    studentCToken = loginC.data?.data?.token;
    assert(loginC.status === 200 && studentCToken, 'Student C (Ananya Deshmukh, ID 6) logged in via REST');

    // 3. Authenticated Socket.IO Connections & Handshake Security
    console.log('\n--- 2. Authenticated Socket.IO Connections ---');

    socketA = await connectSocket(studentAToken);
    assert(socketA?.connected, 'Socket A connected and authenticated via JWT');

    // Verify invalid token handshake is rejected
    const invalidSocketRes = await connectSocket('invalid.tampered.token');
    assert(
      invalidSocketRes.error?.includes('Authentication failed'),
      'Socket handshake with invalid token rejected with authentication error'
    );
    if (invalidSocketRes.socket?.connected) invalidSocketRes.socket.disconnect();

    // 4. Online Presence Tracking & Broadcast
    console.log('\n--- 3. Real-Time Online Presence Tracking ---');

    // Set up presence listener on Socket A before Socket B connects
    const statusPromise = new Promise((resolve) => {
      socketA.on('user_status_changed', (payload) => {
        resolve(payload);
      });
    });

    socketB = await connectSocket(studentBToken);
    assert(socketB?.connected, 'Socket B connected and authenticated via JWT');

    const statusPayload = await Promise.race([
      statusPromise,
      new Promise((r) => setTimeout(() => r(null), 2000)),
    ]);

    assert(
      statusPayload && statusPayload.userId === 2 && statusPayload.isOnline === true,
      'Socket A received user_status_changed notification when Socket B came online',
      JSON.stringify(statusPayload)
    );

    // Test check_online_status event
    const presenceCheck = await new Promise((resolve) => {
      socketA.emit('check_online_status', [1, 2, 6], (response) => {
        resolve(response);
      });
    });

    assert(
      presenceCheck?.status === 'success' &&
        presenceCheck.onlineStatus[1] === true &&
        presenceCheck.onlineStatus[2] === true &&
        presenceCheck.onlineStatus[6] === false,
      'check_online_status accurately identifies online vs offline peers',
      JSON.stringify(presenceCheck)
    );

    // 5. One-to-One Peer Messaging (Authorized)
    console.log('\n--- 4. One-to-One Peer Messaging (Authorized) ---');

    const messagePromise = new Promise((resolve) => {
      socketB.on('receive_message', (msg) => {
        resolve(msg);
      });
    });

    const notifPromise = new Promise((resolve) => {
      socketB.on('notification_received', (notif) => {
        resolve(notif);
      });
    });

    // Socket A sends message to Socket B
    const sendResult = await new Promise((resolve) => {
      socketA.emit(
        'send_message',
        {
          receiverId: 2,
          messageText: 'Hello Priya, this is a live test from Socket A!',
          exchangeRequestId: 1,
        },
        (ack) => {
          resolve(ack);
        }
      );
    });

    assert(sendResult?.status === 'success', 'Socket A received successful acknowledgement from server for message');

    const receivedMessage = await Promise.race([
      messagePromise,
      new Promise((r) => setTimeout(() => r(null), 2500)),
    ]);

    assert(
      receivedMessage &&
        receivedMessage.message_text === 'Hello Priya, this is a live test from Socket A!' &&
        receivedMessage.senderName === 'Aarav Sharma',
      'Socket B received real-time peer message with correct text and sender identity'
    );

    const receivedNotif = await Promise.race([
      notifPromise,
      new Promise((r) => setTimeout(() => r(null), 2500)),
    ]);

    assert(
      receivedNotif &&
        receivedNotif.type === 'new_message' &&
        receivedNotif.title?.includes('Aarav Sharma'),
      'Socket B received real-time new_message notification push'
    );

    // Verify MySQL/Memory persistence of the message
    const store = getMemoryStore();
    const storedMsg = store.messages.find(
      (m) => m.sender_id === 1 && m.receiver_id === 2 && m.message_text.includes('live test from Socket A')
    );
    assert(storedMsg !== undefined, 'Live Socket.IO message was persistently stored in MySQL/memory store');

    // 6. Server-Side Chat Authorization (Unauthorized Stranger Rejected)
    console.log('\n--- 5. Server-Side Authorization Enforcement ---');

    socketC = await connectSocket(studentCToken);
    assert(socketC?.connected, 'Socket C (Student 6, Ananya) connected');

    // Student A tries to message Student C (Unauthorized: no exchange request & no session)
    const unauthorizedChatResult = await new Promise((resolve) => {
      socketA.emit(
        'send_message',
        {
          receiverId: 6,
          messageText: 'Hey Ananya, let me try chatting with you uninvited.',
        },
        (ack) => {
          resolve(ack);
        }
      );
    });

    assert(
      unauthorizedChatResult?.status === 'error' &&
        unauthorizedChatResult.code === 403 &&
        unauthorizedChatResult.message.includes('Chat is only permitted between students with an active exchange proposal'),
      'Server strictly rejected unauthorized chat attempt between non-exchange students with 403 error callback'
    );

    // Verify REST API endpoint also rejects unauthorized chat attempt
    const restUnauthorizedMsg = await restPost(
      '/api/messages',
      {
        receiverId: 6,
        messageText: 'Trying REST unauthorized chat bypass.',
      },
      studentAToken
    );

    assert(
      restUnauthorizedMsg.status === 403,
      'REST POST /api/messages strictly rejects unauthorized chat with 403 Forbidden'
    );

    // Verify REST GET /api/messages/:partnerId rejects unauthorized thread access
    const restUnauthorizedThread = await restGet('/api/messages/6', studentAToken);
    assert(
      restUnauthorizedThread.status === 403,
      'REST GET /api/messages/6 rejects unauthorized conversation thread access with 403'
    );

    // 7. Study Room Protection
    console.log('\n--- 6. Session Study Room Access Protection ---');

    // Student A joins Session 1 (Authorized: Aarav is partner in Session 1)
    const roomJoinA = await new Promise((resolve) => {
      socketA.emit('join_study_room', { sessionId: 1 }, (ack) => {
        resolve(ack);
      });
    });

    assert(
      roomJoinA?.status === 'success' && roomJoinA.room === 'session_1',
      'Authorized participant (Student A) successfully joined study room session_1'
    );

    // Student C tries to join Session 1 (Unauthorized: Ananya is NOT a participant)
    const roomJoinC = await new Promise((resolve) => {
      socketC.emit('join_study_room', { sessionId: 1 }, (ack) => {
        resolve(ack);
      });
    });

    assert(
      roomJoinC?.status === 'error' &&
        roomJoinC.code === 403 &&
        roomJoinC.message.includes('Unauthorized'),
      'Unauthorized student (Student C) strictly denied entry to session_1 study room with 403'
    );

    // 8. Typing Indicators
    console.log('\n--- 7. Real-Time Typing Indicators ---');

    const typingPromise = new Promise((resolve) => {
      socketB.once('partner_typing', (payload) => {
        resolve(payload);
      });
    });

    socketA.emit('typing_start', { receiverId: 2 });

    const typingPayload = await Promise.race([
      typingPromise,
      new Promise((r) => setTimeout(() => r(null), 2000)),
    ]);

    assert(
      typingPayload && typingPayload.senderId === 1 && typingPayload.isTyping === true,
      'Socket B received partner_typing start indicator from Socket A'
    );

    const stopTypingPromise = new Promise((resolve) => {
      socketB.once('partner_typing', (payload) => {
        resolve(payload);
      });
    });

    socketA.emit('typing_stop', { receiverId: 2 });

    const stopTypingPayload = await Promise.race([
      stopTypingPromise,
      new Promise((r) => setTimeout(() => r(null), 2000)),
    ]);

    assert(
      stopTypingPayload && stopTypingPayload.isTyping === false,
      'Socket B received partner_typing stop indicator from Socket A'
    );

    // 9. Real-Time Lifecycle Notifications
    console.log('\n--- 8. Real-Time Lifecycle Notifications (All 6 Event Types) ---');

    // EVENT 1: New exchange proposal (request_received)
    const notifReqPromise = new Promise((resolve) => {
      socketB.once('notification_received', (n) => resolve(n));
    });

    const newReqRes = await restPost(
      '/api/requests',
      {
        receiverId: 2,
        offeredSkill: 'TypeScript Fundamentals',
        requestedSkill: 'Figma Auto-Layout & UI Systems',
        proposedHours: '2 hrs / weekend',
        personalMessage: 'Excited to swap TypeScript for Figma skills!',
      },
      studentAToken
    );

    // In case there was already an active request, handle gracefully
    let sentReqId = newReqRes.data?.data?.id;
    if (!sentReqId) {
      // Find active request
      sentReqId = store.exchange_requests.find((r) => r.sender_id === 2 && r.receiver_id === 1)?.id;
    }

    const notifReq = await Promise.race([
      notifReqPromise,
      new Promise((r) => setTimeout(() => r(null), 2000)),
    ]);

    assert(
      notifReq && notifReq.type === 'request_received',
      'Event 1: Real-time notification received on Socket B for new exchange request (request_received)'
    );

    // EVENT 2: Request accepted (request_accepted)
    // Priya (Student B) sent request 1 to Aarav (Student A).
    // When Aarav accepts, Priya (Socket B) receives request_accepted notification!
    const notifAcceptPromise = new Promise((resolve) => {
      socketB.once('notification_received', (n) => resolve(n));
    });

    // Accept request #1 (sent by Priya to Aarav)
    await restPut('/api/requests/1/accept', {}, studentAToken);

    const notifAccept = await Promise.race([
      notifAcceptPromise,
      new Promise((r) => setTimeout(() => r(null), 2500)),
    ]);

    assert(
      notifAccept && notifAccept.type === 'request_accepted',
      'Event 2: Real-time notification received on Socket A when proposal was accepted (request_accepted)'
    );

    // EVENT 3: Session scheduled (session_scheduled)
    const notifSchedPromise = new Promise((resolve) => {
      socketB.once('notification_received', (n) => resolve(n));
    });

    const schedRes = await restPost(
      '/api/sessions',
      {
        partnerId: 2,
        topic: 'React.js & Hooks',
        sessionDate: '2026-11-20',
        startTime: '15:00:00',
        durationMinutes: 60,
        mode: 'Online',
        locationOrLink: 'https://meet.skillswap.edu/room/aarav-priya-live',
      },
      studentAToken
    );

    const schedSessionId = schedRes.data?.data?.id;

    const notifSched = await Promise.race([
      notifSchedPromise,
      new Promise((r) => setTimeout(() => r(null), 2000)),
    ]);

    assert(
      notifSched && notifSched.type === 'session_scheduled',
      'Event 3: Real-time notification received on Socket B for scheduled session (session_scheduled)'
    );

    // EVENT 4: Session rescheduled (session_rescheduled)
    const notifReschedPromise = new Promise((resolve) => {
      socketB.once('notification_received', (n) => resolve(n));
    });

    await restPut(
      `/api/sessions/${schedSessionId}/reschedule`,
      {
        newDate: '2026-11-21',
        newTime: '16:00:00',
        reason: 'Adjusting for lab hours',
      },
      studentAToken
    );

    const notifResched = await Promise.race([
      notifReschedPromise,
      new Promise((r) => setTimeout(() => r(null), 2000)),
    ]);

    assert(
      notifResched && notifResched.type === 'session_rescheduled',
      'Event 4: Real-time notification received on Socket B when session was rescheduled (session_rescheduled)'
    );

    // EVENT 5: Session cancelled (session_cancelled)
    const notifCancelPromise = new Promise((resolve) => {
      socketB.once('notification_received', (n) => resolve(n));
    });

    await restPut(
      `/api/sessions/${schedSessionId}/cancel`,
      { reason: 'Moved to next semester' },
      studentAToken
    );

    const notifCancel = await Promise.race([
      notifCancelPromise,
      new Promise((r) => setTimeout(() => r(null), 2000)),
    ]);

    assert(
      notifCancel && notifCancel.type === 'session_cancelled',
      'Event 4b: Real-time notification received on Socket B when session was cancelled (session_cancelled)'
    );

    // EVENT 6: Session completion confirmation (session_completed / session_confirmation_needed)
    // Create fresh upcoming session on a future open slot
    const sessToComplete = await restPost(
      '/api/sessions',
      {
        partnerId: 2,
        topic: 'Figma Auto-Layout & UI Systems',
        sessionDate: '2026-11-28',
        startTime: '10:00:00',
        durationMinutes: 60,
        mode: 'Online',
      },
      studentAToken
    );
    const completedSessionId = sessToComplete.data?.data?.id;

    // Student A confirms completion -> Student B receives session_confirmation_needed
    const notifConfNeededPromise = new Promise((resolve) => {
      socketB.once('notification_received', (n) => resolve(n));
    });

    await restPut(`/api/sessions/${completedSessionId}/confirm`, {}, studentAToken);

    const notifConfNeeded = await Promise.race([
      notifConfNeededPromise,
      new Promise((r) => setTimeout(() => r(null), 2500)),
    ]);

    assert(
      notifConfNeeded && notifConfNeeded.type === 'session_confirmation_needed',
      'Event 6a: Notification received for partner completion confirmation needed'
    );

    // Student B confirms completion -> Student A receives session_completed
    const notifCompletedPromise = new Promise((resolve) => {
      socketA.once('notification_received', (n) => resolve(n));
    });

    await restPut(`/api/sessions/${completedSessionId}/confirm`, {}, studentBToken);

    const notifCompleted = await Promise.race([
      notifCompletedPromise,
      new Promise((r) => setTimeout(() => r(null), 2500)),
    ]);

    assert(
      notifCompleted && notifCompleted.type === 'session_completed',
      'Event 6b: Notification received when both confirmed and credits released (session_completed)'
    );

    // 10. Unread Counts & Read Receipts
    console.log('\n--- 9. Notification Unread Counts & Mark-as-Read ---');

    const notifsBefore = await restGet('/api/notifications', studentBToken);
    const unreadBefore = notifsBefore.data?.data?.unreadCount || 0;
    assert(unreadBefore > 0, `Unread notifications correctly tracked (count: ${unreadBefore})`);

    const markAllRes = await restPut('/api/notifications/read-all', {}, studentBToken);
    assert(markAllRes.status === 200, 'PUT /api/notifications/read-all successfully executed');

    const notifsAfter = await restGet('/api/notifications', studentBToken);
    assert(
      notifsAfter.data?.data?.unreadCount === 0,
      'Unread notifications count reset to 0 after mark-all-read'
    );

    // 11. Presence Cleanup on Disconnect
    console.log('\n--- 10. Presence Cleanup on Disconnect ---');

    const offlinePromise = new Promise((resolve) => {
      socketA.on('user_status_changed', (payload) => {
        if (payload.userId === 2 && payload.isOnline === false) {
          resolve(payload);
        }
      });
    });

    socketB.disconnect();

    const offlinePayload = await Promise.race([
      offlinePromise,
      new Promise((r) => setTimeout(() => r(null), 2000)),
    ]);

    assert(
      offlinePayload && offlinePayload.userId === 2 && offlinePayload.isOnline === false,
      'Socket A received user_status_changed with isOnline: false when Socket B disconnected'
    );

  } catch (err) {
    console.error('Unexpected test exception:', err);
    assert(false, 'Unexpected test crash', err.message);
  } finally {
    if (socketA?.connected) socketA.disconnect();
    if (socketB?.connected) socketB.disconnect();
    if (socketC?.connected) socketC.disconnect();

    await new Promise((resolve) => {
      server.close(() => {
        console.log('\n🛑 Test server stopped.');
        resolve();
      });
    });

    const passedCount = results.filter((r) => r.passed).length;
    const totalCount = results.length;
    const passPercentage = ((passedCount / totalCount) * 100).toFixed(1);

    console.log('\n===============================================================');
    console.log(`📊 REAL-TIME SOCKET.IO RESULT: ${passedCount}/${totalCount} PASSED (${passPercentage}%)`);
    if (passedCount === totalCount) {
      console.log('🎉 100% OF REAL-TIME CHAT & NOTIFICATION REQUIREMENTS VERIFIED!');
    } else {
      console.error(`❌ ${totalCount - passedCount} TEST(S) FAILED`);
    }
    console.log('===============================================================\n');

    process.exit(passedCount === totalCount ? 0 : 1);
  }
}

runSocketVerification();
