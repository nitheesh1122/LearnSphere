'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ProfileFormSchema } from '@/lib/definitions';
import { updateProfile, updateAvatar } from '@/lib/actions/profile';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { Camera, Loader2, X } from 'lucide-react';

interface ProfileFormProps {
    user: any; // Type this properly based on your Prisma user + relations
}

export function ProfileForm({ user }: ProfileFormProps) {
    const [isPending, setIsPending] = useState(false);

    const form = useForm<z.infer<typeof ProfileFormSchema>>({
        resolver: zodResolver(ProfileFormSchema),
        defaultValues: {
            name: user.name || '',
            bio: user.bio || '',
            timezone: user.timezone || '',
            language: user.language || 'en',
            title: user.instructorProfile?.title || '',
            expertiseTags: user.instructorProfile?.expertiseTags?.join(', ') || '',
            publicBio: user.instructorProfile?.publicBio || '',
        },
    });

    async function onSubmit(values: z.infer<typeof ProfileFormSchema>) {
        setIsPending(true);
        const result = await updateProfile(values);
        setIsPending(false);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success(result.success);
        }
    }

    const handleAvatarUpdate = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            toast.error("File too large. Max 2MB.");
            return;
        }

        // In a real app, you'd upload to S3/Cloudinary and get a URL.
        // For this implementation, we'll simulate it with a data URL or just a mock success.
        // Since I don't have an upload service, I'll alert the user.
        toast.info("Avatar upload is a demonstration. URL update simulated.");
        // Simulated URL
        await updateAvatar("https://github.com/shadcn.png");
    };

    const removeAvatar = async () => {
        await updateAvatar(null);
    };

    const isInstructor = user.roles?.some((r: any) => r.role.name === 'INSTRUCTOR');
    const isAdmin = user.roles?.some((r: any) => r.role.name === 'ADMIN');

    return (
        <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-1">
                <Card className="p-6">
                    <div className="flex flex-col items-center text-center">
                        <div className="relative group">
                            <Avatar className="w-32 h-32 border-4 border-slate-50">
                                <AvatarImage src={user.avatarUrl} />
                                <AvatarFallback className="text-2xl bg-slate-100 text-slate-400">
                                    {user.name?.charAt(0) || 'U'}
                                </AvatarFallback>
                            </Avatar>
                            <label className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border cursor-pointer hover:bg-slate-50 transition-colors">
                                <Camera className="w-4 h-4 text-slate-600" />
                                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpdate} />
                            </label>
                            {user.avatarUrl && (
                                <button
                                    onClick={removeAvatar}
                                    className="absolute top-0 right-0 p-1 bg-white rounded-full shadow-sm border opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:bg-red-50"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                        <h2 className="mt-4 text-xl font-bold">{user.name}</h2>
                        <div className="mt-1 flex items-center justify-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 uppercase tracking-wider">
                                {user.roles?.[0]?.role.name}
                            </span>
                        </div>
                        <p className="mt-4 text-sm text-muted-foreground">
                            Member since {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                </Card>
            </div>

            <div className="lg:col-span-2 space-y-8">
                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-6">Personal Information</h3>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid gap-6 md:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Full Name</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Your name" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormItem>
                                    <FormLabel>Email Address</FormLabel>
                                    <Input value={user.email} disabled className="bg-slate-50 cursor-not-allowed" />
                                    <FormDescription>Email cannot be changed.</FormDescription>
                                </FormItem>
                            </div>

                            <FormField
                                control={form.control}
                                name="bio"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Short Bio</FormLabel>
                                        <FormControl>
                                            <Textarea {...field} placeholder="Tell us about yourself..." className="resize-none h-24" />
                                        </FormControl>
                                        <FormDescription>Brief description for your profile.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid gap-6 md:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="timezone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Timezone</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="UTC+5:30" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="language"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Preferred Language</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="English" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {isInstructor && (
                                <div className="pt-6 border-t space-y-6">
                                    <h3 className="text-lg font-semibold">Instructor Details</h3>
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <FormField
                                            control={form.control}
                                            name="title"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Professional Title</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="Senior Web Developer" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="expertiseTags"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Expertise Tags</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="React, Next.js, TypeScript" />
                                                    </FormControl>
                                                    <FormDescription>Comma separated list.</FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <FormField
                                        control={form.control}
                                        name="publicBio"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Public Bio</FormLabel>
                                                <FormControl>
                                                    <Textarea {...field} placeholder="Detailed bio for students..." className="resize-none h-32" />
                                                </FormControl>
                                                <FormDescription>This will be shown on your course pages.</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )}

                            <div className="flex justify-end pt-4">
                                <Button type="submit" disabled={isPending}>
                                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    </Form>
                </Card>
            </div>
        </div>
    );
}
