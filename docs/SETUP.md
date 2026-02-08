# LearnSphere - Technical Stack & Setup Justification

This document outlines the core technologies chosen for LearnSphere PHASE 1 and the rationale behind each.

## Core Framework
### Next.js 14 (App Router)
- **Why**: Standard for modern React applications. The App Router provides:
  - **Server Components**: Reduced bundle size, better performance.
  - **Nested Layouts**: Ideal for separating Authentication, Admin, Instructor, and Learner interfaces.
  - **API Routes**: Built-in backend capabilities, simplifying deployment and avoiding separate backend infra for MVP.
  - **Prisma Support**: Seamless integration for database operations.

### TypeScript
- **Why**: Enforces type safety across the entire stack (Database -> API -> Client). Reduces runtime errors significantly, critical for an enterprise-grade LMS.

## Styling & UI
### Tailwind CSS
- **Why**: Utility-first approach ensures design consistency and rapid UI development. Eliminates the complexity of naming CSS classes and managing stylesheets.

### shadcn/ui
- **Why**:
  - Not a black-box component library; components are copied into the codebase, allowing full customization.
  - Built on **Radix UI**, ensuring accessibility (keyboard nav, screen readers) out of the box.
  - Integrates perfectly with Tailwind CSS.

## Development Tools
### ESLint & Prettier
- **Why**:
  - **ESLint**: Catches potential bugs and enforces code quality rules (e.g., catching unused variables, accessibility issues).
  - **Prettier**: Enforces consistent code formatting (indentation, quotes, etc.), eliminating bike-shedding in code reviews.

## Authentication
### NextAuth.js
- **Why**: Standard library for Next.js auth. Secure by default.
- **Config**: Using Credentials Provider (Email/Password) with JWT strategy for stateless, scalable authentication without complex session management infrastructure initially.
