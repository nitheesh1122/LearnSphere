import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { ProfileForm } from '@/components/profile/profile-form';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, CheckCircle, Trophy, Award, FileText } from 'lucide-react';
import Link from 'next/link';

export default async function ProfilePage() {
    const session = await auth();
    if (!session?.user?.id) redirect('/login');

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
            roles: { include: { role: true } },
            instructorProfile: true,
            enrollments: { include: { course: true } },
            certificates: true,
            badges: { include: { badge: true } },
        },
    });

    if (!user) redirect('/login');

    const isLearner = user.roles?.some((r: any) => r.role.name === 'LEARNER');
    const isAdmin = user.roles?.some((r: any) => r.role.name === 'ADMIN');

    const completedCourses = user.enrollments.filter(e => e.completedAt).length;

    return (
        <div className="container py-10 space-y-10 animate-fade-in">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-bold tracking-tight">Profile</h1>
                <p className="text-muted-foreground text-lg">
                    Manage your personal information and view your achievements.
                </p>
            </div>

            <ProfileForm user={user} />

            {isLearner && (
                <div className="space-y-6 pt-10 border-t">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Trophy className="w-6 h-6 text-yellow-500" />
                        Learning Journey Summary
                    </h2>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        <Card className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <BookOpen className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground font-medium">Enrolled</p>
                                    <p className="text-2xl font-bold">{user.enrollments.length} Courses</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-emerald-100 rounded-lg">
                                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground font-medium">Completed</p>
                                    <p className="text-2xl font-bold">{completedCourses} Courses</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-violet-100 rounded-lg">
                                    <Award className="w-5 h-5 text-violet-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground font-medium">Badges</p>
                                    <p className="text-2xl font-bold">{user.badges.length}</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-amber-100 rounded-lg">
                                    <FileText className="w-5 h-5 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground font-medium">Certificates</p>
                                    <p className="text-2xl font-bold">{user.certificates.length}</p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {user.certificates.length > 0 && (
                        <div className="mt-8">
                            <h3 className="text-lg font-semibold mb-4">Earned Certificates</h3>
                            <div className="grid gap-4 sm:grid-cols-2">
                                {user.certificates.map((cert) => (
                                    <Card key={cert.id} className="p-4 flex items-center justify-between group hover:border-blue-200 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <FileText className="w-8 h-8 text-blue-500" />
                                            <div>
                                                <p className="font-semibold text-sm">Certificate of Completion</p>
                                                <p className="text-xs text-muted-foreground">Issued on {new Date(cert.issuedAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="sm" asChild>
                                            <a href={cert.pdfUrl} target="_blank" rel="noopener noreferrer">View PDF</a>
                                        </Button>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {isAdmin && (
                <div className="p-6 border-t bg-slate-50 rounded-lg border">
                    <h3 className="font-bold flex items-center gap-2">
                        <Award className="w-5 h-5 text-slate-700" />
                        Administrator Oversight
                    </h3>
                    <p className="mt-2 text-sm text-slate-600">
                        As an administrator, you have full access to platform metrics and user management.
                        Your profile is public to other administrative members.
                    </p>
                </div>
            )}
        </div>
    );
}
