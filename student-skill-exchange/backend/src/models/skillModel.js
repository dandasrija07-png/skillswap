/**
 * Skill & Student Skills Model
 * Operations for skills catalog and student_skills table
 */

import { getMemoryStore } from '../config/db.js';

export const getAllSkills = async (category = null) => {
  const store = getMemoryStore();
  let list = store.skills;
  if (category && category !== 'All') {
    list = list.filter((s) => s.category.toLowerCase() === category.toLowerCase());
  }
  return list;
};

export const findSkillById = async (skillId) => {
  const store = getMemoryStore();
  return store.skills.find((s) => s.id === Number(skillId)) || null;
};

export const findSkillByName = async (name) => {
  const store = getMemoryStore();
  return store.skills.find((s) => s.name.toLowerCase() === name.toLowerCase()) || null;
};

export const findOrCreateSkill = async ({ name, category = 'Other', description = '' }) => {
  const store = getMemoryStore();
  let found = store.skills.find((s) => s.name.toLowerCase() === name.trim().toLowerCase());
  if (found) return found;

  const newId = store.skills.length > 0 ? Math.max(...store.skills.map((s) => s.id)) + 1 : 1;
  const newSkill = {
    id: newId,
    name: name.trim(),
    category: category || 'Other',
    description: description || `Skill: ${name.trim()}`,
  };
  store.skills.push(newSkill);
  return newSkill;
};

export const getStudentSkills = async (userId, skillType = null) => {
  const store = getMemoryStore();
  let entries = store.student_skills.filter((s) => s.user_id === Number(userId));
  if (skillType) {
    entries = entries.filter((s) => s.skill_type === skillType);
  }

  return entries.map((e) => {
    const catalog = store.skills.find((c) => c.id === e.skill_id);
    return {
      id: e.id,
      skillId: e.skill_id,
      skill_id: e.skill_id,
      name: catalog?.name || '',
      category: catalog?.category || '',
      skillType: e.skill_type,
      skill_type: e.skill_type,
      proficiency: e.proficiency,
      shortDescription: e.short_description,
      short_description: e.short_description,
    };
  });
};

export const addStudentSkill = async ({ userId, skillId, skillType, proficiency = 'Intermediate', shortDescription = '' }) => {
  const store = getMemoryStore();

  // Check unique constraint: uq_user_skill_type
  const existing = store.student_skills.find(
    (s) => s.user_id === Number(userId) && s.skill_id === Number(skillId) && s.skill_type === skillType
  );

  if (existing) {
    throw new Error(`You have already registered this skill under "${skillType}".`);
  }

  const newId = store.student_skills.length > 0 ? Math.max(...store.student_skills.map((s) => s.id)) + 1 : 1;
  const newEntry = {
    id: newId,
    user_id: Number(userId),
    skill_id: Number(skillId),
    skill_type: skillType,
    proficiency,
    short_description: shortDescription,
    created_at: new Date(),
    updated_at: new Date(),
  };

  store.student_skills.push(newEntry);
  const catalog = store.skills.find((c) => c.id === Number(skillId));

  return {
    ...newEntry,
    name: catalog?.name || '',
    category: catalog?.category || '',
  };
};

export const removeStudentSkill = async (id, userId) => {
  const store = getMemoryStore();
  const index = store.student_skills.findIndex((s) => s.id === Number(id));
  if (index === -1) return false;

  // Verify ownership
  if (store.student_skills[index].user_id !== Number(userId)) {
    throw new Error('Unauthorized: You cannot delete a skill belonging to another user.');
  }

  store.student_skills.splice(index, 1);
  return true;
};

export const createCatalogSkill = async ({ name, category = 'Other', description = '' }) => {
  const store = getMemoryStore();
  const existing = store.skills.find((s) => s.name.toLowerCase() === name.trim().toLowerCase());
  if (existing) {
    throw new Error(`A skill named "${name.trim()}" already exists in the catalog.`);
  }

  const newId = store.skills.length > 0 ? Math.max(...store.skills.map((s) => s.id)) + 1 : 1;
  const newSkill = {
    id: newId,
    name: name.trim(),
    category: category || 'Other',
    description: description || `Skill: ${name.trim()}`,
  };
  store.skills.push(newSkill);
  return newSkill;
};

export const updateCatalogSkill = async (id, { name, category, description }) => {
  const store = getMemoryStore();
  const skill = store.skills.find((s) => s.id === Number(id));
  if (!skill) return null;

  if (name && name.trim()) {
    const duplicate = store.skills.find(
      (s) => s.id !== Number(id) && s.name.toLowerCase() === name.trim().toLowerCase()
    );
    if (duplicate) {
      throw new Error(`A skill named "${name.trim()}" already exists in the catalog.`);
    }
    skill.name = name.trim();
  }

  if (category) skill.category = category;
  if (description !== undefined) skill.description = description;

  return skill;
};

export const deleteCatalogSkill = async (id) => {
  const store = getMemoryStore();
  const index = store.skills.findIndex((s) => s.id === Number(id));
  if (index === -1) return false;

  const usageCount = store.student_skills.filter((ss) => ss.skill_id === Number(id)).length;
  if (usageCount > 0) {
    throw new Error(`Cannot delete skill: It is currently active on ${usageCount} student profile(s).`);
  }

  store.skills.splice(index, 1);
  return true;
};

