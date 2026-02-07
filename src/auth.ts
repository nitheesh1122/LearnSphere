import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { authConfig } from './auth.config';

async function getUser(email: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { email },
            include: { roles: { include: { role: true } } },
        });
        return user;
    } catch (error) {
        console.error('Failed to fetch user:', error);
        throw new Error('Failed to fetch user.');
    }
}

export const { auth, signIn, signOut, handlers } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            async authorize(credentials) {
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { email, password } = parsedCredentials.data;
                    const user = await getUser(email);

                    if (!user) return null;

                    const passwordsMatch = await bcrypt.compare(password, user.passwordHash);
                    if (passwordsMatch) {
                        if (user.isActive === false) return null; // Block inactive users

                        // Return user object compatible with NextAuth
                        // We'll flatten the role for session
                        const primaryRole = user.roles[0]?.role.name || 'LEARNER';

                        return {
                            id: user.id,
                            email: user.email,
                            name: user.name,
                            // Custom property - note: types need extending
                            role: primaryRole,
                        };
                    }
                }
                console.log('Invalid credentials');
                return null;
            },
        }),
    ],
    callbacks: {
        ...authConfig.callbacks,
        async jwt({ token, user }) {
            if (user) {
                token.role = (user as any).role;
                token.id = user.id!; // Assert non-null since user from DB always has id
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                // @ts-ignore
                session.user.role = token.role as string;
            }
            return session;
        }
    }
});
