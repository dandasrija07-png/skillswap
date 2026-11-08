-- ============================================================================
-- Student Skill Exchange Platform (SkillSwap)
-- Database Name: student_skill_exchange
-- Seed Data Script
-- All passwords use bcrypt hash of 'Password@123' ($2b$10$JN5CMMF/K6xUflI.J2ksDu1ZRsgymHl2BO1i3/e6bWbt8qO7kWAmO)
-- ============================================================================

USE student_skill_exchange;

-- ----------------------------------------------------------------------------
-- 1. SEED USERS (6 demo students + 1 administrator)
-- ----------------------------------------------------------------------------
INSERT INTO users (id, full_name, email, password_hash, role, is_verified, is_active) VALUES
(1, 'Aarav Sharma', 'aarav.sharma@dtu.ac.in', '$2b$10$JN5CMMF/K6xUflI.J2ksDu1ZRsgymHl2BO1i3/e6bWbt8qO7kWAmO', 'student', TRUE, TRUE),
(2, 'Priya Iyer', 'priya.iyer@vit.ac.in', '$2b$10$JN5CMMF/K6xUflI.J2ksDu1ZRsgymHl2BO1i3/e6bWbt8qO7kWAmO', 'student', TRUE, TRUE),
(3, 'Sneha Patel', 'sneha.patel@nitt.edu', '$2b$10$JN5CMMF/K6xUflI.J2ksDu1ZRsgymHl2BO1i3/e6bWbt8qO7kWAmO', 'student', TRUE, TRUE),
(4, 'Rohan Verma', 'rohan.verma@pilani.bits-pilani.ac.in', '$2b$10$JN5CMMF/K6xUflI.J2ksDu1ZRsgymHl2BO1i3/e6bWbt8qO7kWAmO', 'student', TRUE, TRUE),
(5, 'Vikramaditya Rao', 'vikram.rao@iitr.ac.in', '$2b$10$JN5CMMF/K6xUflI.J2ksDu1ZRsgymHl2BO1i3/e6bWbt8qO7kWAmO', 'student', TRUE, TRUE),
(6, 'Ananya Deshmukh', 'ananya.d@coep.ac.in', '$2b$10$JN5CMMF/K6xUflI.J2ksDu1ZRsgymHl2BO1i3/e6bWbt8qO7kWAmO', 'student', TRUE, TRUE),
(7, 'SkillSwap Admin', 'admin@skillswap.edu', '$2b$10$JN5CMMF/K6xUflI.J2ksDu1ZRsgymHl2BO1i3/e6bWbt8qO7kWAmO', 'admin', TRUE, TRUE);

-- ----------------------------------------------------------------------------
-- 2. SEED STUDENT_PROFILES (1:1 with students)
-- ----------------------------------------------------------------------------
INSERT INTO student_profiles (
  user_id, college_name, department, academic_year, short_bio, location,
  preferred_learning_mode, availability, availability_type, avatar_url,
  rating, reviews_count, completed_sessions_count, credits_balance
) VALUES
(
  1,
  'Delhi Technological University',
  'Computer Science & Engineering',
  '3rd Year (Junior)',
  'Passionate about full-stack web development and clean code. Love mentoring peers in React, Vite, and CSS architecture while actively looking to level up on Advanced Data Structures and Graph Algorithms.',
  'North Campus, Block C • New Delhi',
  'Online',
  'Weekday evenings (6:00 PM - 9:00 PM) & Saturdays',
  'Flexible',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
  4.90, 18, 14, 18
),
(
  2,
  'Vellore Institute of Technology',
  'Information Technology',
  '2nd Year (Sophomore)',
  'UI/UX design enthusiast and Figma power user. I love building responsive design systems and clean wireframes. Looking to master React state management & hooks.',
  'Vellore Campus • Block D',
  'Online',
  'Weekends & Friday Evenings',
  'Weekends',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250',
  5.00, 24, 20, 22
),
(
  3,
  'National Institute of Technology, Trichy',
  'Computer Science & Engineering',
  '3rd Year (Junior)',
  'Active competitive programmer (Candidate Master on Codeforces). Happy to coach peers on graph theory and dynamic programming in exchange for web styling.',
  'Main Hostel Campus • Trichy',
  'Hybrid',
  'Daily 1 hr after 6:00 PM',
  'Weekdays',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250',
  4.90, 22, 17, 19
),
(
  4,
  'BITS Pilani',
  'Computer Science & Engineering',
  '4th Year (Senior)',
  'Final year student with cloud infrastructure internship experience. Mentoring on Docker, Linux, and backend architectures.',
  'Pilani Campus • Rajasthan',
  'Online',
  'Flexible Sessions (Evenings)',
  'Flexible',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
  4.80, 15, 12, 15
),
(
  5,
  'IIT Roorkee',
  'Computer Science & Engineering',
  '2nd Year (Sophomore)',
  'Core backend and database developer. Skilled in relational SQL optimization and multithreaded Java architectures.',
  'Roorkee Campus • Ganga Bhawan',
  'Hybrid',
  'Weekends (Saturday & Sunday)',
  'Weekends',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250',
  4.70, 11, 8, 12
),
(
  6,
  'COEP Technological University',
  'Information Technology',
  '3rd Year (Junior)',
  'Mobile app creator with 2 live apps on Google Play Store. Can teach cross-platform Flutter and Dart from scratch.',
  'Boat Club Road • Pune',
  'Hybrid',
  'Flexible (4-6 hrs/week)',
  'Flexible',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
  4.90, 16, 14, 16
);

