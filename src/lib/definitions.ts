import { z } from 'zod';

export const LoginFormSchema = z.object({
    email: z.string().email({ message: 'Please enter a valid email.' }),
    password: z.string().min(1, { message: 'Password field must not be empty.' }),
});

const roles: [string, ...string[]] = ['INSTRUCTOR', 'LEARNER'];

export const RegisterFormSchema = z.object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
    email: z.string().email({ message: 'Please enter a valid email.' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
    // @ts-ignore
    role: z.enum(roles, { invalid_type_error: 'Please select a role.' }),
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
    // image: z.string().optional(), // Future
});

export const LessonFormSchema = z.object({
    title: z.string().min(2, { message: 'Title must be at least 2 characters.' }),
    type: z.enum(['VIDEO', 'TEXT', 'QUIZ', 'IMAGE', 'DOCUMENT']),
    hidden: z.boolean(),
    contentUrl: z.string().optional(),
    description: z.string().optional(),
    attachments: z.string().optional(), // JSON string for now
});

