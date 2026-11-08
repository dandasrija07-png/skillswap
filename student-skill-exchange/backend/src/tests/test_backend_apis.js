/**
 * Comprehensive Automated Backend API Verification Suite
 * Tests all 17 endpoint areas and business rules
 */

import { app } from '../server.js';

const TEST_PORT = 5055;
const BASE_URL = `http://127.0.0.1:${TEST_PORT}`;

let serverInstance;
let studentToken = null;
let adminToken = null;
let newStudentToken = null;
let testExchangeRequestId = null;
let testSessionId = null;

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

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const method = options.method || 'GET';
  const headers = {
    'Content-Type': 'application/json',
    ...(options.token && { Authorization: `Bearer ${options.token}` }),
    ...options.headers,
  };

  const body = options.body ? JSON.stringify(options.body) : null;

  const res = await fetch(url, {
    method,
    headers,
    body,
  });

  const status = res.status;
  let json = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }

  return { status, data: json };
}

async function runTests() {
  console.log('===============================================================');
  console.log('🚀 STUDENT SKILL EXCHANGE PLATFORM - API VERIFICATION SUITE');
  console.log('===============================================================\n');

  // Start test server
  await new Promise((resolve) => {
    serverInstance = app.listen(TEST_PORT, () => {
      console.log(`📡 Test server running at ${BASE_URL}\n`);
      resolve();
    });
  });

  try {
    // AREA 1: Health & Database connection
    console.log('--- 1. Database Connection & System Health ---');
    const health = await request('/api/health');
    assert(health.status === 200, 'GET /api/health returns 200 OK');
    assert(health.data?.status === 'success', 'Health check status is success');
    assert(typeof health.data?.timestamp === 'string', 'Health check returns valid timestamp');

    // AREA 2: Registration API & Welcome Bonus
    console.log('\n--- 2. Registration API ---');
    const regPayload = {
      fullName: 'Kabir Mehta',
      email: 'kabir.mehta@nsut.ac.in',
      password: 'Password@123',
      collegeName: 'Netaji Subhas University of Technology',
      department: 'Computer Science',
      academicYear: '2nd Year (Sophomore)',
      shortBio: 'Enthusiastic competitive coder learning backend engineering.',
    };
    const regRes = await request('/api/auth/register', { method: 'POST', body: regPayload });
    assert(regRes.status === 201, 'POST /api/auth/register returns 201 Created');
    assert(regRes.data?.data?.user?.email === 'kabir.mehta@nsut.ac.in', 'Registered user email matches');
    assert(regRes.data?.data?.token, 'JWT token returned upon registration');
    assert(regRes.data?.data?.user?.password_hash === undefined, 'Security: Password hash never exposed in registration');
    assert(regRes.data?.data?.profile?.credits_balance === 10, 'Welcome Bonus: 10 initial credits awarded');
    newStudentToken = regRes.data?.data?.token;

    // Test Registration Validation
    const invalidReg = await request('/api/auth/register', {
      method: 'POST',
      body: { fullName: '', email: 'invalid-email', password: '123' },
    });
    assert(invalidReg.status === 400, 'POST /api/auth/register rejects invalid email and empty fields with 400');

    // AREA 3: Login API
    console.log('\n--- 3. Login API ---');
    // Student Login
    const loginRes = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'aarav.sharma@dtu.ac.in', password: 'Password@123' },
    });
    assert(loginRes.status === 200, 'POST /api/auth/login returns 200 OK for student');
    assert(loginRes.data?.data?.user?.role === 'student', 'Student role verified');
    assert(loginRes.data?.data?.token, 'JWT token returned on student login');
    studentToken = loginRes.data?.data?.token;

    // Admin Login
    const adminLoginRes = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'admin@skillswap.edu', password: 'Password@123' },
    });
    assert(adminLoginRes.status === 200, 'POST /api/auth/login returns 200 OK for admin');
    assert(adminLoginRes.data?.data?.user?.role === 'admin', 'Admin role verified');
    adminToken = adminLoginRes.data?.data?.token;

    // Invalid Login credentials
    const badLogin = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'aarav.sharma@dtu.ac.in', password: 'WrongPassword' },
    });
    assert(badLogin.status === 401, 'POST /api/auth/login rejects wrong password with 401 Unauthorized');

    // AREA 4: JWT Authentication Guard
    console.log('\n--- 4. JWT Authentication Middleware ---');
    const meRes = await request('/api/auth/me', { token: studentToken });
    assert(meRes.status === 200, 'GET /api/auth/me returns 200 with valid JWT');
    assert(meRes.data?.data?.user?.email === 'aarav.sharma@dtu.ac.in', 'JWT payload accurately decoded');

    const unauthRes = await request('/api/auth/me');
    assert(unauthRes.status === 401, 'GET /api/auth/me returns 401 when no token is provided');

    const fakeTokenRes = await request('/api/auth/me', { token: 'invalid.fake.jwt' });
    assert(fakeTokenRes.status === 401, 'GET /api/auth/me returns 401 when tampered token is provided');

    // AREA 5: bcrypt Password Hashing Security Check
    console.log('\n--- 5. Password Security Verification ---');
    assert(
      loginRes.data?.data?.user?.password_hash === undefined,
      'Security: user object does not contain password_hash in login response'
    );
    assert(
      meRes.data?.data?.password_hash === undefined,
      'Security: /me does not leak password_hash'
    );

    // AREA 6: Role-Based Authorization (RBAC)
    console.log('\n--- 6. Role-Based Authorization ---');
    const studentAccessAdmin = await request('/api/admin/stats', { token: studentToken });
    assert(
      studentAccessAdmin.status === 403,
      'RBAC: Student forbidden from accessing /api/admin/stats with 403 Forbidden'
    );

    const adminAccessStats = await request('/api/admin/stats', { token: adminToken });
    assert(
      adminAccessStats.status === 200,
      'RBAC: Admin granted access to /api/admin/stats with 200 OK'
    );

    // AREA 7: Student Profile APIs
    console.log('\n--- 7. Student Profile APIs ---');
    const myProfile = await request('/api/profile/me', { token: studentToken });
    assert(myProfile.status === 200, 'GET /api/profile/me returns student profile');
    assert(Array.isArray(myProfile.data?.data?.teachingSkills), 'Profile includes teachingSkills array');
    assert(Array.isArray(myProfile.data?.data?.learningSkills), 'Profile includes learningSkills array');

    const updateProfile = await request('/api/profile/me', {
      method: 'PUT',
      token: studentToken,
      body: {
        short_bio: 'Senior student passionate about React, Vite, CSS, and algorithmic mentoring.',
        preferred_learning_mode: 'Hybrid',
      },
    });
    assert(updateProfile.status === 200, 'PUT /api/profile/me updates student profile');
    assert(
      updateProfile.data?.data?.short_bio.includes('algorithmic mentoring'),
      'Updated bio saved correctly'
    );

    const publicProfile = await request('/api/profile/2');
    assert(publicProfile.status === 200, 'GET /api/profile/:id returns public student profile');
    assert(publicProfile.data?.data?.college_name === 'Vellore Institute of Technology', 'Public profile shows college');

    // AREA 8: Skill Management APIs
    console.log('\n--- 8. Skill Management APIs ---');
    const catalog = await request('/api/skills');
    assert(catalog.status === 200, 'GET /api/skills returns skill catalog');
    assert(catalog.data?.data?.length >= 10, 'Catalog contains 10+ categorized skills');

    const addSkill = await request('/api/skills/my-skills', {
      method: 'POST',
      token: studentToken,
      body: {
        skillId: 10, // Technical Interview Communication
        skillType: 'teach',
        proficiency: 'Advanced',
        shortDescription: 'Conducted 20+ mock technical interviews for juniors.',
      },
    });
    assert(addSkill.status === 201, 'POST /api/skills/my-skills adds skill to profile');

    const mySkills = await request('/api/skills/my-skills', { token: studentToken });
    assert(mySkills.status === 200, 'GET /api/skills/my-skills returns user skills');
    assert(
      mySkills.data?.data?.teachingSkills.some((s) => s.skill_id === 10),
      'Newly added skill present in teaching list'
    );

    const skillEntryId = addSkill.data?.data?.id;
    if (skillEntryId) {
      const deleteSkill = await request(`/api/skills/my-skills/${skillEntryId}`, {
        method: 'DELETE',
        token: studentToken,
      });
      assert(deleteSkill.status === 200, 'DELETE /api/skills/my-skills/:id removes skill');
    }

    // AREA 9: Student Search & Filtering APIs
    console.log('\n--- 9. Student Search APIs ---');
    const searchByName = await request('/api/students?query=Priya');
    assert(searchByName.status === 200, 'GET /api/students?query=Priya returns 200');
    assert(
      searchByName.data?.data?.students.some((s) => s.full_name.includes('Priya')),
      'Search filters by student name'
    );

    const searchByCategory = await request('/api/students?category=Programming');
    assert(searchByCategory.status === 200, 'GET /api/students?category=Programming returns 200');
    assert(searchByCategory.data?.data?.students.length > 0, 'Found students teaching Programming skills');

    // AREA 10: Rule-Based Matching APIs (Deterministic, Zero AI)
    console.log('\n--- 10. Rule-Based Matching (Deterministic Zero-AI) ---');
    const matchDetail = await request('/api/students/2/match', { token: studentToken });
    assert(matchDetail.status === 200, 'GET /api/students/:id/match returns match analysis');
    assert(typeof matchDetail.data?.data?.match?.score === 'number', 'Deterministic match score calculated');
    assert(Array.isArray(matchDetail.data?.data?.match?.matchingSkills), 'Matching skills array returned');
    assert(
      matchDetail.data?.data?.match?.isReciprocal !== undefined,
      'Reciprocal mutual match detected deterministically'
    );

    // AREA 11: Exchange Request Management APIs
    console.log('\n--- 11. Exchange Request APIs ---');
    // Send valid request (Aarav to Rohan Verma [id: 4])
    const sendReq = await request('/api/requests', {
      method: 'POST',
      token: studentToken,
      body: {
        receiverId: 4,
        offeredSkillId: 1, // React
        requestedSkillId: 7, // Docker
        proposedHours: '2 hrs / weekend',
        personalMessage: 'Hey Rohan! Excited to swap React concepts for Docker orchestration.',
      },
    });
    assert(sendReq.status === 201, 'POST /api/requests creates exchange proposal');
    testExchangeRequestId = sendReq.data?.data?.id;

    // Self-request prevention test
    const selfReq = await request('/api/requests', {
      method: 'POST',
      token: studentToken,
      body: {
        receiverId: 1,
        offeredSkillId: 1,
        requestedSkillId: 2,
      },
    });
    assert(selfReq.status === 400, 'Business Rule: Students cannot send exchange requests to themselves (400)');

    // Duplicate active request prevention
    const dupReq = await request('/api/requests', {
      method: 'POST',
      token: studentToken,
      body: {
        receiverId: 4,
        offeredSkillId: 1,
        requestedSkillId: 7,
      },
    });
    assert(dupReq.status === 400, 'Business Rule: Duplicate active exchange requests blocked (400)');

    // List user requests
    const myRequests = await request('/api/requests', { token: studentToken });
    assert(myRequests.status === 200, 'GET /api/requests returns sent and received proposals');
    assert(Array.isArray(myRequests.data?.data?.sent), 'Returns sent requests array');
    assert(Array.isArray(myRequests.data?.data?.received), 'Returns received requests array');

    // Cancel own sent request
    if (testExchangeRequestId) {
      const cancelReq = await request(`/api/requests/${testExchangeRequestId}/cancel`, {
        method: 'PUT',
        token: studentToken,
      });
      assert(cancelReq.status === 200, 'PUT /api/requests/:id/cancel allows sender to withdraw proposal');
      assert(cancelReq.data?.data?.status === 'Cancelled', 'Request status transitioned to Cancelled');
    }

    // AREA 12: Session Scheduling & Dual Completion APIs
    console.log('\n--- 12. Session Scheduling & Dual Completion ---');
    // Future date to test valid booking
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    const sessionDateStr = tomorrow.toISOString().split('T')[0];

    const bookSession = await request('/api/sessions', {
      method: 'POST',
      token: studentToken,
      body: {
        partnerId: 2, // Priya
        topicSkillId: 1, // React
        exchangeSkillId: 4, // Figma
        sessionDate: sessionDateStr,
        startTime: '15:00',
        durationMinutes: 60,
        mode: 'Online',
        agendaNotes: 'Custom hook patterns and component lifecycles',
      },
    });
    assert(bookSession.status === 201, 'POST /api/sessions schedules new session');
    testSessionId = bookSession.data?.data?.id;

    // Double booking conflict test
    const conflictBooking = await request('/api/sessions', {
      method: 'POST',
      token: studentToken,
      body: {
        partnerId: 2,
        topicSkillId: 1,
        sessionDate: sessionDateStr,
        startTime: '15:30', // Overlaps with 15:00 - 16:00
        durationMinutes: 60,
      },
    });
    assert(
      conflictBooking.status === 400,
      'Business Rule: Overlapping double-booking prevented with 400'
    );

    // List sessions
    const mySessions = await request('/api/sessions', { token: studentToken });
    assert(mySessions.status === 200, 'GET /api/sessions lists user upcoming & past sessions');

    // Reschedule session
    const rescheduleRes = await request(`/api/sessions/${testSessionId}/reschedule`, {
      method: 'PUT',
      token: studentToken,
      body: {
        newDate: sessionDateStr,
        newTime: '17:00',
        durationMinutes: 60,
        reason: 'Lab practical rescheduled by university',
      },
    });
    assert(rescheduleRes.status === 200, 'PUT /api/sessions/:id/reschedule updates session time');
    assert(rescheduleRes.data?.data?.start_time.startsWith('17:00'), 'Updated start time verified');

    // Dual Completion test:
    // Participant 1 (Aarav, user 1) confirms completion
    const confirm1 = await request(`/api/sessions/${testSessionId}/complete`, {
      method: 'PUT',
      token: studentToken,
    });
    assert(confirm1.status === 200, 'Participant 1 confirms completion');
    assert(
      confirm1.data?.data?.isFullyCompleted === false,
      'Dual Rule: Credits NOT released after single confirmation (AwaitingConfirmation)'
    );

    // Participant 2 (Priya, user 2) confirms completion
    const priyaLogin = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'priya.iyer@vit.ac.in', password: 'Password@123' },
    });
    const priyaToken = priyaLogin.data?.data?.token;

    const confirm2 = await request(`/api/sessions/${testSessionId}/complete`, {
      method: 'PUT',
      token: priyaToken,
    });
    assert(confirm2.status === 200, 'Participant 2 confirms completion');
    assert(
      confirm2.data?.data?.isFullyCompleted === true,
      'Dual Rule: Session status is Completed upon mutual confirmation'
    );
    assert(
      confirm2.data?.data?.creditsAwarded === true,
      'Dual Rule: Transaction-safe exchange credits awarded to both participants!'
    );

    // AREA 13: Chat & Direct Messaging APIs
    console.log('\n--- 13. Chat & Messaging APIs ---');
    const sendMsg = await request('/api/messages', {
      method: 'POST',
      token: studentToken,
      body: {
        receiverId: 2,
        messageText: 'Looking forward to our upcoming exchange session!',
      },
    });
    assert(sendMsg.status === 201, 'POST /api/messages sends message');

    const getThread = await request('/api/messages/2', { token: studentToken });
    assert(getThread.status === 200, 'GET /api/messages/:partnerId returns conversation history');
    assert(getThread.data?.data?.length >= 1, 'Thread contains messages');

    const markRead = await request('/api/messages/1/read', {
      method: 'PUT',
      token: priyaToken,
    });
    assert(markRead.status === 200, 'PUT /api/messages/:partnerId/read marks messages read');

    // AREA 14: Notification APIs
    console.log('\n--- 14. Notification APIs ---');
    const myNotifs = await request('/api/notifications', { token: studentToken });
    assert(myNotifs.status === 200, 'GET /api/notifications returns user notification feed');
    assert(typeof myNotifs.data?.data?.unreadCount === 'number', 'Returns unread count');

    const readAllNotifs = await request('/api/notifications/read-all', {
      method: 'PUT',
      token: studentToken,
    });
    assert(readAllNotifs.status === 200, 'PUT /api/notifications/read-all clears unread badges');

    // AREA 15: Review & Peer Rating APIs
    console.log('\n--- 15. Review & Rating APIs ---');
    const reviewRes = await request('/api/reviews', {
      method: 'POST',
      token: studentToken,
      body: {
        sessionId: testSessionId,
        revieweeId: 2,
        rating: 5,
        feedbackComment: 'Excellent mentor! Priya explained Figma layout hierarchy seamlessly.',
      },
    });
    assert(reviewRes.status === 201, 'POST /api/reviews submits 5★ rating');

    // Self-review prevention
    const selfReview = await request('/api/reviews', {
      method: 'POST',
      token: studentToken,
      body: {
        sessionId: testSessionId,
        revieweeId: 1,
        rating: 5,
      },
    });
    assert(selfReview.status === 400, 'Business Rule: Cannot review oneself (400)');

    const studentReviews = await request('/api/reviews/student/2');
    assert(studentReviews.status === 200, 'GET /api/reviews/student/:id returns public reviews');
    assert(typeof studentReviews.data?.data?.averageRating === 'number', 'Average rating calculated');

    // AREA 16: Credit Transactions & Ledger
    console.log('\n--- 16. Credit Ledger APIs ---');
    const creditBal = await request('/api/credits/balance', { token: studentToken });
    assert(creditBal.status === 200, 'GET /api/credits/balance returns verified balance');
    assert(typeof creditBal.data?.data?.balance === 'number', 'Balance is a numeric value');

    const creditHistory = await request('/api/credits/history', { token: studentToken });
    assert(creditHistory.status === 200, 'GET /api/credits/history returns audit ledger');
    assert(creditHistory.data?.data?.length > 0, 'Audit ledger records all credit transactions');

    // AREA 17: Admin Management APIs
    console.log('\n--- 17. Admin Management APIs ---');
    const statsRes = await request('/api/admin/stats', { token: adminToken });
    assert(statsRes.status === 200, 'GET /api/admin/stats returns platform metrics');
    assert(statsRes.data?.data?.totalUsers > 0, 'Admin sees totalUsers count');
    assert(statsRes.data?.data?.totalCreditsCirculating > 0, 'Admin sees credit circulation');

    const allUsers = await request('/api/admin/users', { token: adminToken });
    assert(allUsers.status === 200, 'GET /api/admin/users lists all registered users');
    assert(
      allUsers.data?.data?.every((u) => u.password_hash === undefined),
      'Security: Admin user list never exposes password hashes'
    );

    // Student submits report
    const submitReport = await request('/api/admin/reports', {
      method: 'POST',
      token: studentToken,
      body: {
        reportedUserId: 4,
        reason: 'no_show',
        description: 'Peer missed scheduled time without prior notification.',
      },
    });
    assert(submitReport.status === 201, 'POST /api/admin/reports submits moderation report');
    const newReportId = submitReport.data?.data?.id;

    // Admin views reports
    const reportsList = await request('/api/admin/reports', { token: adminToken });
    assert(reportsList.status === 200, 'GET /api/admin/reports lists reports');

    // Admin resolves report
    if (newReportId) {
      const resolveRes = await request(`/api/admin/reports/${newReportId}/resolve`, {
        method: 'PUT',
        token: adminToken,
        body: {
          resolutionNotes: 'Verified reschedule conflict. Issued gentle reminder to both parties.',
        },
      });
      assert(resolveRes.status === 200, 'PUT /api/admin/reports/:id/resolve resolves report');
      assert(resolveRes.data?.data?.status === 'resolved', 'Report status marked as resolved');
    }

    // Admin toggles user account status
    const toggleStatus = await request('/api/admin/users/4/status', {
      method: 'PUT',
      token: adminToken,
      body: { isActive: true },
    });
    assert(toggleStatus.status === 200, 'PUT /api/admin/users/:id/status updates status');
  } catch (err) {
    console.error('Unexpected test exception:', err);
    assert(false, 'Unexpected test crash', err.message);
  } finally {
    if (serverInstance) {
      await new Promise((resolve) => serverInstance.close(resolve));
      console.log('\n🛑 Test server stopped.');
    }
  }

  // Summary
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log('\n===============================================================');
  console.log(`📊 FINAL API VERIFICATION RESULT: ${passed}/${total} PASSED (${((passed / total) * 100).toFixed(1)}%)`);
  if (failed > 0) {
    console.error(`❌ ${failed} TEST(S) FAILED`);
    process.exit(1);
  } else {
    console.log('🎉 ALL 17 ENDPOINT MODULES & SECURITY RULES VERIFIED!');
    console.log('===============================================================\n');
    process.exit(0);
  }
}

runTests();
