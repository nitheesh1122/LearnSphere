import { z } from 'zod';

export const LoginFormSchema = z.object({
    email: z.string().email({ message: 'Please enter a valid email.' }),
    password: z.string().min(1, { message: 'Password field must not be empty.' }),
});

const roles = ['INSTRUCTOR', 'LEARNER'] as const;

export const RegisterFormSchema = z.object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
    email: z.string().email({ message: 'Please enter a valid email.' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
    role: z.enum(roles, { message: 'Please select a role.' }),
});

export const CourseFormSchema = z.object({
    title: z.string().min(5, { message: 'Title must be at least 5 characters.' }),
    description: z.string().optional(),
    price: z.number().min(0, { message: 'Price must be non-negative.' }).optional(),
    accessType: z.enum(['OPEN', 'INVITE', 'PAID']),
    published: z.boolean(),
    tags: z.string().optional(), // We'll handle comma-separated string in frontend
    website: z.string().url({ message: 'Invalid URL' }).or(z.literal('')).optional(),
    level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
    visibility: z.enum(['EVERYONE', 'SIGNED_IN']),
    responsibleId: z.string().optional(),
    imageUrl: z.string().refine((val) => {
        if (!val || val === '') return true;
        // Accept both full URLs and relative paths starting with /
        return /^https?:\/\/.+/.test(val) || /^\/uploads\/.+/.test(val);
    }, { message: 'Invalid URL or upload path' }).optional(),
    previewVideoUrl: z.string().refine((val) => {
        if (!val || val === '') return true;
        // Accept both full URLs and relative paths starting with /
        return /^https?:\/\/.+/.test(val) || /^\/uploads\/.+/.test(val);
    }, { message: 'Invalid URL or upload path' }).optional(),
});

export const LessonFormSchema = z.object({
    title: z.string().min(2, { message: 'Title must be at least 2 characters.' }),
    type: z.enum(['VIDEO', 'TEXT', 'QUIZ', 'IMAGE', 'DOCUMENT']),
    hidden: z.boolean(),
    contentUrl: z.string().optional(),
    description: z.string().optional(),
    attachments: z.string().optional(), // JSON string for now
    isPreview: z.boolean().optional(),
});

export const ProfileFormSchema = z.object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
    bio: z.string().max(500, { message: 'Bio must be less than 500 characters.' }).optional(),
    timezone: z.string().optional(),
    language: z.string().optional(),
    // Roles specific (Instructor)
    title: z.string().optional(),
    expertiseTags: z.string().optional(), // Comma separated
    publicBio: z.string().max(1000, { message: 'Public bio must be less than 1000 characters.' }).optional(),
});

export const PasswordChangeSchema = z.object({
    currentPassword: z.string().min(1, { message: 'Current password is required.' }),
    newPassword: z.string().min(6, { message: 'New password must be at least 6 characters.' }),
    confirmPassword: z.string().min(6),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

export const NotificationSettingsSchema = z.object({
    courseUpdates: z.boolean(),
    quizCompletion: z.boolean(),
    certificateIssued: z.boolean(),
    platformAnnouncements: z.boolean(),
});

export const LearnerPreferencesSchema = z.object({
    resumePlayback: z.boolean(),
    autoNextLesson: z.boolean(),
    emailFromInstructors: z.boolean(),
});

export const InstructorPreferencesSchema = z.object({
    notifyNewEnrollment: z.boolean(),
    notifyCourseCompletion: z.boolean(),
    notifyQuizFailures: z.boolean(),
    defaultLessonVisibility: z.enum(['PUBLIC', 'PRIVATE']),
    defaultQuizRetryLimit: z.number().min(0),
});

