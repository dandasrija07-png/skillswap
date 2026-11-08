/**
 * Verification of Frontend Services against Backend APIs
 */

// In-memory polyfill for localStorage and sessionStorage in Node test runner
if (typeof globalThis.localStorage === 'undefined') {
  const store = new Map();
  globalThis.localStorage = {
    getItem: (key) => store.get(key) || null,
    setItem: (key, val) => store.set(key, String(val)),
    removeItem: (key) => store.delete(key),
    clear: () => store.clear(),
  };
}
if (typeof globalThis.sessionStorage === 'undefined') {
  globalThis.sessionStorage = globalThis.localStorage;
}
if (typeof globalThis.window === 'undefined') {
  globalThis.window = {
    dispatchEvent: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
  };
}

import { app } from '../../../backend/src/server.js';
import api from '../services/api.js';
import * as authService from '../services/authService.js';
import * as profileSkillService from '../services/profileSkillService.js';
import * as studentService from '../services/studentService.js';
import * as exchangeRequestService from '../services/exchangeRequestService.js';
import * as sessionService from '../services/sessionService.js';
import * as dashboardService from '../services/dashboardService.js';

const PORT = 5060;
let serverInstance;

const results = [];
function check(pass, name, details = '') {
  if (pass) {
    results.push({ name, passed: true });
    console.log(`  ✅ [PASS] ${name}`);
  } else {
    results.push({ name, passed: false, details });
    console.error(`  ❌ [FAIL] ${name} - ${details}`);
  }
}

