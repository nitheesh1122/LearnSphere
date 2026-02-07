# Authentication & Security Strategy

## Overview
LearnSphere uses **NextAuth.js v5** with a **Credentials Provider** to handle authentication.

## Strategy Decisions

### 1. Session Strategy: JWT (Stateless)
- **Choice**: JSON Web Tokens (JWT).
- **Reason**: 
  - **Scalability**: No database lookup required for every request to check session validity.
  - **Performance**: Faster middleware checks.
  - **Simplicity**: Works seamlessly with Next.js App Router and Edge Middleware.

### 2. Password Handling
- **Hashing**: `bcryptjs` with salt round 10.
- **Validation**: Zod schema validation ensures minimum length (6 chars) on client and server.

### 3. Role-Based Access Control (RBAC)
- **Implementation**:
  - Roles (`ADMIN`, `INSTRUCTOR`, `LEARNER`) are stored in the Database.
  - Upon login, the role is embedded into the **JWT** and **Session** object.
  - **Middleware** intercepts requests to protected routes (`/admin/*`, `/instructor/*`, etc.) and checks the role in the JWT token.
- **Security**:
  - API Routes also verify session role before processing sensitive actions.

### 4. Route Protection
- Public: `/login`, `/register`, `/` (landing).
- Protected: 
  - `/admin`: Requires `ADMIN` role.
  - `/instructor`: Requires `INSTRUCTOR` role.
  - `/learner`: Requires `LEARNER` role.
