/**
 * Admin Service Layer
 * Connects Frontend Admin Dashboard to Express Backend Admin APIs
 * Gated by JWT authentication and Administrator role verification
 */

import api from './api.js';

/**
 * Fetch high-level platform KPI metrics from real MySQL database
 */
export async function getAdminStats() {
  const res = await api.get('/admin/stats');
  return res.data;
}

/**
 * Fetch all registered student accounts with profiles, status, and stats
 */
export async function getAdminUsers(params = {}) {
  const res = await api.get('/admin/users', { params });
  return res.data || [];
}

/**
 * Suspend or reactivate student account
 */
export async function updateUserStatus(userId, isActive, reason = '') {
  const res = await api.put(`/admin/users/${userId}/status`, { isActive, reason });
  return res.data;
}

/**
 * Moderate inappropriate profile bio or content
 */
export async function moderateUserProfile(userId, data) {
  const res = await api.put(`/admin/users/${userId}/moderate`, data);
  return res.data;
}

/**
 * Fetch platform skills catalog with student adoption metrics
 */
export async function getAdminSkills(params = {}) {
  const res = await api.get('/admin/skills', { params });
  return res.data || [];
}

/**
 * Add a new skill to the platform catalog
 */
export async function createAdminSkill(skillData) {
  const res = await api.post('/admin/skills', skillData);
  return res.data;
}

/**
 * Update an existing catalog skill
 */
export async function updateAdminSkill(id, skillData) {
  const res = await api.put(`/admin/skills/${id}`, skillData);
  return res.data;
}

/**
 * Remove an unused skill from the platform catalog
 */
export async function deleteAdminSkill(id) {
  const res = await api.delete(`/admin/skills/${id}`);
  return res.data;
}

/**
 * Fetch platform dispute and user moderation reports
 */
export async function getAdminReports(status = null) {
  const res = await api.get('/admin/reports', {
    params: status ? { status } : {},
  });
  return res.data || [];
}

/**
 * Mark a dispute report as resolved
 */
export async function resolveAdminReport(reportId, resolutionNotes) {
  const res = await api.put(`/admin/reports/${reportId}/resolve`, { resolutionNotes });
  return res.data;
}

/**
 * Dismiss a dispute report as non-violating
 */
export async function dismissAdminReport(reportId, resolutionNotes = '') {
  const res = await api.put(`/admin/reports/${reportId}/dismiss`, { resolutionNotes });
  return res.data;
}

/**
 * Fetch system-wide platform audit activity feed
 */
export async function getPlatformActivity() {
  const res = await api.get('/admin/activity');
  return res.data || [];
}

/**
 * Generate platform usage and analytics report
 */
export async function getUsageAnalyticsReport() {
  const res = await api.get('/admin/reports/usage');
  return res.data;
}

