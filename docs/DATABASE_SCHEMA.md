# Database Schema Design

This document explains the data models defined in `schema.prisma`.

## Core Identity & Access

### `User`
- **Purpose**: Represents any actor in the system (Admin, Instructor, Learner).
- **Key Relations**: 
  - `roles`: Many-to-Many via `UserRole`. Allows a user to hold multiple roles (e.g., an Instructor can also be a Learner).
  - `enrollments`: Tracks courses the user is taking.
- **Why**: Central identity management.

### `Role`
- **Purpose**: distinct roles like "ADMIN", "INSTRUCTOR", "LEARNER".
- **Why**: Decoupled from User to allow dynamic role assignment and future custom roles.

### `UserRole`
- **Purpose**: Join table linking `User` and `Role`.
- **Why**: Standard Many-to-Many pattern in relational DBs.

### `AccessPolicy`
- **Purpose**: Defines granular permissions (e.g., Role X can READ Resource Y).
- **Why**: Abstraction layer for RBAC/ABAC logic, separating code from policy data.

## Course Management

### `Course`
- **Purpose**: The container for learning material.
- **Key Relations**:
  - `instructor`: The creator/owner.
  - `contents`: Ordered list of chapters/lessons.
- **Indexes**: Indexed by `instructorId` for dashboard performance.

### `CourseContent`
- **Purpose**: Single source of truth for all learning materials (Video, Text, Quiz).
- **Why**: Avoids separate tables (Lesson, Quiz, Video) which complicates ordering. Content is polymorphic via `type` field.
- **Key Relations**: 
  - `quiz`: Optional one-to-one link if content type is QUIZ.

### `Quiz`
- **Purpose**: Assessment data.
- **Why**: Decoupled from Content to keep the main content table lightweight. Linked directly to `CourseContent`.

## Learning & Progress

### `Enrollment`
- **Purpose**: Tracks a user's participation in a course.
- **Why**: Separate from `User` to store enrollment-specific metadata (enrolledAt, progress).

### `ContentProgress`
- **Purpose**: Tracks completion status of individual content items.
- **Why**: Granular progress tracking allows resuming exactly where left off.

## Gamification & Engagement

### `Badge` & `UserBadge`
- **Purpose**: Gamification elements.
- **Why**: Many-to-many relation allows reusable badges awarded to multiple users.

### `Certificate`
- **Purpose**: Proof of completion.
- **Why**: Generated artifact linked to User and Course.

### `DropOffAlert`
- **Purpose**: Retention mechanism.
- **Why**: Tracks inactivity to trigger re-engagement emails.

## Administrative

### `Invitation`
- **Purpose**: Secure onboarding for Instructors/Admins via email.
- **Why**: Avoids public registration for privileged roles.
