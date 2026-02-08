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

            const isAdminRoute = nextUrl.pathname.startsWith('/admin');
            const isInstructorRoute = nextUrl.pathname.startsWith('/instructor');
            const isLearnerRoute = nextUrl.pathname.startsWith('/learner');
            const isAuthRoute = nextUrl.pathname.startsWith('/login') || nextUrl.pathname.startsWith('/register');

            if (isAuthRoute) {
                if (isLoggedIn) {
                    // Redirect to respective dashboard
                    if (userRole === 'ADMIN') return Response.redirect(new URL('/admin', nextUrl));
                    if (userRole === 'INSTRUCTOR') return Response.redirect(new URL('/instructor', nextUrl));
                    return Response.redirect(new URL('/learner', nextUrl));
                }
                return true;
            }

            if (isAdminRoute) {
                if (!isLoggedIn) return false;
                return userRole === 'ADMIN';
            }

            if (isInstructorRoute) {
                if (!isLoggedIn) return false;
                return userRole === 'INSTRUCTOR' || userRole === 'ADMIN'; // Admin can access instructor? Maybe. Strict for now:
                // Prompt said "Instructor cannot access admin", "Learner cannot access admin or instructor"
                // Let's keep it strict.
            }

            if (isLearnerRoute) {
                if (!isLoggedIn) return false;
                return userRole === 'LEARNER' || userRole === 'ADMIN'; // Admin can likely view learner view? 
                // For Phase 1 strictness:
                // actually ADMIN usually has god mode.
                // Let's allow ADMIN to access everything for debugging, or keep strict. 
                // User said "Instructor cannot access admin", "Learner cannot access admin or instructor".
                // It didn't explicitly say "Admin CAN access instructor/learner routes" but implied "Admin can access everything".
                // So I will allow ADMIN to access all.
                if (userRole === 'ADMIN') return true;
                return userRole === 'LEARNER';
            }

            // Allow access to other routes (landing page, api, etc)
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
