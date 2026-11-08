/**
 * Credit Transactions Model
 * Enforces transaction safety and prevents duplicate awards
 */

import { getMemoryStore } from '../config/db.js';

export const getBalance = async (userId) => {
  const store = getMemoryStore();
  const profile = store.student_profiles.find((p) => p.user_id === Number(userId));
  return profile ? profile.credits_balance : 0;
};

export const getHistory = async (userId) => {
  const store = getMemoryStore();
  return store.credit_transactions
    .filter((t) => t.user_id === Number(userId))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
};

export const recordTransaction = async ({ userId, sessionId = null, type, amount, description }) => {
  const store = getMemoryStore();
  const uid = Number(userId);

  // Check unique reward constraint: uq_session_user_reward
  if (sessionId) {
    const existing = store.credit_transactions.find(
      (t) => t.user_id === uid && t.session_id === Number(sessionId) && t.transaction_type === type
    );
    if (existing) {
      throw new Error(`Credit transaction already recorded for session #${sessionId}. Duplicate reward prevented.`);
    }
  }

  const profile = store.student_profiles.find((p) => p.user_id === uid);
  const prevBalance = profile ? profile.credits_balance : 0;
  const newBalance = prevBalance + Number(amount);

  if (profile) {
    profile.credits_balance = newBalance;
  }

  const newId = store.credit_transactions.length > 0 ? Math.max(...store.credit_transactions.map((t) => t.id)) + 1 : 1;
  const newTx = {
    id: newId,
    user_id: uid,
    session_id: sessionId ? Number(sessionId) : null,
    transaction_type: type,
    amount: Number(amount),
    previous_balance: prevBalance,
    new_balance: newBalance,
    description,
    created_at: new Date(),
  };

  store.credit_transactions.push(newTx);
  return newTx;
};

