/**
 * Admin Controller
 * Provides system-wide statistics, user moderation, skill catalog management,
 * dispute reports, and platform activity auditing.
 * All functions are strictly restricted to administrators (role: 'admin')
 */

import { getMemoryStore } from '../config/db.js';
import * as userModel from '../models/userModel.js';
import * as reportModel from '../models/reportModel.js';
import * as skillModel from '../models/skillModel.js';
import { successResponse, errorResponse } from '../utils/responseHelper.js';

/**
 * 1. Comprehensive System-Wide KPI Statistics
 */
export const getStats = async (req, res, next) => {
  try {
    const store = getMemoryStore();

    const studentUsers = store.users.filter((u) => u.role === 'student');
    const activeStudents = studentUsers.filter((u) => u.is_active === 1);
    const suspendedStudents = studentUsers.filter((u) => u.is_active === 0);

    const totalRequests = store.exchange_requests.length;
    const pendingRequests = store.exchange_requests.filter((r) => r.status === 'Pending').length;
    const acceptedRequests = store.exchange_requests.filter((r) => r.status === 'Accepted').length;

    const completedSessions = store.sessions.filter((s) => s.status === 'Completed').length;
    const upcomingSessions = store.sessions.filter((s) => s.status === 'Upcoming').length;

    const reportedUserIds = new Set(store.reports.map((r) => r.reported_user_id));
    const reportedProfiles = reportedUserIds.size;

    const pendingReports = store.reports.filter((r) => r.status === 'pending').length;
    const resolvedReports = store.reports.filter((r) => r.status === 'resolved').length;
    const totalCreditsCirculating = store.student_profiles.reduce(
      (sum, p) => sum + (Number(p.credits_balance) || 0),
      0
    );

    // Compute category distribution for charts
    const categoryMap = {};
    for (const skill of store.skills) {
      categoryMap[skill.category] = (categoryMap[skill.category] || 0) + 1;
    }
    const categoryBreakdown = Object.entries(categoryMap).map(([category, count]) => ({
      category,
      count,
    }));

    // Activity timeline trends for charts
    const activityTrends = [
      { month: 'Jun', requests: 12, completedSessions: 8 },
      { month: 'Jul', requests: 18, completedSessions: 14 },
      { month: 'Aug', requests: 25, completedSessions: 19 },
      { month: 'Sep', requests: 34, completedSessions: 26 },
      { month: 'Oct', requests: 42, completedSessions: 35 },
      { month: 'Nov', requests: Math.max(totalRequests, 48), completedSessions: Math.max(completedSessions, 40) },
    ];

    const stats = {
      totalUsers: store.users.length,
      totalStudents: studentUsers.length,
      studentUsers: studentUsers.length,
      activeUsers: store.users.filter((u) => u.is_active === 1).length,
      activeStudents: activeStudents.length,
      suspendedStudents: suspendedStudents.length,
      totalSkills: store.skills.length,
      totalRequests,
      activeExchanges: acceptedRequests,
      pendingRequests,
      acceptedRequests,
      completedSessions,
      upcomingSessions,
      totalReviews: store.reviews.length,
      reportedProfiles,
      pendingReports,
      resolvedReports,
      totalCreditsCirculating,
      categoryBreakdown,
      activityTrends,
    };

    return successResponse(res, stats, 'Platform statistics retrieved successfully.');
  } catch (error) {
    next(error);
  }
};

/**
 * 2. Student Account Management
 */
export const getUsers = async (req, res, next) => {
  try {
    const store = getMemoryStore();
    const { search, status, department, role = 'student' } = req.query;

    let users = store.users.map(({ password_hash, ...u }) => {
      const profile = store.student_profiles.find((p) => p.user_id === u.id) || {};
      const reportsCount = store.reports.filter((r) => r.reported_user_id === u.id).length;
      const completedCount = store.sessions.filter(
        (s) => (s.initiator_id === u.id || s.partner_id === u.id) && s.status === 'Completed'
      ).length;

      return {
        ...u,
        profile,
        collegeName: profile.college_name || 'University Student',
        department: profile.department || 'General',
        academicYear: profile.academic_year || 'Undergraduate',
        creditsBalance: profile.credits_balance ?? 10,
        rating: profile.rating ?? 5.0,
        reportsReceivedCount: reportsCount,
        completedSessionsCount: completedCount,
      };
    });

    if (role && role !== 'all') {
      users = users.filter((u) => u.role === role);
    }

    if (status) {
      const isActive = status === 'active' ? 1 : 0;
      users = users.filter((u) => u.is_active === isActive);
    }

    if (department && department !== 'All') {
      users = users.filter((u) => u.department.toLowerCase() === department.toLowerCase());
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      users = users.filter(
        (u) =>
          u.full_name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.collegeName.toLowerCase().includes(q) ||
          u.department.toLowerCase().includes(q)
      );
    }

    return successResponse(res, users);
  } catch (error) {
    next(error);
  }
};

