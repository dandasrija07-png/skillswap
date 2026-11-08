/**
 * User Model
 * Parameterized database operations for users table
 */

import db, { getMemoryStore } from '../config/db.js';

export const findByEmail = async (email) => {
  const store = getMemoryStore();
  const found = store.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  return found || null;
};

export const findById = async (id) => {
  const store = getMemoryStore();
  const found = store.users.find((u) => u.id === Number(id));
  return found || null;
};

export const create = async ({ fullName, email, passwordHash, role = 'student' }) => {
  const store = getMemoryStore();
  const newId = store.users.length > 0 ? Math.max(...store.users.map((u) => u.id)) + 1 : 1;

  const newUser = {
    id: newId,
    full_name: fullName,
    email: email.toLowerCase(),
    password_hash: passwordHash,
    role,
    is_verified: 1,
    is_active: 1,
    created_at: new Date(),
    updated_at: new Date(),
  };

  store.users.push(newUser);
  return newUser;
};

export const getAll = async () => {
  const store = getMemoryStore();
  return store.users.map(({ password_hash, ...rest }) => rest);
};

export const updateStatus = async (id, isActive) => {
  const store = getMemoryStore();
  const user = store.users.find((u) => u.id === Number(id));
  if (user) {
    user.is_active = isActive ? 1 : 0;
    user.updated_at = new Date();
    return true;
  }
  return false;
};

