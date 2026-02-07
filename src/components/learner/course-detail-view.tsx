'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Users, BookOpen, DollarSign, Lock, CheckCircle } from 'lucide-react';
import { enrollInCourse, mockPayment } from '@/lib/actions/enrollment';
import { useRouter } from 'next/navigation';

interface CourseDetailViewProps {
    course: any;
    isAuthenticated: boolean;
}

export default function CourseDetailView({ course, isAuthenticated }: CourseDetailViewProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [showPaymentDialog, setShowPaymentDialog] = useState(false);
    const [showInviteDialog, setShowInviteDialog] = useState(false);
    const [inviteToken, setInviteToken] = useState('');
    const [error, setError] = useState('');

    const handleEnroll = () => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        if (course.accessType === 'PAID') {
            setShowPaymentDialog(true);
        } else if (course.accessType === 'INVITE') {
            setShowInviteDialog(true);
        } else {
            // OPEN course - enroll directly
            startTransition(() => {
                enrollInCourse(course.id).then((result) => {
                    if (result.error) {
                        setError(result.error);
                    } else {
                        router.push(`/learner/learn/${course.id}`);
                        router.refresh();
                    }
                });
            });
        }
    };

    const handlePayment = () => {
        setError('');
        startTransition(() => {
            mockPayment(course.id).then((result) => {
                if (result.error) {
                    setError(result.error);
                } else {
                    setShowPaymentDialog(false);
                    router.push(`/learner/learn/${course.id}`);
                    router.refresh();
                }
            });
        });
    };

    const handleInviteEnroll = () => {
        setError('');
        if (!inviteToken.trim()) {
            setError('Please enter an invitation code');
            return;
        }

        startTransition(() => {
            enrollInCourse(course.id, inviteToken).then((result) => {
                if (result.error) {
                    setError(result.error);
                } else {
                    setShowInviteDialog(false);
                    router.push(`/learner/learn/${course.id}`);
                    router.refresh();
                }
            });
        });
    };

    return (
        <div className="space-y-6">
            {/* Course Header */}
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start mb-4">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Badge>{course.level}</Badge>
                                {course.accessType === 'PAID' && (
                                    <Badge variant="secondary" className="flex items-center gap-1">
                                        <DollarSign className="h-3 w-3" />
                                        ${course.price}
                                    </Badge>
                                )}
                                {course.accessType === 'OPEN' && (
                                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                                        Free
                                    </Badge>
                                )}
                                {course.accessType === 'INVITE' && (
                                    <Badge variant="secondary" className="flex items-center gap-1">
                                        <Lock className="h-3 w-3" />
                                        Invitation Only
                                    </Badge>
                                )}
                            </div>
                            <CardTitle className="text-3xl">{course.title}</CardTitle>
                            <CardDescription className="text-base">
                                By {course.instructor.name || 'Unknown Instructor'}
                            </CardDescription>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            {course._count.enrollments} students
                        </div>
                        <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4" />
                            {course.contents.length} lessons
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <h3 className="font-semibold mb-2">Description</h3>
                        <p className="text-muted-foreground whitespace-pre-wrap">
                            {course.description || 'No description provided'}
                        </p>
                    </div>

                    {course.tags.length > 0 && (
                        <div>
                            <h3 className="font-semibold mb-2">Tags</h3>
                            <div className="flex flex-wrap gap-2">
                                {course.tags.map((tag: string) => (
                                    <Badge key={tag} variant="outline">{tag}</Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {course.website && (
                        <div>
                            <h3 className="font-semibold mb-2">Website</h3>
                            <a href={course.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                {course.website}
                            </a>
                        </div>
                    )}

                    {error && (
                        <div className="text-destructive text-sm">{error}</div>
                    )}

                    <Button onClick={handleEnroll} disabled={isPending} size="lg" className="w-full md:w-auto">
                        {course.accessType === 'PAID' ? `Enroll for $${course.price}` : 'Enroll Now'}
                    </Button>
                </CardContent>
            </Card>

            {/* Course Content Preview */}
            <Card>
                <CardHeader>
                    <CardTitle>Course Content</CardTitle>
                    <CardDescription>
                        {course.contents.length} lessons in this course
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {course.contents.map((content: any, index: number) => (
                            <div key={content.id} className="flex items-center gap-3 p-3 border rounded-md">
                                <span className="text-sm text-muted-foreground">{index + 1}.</span>
                                <span className="flex-1">{content.title}</span>
                                <Badge variant="outline">{content.type}</Badge>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Payment Dialog */}
            <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Complete Your Purchase</DialogTitle>
                        <DialogDescription>
                            You are about to enroll in {course.title}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                            <p className="text-sm text-blue-900">
                                <strong>Note:</strong> This is a mock payment simulation. In a production environment, this would integrate with a payment gateway like Stripe or PayPal.
                            </p>
                        </div>
                        <div className="mt-4 space-y-2">
                            <p className="font-semibold">Course: {course.title}</p>
                            <p className="text-2xl font-bold">${course.price}</p>
                        </div>
                        {error && <p className="text-destructive text-sm mt-2">{error}</p>}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handlePayment} disabled={isPending}>
                            {isPending ? 'Processing...' : 'Confirm Payment'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Invitation Dialog */}
            <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Invitation Required</DialogTitle>
                        <DialogDescription>
                            This course requires an invitation code to enroll
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Input
                            placeholder="Enter invitation code"
                            value={inviteToken}
                            onChange={(e) => setInviteToken(e.target.value)}
                        />
                        {error && <p className="text-destructive text-sm mt-2">{error}</p>}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleInviteEnroll} disabled={isPending}>
                            Enroll
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