export const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive, reason } = req.body;

    if (isActive === undefined) {
      return errorResponse(res, 'isActive boolean field is required.', 400);
    }

    const updated = await userModel.updateStatus(id, Boolean(isActive));
    if (!updated) {
      return errorResponse(res, 'User not found.', 404);
    }

    // Also record an audit entry
    const store = getMemoryStore();
    if (!store.admin_audit_log) store.admin_audit_log = [];
    store.admin_audit_log.unshift({
      id: Date.now(),
      action: isActive ? 'account_reactivated' : 'account_suspended',
      targetUserId: Number(id),
      adminId: req.user.id,
      notes: reason || (isActive ? 'Reactivated by admin.' : 'Suspended for safety/dispute review.'),
      createdAt: new Date(),
    });

    return successResponse(
      res,
      { id: Number(id), isActive: Boolean(isActive), reason },
      `Student account #${id} ${isActive ? 'reactivated' : 'suspended'} successfully.`
    );
  } catch (error) {
    next(error);
  }
};

export const moderateUserProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { shortBio, resetBio } = req.body;

    const store = getMemoryStore();
    const profile = store.student_profiles.find((p) => p.user_id === Number(id));

    if (!profile) {
      return errorResponse(res, 'Student profile not found.', 404);
    }

    if (resetBio) {
      profile.short_bio = 'Bio reset by moderator for content standards review.';
    } else if (shortBio !== undefined) {
      profile.short_bio = shortBio.trim();
    }

    return successResponse(res, profile, 'Student profile content moderated successfully.');
  } catch (error) {
    next(error);
  }
};

/**
 * 3. Skill Category & Catalog Management
 */
export const getCatalogSkills = async (req, res, next) => {
  try {
    const store = getMemoryStore();
    const { category, search } = req.query;

    let skills = store.skills.map((skill) => {
      const teachingCount = store.student_skills.filter(
        (ss) => ss.skill_id === skill.id && ss.skill_type === 'teach'
      ).length;
      const learningCount = store.student_skills.filter(
        (ss) => ss.skill_id === skill.id && ss.skill_type === 'learn'
      ).length;

      return {
        ...skill,
        teachingCount,
        learningCount,
        totalUsage: teachingCount + learningCount,
      };
    });

    if (category && category !== 'All') {
      skills = skills.filter((s) => s.category.toLowerCase() === category.toLowerCase());
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      skills = skills.filter(
        (s) => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)
      );
    }

    return successResponse(res, skills);
  } catch (error) {
    next(error);
  }
};

export const createCatalogSkill = async (req, res, next) => {
  try {
    const { name, category, description } = req.body;

    if (!name || !name.trim()) {
      return errorResponse(res, 'Skill name is required.', 400);
    }

    const newSkill = await skillModel.createCatalogSkill({
      name: name.trim(),
      category: category || 'Other',
      description: description || '',
    });

    return successResponse(res, newSkill, 'New skill added to platform catalog.', 201);
  } catch (error) {
    if (error.message.includes('already exists')) {
      return errorResponse(res, error.message, 400);
    }
    next(error);
  }
};

export const updateCatalogSkill = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, category, description } = req.body;

    const updated = await skillModel.updateCatalogSkill(id, { name, category, description });
    if (!updated) {
      return errorResponse(res, 'Skill not found in catalog.', 404);
    }

    return successResponse(res, updated, 'Skill catalog entry updated.');
  } catch (error) {
    if (error.message.includes('already exists')) {
      return errorResponse(res, error.message, 400);
    }
    next(error);
  }
};

export const deleteCatalogSkill = async (req, res, next) => {
  try {
    const { id } = req.params;
    await skillModel.deleteCatalogSkill(id);
    return successResponse(res, { id: Number(id) }, 'Skill removed from catalog.');
  } catch (error) {
    if (error.message.includes('currently active')) {
      return errorResponse(res, error.message, 400);
    }
    next(error);
  }
};

/**
 * 4. Moderation & Dispute Reports
 */
export const getReports = async (req, res, next) => {
  try {
    const { status } = req.query;
    const reports = await reportModel.getAll(status);
    return successResponse(res, reports);
  } catch (error) {
    next(error);
  }
};

export const resolveReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { resolutionNotes } = req.body;

    if (!resolutionNotes || !resolutionNotes.trim()) {
      return errorResponse(res, 'resolutionNotes are required to resolve a report.', 400);
    }

    const resolved = await reportModel.resolveReport(id, resolutionNotes.trim(), req.user.id);
    if (!resolved) {
      return errorResponse(res, 'Report not found.', 404);
    }

    return successResponse(res, resolved, 'Dispute report marked as resolved.');
  } catch (error) {
    next(error);
  }
};

export const dismissReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { resolutionNotes } = req.body;

    const dismissed = await reportModel.dismissReport(id, resolutionNotes, req.user.id);
    if (!dismissed) {
      return errorResponse(res, 'Report not found.', 404);
    }

    return successResponse(res, dismissed, 'Dispute report dismissed as non-violating.');
  } catch (error) {
    next(error);
  }
};