-- ----------------------------------------------------------------------------
-- 3. SEED SKILLS (Normalized catalog across 8 categories)
-- ----------------------------------------------------------------------------
INSERT INTO skills (id, name, category, description) VALUES
(1, 'React.js & Hooks', 'Web Development', 'Modern component architecture, state management, and custom hooks.'),
(2, 'Tailwind CSS & SaaS Layouts', 'Web Development', 'Utility-first styling, responsive grids, and design tokens.'),
(3, 'TypeScript Fundamentals', 'Programming', 'Type safety, generics, interfaces, and strict compiler setups.'),
(4, 'Figma Auto-Layout & UI Systems', 'Design', 'Component libraries, auto-layout 5.0, tokens, and wireframing.'),
(5, 'Graph Algorithms & Traversal', 'Programming', 'BFS, DFS, Dijkstra, topological sort, and tree algorithms.'),
(6, 'Dynamic Programming Patterns', 'Programming', 'Memoization, tabulation, knapsack, and grid optimization.'),
(7, 'Docker & Microservices', 'Web Development', 'Containerization, Dockerfile optimization, and multi-container Compose.'),
(8, 'Relational Database Design', 'Database', 'SQL queries, normal forms 1NF-3NF, indexing, and foreign keys.'),
(9, 'Flutter Mobile App Development', 'Mobile Development', 'Cross-platform mobile apps for iOS and Android with Dart.'),
(10, 'Technical Interview Communication', 'Communication', 'Mock behavioral, system explanation, and code walkthrough skills.'),
(11, 'Python Data Analysis & Pandas', 'Programming', 'DataFrame manipulation, NumPy vectorized computation, and visualization.'),
(12, 'Conversational Japanese (N5)', 'Languages', 'Basic conversational phrases, hiragana, katakana, and kanji.');

-- ----------------------------------------------------------------------------
-- 4. SEED STUDENT_SKILLS (Separate teaching and learning pairings)
-- ----------------------------------------------------------------------------
INSERT INTO student_skills (user_id, skill_id, skill_type, proficiency, short_description) VALUES
-- Aarav Sharma (User 1): Teaches Web/TS, wants DSA/Design
(1, 1, 'teach', 'Advanced', 'Built 5+ production SaaS interfaces and open-source packages.'),
(1, 2, 'teach', 'Advanced', 'Responsive web design with modern utility styling and dark mode.'),
(1, 3, 'teach', 'Intermediate', 'Type-safe React components and custom hook return types.'),
(1, 5, 'learn', 'Intermediate', 'Preparing for placement test graph algorithms.'),
(1, 6, 'learn', 'Beginner', 'Need guidance on dynamic programming sub-problems.'),
(1, 4, 'learn', 'Beginner', 'Want to build Figma wireframes before coding.'),

-- Priya Iyer (User 2): Teaches Design, wants Web/TS (Reciprocal with Aarav!)
(2, 4, 'teach', 'Advanced', 'Design system tokens and accessible wireframing in Figma.'),
(2, 1, 'learn', 'Intermediate', 'Transitioning from Figma designs to interactive React code.'),
(2, 3, 'learn', 'Beginner', 'Learning typed web development.'),

