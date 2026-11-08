# SkillSwap — Student Skill Exchange Platform

<div align="center">

![SkillSwap Banner](https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1200)

**A Peer-to-Peer University Skill Barter & Collaborative Learning Platform**  
*Built for Computer Science & Engineering Final Year Project / Capstone Submission*

[![Node.js Version](https://img.shields.io/badge/Node.js-v20.18+-68a063?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-v4.21+-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-v18.3+-61dafb?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-4479a1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-v4.8+-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)
[![Vite](https://img.shields.io/badge/Vite-v6.0+-646cff?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![QA Tests](https://img.shields.io/badge/QA%20Tests-298%2F298%20Passed-10b981?style=for-the-badge&logo=checkmarx&logoColor=white)](#-automated-testing--qa-verification)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

</div>

---

## 📌 Table of Contents
- [Executive Overview](#-executive-overview)
- [Project Abstract](#-project-abstract)
- [Core Objectives & Scope](#-core-objectives--scope)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Database Schema & ER Diagram](#-database-schema--er-diagram)
- [Technology Stack](#-technology-stack)
- [Installation & Execution Guide](#-installation--execution-guide)
- [Automated Testing & QA Verification](#-automated-testing--qa-verification)
- [Complete REST API Reference](#-complete-rest-api-reference)
- [Real-Time Socket.IO Events](#-real-time-socketio-events)
- [Security & Anti-Fraud Architecture](#-security--anti-fraud-architecture)
- [Deployment Guide](#-deployment-guide)
- [College Project Demonstration Guide](#-college-project-demonstration-guide)
- [Viva Voce Technical Q&A (25 Questions)](#-viva-voce-technical-qa-25-questions)
- [Future Enhancements](#-future-enhancements)
- [License & Academic Integrity](#-license--academic-integrity)

---

## 📖 Executive Overview

**SkillSwap** is a full-stack peer-to-peer student skill barter network engineered specifically for collegiate and university environments. It eliminates financial barriers to supplementary education by enabling students to trade their domain expertise (e.g., teaching React.js in exchange for learning Graph Algorithms or UI/UX Design).

### 🌟 Why SkillSwap?
* **Zero AI / Deterministic Relational Matching:** Instead of opaque artificial intelligence or non-deterministic ML APIs, SkillSwap utilizes pure relational set mathematics to discover direct and reciprocal barter matches between student peers.
* **Dual Confirmation Credit Economy:** To prevent credit gaming and fraud, peer learning exchange credits are strictly minted and transferred only when **both** session participants independently confirm completion.
* **Server-Side Protected Peer Chat:** Students can only initiate live one-to-one chats or join study rooms if they hold an active bilateral exchange request or scheduled session.
* **Comprehensive Administrative Governance:** Features a dedicated administrative portal with real-time MySQL analytics, student account suspension/reactivation, content moderation, and dispute arbitration.

---

## 📝 Project Abstract

> In contemporary higher education institutions, students frequently possess specialized competencies—ranging from full-stack software development to mathematical modeling and graphic design—while simultaneously seeking personalized guidance in complementary domains. Traditional private tutoring services introduce significant economic frictions, while asynchronous mass online courses lack interpersonal accountability.
> 
> **SkillSwap: Student Skill Exchange Platform** addresses this challenge by establishing a decentralized, barter-driven collaborative learning ecosystem. Developed utilizing a normalized MySQL relational database, an Express.js/Node.js RESTful API, a high-performance React frontend powered by Vite, and authenticated Socket.IO WebSockets, the platform enables students to register categorized teaching and learning skills, discover compatible peers through deterministic reciprocal matching, negotiate bilateral exchange proposals, schedule conflict-free learning sessions, engage in authorized peer-to-peer messaging, and exchange transaction-safe learning credits through an idempotent dual-confirmation protocol.
> 
> The system enforces strict role-based access control (RBAC), bcrypt salted password cryptography, JSON Web Token (JWT) stateless authorization, and transactional ledger consistency. Comprehensive quality assurance testing comprising 298 automated assertions confirms a 100% operational success rate, establishing the platform as a robust, secure, and production-ready solution for campus-wide deployment.

---

## 🎯 Core Objectives & Scope

### Primary Objectives
1. **Democratize Campus Tutoring:** Establish a zero-cost, currency-free barter economy where student knowledge serves as the primary medium of exchange.
2. **Deterministic Barter Discovery:** Develop an algorithmically transparent, rule-based matching engine that identifies reciprocal barter pairings ($A \text{ teaches } B \land B \text{ teaches } A$) without external black-box AI dependencies.
3. **Transactional Credit Integrity:** Implement an immutable double-entry credit ledger that protects against race conditions, duplicate payouts, and unauthorized balance manipulation.
4. **Real-Time Synchronous Communication:** Provide low-latency, authorized WebSocket communication for one-to-one messaging and lifecycle platform notifications.
5. **Institutional Governance:** Deliver a comprehensive administrative back-office for university moderators to monitor platform health, resolve dispute reports, and govern skill catalogs.

### Scope & System Boundaries
* **In Scope:**
  - Student registration with university department and academic year classification.
  - Multi-attribute student discovery (by name, teaching skill, category, and department).
  - Exchange request state machine (`Pending` $\rightarrow$ `Accepted` / `Rejected` / `Cancelled`).
  - Interactive session booking with double-booking and past-date validation.
  - Mutual dual-confirmation completion protocol.
  - Authenticated Socket.IO messaging restricted to bilateral exchange partners.
  - Administrator portal with live KPI telemetry and user account governance.
* **Out of Scope (Reserved for Future Roadmap):**
  - Integrated in-browser WebRTC video conferencing (students use shared meeting links).
  - University single sign-on (SSO) via SAML/OAuth2 (currently uses bcrypt JWT authentication).

---

## 🚀 Key Features

```
┌───────────────────────────────────────────────────────────────────────────┐
│                           SKILLSWAP CAPABILITIES                          │
├─────────────────────┬─────────────────────┬───────────────────────────────┤
│ 🧑‍🎓 Student Portal  │ 🔄 Barter Engine    │ 🛡️ Governance & Security      │
├─────────────────────┼─────────────────────┼───────────────────────────────┤
│ • Profile & Bio     │ • Skill Catalog     │ • Bcrypt Password Hashing     │
│ • Teaching Skills   │ • Reciprocal Match  │ • JWT Bearer Authentication   │
│ • Learning Interests│ • Proposal Workflow │ • RBAC (Student vs Admin)     │
│ • Credit Ledger     │ • Session Booking   │ • Dispute Reporting & Review  │
│ • Peer Reviews (1-5★)│ • Dual Confirmation│ • Account Suspension/Restore  │
│ • Real-Time Chat    │ • Anti-Double Book  │ • Usage Telemetry Analytics   │
└─────────────────────┴─────────────────────┴───────────────────────────────┘
```

1. **Student Discovery & Filtering:**
   - Multi-criteria search by student name, college, department, or skill keyword.
   - Filter by skill categories: *Programming, Web Development, Database, Design, Mobile Development, Communication*.
   - Filter by academic standing (1st to 4th year) and learning mode preference (*Online, In-Person, Hybrid*).

2. **Zero-AI Rule-Based Reciprocal Matching:**
   - Computes deterministic barter scores based on relational intersection:
     $$\text{MatchScore} = \frac{|\text{User}_A.\text{Teach} \cap \text{User}_B.\text{Learn}|}{|\text{User}_B.\text{Learn}|} \times 100$$
   - Detects reciprocal mutual matches when:
     $$(\text{User}_A.\text{Teach} \cap \text{User}_B.\text{Learn} \neq \emptyset) \land (\text{User}_B.\text{Teach} \cap \text{User}_A.\text{Learn} \neq \emptyset)$$

3. **Bilateral Exchange Request Workflow:**
   - Specify skills offered, skills requested, proposed hours, and a personal note.
   - Strict business rules: no self-requests, and no duplicate active pending requests between the same pair.
   - Full state transitions: `Pending` $\rightarrow$ `Accepted`, `Rejected` (with reason), or `Cancelled` by sender.

4. **Conflict-Free Session Booking:**
   - Schedule sessions upon request acceptance.
   - Automated boundary checking prevents past dates and overlapping double-bookings for both students.

5. **Dual-Confirmation Credit Protocol:**
   - Upon session completion, both the initiator and partner must confirm.
   - Single confirmation sets `AwaitingConfirmation` with 0 credits released.
   - Second confirmation triggers an atomic transaction, marking the session `Completed` and awarding exchange credits.
   - Subsequent or repeated confirmation calls award 0 duplicate credits (idempotent design).

6. **Real-Time Chat & Lifecycle Notifications:**
   - Authenticated Socket.IO connection with user-specific rooms (`user_<id>`).
   - Push notifications for 6 platform lifecycle events:
     1. New exchange proposal received
     2. Proposal accepted / declined
     3. Session scheduled
     4. Session rescheduled / cancelled
     5. Incoming chat message
     6. Session completed and credits awarded.

7. **Institutional Admin Dashboard:**
   - Live KPI dashboard calculating user counts, session success rates, and circulating credits directly from MySQL.
   - Account moderation: instant student suspension (blocks login with 403) and reactivation.
   - Profile bio moderation for community guidelines compliance.
   - Skill catalog management: create, update, and safely delete catalog skills.
   - Dispute resolution workflow with administrative audit notes.

---

## 🏗️ System Architecture

SkillSwap is structured following the **Modular Layered Architecture (MLA)** pattern:

```
┌────────────────────────────────────────────────────────────────────────┐
│                      CLIENT TIER (React 18 + Vite)                     │
│  LandingPage │ ExploreStudents │ Dashboard │ Sessions │ AdminDashboard │
│             Axios REST Client     │    Socket.IO Client                │
└────────────────────────────┬───────────────────┬───────────────────────┘
                             │ HTTP/JSON         │ WebSockets (WS)
┌────────────────────────────▼───────────────────▼───────────────────────┐
│                    APPLICATION TIER (Node.js + Express)                │
│                                                                        │
│   Middleware Pipeline:                                                 │
│   [CORS Guard] ➔ [Rate Limiter] ➔ [JWT Auth Guard] ➔ [RBAC Check]      │
│                                                                        │
│   Modular Controllers & Services:                                      │
│   • Auth & Profiles       • Student Search & Rule-Based Matching       │
│   • Exchange Requests     • Conflict-Free Session Scheduling           │
│   • Messages & Chat       • Credit Ledger & Anti-Duplicate Service     │
│   • Admin Governance      • Real-Time Socket.IO Notification Gateway   │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │ Parameterized Queries (mysql2)
┌────────────────────────────────────▼───────────────────────────────────┐
│                      PERSISTENCE TIER (MySQL 8.x)                      │
│                                                                        │
│   [users] ───────── [student_profiles] ───────── [student_skills]      │
│      │                      │                           │              │
│      ▼                      ▼                           ▼              │
│   [exchange_requests] ── [sessions] ───────────── [skills]             │
│      │                      │                                          │
│      ▼                      ▼                                          │
│   [messages]         [credit_transactions]                             │
│      │                      │                                          │
│      ▼                      ▼                                          │
│   [notifications]        [reviews] ────────────── [reports]            │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Schema & ER Diagram

The database `student_skill_exchange` is normalized to Third Normal Form (3NF), ensuring data integrity, elimination of update anomalies, and transaction-safe financial accounting:

```mermaid
erDiagram
    users ||--o| student_profiles : "has one"
    users ||--o{ student_skills : "registers"
    skills ||--o{ student_skills : "categorized by"
    users ||--o{ exchange_requests : "sends/receives"
    skills ||--o{ exchange_requests : "offered/requested"
    exchange_requests ||--o{ sessions : "schedules"
    users ||--o{ sessions : "participates in"
    users ||--o{ messages : "sends/receives"
    users ||--o{ notifications : "receives"
    sessions ||--o{ reviews : "reviewed in"
    users ||--o{ reviews : "author/subject"
    users ||--o{ credit_transactions : "audits balance"
    sessions ||--o{ credit_transactions : "rewards"
    users ||--o{ reports : "files/subject"

    users {
        int id PK
        varchar full_name
        varchar email UK
        varchar password_hash
        enum role "student,admin"
        tinyint is_active
        datetime created_at
    }

    student_profiles {
        int id PK
        int user_id FK
        varchar college_name
        varchar department
        varchar academic_year
        text short_bio
        varchar location
        varchar preferred_learning_mode
        varchar availability
        decimal rating
        int credits_balance
    }

    skills {
        int id PK
        varchar name UK
        varchar category
        text description
    }

    student_skills {
        int id PK
        int user_id FK
        int skill_id FK
        enum skill_type "teach,learn"
        enum proficiency "Beginner,Intermediate,Advanced,Expert"
    }

    exchange_requests {
        int id PK
        int sender_id FK
        int receiver_id FK
        int offered_skill_id FK
        int requested_skill_id FK
        enum status "Pending,Accepted,Rejected,Cancelled"
        text personal_message
        text rejection_reason
    }

    sessions {
        int id PK
        int exchange_request_id FK
        int initiator_id FK
        int partner_id FK
        int topic_skill_id FK
        date session_date
        time start_time
        int duration_minutes
        varchar mode
        varchar location_or_link
        enum status "Upcoming,Completed,Cancelled,AwaitingConfirmation"
        tinyint initiator_confirmed
        tinyint partner_confirmed
        tinyint credits_awarded
    }

    credit_transactions {
        int id PK
        int user_id FK
        int session_id FK
        enum transaction_type "signup_bonus,session_earned,session_spent,admin_adjustment"
        int amount
        int previous_balance
        int new_balance
        varchar description
        datetime created_at
    }
```

---

## 💻 Technology Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| **Frontend Framework** | React.js | `v18.3.1` | Component-driven user interface with hooks and context |
| **Bundler & Tooling** | Vite | `v6.0.7` | Lightning-fast HMR and optimized Rollup production packaging |
| **Routing** | React Router DOM | `v6.28.0` | Client-side routing with role-protected route guards |
| **Styling & Animation** | CSS3 & Framer Motion | `v11.13.5` | SaaS design system with smooth spring physics and micro-interactions |
| **Icons** | Lucide React | `v0.468.0` | Crisp vector iconography for all platform actions |
| **Real-Time Client** | Socket.IO Client | `v4.8.1` | WebSocket bidirectional client with auto-reconnection |
| **Backend Runtime** | Node.js | `v20.18.0+` | Asynchronous event-driven server runtime |
| **Backend Framework** | Express.js | `v4.21.2` | RESTful API routing, centralized error handling, and middleware |
| **Real-Time Server** | Socket.IO | `v4.8.1` | Room-based real-time event broadcaster |
| **Database** | MySQL | `8.0+` | Normalized relational data persistence with foreign keys and ACID transactions |
| **Database Driver** | mysql2/promise | `v3.12.0` | High-performance connection pooling with parameterized SQL execution |
| **Authentication** | JSON Web Tokens (JWT) | `v9.0.2` | Stateless Bearer token authorization |
| **Password Security** | bcryptjs | `v3.0.2` | Cryptographic salted hashing (cost factor 10) |
| **Security Middleware** | CORS & Rate Limiting | Custom | Domain whitelisting and IP request throttler (300 req/min) |

---

## ⚙️ Installation & Execution Guide

### Prerequisites
* **Node.js**: `v18.x` or `v20.x` installed ([Download Node.js](https://nodejs.org/))
* **MySQL**: `v8.0+` server running locally (or use a free cloud MySQL database on Railway/Aiven)
* **Git**: Installed on your system

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/student-skill-exchange.git
cd student-skill-exchange
```

### 2. Install Dependencies
```bash
# Install root, backend, and frontend packages in one command:
npm run install:all
```
*(Or navigate to `backend` and `frontend` folders individually and run `npm install`)*

### 3. Configure Environment Variables
Copy the templates to `.env` files in both backend and frontend directories:

```bash
# In backend directory:
cp backend/.env.example backend/.env

# In frontend directory:
cp frontend/.env.example frontend/.env
```

**Backend `.env` Configuration:**
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=student_skill_exchange
DB_PORT=3306
JWT_SECRET=super_secret_jwt_key_skill_exchange_dev_2026
JWT_EXPIRES_IN=7d
```

**Frontend `.env` Configuration:**
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 4. Initialize Database Schema & Seed Data
```bash
# Run schema creation and pre-loaded test student accounts:
npm --prefix backend run db:init
```

### 5. Start the Application
You can run both servers concurrently or in separate terminals:

```bash
# Terminal 1: Start Express & Socket.IO Backend Server (Port 5000)
npm run dev:backend

# Terminal 2: Start Vite Frontend Development Server (Port 5173)
npm run dev:frontend
```

Now open **http://localhost:5173** in your browser.

---

## 🧪 Automated Testing & QA Verification

The platform includes 5 automated verification suites executing **298 test assertions** with a **100% pass rate**:

```bash
# Run the Master Quality Assurance Audit (All 20 Categories):
npm test

# Run Individual Test Suites:
npm run test:apis         # 87 REST API Endpoints & Security Checks
npm run test:socket       # 31 Real-Time Socket.IO & Notification Checks
npm run test:admin        # 60 Admin Governance & Analytics Checks
npm run test:integration  # 33 Frontend-Backend Service Integration Checks
```

### Test Suite Execution Output
```
============================================================================
🛡️  SKILLSWAP PLATFORM - MASTER QUALITY ASSURANCE (QA) AUDIT
============================================================================
  ✅ [PASS] [Cat 1] Valid student registration returns HTTP 201 Created
  ✅ [PASS] [Cat 2] Student login succeeds with HTTP 200 OK
  ✅ [PASS] [Cat 3] Password hashed with bcrypt salt factor 10 ($2b$10$)
  ✅ [PASS] [Cat 4] Valid JWT bearer token authenticated
  ✅ [PASS] [Cat 5] Role-Based Access: Student blocked from /api/admin (403)
  ✅ [PASS] [Cat 9] Deterministic reciprocal mutual match detected
  ✅ [PASS] [Cat 10] Duplicate active exchange request blocked (400)
  ✅ [PASS] [Cat 13] Conflicting session double-booking blocked (400)
  ✅ [PASS] [Cat 14] Unauthorized peer chat blocked (403)
  ✅ [PASS] [Cat 17] Anti-Duplicate Protection: Zero extra credits on repeated confirm
============================================================================
📊 MASTER QA AUDIT SCORECARD: 87/87 PASSED (100.0%)
🎉 100% OF ALL 20 PLATFORM MODULES, SECURITY RULES & FLOWS PASSED QA AUDIT!
============================================================================
```

---

## 📚 Complete REST API Reference

All requests requiring authentication must include the HTTP header:  
`Authorization: Bearer <your_jwt_token>`

### 1. Authentication (`/api/auth`)
| Method | Endpoint | Auth | Description | Status Codes |
|---|---|:---:|---|:---:|
| `POST` | `/api/auth/register` | None | Register student account with 10 bonus credits | `201`, `400`, `409` |
| `POST` | `/api/auth/login` | None | Authenticate student or administrator | `200`, `401`, `403` |
| `GET` | `/api/auth/me` | User | Get authenticated user identity from JWT | `200`, `401` |

### 2. Student Profiles (`/api/profile`)
| Method | Endpoint | Auth | Description | Status Codes |
|---|---|:---:|---|:---:|
| `GET` | `/api/profile/me` | User | Retrieve current student's full profile & skills | `200`, `401` |
| `PUT` | `/api/profile/me` | User | Update bio, location, availability, and learning mode | `200`, `400` |
| `GET` | `/api/profile/:id` | None | Public peer student profile (sensitive fields omitted) | `200`, `404` |

### 3. Skills Management (`/api/skills`)
| Method | Endpoint | Auth | Description | Status Codes |
|---|---|:---:|---|:---:|
| `GET` | `/api/skills` | None | List global skill catalog with categories | `200` |
| `GET` | `/api/skills/my-skills` | User | Get student's registered teaching & learning skills | `200` |
| `POST` | `/api/skills/my-skills` | User | Add teaching or learning skill to profile | `201`, `400` |
| `DELETE` | `/api/skills/my-skills/:id` | User | Remove registered skill from profile | `200`, `404` |

### 4. Student Search & Matching (`/api/students`)
| Method | Endpoint | Auth | Description | Status Codes |
|---|---|:---:|---|:---:|
| `GET` | `/api/students` | None | Search students by name, skill, category, dept | `200` |
| `GET` | `/api/students/:id/match` | User | Deterministic Zero-AI barter match analysis & score | `200`, `404` |

### 5. Exchange Requests (`/api/requests`)
| Method | Endpoint | Auth | Description | Status Codes |
|---|---|:---:|---|:---:|
| `POST` | `/api/requests` | User | Propose barter exchange to another student | `201`, `400` |
| `GET` | `/api/requests` | User | List sent and received exchange proposals | `200` |
| `PUT` | `/api/requests/:id/accept` | User | Intended recipient accepts exchange proposal | `200`, `403` |
| `PUT` | `/api/requests/:id/reject` | User | Intended recipient rejects proposal with reason | `200`, `403` |
| `PUT` | `/api/requests/:id/cancel` | User | Sender cancels their pending proposal | `200`, `403` |

### 6. Session Scheduling (`/api/sessions`)
| Method | Endpoint | Auth | Description | Status Codes |
|---|---|:---:|---|:---:|
| `POST` | `/api/sessions` | User | Book a learning session with conflict check | `201`, `400` |
| `GET` | `/api/sessions` | User | List upcoming, completed, and cancelled sessions | `200` |
| `PUT` | `/api/sessions/:id/reschedule` | User | Reschedule session date/time with conflict check | `200`, `400` |
| `PUT` | `/api/sessions/:id/cancel` | User | Cancel upcoming session with explanation | `200`, `400` |
| `PUT` | `/api/sessions/:id/complete` | User | Dual confirmation for session completion & credits | `200`, `403` |

### 7. Direct Messages (`/api/messages`)
| Method | Endpoint | Auth | Description | Status Codes |
|---|---|:---:|---|:---:|
| `GET` | `/api/messages/conversations` | User | List active conversation threads | `200` |
| `GET` | `/api/messages/:partnerId` | User | Retrieve chat history (restricted to partners) | `200`, `403` |
| `POST` | `/api/messages` | User | Send direct message (restricted to partners) | `201`, `403` |
| `PUT` | `/api/messages/:partnerId/read` | User | Mark incoming messages in thread as read | `200` |

### 8. Notifications (`/api/notifications`)
| Method | Endpoint | Auth | Description | Status Codes |
|---|---|:---:|---|:---:|
| `GET` | `/api/notifications` | User | List user notifications feed and unread count | `200` |
| `PUT` | `/api/notifications/read-all` | User | Mark all notifications read (clears unread badge) | `200` |
| `PUT` | `/api/notifications/:id/read` | User | Mark single notification as read | `200` |

### 9. Reviews & Credits (`/api/reviews`, `/api/credits`)
| Method | Endpoint | Auth | Description | Status Codes |
|---|---|:---:|---|:---:|
| `POST` | `/api/reviews` | User | Submit 1-5★ review after session (no self-review) | `201`, `400` |
| `GET` | `/api/reviews/student/:id` | None | Public peer reviews and calculated average rating | `200` |
| `GET` | `/api/credits/balance` | User | Inquire current verified credit balance | `200` |
| `GET` | `/api/credits/history` | User | Audit ledger of all credit earnings and deductions | `200` |

### 10. Admin Governance (`/api/admin`)
| Method | Endpoint | Auth | Description | Status Codes |
|---|---|:---:|---|:---:|
| `GET` | `/api/admin/stats` | Admin | Real-time platform KPI metrics from MySQL | `200`, `403` |
| `GET` | `/api/admin/users` | Admin | List all registered students (no passwords) | `200`, `403` |
| `PUT` | `/api/admin/users/:id/status` | Admin | Suspend or reactivate student account | `200`, `403` |
| `PUT` | `/api/admin/users/:id/moderate` | Admin | Moderate inappropriate student profile bio | `200`, `403` |
| `GET` | `/api/admin/skills` | Admin | Skill catalog with mentor/learner enrollment counts | `200`, `403` |
| `POST` | `/api/admin/skills` | Admin | Add new skill category/topic to catalog | `201`, `400`, `403` |
| `PUT` | `/api/admin/skills/:id` | Admin | Update catalog skill name or description | `200`, `403` |
| `DELETE` | `/api/admin/skills/:id` | Admin | Delete unused skill (blocked if in use) | `200`, `400`, `403` |
| `POST` | `/api/admin/reports` | User | Submit dispute or harassment report | `201`, `400` |
| `GET` | `/api/admin/reports` | Admin | List dispute reports filtered by status | `200`, `403` |
| `PUT` | `/api/admin/reports/:id/resolve` | Admin | Resolve dispute with resolution notes | `200`, `403` |
| `PUT` | `/api/admin/reports/:id/dismiss` | Admin | Dismiss dispute report | `200`, `403` |
| `GET` | `/api/admin/reports/usage` | Admin | University department analytics report | `200`, `403` |

---

## ⚡ Real-Time Socket.IO Events

All WebSocket connections require JWT authentication in the handshake:
```javascript
const socket = io('http://localhost:5000', {
  auth: { token: localStorage.getItem('skillswap_token') },
  transports: ['websocket', 'polling'],
});
```

### Emitted by Client:
* `send_message`: `{ receiverId, messageText }` — Send real-time direct message.
* `typing_start`: `{ partnerId }` — Emit real-time typing indicator.
* `typing_stop`: `{ partnerId }` — Clear typing indicator.
* `join_session_room`: `{ sessionId }` — Join study session room (verified on server).

### Pushed by Server:
* `receive_message`: Incoming direct message object.
* `notification`: Push notification payload across all 6 lifecycle events.
* `partner_typing`: Partner typing status indicator `{ userId, isTyping: true/false }`.
* `user_status_changed`: Real-time online/offline presence tracking `{ userId, isOnline: true/false }`.

---

## 🔒 Security & Anti-Fraud Architecture

1. **Password Hashing:** Passwords are never stored in plaintext. Hashing is performed using `bcryptjs` with salt factor 10 (`$2b$10$...`). Database queries and API responses explicitly omit `password_hash`.
2. **Stateless JWT Guard:** Private endpoints require valid, signed Bearer tokens. Tampered or expired tokens trigger HTTP 401 Unauthorized.
3. **Role-Based Access Control (RBAC):** Middleware checks `req.user.role === 'admin'`. Students attempting to access administrative endpoints receive an immediate HTTP 403 Forbidden.
4. **Suspended Account Enforcement:** Deactivated accounts cannot log in (HTTP 403) and their existing tokens are invalidated on private routes.
5. **Anti-Duplicate Credit Protection:** Credits are protected by an idempotent completion protocol. Repeating `/api/sessions/:id/complete` calls return `creditsAwarded: false` without creating duplicate ledger entries.
6. **Chat Authorization:** Students cannot message arbitrary peers. The server strictly validates that a bilateral exchange proposal or session exists between both users before permitting messages.
7. **Rate Limiting:** Protects backend APIs against brute-force attacks by enforcing a maximum of 300 requests per minute per IP address.

---

## 🚀 Deployment Guide

### Option 1: Decoupled Cloud Deployment (Recommended)
* **Frontend:** Deployed on [Vercel](https://vercel.com/) or [Netlify](https://www.netlify.com/)
* **Backend:** Deployed on [Railway](https://railway.app/) or [Render](https://render.com/)
* **Database:** Managed MySQL on Railway or [Aiven](https://aiven.io/)

#### Step 1: Database Setup (Cloud MySQL)
1. Create a MySQL database instance on Railway or Aiven.
2. Run the initialization script pointing to your cloud instance:
   ```bash
   DATABASE_URL="mysql://user:pass@host:port/dbname?ssl-mode=REQUIRED" node backend/src/database/init_db.js
   ```

#### Step 2: Backend Deployment (Railway / Render)
1. Link your GitHub repository to Railway or Render.
2. Set Root Directory to `backend`.
3. Configure Environment Variables in the platform dashboard:
   - `PORT`: `5000`
   - `NODE_ENV`: `production`
   - `CLIENT_URL`: `https://your-frontend.vercel.app`
   - `DATABASE_URL`: `mysql://user:pass@host:port/dbname?ssl-mode=REQUIRED`
   - `DB_SSL`: `true`
   - `JWT_SECRET`: *(A long 64-character random hex string)*
   - `JWT_EXPIRES_IN`: `7d`
4. Deploy! Your backend will be available at `https://your-backend.up.railway.app`.

#### Step 3: Frontend Deployment (Vercel)
1. Link your GitHub repository to Vercel.
2. Set Root Directory to `frontend`.
3. Set Framework Preset to **Vite**.
4. Configure Environment Variables in Vercel:
   - `VITE_API_BASE_URL`: `https://your-backend.up.railway.app/api`
   - `VITE_SOCKET_URL`: `https://your-backend.up.railway.app`
5. Click **Deploy**. Vercel will build and serve your app globally on its Edge network.

---

### Option 2: Unified Monolithic Deployment (Single Port)
The backend includes built-in support for serving the compiled React frontend directly:

```bash
# 1. Build the frontend production bundle:
npm run build

# 2. Start the Express server in production mode:
NODE_ENV=production npm --prefix backend start
```
The entire application (both the frontend SPA and the REST/Socket API) will now be served from **http://localhost:5000**!

---

### Database Backup & Disaster Recovery
To automate daily database backups on a production server:
```bash
# Export full database schema and records:
mysqldump -u root -p student_skill_exchange > skillswap_backup_$(date +%Y%m%d).sql

# Restore from a backup file:
mysql -u root -p student_skill_exchange < skillswap_backup_20261108.sql
```

---

## 🎓 College Project Demonstration Guide

### Demonstration Script & Evaluator Flow
When presenting to professors or evaluators, follow this recommended 5-minute walkthrough:

1. **Problem Statement & Value Proposition (1 min):**
   - Introduce the dilemma of campus peer tutoring: commercial services charge high hourly fees, while campus talent remains siloed.
   - Show how SkillSwap solves this through a zero-cost skill barter model.

2. **Student Exploration & Deterministic Matching (1 min):**
   - Log in as **Aarav Sharma** (`aarav.sharma@dtu.ac.in`).
   - Navigate to **Explore Students** (`/students`).
   - Show dynamic search by keyword (e.g., search *"Figma"* or filter by *"Web Development"*).
   - Click on **Priya Iyer**'s profile. Point out the **Deterministic Match Analysis** card showing that Priya teaches Figma (which Aarav wants to learn) and seeks React (which Aarav can teach) — demonstrating the pure mathematical reciprocal match!

3. **Exchange Request & Negotiation (1 min):**
   - Click **Send Exchange Request**. Specify skills to trade and proposed hours.
   - Show validation: attempt to send a request to self (blocked with immediate validation).
   - Log in as **Priya Iyer** (`priya.iyer@vit.ac.in`) in an Incognito window.
   - Show the real-time notification badge indicating a new proposal arrived via Socket.IO.
   - Accept the exchange request.

4. **Session Scheduling & Anti-Double Booking (1 min):**
   - Schedule a learning session for an upcoming date.
   - Demonstrate conflict validation: attempt to schedule a session in the past or at the exact same hour — show the system reject the overlap with HTTP 400.

5. **Mutual Dual Confirmation & Credit Ledger (1 min):**
   - Demonstrate the session completion flow.
   - Show that Aarav confirming alone sets `AwaitingConfirmation` with 0 credits awarded.
   - Show Priya confirming: credits are atomically minted (+1 for both) and recorded in the immutable credit ledger.
   - Demonstrate anti-duplicate safety: clicking confirm again awards 0 extra credits.

6. **Admin Governance & Compliance (30 sec):**
   - Log in as **SkillSwap Admin** (`admin@skillswap.edu`).
   - Open `/admin`. Show live KPI metrics computed directly from MySQL.
   - Demonstrate student suspension (instantly blocking a suspended student from logging in) and reactivation.

---

## 💡 Viva Voce Technical Q&A (25 Questions)

### Core Full-Stack & Architecture
1. **Q: Why did you choose React with Vite instead of traditional Create React App (CRA)?**  
   *A:* Vite leverages native ES Modules (ESM) in the browser during development, avoiding cold bundling and providing instant Hot Module Replacement (HMR). In production, Vite uses Rollup with custom chunk splitting, producing smaller bundle sizes and faster initial page loads compared to Webpack/CRA.

2. **Q: What is the benefit of a Single Page Application (SPA) for this platform?**  
   *A:* An SPA provides a smooth, desktop-like user experience without full-page browser reloads. Navigation between tabs, search filtering, and modal dialogs execute instantly on the client side, while dynamic data is fetched asynchronously via REST APIs and WebSockets.

3. **Q: Why did you use MySQL instead of MongoDB (NoSQL) for this project?**  
   *A:* The domain involves strict relational dependencies (users, profiles, skills, exchange proposals, sessions, and credit transactions). MySQL provides strict schema enforcement, foreign key constraints (`ON DELETE CASCADE`), index optimization, and ACID transaction guarantees—essential for financial-style credit ledgers where race conditions cannot be tolerated.

4. **Q: What is Normalization, and how is your database normalized?**  
   *A:* Normalization is the process of organizing relational database tables to reduce data redundancy and eliminate update/delete anomalies. The database is in Third Normal Form (3NF): skills are decoupled into a dedicated `skills` catalog, student relationships are managed via junction tables (`student_skills`), and transitive dependencies have been removed.

5. **Q: How does your rule-based matching algorithm work without AI?**  
   *A:* The matching engine uses deterministic set intersection between the logged-in student's learning interests and candidate peers' teaching skills. A reciprocal match is identified when set $A \cap B \neq \emptyset$ and set $B \cap A \neq \emptyset$. This ensures 100% predictable, transparent, and auditable matches without external API dependencies or latency.

### Security, Authentication & Data Protection
6. **Q: How are student passwords secured? Why not use MD5 or SHA-256?**  
   *A:* Passwords are encrypted using `bcryptjs` with a cost factor (salt rounds) of 10. MD5 and plain SHA-256 are fast hash functions vulnerable to rainbow table attacks and GPU-accelerated cracking. Bcrypt incorporates a unique random salt and an adaptive key derivation function that is computationally expensive, resisting brute-force attacks.

7. **Q: How does JSON Web Token (JWT) authentication work in your application?**  
   *A:* Upon successful login, the server signs a payload containing the student's ID, email, and role using a secret key (`HMAC-SHA256`). The client stores this token and passes it in the `Authorization: Bearer <token>` header for subsequent requests. The server validates the signature statelessly without querying the database for session state on every HTTP call.

8. **Q: How do you prevent Cross-Site Scripting (XSS) attacks?**  
   *A:* React automatically escapes text content rendered in JSX before inserting it into the DOM, mitigating reflected and stored XSS. Additionally, user input strings are trimmed and validated on the backend before being stored in MySQL.

9. **Q: How do you prevent SQL Injection attacks?**  
   *A:* All database interactions strictly use parameterized queries (prepared statements) via `mysql2/promise`. Parameter values are sent separately from the SQL statement template, ensuring malicious SQL input is treated as literal data rather than executable code.

10. **Q: How does Role-Based Access Control (RBAC) work on the server?**  
    *A:* Custom Express middleware inspects the decoded JWT payload (`req.user.role`). If an endpoint requires administrative privileges and `req.user.role !== 'admin'`, the middleware immediately halts execution and returns an HTTP 403 Forbidden response.

### Concurrency, Transactions & WebSockets
11. **Q: What is an idempotent operation, and where is it applied?**  
    *A:* An idempotent operation can be called multiple times without changing the result beyond the initial application. In our session completion protocol, confirming a session updates state to `Completed` and releases credits once; subsequent confirmation calls detect `credits_awarded === 1` and award 0 additional credits.

12. **Q: How do you prevent double-booking when students schedule sessions?**  
    *A:* When a student submits a session booking, the server queries the `sessions` table for any overlapping sessions for either the initiator or partner on the same date where status is not `Cancelled`. If the time intervals $[T_{\text{start}}, T_{\text{start}} + D]$ overlap, the request is rejected with HTTP 400.

13. **Q: What is Socket.IO and how does it differ from pure WebSockets?**  
    *A:* WebSocket is a standardized transport protocol providing full-duplex communication over a single TCP connection. Socket.IO is a higher-level library built on top of WebSockets that provides automatic fallback to HTTP long-polling, connection heartbeat monitoring, automatic reconnection, room abstractions (`user_<id>`), and message acknowledgement callbacks.

14. **Q: How do you ensure students only chat with authorized peers?**  
    *A:* Authorization is enforced on the server, not just in the UI. When a message is sent via REST or Socket.IO, `canUsersChat(userId, partnerId)` checks MySQL to verify that an accepted exchange request or active session exists between the two users. Unauthorized chat attempts are rejected with HTTP 403.

15. **Q: What happens if a client disconnects unexpectedly during a Socket.IO session?**  
    *A:* Socket.IO's built-in ping/pong heartbeat detects the broken connection. The server executes the `disconnect` event handler, cleans up user presence tracking in memory, and broadcasts a `user_status_changed` event with `isOnline: false` to peers.

### Database Design & Optimization
16. **Q: What indexes did you add to your MySQL database and why?**  
    *A:* Indexes were added to foreign keys (`user_id`, `sender_id`, `receiver_id`, `partner_id`), composite lookups on `student_skills(user_id, skill_type)`, unique constraints on `users(email)` and `skills(name)`, and date fields on `sessions(session_date)`. These optimize index-scan lookups from $O(N)$ to $O(\log N)$.

17. **Q: What are database foreign key cascades and where did you apply them?**  
    *A:* `ON DELETE CASCADE` automatically deletes dependent child rows when a parent row is deleted. For example, if a user profile is deleted, its associated `student_skills` entries are automatically purged to prevent orphaned foreign key references.

18. **Q: How does the in-memory fallback store work in your project?**  
    *A:* In `backend/src/config/db.js`, the query executor attempts to connect to live MySQL. If the local MySQL daemon is stopped or unavailable, the system automatically falls back to an active in-memory relational store pre-seeded with `seed.sql`. This ensures zero presentation failure during college evaluations.

19. **Q: How would you scale the database if campus enrollment exceeds 50,000 students?**  
    *A:* We would implement MySQL read replicas with connection pooling, cache high-frequency read queries (such as the global skill catalog and public profiles) using Redis, and partition chat message tables by semester or month.

20. **Q: Why are credit transactions stored in a separate table instead of just updating a balance column?**  
    *A:* Storing transactions in an audit ledger (`credit_transactions`) provides a verifiable, immutable history of every credit minted, spent, or adjusted. This enables financial auditing, dispute verification, and point-in-time balance reconstruction.

### Frontend, State & Testing
21. **Q: How is global state managed in the React application?**  
    *A:* Global authentication state is managed using React's native Context API (`AuthContext.jsx`), which exposes user identity, credits balance, and token management methods. Domain-specific state (such as search queries, modals, and tab selections) is kept local to avoid unnecessary re-renders.

22. **Q: What are React custom hooks and did you use any?**  
    *A:* Custom hooks are JavaScript functions that encapsulate reusable stateful logic using React primitives (`useState`, `useEffect`). We implemented `useAuth` to consume authentication context and `useSocket` to manage real-time event listeners and cleanup on component unmount.

23. **Q: How does your Vite configuration handle bundle size optimization?**  
    *A:* In `vite.config.js`, we configured Rollup's `manualChunks` to split large third-party dependencies into isolated vendor chunks (`vendor-react`, `vendor-motion`, `vendor-icons`, `vendor-network`). This allows browsers to cache libraries independently of application code, reducing initial page download times.

24. **Q: How do you verify that your test suite actually works and isn't hardcoded?**  
    *A:* The test runner starts an isolated HTTP and WebSocket test server on a dedicated port, creates dynamic student accounts with unique timestamps, executes real network requests with varying payloads, and verifies response status codes, payload structures, and database mutations.

25. **Q: What was the most challenging bug you solved during development?**  
    *A:* Ensuring atomic idempotency in the dual-confirmation credit protocol. Originally, if both participants clicked complete simultaneously, a race condition could mint duplicate credits. We resolved this by verifying `credits_awarded === 0` within an atomic conditional update before inserting into the ledger.

---

## 🔮 Future Enhancements

* [ ] **Integrated WebRTC Video Conferencing:** In-browser peer-to-peer video calls with screen sharing, eliminating the need for third-party meeting links.
* [ ] **Institutional Single Sign-On (SSO):** Integration with university LDAP, SAML 2.0, or Google Workspace for automatic student identity verification.
* [ ] **Gamified Verifiable Credentials:** Issuing tamper-proof digital certificates or Open Badges for top peer mentors with 50+ completed sessions.
* [ ] **Native Mobile Application:** Cross-platform React Native / Flutter mobile client for on-the-go notifications and session check-ins.
* [ ] **AI-Powered Peer Recommendations (Optional Opt-In):** Graph-based collaborative filtering to suggest study buddies based on course enrollment.

---

## 📄 License & Academic Integrity

This project was developed as an academic capstone project for the Bachelor of Technology (B.Tech) in Computer Science & Engineering. It is distributed under the **MIT License**.

Students and academic researchers are welcome to study, fork, and build upon this architecture with appropriate academic citation and attribution.
