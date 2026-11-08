/**
 * Student Directory & Rule-Based Matching Service
 * Connected to Express backend & MySQL database
 * STRICTLY ZERO AI / ML / LLMs - uses deterministic database queries and set theory
 */

import api from './api.js';

// Filter constants for Student Directory
export const SKILL_CATEGORIES = [
  'All',
  'Programming',
  'Web Development',
  'Mobile Development',
  'Database',
  'Design',
  'Communication',
  'Languages',
  'Other',
];

export const DEPARTMENTS = [
  'All',
  'Computer Science & Engineering',
  'Information Technology',
  'Electronics & Communication',
  'Electrical Engineering',
  'Mechanical Engineering',
];

export const ACADEMIC_YEARS = ['All', '1st Year', '2nd Year', '3rd Year', '4th Year'];

export const PROFICIENCY_LEVELS = ['All', 'Beginner', 'Intermediate', 'Advanced'];

export const AVAILABILITY_OPTIONS = ['Any', 'Weekdays', 'Weekends', 'Flexible'];

export const LEARNING_MODES = ['Any', 'Online', 'In-Person', 'Hybrid'];

export const DEMO_STUDENTS = [
  {
    id: 2,
    userId: 2,
    fullName: 'Priya Iyer',
    name: 'Priya Iyer',
    initials: 'PI',
    collegeName: 'Vellore Institute of Technology',
    college: 'Vellore Institute of Technology',
    department: 'Information Technology',
    academicYear: '2nd Year (Sophomore)',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250',
    rating: 5.0,
    teachingSkills: [{ id: 4, name: 'Figma Auto-Layout & UI Systems', category: 'Design' }],
    learningSkills: [{ id: 1, name: 'React.js & Hooks', category: 'Web Development' }],
  },
  {
    id: 3,
    userId: 3,
    fullName: 'Sneha Patel',
    name: 'Sneha Patel',
    initials: 'SP',
    collegeName: 'National Institute of Technology, Trichy',
    college: 'National Institute of Technology, Trichy',
    department: 'Computer Science & Engineering',
    academicYear: '3rd Year (Junior)',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250',
    rating: 4.9,
    teachingSkills: [{ id: 5, name: 'Graph Algorithms & Traversal', category: 'Programming' }],
    learningSkills: [{ id: 2, name: 'Tailwind CSS & SaaS Layouts', category: 'Web Development' }],
  },
];

const mapStudent = (raw) => {
  if (!raw) return null;
  const fullName = raw.full_name || raw.fullName || 'Student Peer';
  const initials = fullName
    .trim()
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0].toUpperCase())
    .slice(0, 2)
    .join('') || 'SP';

  const tSkills = (raw.teaching_skills || raw.teachingSkills || []).map((s) => ({
    id: s.id,
    skillId: s.skill_id || s.skillId || s.id,
    name: s.name,
    category: s.category || 'General',
    proficiency: s.proficiency || 'Intermediate',
    description: s.short_description || s.shortDescription || s.description || '',
  }));

  const lSkills = (raw.learning_skills || raw.learningSkills || []).map((s) => ({
    id: s.id,
    skillId: s.skill_id || s.skillId || s.id,
    name: s.name,
    category: s.category || 'General',
    proficiency: s.proficiency || 'Beginner',
    description: s.short_description || s.shortDescription || s.description || '',
  }));

  return {
    id: raw.user_id || raw.id,
    userId: raw.user_id || raw.id,
    fullName,
    initials,
    email: raw.email || '',
    collegeName: raw.college_name || raw.collegeName || 'Campus Partner',
    department: raw.department || 'Computer Science',
    academicYear: raw.academic_year || raw.academicYear || '3rd Year',
    location: raw.location || 'University Campus',
    avatarUrl: raw.avatar_url || raw.avatarUrl || null,
    shortBio: raw.short_bio || raw.shortBio || 'Student eager to exchange skills and collaborate.',
    preferredLearningMode: raw.preferred_learning_mode || raw.preferredLearningMode || 'Online (Video Call)',
    availability: raw.availability || 'Weekends & Evenings',
    availabilityType: raw.availability_type || raw.availabilityType || 'Flexible',
    rating: Number(raw.rating || 5.0),
    reviewsCount: Number(raw.reviews_count || raw.reviewsCount || 0),
    completedSessionsCount: Number(raw.completed_sessions_count || raw.completedSessionsCount || 0),
    teachingSkills: tSkills,
    learningSkills: lSkills,
    match: raw.match || null,
  };
};

/**
 * Filter, search, and rank students using backend API
 */
export async function searchStudents(filters = {}) {
  try {
    const params = {
      query: filters.query || '',
      teachingSkillQuery: filters.teachingSkillQuery || '',
      category: filters.category || 'All',
      department: filters.department || 'All',
      academicYear: filters.academicYear || 'All',
      proficiency: filters.proficiency || 'All',
      availability: filters.availability || 'Any',
      learningMode: filters.learningMode || 'Any',
      sortBy: filters.sortBy || 'relevance',
    };

    const res = await api.get('/students', { params });
    const studentsList = res.data?.students || [];

    const mapped = studentsList.map(mapStudent);
    return {
      total: res.data?.total || mapped.length,
      students: mapped,
    };
  } catch (error) {
    console.error('[searchStudents Error]', error);
    return { total: 0, students: [] };
  }
}

/**
 * Retrieve a specific student by ID with deterministic rule-based match analysis
 */
export async function getStudentById(studentId) {
  try {
    // Fetch profile
    const profileRes = await api.get(`/profile/${studentId}`);
    const student = mapStudent(profileRes.data);

    // Fetch deterministic match analysis if logged in
    let match = null;
    const token = localStorage.getItem('skillswap_token');
    if (token) {
      try {
        const matchRes = await api.get(`/students/${studentId}/match`);
        match = matchRes.data?.match || null;
      } catch (e) {
        // Not matching self or unauthenticated
      }
    }

    return {
      ...student,
      match,
    };
  } catch (error) {
    console.error('[getStudentById Error]', error);
    return null;
  }
}