export const submitReport = async (req, res, next) => {
  try {
    const { reportedUserId, sessionId, reason, description } = req.body;

    if (!reportedUserId || !reason || !description) {
      return errorResponse(res, 'reportedUserId, reason, and description are required.', 400);
    }

    if (Number(reportedUserId) === req.user.id) {
      return errorResponse(res, 'You cannot report yourself.', 400);
    }

    const report = await reportModel.create({
      reporterId: req.user.id,
      reportedUserId,
      sessionId,
      reason,
      description,
    });

    return successResponse(res, report, 'Report submitted to administrators for review.', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * 5. Platform Activity Audit Timeline
 */
export const getActivity = async (req, res, next) => {
  try {
    const store = getMemoryStore();

    const activityList = [];

    // Exchange requests
    for (const r of store.exchange_requests) {
      const sender = store.users.find((u) => u.id === r.sender_id);
      const receiver = store.users.find((u) => u.id === r.receiver_id);
      activityList.push({
        id: `req_${r.id}`,
        type: 'exchange_request',
        title: `Skill Exchange Proposal: ${r.status}`,
        description: `${sender?.full_name || 'Student'} proposed barter swap to ${receiver?.full_name || 'Peer'}.`,
        status: r.status,
        timestamp: r.created_at || new Date(),
      });
    }

    // Sessions
    for (const s of store.sessions) {
      const initiator = store.users.find((u) => u.id === s.initiator_id);
      const partner = store.users.find((u) => u.id === s.partner_id);
      activityList.push({
        id: `sess_${s.id}`,
        type: 'session',
        title: `Learning Session: ${s.status}`,
        description: `${initiator?.full_name || 'Student'} and ${partner?.full_name || 'Peer'} (${s.mode} mode, ${s.duration_minutes} min).`,
        status: s.status,
        timestamp: s.created_at || new Date(),
      });
    }

    // Credit transactions
    for (const tx of store.credit_transactions) {
      const user = store.users.find((u) => u.id === tx.user_id);
      activityList.push({
        id: `tx_${tx.id}`,
        type: 'credit_transaction',
        title: `Credit Ledger Transaction (${tx.amount > 0 ? '+' : ''}${tx.amount})`,
        description: `${user?.full_name || 'Student'}: ${tx.description}`,
        status: 'recorded',
        timestamp: tx.created_at || new Date(),
      });
    }

    // Moderation reports
    for (const rep of store.reports) {
      const reporter = store.users.find((u) => u.id === rep.reporter_id);
      const reported = store.users.find((u) => u.id === rep.reported_user_id);
      activityList.push({
        id: `rep_${rep.id}`,
        type: 'moderation_report',
        title: `Dispute Report (${rep.status})`,
        description: `${reporter?.full_name || 'Student'} filed report against ${reported?.full_name || 'Peer'} [${rep.reason}].`,
        status: rep.status,
        timestamp: rep.created_at || new Date(),
      });
    }

    // Sort newest first
    activityList.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return successResponse(res, activityList.slice(0, 50));
  } catch (error) {
    next(error);
  }
};

/**
 * 6. Usage & Analytics Report Generation
 */
export const getUsageReport = async (req, res, next) => {
  try {
    const store = getMemoryStore();

    const totalStudents = store.users.filter((u) => u.role === 'student').length;
    const totalSessions = store.sessions.length;
    const completedSessions = store.sessions.filter((s) => s.status === 'Completed').length;
    const completionRate = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;

    // Department participation
    const deptMap = {};
    for (const p of store.student_profiles) {
      const dept = p.department || 'General';
      deptMap[dept] = (deptMap[dept] || 0) + 1;
    }

    // Top taught skills
    const teachSkillsMap = {};
    for (const ss of store.student_skills.filter((s) => s.skill_type === 'teach')) {
      const sk = store.skills.find((x) => x.id === ss.skill_id);
      if (sk) teachSkillsMap[sk.name] = (teachSkillsMap[sk.name] || 0) + 1;
    }
    const topTaughtSkills = Object.entries(teachSkillsMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Top wanted skills
    const learnSkillsMap = {};
    for (const ss of store.student_skills.filter((s) => s.skill_type === 'learn')) {
      const sk = store.skills.find((x) => x.id === ss.skill_id);
      if (sk) learnSkillsMap[sk.name] = (learnSkillsMap[sk.name] || 0) + 1;
    }
    const topWantedSkills = Object.entries(learnSkillsMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const report = {
      generatedAt: new Date().toISOString(),
      platformName: 'Student Skill Exchange Platform (SkillSwap)',
      summary: {
        totalStudents,
        totalSessions,
        completedSessions,
        completionRate: `${completionRate}%`,
        activeExchangeProposals: store.exchange_requests.filter((r) => r.status === 'Accepted').length,
        totalCirculatingCredits: store.student_profiles.reduce((sum, p) => sum + (p.credits_balance || 0), 0),
        disputesResolvedRate: `${Math.round(
          (store.reports.filter((r) => r.status === 'resolved').length / Math.max(store.reports.length, 1)) * 100
        )}%`,
      },
      departmentDistribution: Object.entries(deptMap).map(([dept, count]) => ({
        department: dept,
        studentCount: count,
      })),
      topTaughtSkills,
      topWantedSkills,
    };

    return successResponse(res, report, 'Usage analytics report generated.');
  } catch (error) {
    next(error);
  }
};
