'use server';

import { auth } from '@/auth';
import prisma from '../prisma';
import { z } from 'zod';
import {
    ProfileFormSchema,
    PasswordChangeSchema,
    NotificationSettingsSchema,
    LearnerPreferencesSchema
} from '../definitions';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';

export async function updateProfile(values: z.infer<typeof ProfileFormSchema>) {
    const session = await auth();
    if (!session?.user?.id) throw new Error('Unauthorized');

    const validatedFields = ProfileFormSchema.safeParse(values);
    if (!validatedFields.success) return { error: 'Invalid fields' };

    const { name, bio, timezone, language, title, expertiseTags, publicBio } = validatedFields.data;

    try {
        const userRole = session.user.role;

        const data: any = {
            name,
            bio,
            timezone,
            language,
        };

        // If instructor, handle InstructorProfile
        if (userRole === 'INSTRUCTOR') {
            data.instructorProfile = {
                upsert: {
                    create: {
                        title,
                        expertiseTags: expertiseTags ? expertiseTags.split(',').map(t => t.trim()) : [],
                        publicBio,
                    },
                    update: {
                        title,
                        expertiseTags: expertiseTags ? expertiseTags.split(',').map(t => t.trim()) : [],
                        publicBio,
                    },
                },
            };
        }

        await prisma.user.update({
            where: { id: session.user.id },
            data,
        });

        revalidatePath('/profile');
        return { success: 'Profile updated successfully' };
    } catch (error) {
        console.error('Profile update error:', error);
        return { error: 'Failed to update profile' };
    }
}

export async function updatePassword(values: z.infer<typeof PasswordChangeSchema>) {
    const session = await auth();
    if (!session?.user?.id) throw new Error('Unauthorized');

    const validatedFields = PasswordChangeSchema.safeParse(values);
    if (!validatedFields.success) return { error: 'Invalid fields' };

    const { currentPassword, newPassword } = validatedFields.data;

    try {
        const user = await prisma.user.findUnique({ where: { id: session.user.id } });
        if (!user) return { error: 'User not found' };

        const passwordsMatch = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!passwordsMatch) return { error: 'Incorrect current password' };

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: session.user.id },
            data: { passwordHash: hashedNewPassword },
        });

        return { success: 'Password changed successfully' };
    } catch (error) {
        return { error: 'Failed to update password' };
    }
}

export async function updateNotificationPreferences(values: z.infer<typeof NotificationSettingsSchema>) {
    const session = await auth();
    if (!session?.user?.id) throw new Error('Unauthorized');

    try {
        await prisma.user.update({
            where: { id: session.user.id },
            data: { notificationPreferences: values as any },
        });
        return { success: 'Preferences saved' };
    } catch (error) {
        return { error: 'Failed to save preferences' };
    }
}

export async function updateLearnerPreferences(values: z.infer<typeof LearnerPreferencesSchema>) {
    const session = await auth();
    if (!session?.user?.id) throw new Error('Unauthorized');

    try {
        await prisma.learnerPreferences.upsert({
            where: { userId: session.user.id },
            create: {
                userId: session.user.id,
                ...values,
            },
            update: values,
        });
        return { success: 'Preferences saved' };
    } catch (error) {
        return { error: 'Failed to save preferences' };
    }
}

export async function deleteAccount(password: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error('Unauthorized');

    try {
        const user = await prisma.user.findUnique({ where: { id: session.user.id } });
        if (!user) return { error: 'User not found' };

        const passwordsMatch = await bcrypt.compare(password, user.passwordHash);
        if (!passwordsMatch) return { error: 'Incorrect password' };

        // Soft delete
        await prisma.user.update({
            where: { id: session.user.id },
            data: { isActive: false },
        });

        return { success: 'Account deactivated' };
    } catch (error) {
        return { error: 'Failed to delete account' };
    }
}

export async function updateAvatar(url: string | null) {
    const session = await auth();
    if (!session?.user?.id) throw new Error('Unauthorized');

    try {
        await prisma.user.update({
            where: { id: session.user.id },
            data: { avatarUrl: url },
        });
        revalidatePath('/profile');
        return { success: url ? 'Avatar updated' : 'Avatar removed' };
    } catch (error) {
        return { error: 'Failed to update avatar' };
    }
}
