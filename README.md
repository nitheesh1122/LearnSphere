# LearnSphere — Professional eLearning Platform

LearnSphere is a **full-stack, role-driven eLearning Management System (LMS)** built to demonstrate **real-world system design, access control, and learning workflows**.
It provides **dedicated portals** for **Administrators, Instructors, and Learners**, with strict rule enforcement and a scalable architecture.

This project was developed in clearly defined phases, prioritizing **correct functionality first**, followed by **UI/UX polish and branding**.

---

## 🎯 What Problem LearnSphere Solves

Most LMS platforms either:

* Focus only on content delivery, or
* Mix roles and permissions loosely, or
* Lack proper learning progression and verification

**LearnSphere addresses these gaps** by providing:

* Clear role separation (Admin / Instructor / Learner)
* Rule-driven learning progression
* Instructor-controlled course structure
* Verifiable course completion with certificates

---

## 🚀 Key Features

### Platform-Level

* **Role-Based Access Control (RBAC)** with strict route and data protection
* **Scalable architecture** using modern full-stack patterns
* **Consistent design system** with role-based visual differentiation

### Admin

* User management (view, ban/unban)
* Global course moderation
* Platform-wide analytics (read-only oversight)

### Instructor

* Advanced course builder (Video, Text, Quiz, Document, Image)
* Lesson reordering and visibility control
* Quiz builder with attempt-based scoring
* Student progress analytics per course
* Invitation-based access control

### Learner

* Course discovery with visibility rules
* Structured lesson progression (mandatory vs optional)
* Interactive quizzes with scoring logic
* Progress tracking and badges
* **Auto-generated certificates with QR-based verification**

---

## 🛠️ Tech Stack

### Frontend

* **Framework:** Next.js (App Router, Server Actions)
* **Language:** TypeScript
* **Styling:** Tailwind CSS 4 + shadcn/ui
* **Forms & Validation:** React Hook Form + Zod
* **Branding:** Shared design system with role-based accent colors
* **Motion:** Minimal, brand-focused entry animations

### Backend

* **Runtime:** Node.js (via Next.js)
* **Auth:** NextAuth.js (Credentials Provider)
* **Database:** PostgreSQL
* **ORM:** Prisma (type-safe data access & migrations)

---

## 🧠 System Highlights

* **Rule-driven learning flow** (enrollment → lessons → quizzes → completion)
* **Mandatory vs optional lesson enforcement**
* **Attempt-based quiz scoring**
* **Certificate trust model** with public verification endpoint
* **Soft-delete strategy** to preserve historical data
* **Read-only analytics** to maintain data integrity

---

## 📂 Project Structure

```text
/src
 ├── app/          # Next.js App Router (Routes, Layouts, Pages)
 ├── components/   # Shared & role-specific UI components
 ├── lib/          # Server actions & business logic
 ├── hooks/        # Custom React hooks
 ├── styles/       # Global styles & Tailwind configuration
 ├── types/        # TypeScript type definitions
/prisma
 ├── schema.prisma # Database schema
 ├── migrations/   # Migration history
```

---

## ⚙️ Getting Started (Local Development)

### 1. Clone the repository

```bash
git clone <repository-url>
cd learn-sphere
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env` file with the following:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/learnsphere
AUTH_SECRET=your-secret-key
```

### 4. Run database migrations

```bash
npx prisma migrate dev
```

### 5. Start the development server

```bash
npm run dev
```

---

## 📖 Documentation

Detailed documentation is included in the repository:

* **Project Overview**
  * System architecture
  * Role separation
  * Learning flow design
* **Frontend Architecture**
  * App Router usage
  * UI component system
  * Branding & UX decisions
* **Backend Architecture**
  * Data modeling
  * RBAC enforcement
  * Business rule implementation

These documents explain **what was built, why it was built, and how decisions were made**.

---

## 📌 Project Status

* ✅ Core functionality complete (Phases 1–5)
* ✅ UI/UX & branding complete (Phase 6)
* 🔜 Performance tuning & optimization (Phase 7 – optional)

---

## 🤝 Contribution & Usage

This project is intended for:

* Academic evaluation
* System design demonstrations
* Full-stack learning reference

Not currently optimized for production deployment.

---

Built with ❤️ as a **learning-first, system-driven platform**.
