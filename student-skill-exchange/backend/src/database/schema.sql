-- ============================================================================
-- Student Skill Exchange Platform (SkillSwap)
-- Database Name: student_skill_exchange
-- Engine: InnoDB | Character Set: utf8mb4 | Collation: utf8mb4_unicode_ci
-- Normalized Schema Architecture
-- ============================================================================

CREATE DATABASE IF NOT EXISTS student_skill_exchange
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE student_skill_exchange;

-- Disable foreign key checks during schema re-creation if running in fresh setup
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS reports;
DROP TABLE IF EXISTS credit_transactions;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS exchange_requests;
DROP TABLE IF EXISTS student_skills;
DROP TABLE IF EXISTS skills;
DROP TABLE IF EXISTS student_profiles;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- 1. USERS TABLE
-- Primary identity, authentication credentials, and system roles.
-- Passwords strictly stored as bcrypt hashes; never plaintext.
-- ============================================================================
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('student', 'admin', 'moderator') NOT NULL DEFAULT 'student',
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_email (email),
  INDEX idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 2. STUDENT_PROFILES TABLE
-- Academic credentials, bio, campus location, preferences, and aggregate stats.
-- 1:1 relationship with users.
-- ============================================================================
CREATE TABLE student_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  college_name VARCHAR(150) NOT NULL,
  department VARCHAR(100) NOT NULL,
  academic_year VARCHAR(50) NOT NULL,
  short_bio TEXT NULL,
  location VARCHAR(150) NULL,
  preferred_learning_mode ENUM('Online', 'In-Person', 'Hybrid') NOT NULL DEFAULT 'Online',
  availability VARCHAR(150) NOT NULL DEFAULT 'Flexible',
  availability_type ENUM('Weekdays', 'Weekends', 'Flexible') NOT NULL DEFAULT 'Flexible',
  avatar_url VARCHAR(500) NULL,
  rating DECIMAL(3, 2) NOT NULL DEFAULT 5.00,
  reviews_count INT UNSIGNED NOT NULL DEFAULT 0,
  completed_sessions_count INT UNSIGNED NOT NULL DEFAULT 0,
  credits_balance INT NOT NULL DEFAULT 10,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_profiles_user FOREIGN KEY (user_id)
    REFERENCES users (id) ON DELETE CASCADE,
  INDEX idx_profiles_college (college_name),
  INDEX idx_profiles_dept (department),
  INDEX idx_profiles_year (academic_year),
  INDEX idx_profiles_rating (rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 3. SKILLS TABLE
-- Master catalog of normalized skills across 8 core domain categories.
-- ============================================================================
CREATE TABLE skills (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  category ENUM(
    'Programming',
    'Web Development',
    'Mobile Development',
    'Database',
    'Design',
    'Communication',
    'Languages',
    'Other'
  ) NOT NULL,
  description TEXT NULL,
  icon_name VARCHAR(50) NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_skills_category (category),
  INDEX idx_skills_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 4. STUDENT_SKILLS TABLE
-- Associates students with skills they can teach or want to learn (M:N).
-- Enforces separate teaching and learning skill types.
-- Unique constraint prevents duplicate registrations of same skill per type.
-- ============================================================================
CREATE TABLE student_skills (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  skill_id INT NOT NULL,
  skill_type ENUM('teach', 'learn') NOT NULL,
  proficiency ENUM('Beginner', 'Intermediate', 'Advanced') NOT NULL DEFAULT 'Intermediate',
  short_description VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_studskills_user FOREIGN KEY (user_id)
    REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_studskills_skill FOREIGN KEY (skill_id)
    REFERENCES skills (id) ON DELETE RESTRICT,
  CONSTRAINT uq_user_skill_type UNIQUE (user_id, skill_id, skill_type),
  INDEX idx_studskills_user (user_id),
  INDEX idx_studskills_skill_type (skill_id, skill_type),
  INDEX idx_studskills_proficiency (proficiency)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 5. EXCHANGE_REQUESTS TABLE
-- Bilateral skill swap proposals between campus students.
-- Enforces: sender cannot request self; tracks Offered & Requested skills.
-- ============================================================================
CREATE TABLE exchange_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sender_id INT NOT NULL,
  receiver_id INT NOT NULL,
  offered_skill_id INT NOT NULL,
  requested_skill_id INT NOT NULL,
  proposed_hours VARCHAR(100) NOT NULL DEFAULT '2 hrs / weekend',
  personal_message TEXT NOT NULL,
  status ENUM('Pending', 'Accepted', 'Rejected', 'Cancelled') NOT NULL DEFAULT 'Pending',
  rejection_reason VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_req_sender FOREIGN KEY (sender_id)
    REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_req_receiver FOREIGN KEY (receiver_id)
    REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_req_offered FOREIGN KEY (offered_skill_id)
    REFERENCES skills (id) ON DELETE RESTRICT,
  CONSTRAINT fk_req_requested FOREIGN KEY (requested_skill_id)
    REFERENCES skills (id) ON DELETE RESTRICT,
  CONSTRAINT chk_different_users CHECK (sender_id <> receiver_id),
  INDEX idx_req_sender_status (sender_id, status),
  INDEX idx_req_receiver_status (receiver_id, status),
  INDEX idx_req_pair (sender_id, receiver_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 6. SESSIONS TABLE
-- Scheduled 1:1 learning sessions created following accepted exchanges.
-- Contains date, time windows, mode (Online/In-Person), link/location,
-- and dual completion confirmation flags before credit release.
-- ============================================================================
CREATE TABLE sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  exchange_request_id INT NULL,
  initiator_id INT NOT NULL,
  partner_id INT NOT NULL,
  topic_skill_id INT NOT NULL,
  exchange_skill_id INT NULL,
  session_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_minutes INT NOT NULL DEFAULT 60,
  mode ENUM('Online', 'In-Person') NOT NULL DEFAULT 'Online',
  location_or_link VARCHAR(500) NOT NULL,
  agenda_notes TEXT NULL,
  status ENUM('Upcoming', 'AwaitingConfirmation', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Upcoming',
  initiator_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
  partner_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
  credits_awarded BOOLEAN NOT NULL DEFAULT FALSE,
  cancelled_by INT NULL,
  cancellation_reason VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_sess_request FOREIGN KEY (exchange_request_id)
    REFERENCES exchange_requests (id) ON DELETE SET NULL,
  CONSTRAINT fk_sess_initiator FOREIGN KEY (initiator_id)
    REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_sess_partner FOREIGN KEY (partner_id)
    REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_sess_topic FOREIGN KEY (topic_skill_id)
    REFERENCES skills (id) ON DELETE RESTRICT,
  CONSTRAINT fk_sess_exskills FOREIGN KEY (exchange_skill_id)
    REFERENCES skills (id) ON DELETE SET NULL,
  CONSTRAINT fk_sess_cancelled_by FOREIGN KEY (cancelled_by)
    REFERENCES users (id) ON DELETE SET NULL,
  CONSTRAINT chk_sess_participants CHECK (initiator_id <> partner_id),
  INDEX idx_sess_schedule (session_date, start_time, end_time),
  INDEX idx_sess_initiator (initiator_id, status),
  INDEX idx_sess_partner (partner_id, status),
  INDEX idx_sess_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 7. CREDIT_TRANSACTIONS TABLE
-- Transaction-safe immutable ledger recording every balance modification.
-- Prevents duplicate credit awards by enforcing unique (user_id, session_id, type).
-- ============================================================================
CREATE TABLE credit_transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  session_id INT NULL,
  transaction_type ENUM(
    'signup_bonus',
    'session_completion',
    'session_teaching',
    'refund',
    'admin_adjustment'
  ) NOT NULL,
  amount INT NOT NULL,
  previous_balance INT NOT NULL,
  new_balance INT NOT NULL,
  description VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_credits_user FOREIGN KEY (user_id)
    REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_credits_session FOREIGN KEY (session_id)
    REFERENCES sessions (id) ON DELETE SET NULL,
  CONSTRAINT uq_session_user_reward UNIQUE (user_id, session_id, transaction_type),
  INDEX idx_credits_user (user_id, created_at),
  INDEX idx_credits_session (session_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 8. REVIEWS TABLE
-- Bilateral peer ratings and feedback submitted after session completion.
-- Enforces single review per participant per session.
-- ============================================================================
CREATE TABLE reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  session_id INT NOT NULL,
  reviewer_id INT NOT NULL,
  reviewee_id INT NOT NULL,
  rating TINYINT UNSIGNED NOT NULL,
  feedback_comment TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_rev_session FOREIGN KEY (session_id)
    REFERENCES sessions (id) ON DELETE CASCADE,
  CONSTRAINT fk_rev_reviewer FOREIGN KEY (reviewer_id)
    REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_rev_reviewee FOREIGN KEY (reviewee_id)
    REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT uq_session_reviewer UNIQUE (session_id, reviewer_id),
  CONSTRAINT chk_rev_rating CHECK (rating >= 1 AND rating <= 5),
  CONSTRAINT chk_rev_different_users CHECK (reviewer_id <> reviewee_id),
  INDEX idx_rev_reviewee (reviewee_id, rating),
  INDEX idx_rev_reviewer (reviewer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 9. MESSAGES TABLE
-- 1:1 chat message logs between peer students.
-- ============================================================================
CREATE TABLE messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sender_id INT NOT NULL,
  receiver_id INT NOT NULL,
  exchange_request_id INT NULL,
  message_text TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_msg_sender FOREIGN KEY (sender_id)
    REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_msg_receiver FOREIGN KEY (receiver_id)
    REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_msg_request FOREIGN KEY (exchange_request_id)
    REFERENCES exchange_requests (id) ON DELETE SET NULL,
  INDEX idx_msg_pair (sender_id, receiver_id, created_at),
  INDEX idx_msg_unread (receiver_id, is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 10. NOTIFICATIONS TABLE
-- Real-time and persistent alerts delivered to students for platform events.
-- ============================================================================
CREATE TABLE notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type ENUM(
    'request_received',
    'request_accepted',
    'request_rejected',
    'session_booked',
    'session_rescheduled',
    'session_completed',
    'credit_earned',
    'system_alert'
  ) NOT NULL,
  title VARCHAR(150) NOT NULL,
  message TEXT NOT NULL,
  reference_id INT NULL,
  reference_type VARCHAR(50) NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notif_user FOREIGN KEY (user_id)
    REFERENCES users (id) ON DELETE CASCADE,
  INDEX idx_notif_user_unread (user_id, is_read, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 11. REPORTS TABLE
-- Campus safety, moderation, dispute handling, and peer conduct reports.
-- ============================================================================
CREATE TABLE reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reporter_id INT NOT NULL,
  reported_user_id INT NOT NULL,
  session_id INT NULL,
  reason ENUM(
    'no_show',
    'inappropriate_behavior',
    'skill_mismatch',
    'spam',
    'harassment',
    'other'
  ) NOT NULL,
  description TEXT NOT NULL,
  status ENUM('pending', 'under_review', 'resolved', 'dismissed') NOT NULL DEFAULT 'pending',
  resolution_notes TEXT NULL,
  resolved_by INT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_rep_reporter FOREIGN KEY (reporter_id)
    REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_rep_reported FOREIGN KEY (reported_user_id)
    REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_rep_session FOREIGN KEY (session_id)
    REFERENCES sessions (id) ON DELETE SET NULL,
  CONSTRAINT fk_rep_resolver FOREIGN KEY (resolved_by)
    REFERENCES users (id) ON DELETE SET NULL,
  INDEX idx_rep_status (status, created_at),
  INDEX idx_rep_reported_user (reported_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

