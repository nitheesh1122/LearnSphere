# Layout Architecture

## Overview
LearnSphere uses Next.js Nested Layouts to apply distinct UI shells for different user roles.

## Layouts

### 1. AuthLayout (`src/app/(auth)/layout.tsx`)
- **Purpose**: Wraps Login and Register pages.
- **Design**: Centered card on a gray background.
- **Components**: None (pure layout).

### 2. AdminLayout (`src/app/(admin)/layout.tsx`)
- **Purpose**: Dashboard shell for Administrators.
- **Features**:
  - Top Navigation Bar (Overview, Users, Settings).
  - User Menu (Sign Out).
- **Style**: Professional, data-dense.

### 3. InstructorLayout (`src/app/(instructor)/layout.tsx`)
- **Purpose**: Dashboard shell for Instructors.
- **Features**:
  - Top Navigation (Dashboard, My Courses).
  - User Menu.
- **Style**: Creator-focused.

### 4. LearnerLayout (`src/app/(learner)/layout.tsx`)
- **Purpose**: Main learning interface.
- **Features**:
  - Top Navigation (My Learning, Catalog).
  - User Menu.
- **Style**: Clean, distraction-free.

## Scalability
New features (e.g., specific course view) can introduce their own nested layouts (e.g., `src/app/(learner)/course/[id]/layout.tsx`) without affecting the global role-based shells.
