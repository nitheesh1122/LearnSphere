'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    PasswordChangeSchema,
    NotificationSettingsSchema,
    LearnerPreferencesSchema
} from '@/lib/definitions';
import {
    updatePassword,
    updateNotificationPreferences,
    updateLearnerPreferences,
    deleteAccount
} from '@/lib/actions/profile';
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
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, ShieldAlert, LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

// -----------------------------------------------------------------------------
// Security / Password Form
// -----------------------------------------------------------------------------
export function SecuritySettings({ userId }: { userId: string }) {
    const [isPending, setIsPending] = useState(false);

    const form = useForm<z.infer<typeof PasswordChangeSchema>>({
        resolver: zodResolver(PasswordChangeSchema),
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
    });

    async function onSubmit(values: z.infer<typeof PasswordChangeSchema>) {
        setIsPending(true);
        const result = await updatePassword(values);
        setIsPending(false);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success(result.success);
            form.reset();
        }
    }

    return (
        <Card className="p-6">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-blue-600" />
                Security & Password
            </h3>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-md">
                    <FormField
                        control={form.control}
                        name="currentPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Current Password</FormLabel>
                                <FormControl>
                                    <Input {...field} type="password" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="newPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>New Password</FormLabel>
                                <FormControl>
                                    <Input {...field} type="password" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Confirm New Password</FormLabel>
                                <FormControl>
                                    <Input {...field} type="password" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit" disabled={isPending}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Update Password
                    </Button>
                </form>
            </Form>
        </Card>
    );
}

// -----------------------------------------------------------------------------
// Notifications Form
// -----------------------------------------------------------------------------
export function NotificationSettings({ preferences }: { preferences: any }) {
    const [isPending, setIsPending] = useState(false);

    const form = useForm<z.infer<typeof NotificationSettingsSchema>>({
        resolver: zodResolver(NotificationSettingsSchema),
        defaultValues: preferences || {
            courseUpdates: true,
            quizCompletion: true,
            certificateIssued: true,
            platformAnnouncements: false,
        },
    });

    async function onSubmit(values: z.infer<typeof NotificationSettingsSchema>) {
        setIsPending(true);
        const result = await updateNotificationPreferences(values);
        setIsPending(false);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success(result.success);
        }
    }

    return (
        <Card className="p-6">
            <h3 className="text-lg font-semibold mb-6">Email Notifications</h3>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="courseUpdates"
                            render={({ field }) => (
                                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">Course Updates</FormLabel>
                                        <FormDescription>Receive emails about updates to courses you're enrolled in.</FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="quizCompletion"
                            render={({ field }) => (
                                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">Quiz Completion</FormLabel>
                                        <FormDescription>Get notified when you complete or fail a quiz.</FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="certificateIssued"
                            render={({ field }) => (
                                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">Certificate Issuance</FormLabel>
                                        <FormDescription>Receive an email whenever you earn a new certificate.</FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="platformAnnouncements"
                            render={({ field }) => (
                                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">Platform Announcements</FormLabel>
                                        <FormDescription>Email about platform changes, new features, and news.</FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>
                    <Button type="submit" disabled={isPending}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Preferences
                    </Button>
                </form>
            </Form>
        </Card>
    );
}

// -----------------------------------------------------------------------------
// Learner Preferences Form
// -----------------------------------------------------------------------------
export function LearnerPreferences({ preferences }: { preferences: any }) {
    const [isPending, setIsPending] = useState(false);

    const form = useForm<z.infer<typeof LearnerPreferencesSchema>>({
        resolver: zodResolver(LearnerPreferencesSchema),
        defaultValues: preferences || {
            resumePlayback: true,
            autoNextLesson: false,
            emailFromInstructors: true,
        },
    });

    async function onSubmit(values: z.infer<typeof LearnerPreferencesSchema>) {
        setIsPending(true);
        const result = await updateLearnerPreferences(values);
        setIsPending(false);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success(result.success);
        }
    }

    return (
        <Card className="p-6">
            <h3 className="text-lg font-semibold mb-6">Learning Experience</h3>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="resumePlayback"
                            render={({ field }) => (
                                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">Resume where left off</FormLabel>
                                        <FormDescription>Automatically scroll to your last position when opening a lesson.</FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="autoNextLesson"
                            render={({ field }) => (
                                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">Auto-open next lesson</FormLabel>
                                        <FormDescription>Navigate to the next lesson immediately after finishing one.</FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="emailFromInstructors"
                            render={({ field }) => (
                                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">Allow instructor contact</FormLabel>
                                        <FormDescription>Enable instructors to reach out via your registered email.</FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>
                    <Button type="submit" disabled={isPending}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Settings
                    </Button>
                </form>
            </Form>
        </Card>
    );
}

// -----------------------------------------------------------------------------
// Account Deletion
// -----------------------------------------------------------------------------
export function AccountSettings() {
    const [password, setPassword] = useState('');
    const [isPending, setIsPending] = useState(false);

    const handleDelete = async () => {
        setIsPending(true);
        const result = await deleteAccount(password);
        setIsPending(false);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Account deactivated. Logging out...");
            setTimeout(() => signOut(), 2000);
        }
    };

    return (
        <Card className="p-6 border-red-100 bg-red-50/10">
            <h3 className="text-lg font-semibold mb-2 text-red-600">Danger Zone</h3>
            <p className="text-sm text-muted-foreground mb-6">
                Deactivating your account will disable your access and remove you from enrolled courses.
                This action is reversible by contacting support.
            </p>

            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="destructive">Deactivate Account</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Are you absolutely sure?</DialogTitle>
                        <DialogDescription>
                            Please enter your password to confirm deactivation.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Input
                            type="password"
                            placeholder="Current Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setPassword('')}>Cancel</Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={!password || isPending}
                        >
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Confirm Deactivation
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
