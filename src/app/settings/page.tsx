import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    SecuritySettings,
    NotificationSettings,
    LearnerPreferences,
    AccountSettings
} from '@/components/settings/settings-forms';
import { User, Shield, Bell, BookOpen, Settings2 } from 'lucide-react';

export default async function SettingsPage() {
    const session = await auth();
    if (!session?.user?.id) redirect('/login');

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
            roles: { include: { role: true } },
            learnerPreferences: true,
        },
    });

    if (!user) redirect('/login');

    const isLearner = user.roles?.some((r: any) => r.role.name === 'LEARNER');
    const isInstructor = user.roles?.some((r: any) => r.role.name === 'INSTRUCTOR');

    return (
        <div className="container py-10 space-y-8 animate-fade-in">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground text-lg">
                    Manage your account preferences and security settings.
                </p>
            </div>

            <Tabs defaultValue="account" className="space-y-6">
                <TabsList className="bg-slate-100/50 p-1">
                    <TabsTrigger value="account" className="flex gap-2">
                        <User className="w-4 h-4" />
                        Account
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="flex gap-2">
                        <Bell className="w-4 h-4" />
                        Notifications
                    </TabsTrigger>
                    {isLearner && (
                        <TabsTrigger value="preferences" className="flex gap-2">
                            <BookOpen className="w-4 h-4" />
                            Learning
                        </TabsTrigger>
                    )}
                    <TabsTrigger value="security" className="flex gap-2">
                        <Shield className="w-4 h-4" />
                        Security
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="account" className="space-y-6">
                    <div className="grid gap-6">
                        <AccountSettings />
                    </div>
                </TabsContent>

                <TabsContent value="notifications">
                    <NotificationSettings preferences={user.notificationPreferences} />
                </TabsContent>

                {isLearner && (
                    <TabsContent value="preferences">
                        <LearnerPreferences preferences={user.learnerPreferences} />
                    </TabsContent>
                )}

                <TabsContent value="security">
                    <SecuritySettings userId={user.id} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
