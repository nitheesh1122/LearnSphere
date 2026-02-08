# LearnSphere
**Repository**: [LearnSphere on GitHub](https://github.com/nitheesh1122/LearnSphere)

## 🚀 Project Overview

LearnSphere is a comprehensive Learning Management System (LMS) designed to bridge the gap between instructors and learners. It provides a seamless platform for creating, hosting, and consuming educational content. Built with modern web technologies, LearnSphere offers a robust and scalable solution for online education.

The platform supports multiple user roles, including **Admins**, **Instructors**, and **Learners**, each with tailored dashboards and functionalities.

## ✨ Key Features

### For Instructors
*   **Course Creation**: Intuitive tools to create courses with rich text descriptions, video lessons, and image assets.
*   **Lesson Management**: Organize curriculum into lessons and modules. Support for video embedding (YouTube, Vimeo) and markdown-based text lessons.
*   **Quiz Builder**: Integrated quiz creator to assess learner progress. Support for multiple-choice questions, scoring, and editing.
*   **Analytics**: Track course performance and learner engagement (views, enrollments).

### For Learners
*   **Dashboard**: Personalized dashboard to track enrolled courses, progress, and activity streaks.
*   **Course Catalog**: Browse available courses with filtering and search capabilities.
*   **Learning Experience**: Distraction-free video player and lesson viewer. Progress tracking for every lesson.
*   **Certification**: (Planned) Earn certificates upon course completion.

### System Features
*   **Authentication**: Secure login and registration using NextAuth.js.
*   **Role-Based Access Control (RBAC)**: Distinct permissions for Admins, Instructors, and Learners.
*   **Database**: Robust data management using PostgreSQL and Prisma ORM.

## 🛠️ Tech Stack

*   **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS, Shadcn UI
*   **Database**: PostgreSQL
*   **ORM**: Prisma
*   **Authentication**: NextAuth.js (v5 Beta)
*   **Forms**: React Hook Form + Zod
*   **UI Components**: Radix UI

## 📦 Installation & Setup

1.  **Clone the repository**
    ```bash
    git clone https://github.com/nitheesh1122/LearnSphere.git
    cd LearnSphere
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Configuration**
    Create a `.env` file in the root directory and add your environment variables:
    ```env
    DATABASE_URL="postgresql://user:password@localhost:5432/learn_sphere"
    AUTH_SECRET="your-auth-secret"
    # Add other necessary keys
    ```

4.  **Database Setup**
    ```bash
    npx prisma generate
    npx prisma db push
    ```

5.  **Run Development Server**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🤝 Contribution

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
