'use server';

import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import { z } from 'zod';
import { LoginFormSchema, RegisterFormSchema } from './definitions';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        const data = Object.fromEntries(formData);
        const parsed = LoginFormSchema.safeParse(data);

        if (!parsed.success) {
            return 'Invalid inputs.';
        }

        await signIn('credentials', {
            email: data.email,
            password: data.password,
        });

        // If signIn is successful with redirect:false, it returns nothing but sets cookie
        // We handle client-side redirect or throw error if it failed?
        // Actually with v5, strict redirect:false might require manual handling.
        // Let's use redirect:true by default or handle logic.
        // Reverting to standard handling:
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Invalid credentials.';
                default:
                    return 'Something went wrong.';
            }
        }
        throw error;
    }
}

export async function authenticateValues(values: z.infer<typeof LoginFormSchema>) {
    try {
        await signIn('credentials', values);
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return { error: 'Invalid credentials.' };
                default:
                    return { error: 'Something went wrong.' };
            }
        }
        throw error;
    }
}

export async function register(values: z.infer<typeof RegisterFormSchema>) {
    const validatedFields = RegisterFormSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: 'Invalid fields' };
    }

    const { email, password, name, role } = validatedFields.data;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        // Check existing
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) return { error: 'Email already in use.' };

        // Get role ID
        const roleRecord = await prisma.role.findUnique({ where: { name: role } });
        if (!roleRecord) return { error: 'Invalid role selected.' };

        const user = await prisma.user.create({
            data: {
                name,
                email,
                passwordHash: hashedPassword,
                roles: {
                    create: {
                        roleId: roleRecord.id
                    }
                }
            }
        });

        // success
    } catch (error) {
        console.error('Registration error:', error);
        return { error: 'Failed to create user.' };
    }

    redirect('/login');
}
