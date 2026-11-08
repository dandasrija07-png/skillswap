/**
 * Deterministic Rule-Based Matching Service
 * 
 * STRICT PRIVACY & SAFETY: ZERO AI / ML / LLMs.
 * Uses 100% deterministic SQL-compatible string and set operations.
 */

/**
 * Calculates bilateral skill barter compatibility between a candidate student and current student
 */
export const calculateStudentMatch = (candidate, userLearningSkills = [], userTeachingSkills = []) => {
  const matchedLearningSkills = [];
  const matchedTeachingSkills = [];

  // Skills candidate teaches that match current student's learning interests (Direct Match)
  userLearningSkills.forEach((userGoal) => {
    const goalName = (userGoal.name || '').toLowerCase();
    const found = (candidate.teaching_skills || candidate.teachingSkills || []).find((candSkill) => {
      const cName = (candSkill.name || '').toLowerCase();
      return cName.includes(goalName) || goalName.includes(cName);
    });

    if (found && !matchedLearningSkills.some((m) => m.name === found.name)) {
      matchedLearningSkills.push(found);
    }
  });

  // Skills candidate wants to learn that current student can teach (Reciprocal Barter)
  userTeachingSkills.forEach((userTeach) => {
    const teachName = (userTeach.name || '').toLowerCase();
    const found = (candidate.learning_skills || candidate.learningSkills || []).find((candGoal) => {
      const gName = (candGoal.name || '').toLowerCase();
      return gName.includes(teachName) || teachName.includes(gName);
    });

    if (found && !matchedTeachingSkills.some((m) => m.name === found.name)) {
      matchedTeachingSkills.push(found);
    }
  });

  const isDirectMatch = matchedLearningSkills.length > 0;
  const isReciprocalMatch = isDirectMatch && matchedTeachingSkills.length > 0;

  // Deterministic Relevance Score calculation (0 to 100)
  let score = 50; // base score
  if (isDirectMatch) score += matchedLearningSkills.length * 20;
  if (isReciprocalMatch) score += 25; // reciprocal barter boost
  const rating = Number(candidate.rating || 5.0);
  score += Math.round(rating * 3);
  score = Math.min(100, score);

  return {
    score,
    isDirectMatch,
    isReciprocalMatch,
    isReciprocal: isReciprocalMatch,
    matchingSkills: [...matchedLearningSkills, ...matchedTeachingSkills],
    matchedLearningSkills,
    matchedTeachingSkills,
    matchedLearningSkillNames: matchedLearningSkills.map((s) => s.name),
    matchedTeachingSkillNames: matchedTeachingSkills.map((s) => s.name),
    matchSummary: isReciprocalMatch
      ? '100% Reciprocal Swap Match! Both teach what the other needs.'
      : isDirectMatch
      ? `Matches your goal: ${matchedLearningSkills.map((s) => s.name).join(', ')}`
      : 'General Campus Peer',
  };
};