-- Sneha Patel (User 3): Teaches DSA, wants Web
(3, 5, 'teach', 'Advanced', 'Candidate Master on Codeforces, coaching BFS/DFS and trees.'),
(3, 6, 'teach', 'Advanced', 'Tabulation and memoization patterns.'),
(3, 2, 'learn', 'Beginner', 'Need help making algorithmic visualizer interfaces pretty.'),

-- Rohan Verma (User 4): Teaches Docker & DB, wants TS
(4, 7, 'teach', 'Advanced', 'Multi-container orchestration and microservice setups.'),
(4, 8, 'teach', 'Advanced', 'Relational query optimization and schema indexing.'),
(4, 3, 'learn', 'Intermediate', 'Adopting TypeScript in Node backend services.'),

-- Vikramaditya Rao (User 5): Teaches DB, wants Python
(5, 8, 'teach', 'Advanced', 'MySQL indexing, B-Trees, and transactions.'),
(5, 11, 'teach', 'Intermediate', 'Data manipulation using Pandas.'),
(5, 1, 'learn', 'Beginner', 'Learning frontend fundamentals.'),

-- Ananya Deshmukh (User 6): Teaches Mobile, wants DSA
(6, 9, 'teach', 'Advanced', 'Cross-platform Flutter widgets and state management.'),
(6, 5, 'learn', 'Intermediate', 'Graph traversal practice.');

-- ----------------------------------------------------------------------------
-- 5. SEED EXCHANGE_REQUESTS (Sample bilateral proposals across all 4 statuses)
-- ----------------------------------------------------------------------------
INSERT INTO exchange_requests (
  id, sender_id, receiver_id, offered_skill_id, requested_skill_id,
  proposed_hours, personal_message, status, rejection_reason
) VALUES
(
  1, 2, 1, 4, 1,
  '2 hrs / weekend',
  'Hi Aarav! I loved your portfolio. I can walk you through creating scalable design tokens & autolayout in Figma if you can help me understand custom React hooks.',
  'Pending', NULL
),
(
  2, 1, 3, 2, 5,
  '3 hrs / week',
  'Hello Sneha, I am preparing for upcoming campus placement tests and need help with BFS/DFS graph problems. Happy to teach responsive Tailwind design in exchange!',
  'Pending', NULL
),
(
  3, 4, 1, 7, 3,
  '2 hrs / week',
  'Hey Aarav, looking to solidify my TypeScript generics. Let us trade a weekend session!',
  'Accepted', NULL
),
(
  4, 5, 1, 11, 8,
  '1 hr / week',
  'Can we schedule a quick session this weekend on relational schemas?',
  'Rejected', 'Schedule clash during mid-semester examination week.'
);

-- ----------------------------------------------------------------------------
-- 6. SEED SESSIONS (Upcoming, AwaitingConfirmation, Completed, Cancelled)
-- ----------------------------------------------------------------------------
INSERT INTO sessions (
  id, exchange_request_id, initiator_id, partner_id, topic_skill_id, exchange_skill_id,
  session_date, start_time, end_time, duration_minutes, mode, location_or_link,
  agenda_notes, status, initiator_confirmed, partner_confirmed, credits_awarded,
  cancelled_by, cancellation_reason
) VALUES
(
  1, 1, 2, 1, 4, 1,
  '2026-11-09', '16:00:00', '17:30:00', 90, 'Online',
  'https://meet.skillswap.edu/room/priya-aarav-figma-react',
  'Review auto-layout nested frames in Figma, then live-code a custom React hook for window resizing.',
  'Upcoming', FALSE, FALSE, FALSE, NULL, NULL
),
(
  2, 2, 1, 3, 5, 2,
  '2026-11-12', '18:00:00', '19:00:00', 60, 'Online',
  'https://meet.skillswap.edu/room/sneha-aarav-dsa-tailwind',
  'Solve 3 LeetCode medium graph traversal problems with adjacency lists.',
  'Upcoming', FALSE, FALSE, FALSE, NULL, NULL
),
(
  3, 3, 4, 1, 7, 3,
  '2026-11-05', '14:00:00', '15:30:00', 90, 'In-Person',
  'North Campus Library • Discussion Pod B',
  'Build a multi-container compose file with Node.js and MySQL.',
  'AwaitingConfirmation', TRUE, FALSE, FALSE, NULL, NULL
),
(
  4, 4, 5, 1, 8, 11,
  '2026-10-30', '11:00:00', '12:00:00', 60, 'Online',
  'https://meet.skillswap.edu/room/vikram-aarav-sql-python',
  'Covered 1NF, 2NF, 3NF and B-Tree indexes on MySQL.',
  'Completed', TRUE, TRUE, TRUE, NULL, NULL
),
(
  5, NULL, 1, 3, 5, 1,
  '2026-11-02', '10:00:00', '11:00:00', 60, 'Online',
  'https://meet.skillswap.edu/room/aarav-sneha-cp',
  'Cancelled due to college mid-semester exam conflicts.',
  'Cancelled', FALSE, FALSE, FALSE, 3, 'College mid-term examination clash. Agreed to reschedule later.'
);

