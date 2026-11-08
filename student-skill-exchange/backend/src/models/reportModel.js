/**
 * Report Model
 */

import { getMemoryStore } from '../config/db.js';

export const getAll = async (status = null) => {
  const store = getMemoryStore();
  let reports = store.reports;
  if (status) {
    reports = reports.filter((r) => r.status === status);
  }

  return reports.map((r) => {
    const reporter = store.users.find((u) => u.id === r.reporter_id);
    const reported = store.users.find((u) => u.id === r.reported_user_id);
    return {
      ...r,
      reporterName: reporter?.full_name || '',
      reporterEmail: reporter?.email || '',
      reportedUserName: reported?.full_name || '',
      reportedUserEmail: reported?.email || '',
    };
  });
};

export const create = async ({ reporterId, reportedUserId, sessionId = null, reason, description }) => {
  const store = getMemoryStore();

  const newId = store.reports.length > 0 ? Math.max(...store.reports.map((r) => r.id)) + 1 : 1;
  const newReport = {
    id: newId,
    reporter_id: Number(reporterId),
    reported_user_id: Number(reportedUserId),
    session_id: sessionId ? Number(sessionId) : null,
    reason,
    description,
    status: 'pending',
    resolution_notes: null,
    resolved_by: null,
    created_at: new Date(),
    updated_at: new Date(),
  };

  store.reports.push(newReport);
  return newReport;
};

export const resolveReport = async (reportId, resolutionNotes, adminId) => {
  const store = getMemoryStore();
  const report = store.reports.find((r) => r.id === Number(reportId));
  if (!report) return null;

  report.status = 'resolved';
  report.resolution_notes = resolutionNotes;
  report.resolved_by = Number(adminId);
  report.updated_at = new Date();

  return report;
};

export const dismissReport = async (reportId, resolutionNotes, adminId) => {
  const store = getMemoryStore();
  const report = store.reports.find((r) => r.id === Number(reportId));
  if (!report) return null;

  report.status = 'dismissed';
  report.resolution_notes = resolutionNotes || 'Dismissed as non-violating by platform administrator.';
  report.resolved_by = Number(adminId);
  report.updated_at = new Date();

  return report;
};