async function run() {
  console.log('===============================================================');
  console.log('🚀 FRONTEND-BACKEND INTEGRATION VERIFICATION SUITE');
  console.log('===============================================================\n');

  // Point API client to test port 5060
  process.env.VITE_API_URL = `http://127.0.0.1:${PORT}/api`;

  await new Promise((resolve) => {
    serverInstance = app.listen(PORT, resolve);
  });
  api.defaults.baseURL = `http://127.0.0.1:${PORT}/api`;
  console.log(`📡 Backend server active on port ${PORT}\n`);

  try {
    // 1. Test Login through authService
    console.log('--- 1. Testing authService.loginStudent ---');
    const loginRes = await authService.loginStudent({
      email: 'aarav.sharma@dtu.ac.in',
      password: 'Password@123',
    });
    check(loginRes.success === true, 'authService.loginStudent succeeds with real credentials');
    check(loginRes.user.email === 'aarav.sharma@dtu.ac.in', 'authService returns verified user email');
    check(Boolean(loginRes.token), 'JWT token returned and stored');

    // 2. Test Profile Management through profileSkillService
    console.log('\n--- 2. Testing profileSkillService.getProfileData ---');
    const profile = await profileSkillService.getProfileData();
    check(profile && profile.collegeName.includes('Delhi Technological'), 'Profile retrieved with college name');
    check(typeof profile.creditsBalance === 'number', 'Credits balance is present and numeric');

    // Update Profile
    const updateRes = await profileSkillService.updateProfileData({
      fullName: 'Aarav Sharma',
      collegeName: 'Delhi Technological University',
      department: 'Computer Science & Engineering',
      academicYear: '3rd Year (Junior)',
      shortBio: 'Updated senior mentor bio via frontend integration test.',
      location: 'North Campus • Delhi',
      preferredLearningMode: 'Hybrid (Online + Campus)',
      availability: 'Weekends & Evenings',
    });
    check(updateRes.success === true, 'profileSkillService.updateProfileData updates profile');
    check(updateRes.profile.shortBio.includes('Updated senior mentor bio'), 'Updated bio confirmed in response');

    // 3. Test Skills Management through profileSkillService
    console.log('\n--- 3. Testing Teaching and Learning Skills ---');
    const tSkills = await profileSkillService.getTeachingSkills();
    check(Array.isArray(tSkills), 'getTeachingSkills returns array of skills');
    check(tSkills.length > 0, 'User has registered teaching skills in database');

    const addSkillRes = await profileSkillService.addTeachingSkill({
      name: 'Golang Microservices',
      category: 'Programming',
      proficiency: 'Intermediate',
      description: 'Building REST and gRPC microservices in Go.',
    });
    check(addSkillRes.success === true, 'addTeachingSkill adds new skill to catalog');
    check(addSkillRes.skills.some((s) => s.name === 'Golang Microservices'), 'Newly added skill in list');

    // Remove added skill
    const addedId = addSkillRes.skill.id;
    if (addedId) {
      const remRes = await profileSkillService.removeTeachingSkill(addedId);
      check(remRes.success === true, 'removeTeachingSkill deletes skill');
    }

    // 4. Test Student Directory & Matching through studentService
    console.log('\n--- 4. Testing studentService.searchStudents & getStudentById ---');
    const searchRes = await studentService.searchStudents({ query: 'Priya' });
    check(searchRes.students.length > 0, 'searchStudents finds candidate students by name');
    check(searchRes.students[0].fullName === 'Priya Iyer', 'Candidate student data correctly mapped');

    const studentDetail = await studentService.getStudentById(2);
    check(studentDetail && studentDetail.fullName === 'Priya Iyer', 'getStudentById retrieves full student profile');
    check(studentDetail.match !== null, 'getStudentById includes deterministic barter match analysis');

    // 5. Test Exchange Requests through exchangeRequestService
    console.log('\n--- 5. Testing exchangeRequestService ---');
    const reqRes = await exchangeRequestService.sendExchangeRequest({
      receiverId: 5, // Vikramaditya
      offeredSkill: 'React.js & Hooks',
      requestedSkill: 'Relational Database Design',
      proposedHours: '2 hrs / week',
      personalMessage: 'Let us exchange React for SQL optimization!',
    });
    check(reqRes.success === true, 'sendExchangeRequest creates bilateral proposal');
    const newReqId = reqRes.request.id;

    const allRequests = await exchangeRequestService.getStudentRequests();
    check(allRequests.sent.length > 0, 'getStudentRequests returns sent proposals');
    check(allRequests.counts.total > 0, 'getStudentRequests returns summary counts');

    if (newReqId) {
      const cancelRes = await exchangeRequestService.cancelExchangeRequest(newReqId);
      check(cancelRes.success === true, 'cancelExchangeRequest cancels proposal');
      check(cancelRes.status === 'Cancelled', 'Request status updated to Cancelled');
    }

    // 6. Test Sessions through sessionService
    console.log('\n--- 6. Testing sessionService ---');
    const futureDate = new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString().split('T')[0];
    const sessionRes = await sessionService.scheduleSession({
      partnerId: 2,
      topic: 'React Custom Hooks & Architecture',
      sessionDate: futureDate,
      startTime: '16:00',
      durationMinutes: 60,
      mode: 'Online (Video Call)',
      locationOrLink: 'https://meet.skillswap.edu/room/priya-aarav-test',
      agendaNotes: 'Custom hooks patterns',
    });
    check(sessionRes.success === true, 'sessionService.scheduleSession schedules new session');
    const newSessId = sessionRes.session.id;

    const mySessions = await sessionService.getStudentSessions();
    check(mySessions.all.length > 0, 'sessionService.getStudentSessions lists user sessions');
    check(mySessions.counts.total > 0, 'Session counts summary calculated');

    // 7. Test Dashboard Overview & Multi-Module Features
    console.log('\n--- 7. Testing dashboardService.getDashboardOverview ---');
    const overview = await dashboardService.getDashboardOverview();
    check(overview && overview.profile !== null, 'getDashboardOverview aggregates profile data');
    check(Array.isArray(overview.suggestedMatches), 'Overview includes suggested matches');
    check(Array.isArray(overview.upcomingSessions), 'Overview includes upcoming sessions');
    check(Array.isArray(overview.activityLog), 'Overview includes activity log');

    // Test Messaging
    console.log('\n--- 8. Testing Chat & Messages ---');
    const msgRes = await dashboardService.sendChatMessage({
      receiverId: 2,
      messageText: 'Hello Priya, looking forward to our session!',
    });
    check(msgRes && msgRes.id > 0, 'dashboardService.sendChatMessage sends message');

    const thread = await dashboardService.getChatThread(2);
    check(thread.length > 0, 'dashboardService.getChatThread retrieves message thread');

    // Test Credits
    console.log('\n--- 9. Testing Credit Ledger ---');
    const balance = await dashboardService.getCreditBalance();
    check(typeof balance === 'number', 'getCreditBalance returns balance');

    const txHistory = await dashboardService.getCreditHistory();
    check(Array.isArray(txHistory) && txHistory.length > 0, 'getCreditHistory returns audit transactions');

    // Test Notifications
    console.log('\n--- 10. Testing Notifications ---');
    const notifs = await dashboardService.getNotifications();
    check(Array.isArray(notifs.notifications), 'getNotifications returns notifications feed');
  } catch (err) {
    console.error('Integration exception:', err);
    check(false, 'Integration crash', err.message);
  } finally {
    if (serverInstance) {
      await new Promise((resolve) => serverInstance.close(resolve));
      console.log('\n🛑 Test server closed.');
    }
  }

  const passed = results.filter((r) => r.passed).length;
  const total = results.length;
  console.log('\n===============================================================');
  console.log(`📊 INTEGRATION RESULTS: ${passed}/${total} PASSED (${((passed / total) * 100).toFixed(1)}%)`);
  if (passed === total) {
    console.log('🎉 ALL FRONTEND SERVICES FULLY CONNECTED TO BACKEND & DATABASE!');
  }
  console.log('===============================================================\n');

  process.exit(passed === total ? 0 : 1);
}

run();
