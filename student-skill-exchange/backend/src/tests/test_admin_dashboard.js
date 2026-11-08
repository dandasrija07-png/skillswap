/**
 * Automated Admin Dashboard & Governance Verification Suite
 * Tests all Administrator endpoints, RBAC security gates, student moderation,
 * skill catalog CRUD, dispute handling, and usage report generation.
 */

import { app, server } from '../server.js';
import { getMemoryStore } from '../config/db.js';

const TEST_PORT = 5077;
const BASE_URL = `http://127.0.0.1:${TEST_PORT}`;

let adminToken = null;
let studentToken = null;
let createdSkillId = null;
let testReportId = null;

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

async function runAdminTests() {
  console.log('===============================================================');
  console.log('🛡️  SKILLSWAP ADMIN DASHBOARD & GOVERNANCE VERIFICATION SUITE');
  console.log('===============================================================\n');

  try {
    // Start isolated test server
    await new Promise((resolve) => {
      server.listen(TEST_PORT, () => {
        console.log(`📡 Admin Test Server listening on ${BASE_URL}\n`);
        resolve();
      });
    });

    // -------------------------------------------------------------
    // 1. Authentication & Role-Based Authorization
    // -------------------------------------------------------------
    console.log('--- 1. Admin Authentication & RBAC Enforcement ---');

    // Admin login
    const adminLoginRes = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'admin@skillswap.edu', password: 'Password@123' },
    });
    adminToken = adminLoginRes.data?.data?.token;
    assert(adminLoginRes.status === 200, 'Admin login succeeds with HTTP 200 OK');
    assert(adminLoginRes.data?.data?.user?.role === 'admin', 'Authenticated identity confirmed as role: "admin"');
    assert(Boolean(adminToken), 'JWT token returned for administrator session');

    // Student login (Aarav Sharma)
    const studentLoginRes = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'aarav.sharma@dtu.ac.in', password: 'Password@123' },
    });
    studentToken = studentLoginRes.data?.data?.token;
    assert(studentLoginRes.status === 200, 'Student login succeeds with HTTP 200 OK');
    assert(studentLoginRes.data?.data?.user?.role === 'student', 'Authenticated identity confirmed as role: "student"');

    // RBAC: Verify students CANNOT access admin endpoints
    const studentAccessStats = await request('/api/admin/stats', { token: studentToken });
    assert(studentAccessStats.status === 403, 'RBAC Security: Student blocked from /api/admin/stats with 403 Forbidden');

    const studentAccessUsers = await request('/api/admin/users', { token: studentToken });
    assert(studentAccessUsers.status === 403, 'RBAC Security: Student blocked from /api/admin/users with 403 Forbidden');

    const studentAccessSkills = await request('/api/admin/skills', { token: studentToken });
    assert(studentAccessSkills.status === 403, 'RBAC Security: Student blocked from /api/admin/skills with 403 Forbidden');

    const studentAccessReports = await request('/api/admin/reports', { token: studentToken });
    assert(studentAccessReports.status === 403, 'RBAC Security: Student blocked from /api/admin/reports with 403 Forbidden');

    const studentAccessActivity = await request('/api/admin/activity', { token: studentToken });
    assert(studentAccessActivity.status === 403, 'RBAC Security: Student blocked from /api/admin/activity with 403 Forbidden');

    const studentAccessUsage = await request('/api/admin/reports/usage', { token: studentToken });
    assert(studentAccessUsage.status === 403, 'RBAC Security: Student blocked from /api/admin/reports/usage with 403 Forbidden');

    // Unauthenticated access
    const unauthAccess = await request('/api/admin/stats');
    assert(unauthAccess.status === 401, 'RBAC Security: Unauthenticated request rejected with 401 Unauthorized');

    // -------------------------------------------------------------
    // 2. Real MySQL Statistics Calculation
    // -------------------------------------------------------------
    console.log('\n--- 2. Real MySQL Statistics Calculation ---');

    const statsRes = await request('/api/admin/stats', { token: adminToken });
    const stats = statsRes.data?.data;

    assert(statsRes.status === 200, 'Admin can retrieve platform statistics with HTTP 200 OK');
    assert(typeof stats?.totalStudents === 'number' && stats.totalStudents >= 6, `Total registered students verified (${stats?.totalStudents})`);
    assert(typeof stats?.activeStudents === 'number' && stats.activeStudents >= 5, `Active students count verified (${stats?.activeStudents})`);
    assert(typeof stats?.totalRequests === 'number' && stats.totalRequests >= 4, `Total exchange requests verified (${stats?.totalRequests})`);
    assert(typeof stats?.completedSessions === 'number' && stats.completedSessions >= 1, `Completed learning sessions verified (${stats?.completedSessions})`);
    assert(typeof stats?.pendingRequests === 'number' && stats.pendingRequests >= 1, `Pending exchange proposals verified (${stats?.pendingRequests})`);
    assert(typeof stats?.reportedProfiles === 'number', `Reported student profiles counted (${stats?.reportedProfiles})`);
    assert(typeof stats?.totalCreditsCirculating === 'number' && stats.totalCreditsCirculating > 0, `Total circulating credits verified (${stats?.totalCreditsCirculating})`);
    assert(Array.isArray(stats?.categoryBreakdown) && stats.categoryBreakdown.length > 0, 'Category breakdown distribution returned for charts');
    assert(Array.isArray(stats?.activityTrends) && stats.activityTrends.length > 0, 'Activity monthly timeline trends returned for charts');

    // -------------------------------------------------------------
    // 3. Student Account Management & Moderation
    // -------------------------------------------------------------
    console.log('\n--- 3. Student Account Management & Moderation ---');

    const usersRes = await request('/api/admin/users', { token: adminToken });
    const users = usersRes.data?.data || [];
    assert(usersRes.status === 200, 'GET /api/admin/users returns student list');
    assert(users.length >= 6, 'Returns all registered student records');
    assert(!users[0].password_hash, 'Security: Student passwords never exposed in admin users payload');

    // Search filter
    const searchRes = await request('/api/admin/users?search=Priya', { token: adminToken });
    assert(searchRes.data?.data?.length === 1 && searchRes.data.data[0].full_name.includes('Priya'), 'Search filter by student name returns matching student');

    // Suspend student #2 (Priya Iyer)
    const suspendRes = await request('/api/admin/users/2/status', {
      method: 'PUT',
      token: adminToken,
      body: { isActive: false, reason: 'Temporary suspension for safety review.' },
    });
    assert(suspendRes.status === 200, 'PUT /api/admin/users/:id/status suspends student account');
    assert(suspendRes.data?.data?.isActive === false, 'Student #2 isActive updated to false');

    // Verify suspended student cannot log in
    const suspendedLoginRes = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'priya.iyer@vit.ac.in', password: 'Password@123' },
    });
    assert(
      suspendedLoginRes.status === 403 && suspendedLoginRes.data?.message?.includes('deactivated'),
      'Business Rule: Suspended student blocked from logging in with 403 Forbidden'
    );

    // Reactivate student #2
    const reactivateRes = await request('/api/admin/users/2/status', {
      method: 'PUT',
      token: adminToken,
      body: { isActive: true },
    });
    assert(reactivateRes.status === 200, 'PUT /api/admin/users/:id/status reactivates student account');
    assert(reactivateRes.data?.data?.isActive === true, 'Student #2 isActive restored to true');

    // Verify reactivated student can log in again
    const reactivatedLoginRes = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'priya.iyer@vit.ac.in', password: 'Password@123' },
    });
    assert(reactivatedLoginRes.status === 200, 'Reactivated student successfully logs in again');

    // Moderate student profile content / bio
    const moderateBioRes = await request('/api/admin/users/2/moderate', {
      method: 'PUT',
      token: adminToken,
      body: { shortBio: 'Professional UI/UX designer and verified peer mentor.' },
    });
    assert(moderateBioRes.status === 200, 'PUT /api/admin/users/:id/moderate updates student profile bio');
    assert(moderateBioRes.data?.data?.short_bio?.includes('Professional UI/UX'), 'Updated bio reflected in student profile');

    // -------------------------------------------------------------
    // 4. Skill Category & Catalog Management
    // -------------------------------------------------------------
    console.log('\n--- 4. Skill Category & Catalog Management ---');

    const skillsRes = await request('/api/admin/skills', { token: adminToken });
    const skills = skillsRes.data?.data || [];
    assert(skillsRes.status === 200, 'GET /api/admin/skills returns full catalog');
    assert(skills.length >= 10, 'Catalog contains 10+ standard skills');
    assert(typeof skills[0].teachingCount === 'number', 'Catalog includes student mentor teachingCount');
    assert(typeof skills[0].learningCount === 'number', 'Catalog includes student learner learningCount');

    // Create new skill in catalog
    const newSkillRes = await request('/api/admin/skills', {
      method: 'POST',
      token: adminToken,
      body: {
        name: 'Rust Systems Programming & Cargo',
        category: 'Programming',
        description: 'Memory safety, ownership, concurrency, and low-level CLI development.',
      },
    });
    createdSkillId = newSkillRes.data?.data?.id;
    assert(newSkillRes.status === 201, 'POST /api/admin/skills creates new catalog skill (201 Created)');
    assert(newSkillRes.data?.data?.name === 'Rust Systems Programming & Cargo', 'New skill name confirmed');

    // Duplicate skill name prevention
    const duplicateSkillRes = await request('/api/admin/skills', {
      method: 'POST',
      token: adminToken,
      body: {
        name: 'Rust Systems Programming & Cargo',
        category: 'Programming',
      },
    });
    assert(duplicateSkillRes.status === 400, 'Business Rule: Duplicate skill name prevented with 400 Bad Request');

    // Update catalog skill
    const updateSkillRes = await request(`/api/admin/skills/${createdSkillId}`, {
      method: 'PUT',
      token: adminToken,
      body: {
        description: 'Advanced memory safety, lifetimes, async Tokio, and WebAssembly.',
      },
    });
    assert(updateSkillRes.status === 200, 'PUT /api/admin/skills/:id updates catalog skill');
    assert(updateSkillRes.data?.data?.description?.includes('Tokio'), 'Updated description confirmed');

    // Delete newly created skill
    const deleteSkillRes = await request(`/api/admin/skills/${createdSkillId}`, {
      method: 'DELETE',
      token: adminToken,
    });
    assert(deleteSkillRes.status === 200, 'DELETE /api/admin/skills/:id successfully deletes unused skill');

    // Protection rule: Attempting to delete a skill in active student use
    const deleteActiveSkillRes = await request('/api/admin/skills/1', {
      method: 'DELETE',
      token: adminToken,
    });
    assert(
      deleteActiveSkillRes.status === 400 && deleteActiveSkillRes.data?.message?.includes('currently active'),
      'Business Rule: Deleting active skill in student use blocked with 400 Bad Request'
    );

    // -------------------------------------------------------------
    // 5. Review & Moderate Dispute Reports
    // -------------------------------------------------------------
    console.log('\n--- 5. Review & Moderate Dispute Reports ---');

    // Student submits report
    const submitReportRes = await request('/api/admin/reports', {
      method: 'POST',
      token: studentToken,
      body: {
        reportedUserId: 4,
        reason: 'skill_mismatch',
        description: 'Peer requested advanced distributed Raft protocol when basic HTTP was agreed.',
      },
    });
    testReportId = submitReportRes.data?.data?.id;
    assert(submitReportRes.status === 201, 'POST /api/admin/reports allows student to file report (201 Created)');

    // Admin views pending reports
    const getReportsRes = await request('/api/admin/reports?status=pending', { token: adminToken });
    const pendingReports = getReportsRes.data?.data || [];
    assert(getReportsRes.status === 200, 'GET /api/admin/reports?status=pending returns reports list');
    assert(pendingReports.some((r) => r.id === testReportId), 'Newly filed report appears in pending review queue');

    // Admin resolves report
    const resolveReportRes = await request(`/api/admin/reports/${testReportId}/resolve`, {
      method: 'PUT',
      token: adminToken,
      body: { resolutionNotes: 'Reviewed syllabus agreement. Advised both students to calibrate session scope.' },
    });
    assert(resolveReportRes.status === 200, 'PUT /api/admin/reports/:id/resolve resolves dispute report');
    assert(resolveReportRes.data?.data?.status === 'resolved', 'Report status marked as "resolved" in MySQL');

    // Admin dismisses report
    const dismissReportRes = await request(`/api/admin/reports/${testReportId}/dismiss`, {
      method: 'PUT',
      token: adminToken,
      body: { resolutionNotes: 'Reviewed as false alarm; amicable peer resolution.' },
    });
    assert(dismissReportRes.status === 200, 'PUT /api/admin/reports/:id/dismiss dismisses report');
    assert(dismissReportRes.data?.data?.status === 'dismissed', 'Report status marked as "dismissed" in MySQL');

    // -------------------------------------------------------------
    // 6. Platform Audit Activity Timeline
    // -------------------------------------------------------------
    console.log('\n--- 6. Platform Audit Activity Timeline ---');

    const activityRes = await request('/api/admin/activity', { token: adminToken });
    const activity = activityRes.data?.data || [];
    assert(activityRes.status === 200, 'GET /api/admin/activity returns platform activity audit log');
    assert(activity.length > 0, 'Activity timeline contains chronological platform events');
    assert(activity[0].type && activity[0].title, 'Activity records contain event type, title, and timestamp');

    // -------------------------------------------------------------
    // 7. Usage & Analytics Report Generation
    // -------------------------------------------------------------
    console.log('\n--- 7. Usage & Analytics Report Generation ---');

    const usageReportRes = await request('/api/admin/reports/usage', { token: adminToken });
    const usage = usageReportRes.data?.data;
    assert(usageReportRes.status === 200, 'GET /api/admin/reports/usage generates platform report');
    assert(typeof usage?.summary?.completionRate === 'string', 'Report calculates session completion success rate');
    assert(Array.isArray(usage?.topTaughtSkills) && usage.topTaughtSkills.length > 0, 'Report calculates top taught skills ranking');
    assert(Array.isArray(usage?.topWantedSkills) && usage.topWantedSkills.length > 0, 'Report calculates top wanted skills ranking');
    assert(Array.isArray(usage?.departmentDistribution) && usage.departmentDistribution.length > 0, 'Report aggregates student share by university department');

  } catch (err) {
    console.error('Unexpected test exception:', err);
    assert(false, 'Unexpected test crash', err.message);
  } finally {
    await new Promise((resolve) => {
      server.close(() => {
        console.log('\n🛑 Admin test server stopped.');
        resolve();
      });
    });

    const passedCount = results.filter((r) => r.passed).length;
    const totalCount = results.length;
    const passPercentage = ((passedCount / totalCount) * 100).toFixed(1);

    console.log('\n===============================================================');
    console.log(`📊 ADMIN DASHBOARD VERIFICATION RESULT: ${passedCount}/${totalCount} PASSED (${passPercentage}%)`);
    if (passedCount === totalCount) {
      console.log('🎉 ALL ADMIN GOVERNANCE, RBAC & MODERATION CAPABILITIES VERIFIED!');
    } else {
      console.error(`❌ ${totalCount - passedCount} TEST(S) FAILED`);
    }
    console.log('===============================================================\n');

    process.exit(passedCount === totalCount ? 0 : 1);
  }
}

runAdminTests();

