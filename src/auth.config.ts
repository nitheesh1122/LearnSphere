import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    pages: {
        signIn: '/login',
        newUser: '/register',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const userRole = auth?.user?.role;

            // Public routes that don't require authentication
            const publicRoutes = ['/login', '/register', '/', '/search'];
            const isPublicRoute = publicRoutes.includes(nextUrl.pathname);

            // Allow access to public routes
            if (isPublicRoute) {
                return true;
            }

            // If not logged in, redirect to login
            if (!isLoggedIn) {
                return false; // This will redirect to login page
            }

            const isAdminRoute = nextUrl.pathname.startsWith('/admin');
            const isInstructorRoute = nextUrl.pathname.startsWith('/instructor');
            const isLearnerRoute = nextUrl.pathname.startsWith('/learner');

            if (isAdminRoute) {
                return userRole === 'ADMIN';
            }

            if (isInstructorRoute) {
                return userRole === 'INSTRUCTOR' || userRole === 'ADMIN';
            }

            if (isLearnerRoute) {
                return userRole === 'LEARNER' || userRole === 'ADMIN';
            }

            // Allow access to other routes
            return true;
        },
        async session({ session, token }) {
            if (token.sub && session.user) {
                session.user.id = token.sub;
            }
            if (token.role && session.user) {
                session.user.role = token.role;
            }
            return session;
        },
        async jwt({ token, user }) {
            // Logic to attach role to token will be added in auth.ts
            return token;
        },
    },
    providers: [], // Configured in auth.ts
} satisfies NextAuthConfig;