-- ----------------------------------------------------------------------------
-- 7. SEED CREDIT_TRANSACTIONS (Immutable transaction ledger)
-- ----------------------------------------------------------------------------
INSERT INTO credit_transactions (
  user_id, session_id, transaction_type, amount, previous_balance, new_balance, description
) VALUES
(1, NULL, 'signup_bonus', 10, 0, 10, 'Initial registration welcome credits bonus'),
(1, 4, 'session_completion', 1, 10, 11, 'Completed 60-min relational database session with Vikramaditya Rao'),
(1, NULL, 'admin_adjustment', 7, 11, 18, 'Early campus peer adopter reward grant'),
(2, NULL, 'signup_bonus', 10, 0, 10, 'Initial registration welcome credits bonus'),
(3, NULL, 'signup_bonus', 10, 0, 10, 'Initial registration welcome credits bonus'),
(4, NULL, 'signup_bonus', 10, 0, 10, 'Initial registration welcome credits bonus');

-- ----------------------------------------------------------------------------
-- 8. SEED REVIEWS (Feedback for completed session)
-- ----------------------------------------------------------------------------
INSERT INTO reviews (session_id, reviewer_id, reviewee_id, rating, feedback_comment) VALUES
(4, 1, 5, 5, 'Vikramaditya explained SQL indexing and B-tree lookups with brilliant real-world analogies! Highly recommended peer mentor.'),
(4, 5, 1, 5, 'Aarav asked thoughtful questions and already had strong relational fundamentals. Great exchange partner!');

-- ----------------------------------------------------------------------------
-- 9. SEED MESSAGES (1:1 chat between peers)
-- ----------------------------------------------------------------------------
INSERT INTO messages (sender_id, receiver_id, exchange_request_id, message_text, is_read, read_at) VALUES
(2, 1, 1, 'Hey Aarav! Excited for our session tomorrow on React state management.', TRUE, '2026-11-06 10:31:00'),
(1, 2, 1, 'Hi Priya! Yes, I prepared a few real-world examples with custom hooks and Context API.', TRUE, '2026-11-06 10:35:00'),
(2, 1, 1, 'Awesome! In return, I will walk you through Figma auto-layout and design tokens.', TRUE, '2026-11-06 10:40:00'),
(1, 2, 1, 'Looking forward to it! See you at 4:00 PM.', FALSE, NULL);

-- ----------------------------------------------------------------------------
-- 10. SEED NOTIFICATIONS
-- ----------------------------------------------------------------------------
INSERT INTO notifications (user_id, type, title, message, reference_id, reference_type, is_read) VALUES
(1, 'request_received', 'New Exchange Proposal', 'Priya Iyer proposed a skill swap: Figma for React.', 1, 'exchange_request', FALSE),
(1, 'session_booked', 'Upcoming Learning Session', 'Session scheduled with Priya Iyer for Nov 9 at 4:00 PM.', 1, 'session', FALSE),
(1, 'credit_earned', 'Credit Reward Released', 'You earned +1 learning credit for completing session #4 with Vikramaditya Rao.', 4, 'credit_transaction', TRUE);

-- ----------------------------------------------------------------------------
-- 11. SEED REPORTS (Sample moderation dispute record)
-- ----------------------------------------------------------------------------
INSERT INTO reports (
  reporter_id, reported_user_id, session_id, reason, description, status, resolution_notes, resolved_by
) VALUES
(
  1, 5, NULL, 'skill_mismatch',
  'Sample benign report: Initial peer requested advanced C++ kernel drivers when basic OOP was agreed. Resolved amicably.',
  'resolved',
  'Moderator clarified course scope with both students. Mutual agreement reached.',
  7
);

