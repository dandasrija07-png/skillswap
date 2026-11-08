
import { getMemoryStore } from '../config/db.js';

// Get student profile by user ID
export const findByUserId = async (userId) => {
  const store = getMemoryStore();

  const profile = store.student_profiles.find(
    (p) => p.user_id === Number(userId)
  );

  if (!profile) return null;

  const user = store.users.find(
    (u) => u.id === Number(userId)
  );

  const skills = store.student_skills
    .filter((s) => s.user_id === Number(userId))
    .map((s) => {
      const catalog = store.skills.find(
        (c) => c.id === s.skill_id
      );

      return {
        id: s.id,
        skill_id: s.skill_id,
        name: catalog?.name || '',
        category: catalog?.category || 'Other',
        proficiency: s.proficiency,
        short_description: s.short_description || '',
        skill_type: s.skill_type,
      };
    });

  return {
    ...profile,
    full_name: user?.full_name || '',
    email: user?.email || '',
    role: user?.role || 'student',
    teaching_skills: skills.filter((s) => s.skill_type === 'teach'),
    learning_skills: skills.filter((s) => s.skill_type === 'learn'),
  };
};

// Get all student profiles for Explore Students
export const getAllProfiles = async () => {
  const store = getMemoryStore();

  return store.student_profiles
    .map((profile) => {
      const user = store.users.find(
        (u) => u.id === Number(profile.user_id)
      );

      if (!user) return null;

      const skills = store.student_skills
        .filter((s) => s.user_id === Number(profile.user_id))
        .map((s) => {
          const catalog = store.skills.find(
            (c) => c.id === s.skill_id
          );

          return {
            id: s.id,
            skill_id: s.skill_id,
            name: catalog?.name || '',
            category: catalog?.category || 'Other',
            proficiency: s.proficiency,
            short_description: s.short_description || '',
            skill_type: s.skill_type,
          };
        });

      return {
        ...profile,
        full_name: user.full_name || '',
        email: user.email || '',
        role: user.role || 'student',
        teaching_skills: skills.filter((s) => s.skill_type === 'teach'),
        learning_skills: skills.filter((s) => s.skill_type === 'learn'),
        availability_type: profile.availability_type || 'Flexible',
        rating: Number(profile.rating || 5),
        completed_sessions_count: Number(
          profile.completed_sessions_count || 0
        ),
      };
    })
    .filter(Boolean);
};

// Create student profile during registration
export const create = async (profileData) => {
  const store = getMemoryStore();

  const newProfile = {
    id: store.student_profiles.length + 1,
    user_id: Number(profileData.userId),
    college_name: profileData.collegeName,
    department: profileData.department,
    academic_year: profileData.academicYear,
    short_bio: profileData.shortBio || '',
    location: '',
    preferred_learning_mode: 'Online (Video Call & Screen Share)',
    availability: 'Weekday Evenings & Weekends',
    availability_type: 'Flexible',
    avatar_url: null,
    updated_at: new Date(),
  };

  store.student_profiles.push(newProfile);

  return await findByUserId(profileData.userId);
};

// Update existing student profile
export const updateByUserId = async (userId, updateFields) => {
  const store = getMemoryStore();

  const profile = store.student_profiles.find(
    (p) => p.user_id === Number(userId)
  );

  if (!profile) return null;

  const user = store.users.find(
    (u) => u.id === Number(userId)
  );

  if (user && updateFields.full_name !== undefined) {
    user.full_name = updateFields.full_name;
  }

  const allowedFields = [
    'college_name',
    'department',
    'academic_year',
    'short_bio',
    'location',
    'preferred_learning_mode',
    'availability',
    'availability_type',
    'avatar_url',
  ];

  allowedFields.forEach((field) => {
    if (updateFields[field] !== undefined) {
      profile[field] = updateFields[field];
    }
  });

  profile.updated_at = new Date();

  return await findByUserId(userId);
};
