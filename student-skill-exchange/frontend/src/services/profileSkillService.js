
/**
 * Profile and Skill Management Service
 */

import api from './api.js';

// Skill categories
export const SKILL_CATEGORIES = [
  'Programming',
  'Web Development',
  'Mobile Development',
  'Database',
  'Design',
  'Communication',
  'Languages',
  'Other',
];

export const PROFICIENCY_LEVELS = [
  'Beginner',
  'Intermediate',
  'Advanced',
];

export const LEARNING_MODES = [
  'Online (Video Call & Screen Share)',
  'In-Person (Campus Library / Lab)',
  'Hybrid (Online + Campus Meetups)',
];

// Convert backend profile data to frontend format
const mapProfile = (raw) => {
  if (!raw) return null;

  const fullName = raw.full_name || raw.fullName || '';

  const initials = fullName
    .trim()
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0].toUpperCase())
    .slice(0, 2)
    .join('') || 'SP';

  return {
    id: raw.id || raw.user_id,
    userId: raw.user_id || raw.id,
    fullName,
    initials,
    email: raw.email || '',
    collegeName: raw.college_name || raw.collegeName || 'Campus Peer',
    department: raw.department || 'Engineering',
    academicYear: raw.academic_year || raw.academicYear || '3rd Year',
    shortBio: raw.short_bio || raw.shortBio || '',
    location: raw.location || 'University Campus',
    preferredLearningMode:
      raw.preferred_learning_mode ||
      raw.preferredLearningMode ||
      LEARNING_MODES[0],
    availability: raw.availability || 'Weekday Evenings & Weekends',
    avatarUrl: raw.avatar_url || raw.avatarUrl || null,
    rating: Number(raw.rating || 5.0),
    reviewsCount: Number(raw.reviews_count || raw.reviewsCount || 0),
    creditsBalance: Number(
      raw.credits_balance !== undefined
        ? raw.credits_balance
        : raw.creditsBalance || 10
    ),
    completedSwapsCount: Number(
      raw.completed_sessions_count || raw.completedSwapsCount || 0
    ),
    teachingSkills: raw.teachingSkills || raw.teaching_skills || [],
    learningSkills: raw.learningSkills || raw.learning_skills || [],
  };
};

// Convert backend skill data to frontend format
const mapSkill = (raw) => ({
  id: raw.id,
  skillId: raw.skill_id || raw.skillId || raw.id,
  name: raw.name || '',
  category: raw.category || 'Other',
  proficiency: raw.proficiency || 'Intermediate',
  description:
    raw.short_description ||
    raw.shortDescription ||
    raw.description ||
    '',
  studentsInterested: Math.floor(Math.random() * 8) + 4,
});

// Get current student profile
export const getProfileData = async () => {
  try {
    const res = await api.get('/profile/me');
    return mapProfile(res.data || res);
  } catch (error) {
    console.error('[getProfileData Error]', error);
    throw error;
  }
};

// Update student profile
export const updateProfileData = async (profileData) => {
  if (!profileData.fullName?.trim()) {
    throw new Error('Full name is required.');
  }

  if (!profileData.collegeName?.trim()) {
    throw new Error('College name is required.');
  }

  if (!profileData.department?.trim()) {
    throw new Error('Department is required.');
  }

  if (!profileData.academicYear?.trim()) {
    throw new Error('Academic year is required.');
  }

  const res = await api.put('/profile/me', {
    full_name: profileData.fullName.trim(),
    college_name: profileData.collegeName,
    department: profileData.department,
    academic_year: profileData.academicYear,
    short_bio: profileData.shortBio,
    location: profileData.location,
    preferred_learning_mode: profileData.preferredLearningMode,
    availability: profileData.availability,
    avatar_url: profileData.avatarUrl,
  });

  const updatedProfile = mapProfile(res.data || res);

  return {
    success: true,
    profile: updatedProfile,
    message: 'Profile updated successfully!',
  };
};

// Get skills I can teach
export const getTeachingSkills = async () => {
  try {
    const res = await api.get('/skills/my-skills');
    const data = res.data || res;
    const list = data.teachingSkills || [];
    return list.map(mapSkill);
  } catch (error) {
    console.error('[getTeachingSkills Error]', error);
    return [];
  }
};

// Add a skill I can teach
export const addTeachingSkill = async (skill) => {
  if (!skill.name?.trim()) {
    throw new Error('Skill name is required.');
  }

  if (!SKILL_CATEGORIES.includes(skill.category)) {
    throw new Error('Please select a valid category.');
  }

  const res = await api.post('/skills/my-skills', {
    name: skill.name.trim(),
    category: skill.category,
    skillType: 'teach',
    proficiency: skill.proficiency || 'Intermediate',
    shortDescription: skill.description || '',
  });

  const updatedList = await getTeachingSkills();

  return {
    success: true,
    skill: mapSkill(res.data || res),
    skills: updatedList,
    message: `"${skill.name}" added to your teaching catalog!`,
  };
};

// Remove a teaching skill
export const removeTeachingSkill = async (skillId) => {
  await api.delete(`/skills/my-skills/${skillId}`);

  const updated = await getTeachingSkills();

  return {
    success: true,
    skills: updated,
    message: 'Skill removed from your teaching catalog.',
  };
};

// Get skills I want to learn
export const getLearningSkills = async () => {
  try {
    const res = await api.get('/skills/my-skills');
    const data = res.data || res;
    const list = data.learningSkills || [];
    return list.map(mapSkill);
  } catch (error) {
    console.error('[getLearningSkills Error]', error);
    return [];
  }
};

// Add a learning skill
export const addLearningSkill = async (skill) => {
  if (!skill.name?.trim()) {
    throw new Error('Skill name is required.');
  }

  if (!SKILL_CATEGORIES.includes(skill.category)) {
    throw new Error('Please select a valid category.');
  }

  const res = await api.post('/skills/my-skills', {
    name: skill.name.trim(),
    category: skill.category,
    skillType: 'learn',
    proficiency: skill.proficiency || 'Intermediate',
    shortDescription: skill.description || '',
  });

  const updatedList = await getLearningSkills();

  return {
    success: true,
    skill: mapSkill(res.data || res),
    skills: updatedList,
    message: `"${skill.name}" added to your learning goals!`,
  };
};

// Remove a learning skill
export const removeLearningSkill = async (skillId) => {
  await api.delete(`/skills/my-skills/${skillId}`);

  const updated = await getLearningSkills();

  return {
    success: true,
    skills: updated,
    message: 'Skill removed from your learning goals.',
  };
};

// Get skills catalog
export const getCatalogSkills = async (category = null) => {
  try {
    const res = await api.get('/skills', {
      params: category && category !== 'All' ? { category } : {},
    });

    const data = res.data || res;
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('[getCatalogSkills Error]', error);
    return [];
  }
};
