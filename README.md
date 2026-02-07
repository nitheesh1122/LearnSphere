# LearnSphere – Professional eLearning Platform

LearnSphere is a modern, high-performance eLearning Management System (LMS) built with Next.js 15+, Tailwind CSS 4, Prisma, and PostgreSQL. It provides a structured learning environment with dedicated portals for Administrators, Instructors, and Learners.

## 🚀 Key Features

- **Role-Based Access Control (RBAC):** Dedicated dashboards for Admin, Instructor, and Learner roles.
- **Course Management:** Advanced course builder with modular lesson support (Video, Text, Quiz).
- **Interactive Quizzes:** Automated scoring and progress-based unlocking mechanics.
- **Analytics Dashboard:** Real-time tracking of student progress and course performance.
- **Certification Engine:** Instant generation of verifiable certificates upon course completion.
- **Premium UI/UX:** A stunning, brand-driven design with role-specific visual identities.

## 🛠️ Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router & Server Actions)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Database:** [PostgreSQL](https://www.postgresql.org/) via [Prisma ORM](https://www.prisma.io/)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)
- **Auth:** [NextAuth.js](https://next-auth.js.org/)
- **Validation:** [Zod](https://zod.dev/) & [React Hook Form](https://react-hook-form.com/)

## 📂 Project Structure

```text
/src
  /app         # Next.js App Router (Routes & Layouts)
  /components  # Role-specific & Shared UI Components
  /lib         # Server Actions & Business Logic
  /styles      # Global CSS & Tailwind Config
  /types       # TypeScript Definitions
```

## ⚙️ Getting Started

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd learn-sphere
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env` file and add your `DATABASE_URL` and `AUTH_SECRET`.

4. **Run Database Migrations:**
   ```bash
   npx prisma migrate dev
   ```

5. **Start the Development Server:**
   ```bash
   npm run dev
   ```

## 📖 Technical Documentation

For in-depth technical details, please refer to the following documentation (available in the project repository):
- **Project Overview:** System-level architecture and solution design.
- **Frontend Architecture:** Component system, styling, and rendering strategy.
- **Backend Architecture:** Data modeling, RBAC, and business rules.

---
Built with ❤️ by the LearnSphere Team.
