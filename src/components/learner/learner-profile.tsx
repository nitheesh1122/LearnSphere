'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Award, BookCheck, Target, TrendingUp } from 'lucide-react';

interface LearnerProfileProps {
    user: any;
    stats: {
        totalEnrollments: number;
        completedCourses: number;
        totalPoints: number;
        currentBadge: string;
        nextBadge: string | null;
        coursesToNextBadge: number;
    };
}

export default function LearnerProfile({ user, stats }: LearnerProfileProps) {
    const badgeColors: Record<string, string> = {
        'Newcomer': 'bg-gray-500',
        'Beginner': 'bg-blue-500',
        'Advanced': 'bg-purple-500',
        'Expert': 'bg-orange-500',
        'Master': 'bg-yellow-500',
    };

    const progressToNextBadge = stats.nextBadge
        ? Math.round((1 - (stats.coursesToNextBadge / getRequiredForBadge(stats.nextBadge))) * 100)
        : 100;

    return (
        <div className="space-y-4">
            {/* User Profile Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <p className="font-semibold text-lg">{user.name || 'Learner'}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                        <div className="flex items-center gap-2">
                            <Award className="h-5 w-5 text-purple-600" />
                            <span className="font-semibold">Current Badge</span>
                        </div>
                        <Badge className={`${badgeColors[stats.currentBadge] || 'bg-gray-500'} text-white`}>
                            {stats.currentBadge}
                        </Badge>
                    </div>
                </CardContent>
            </Card>

            {/* Stats Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Learning Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <BookCheck className="h-4 w-4" />
                                <span className="text-sm">Enrolled</span>
                            </div>
                            <p className="text-2xl font-bold">{stats.totalEnrollments}</p>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Target className="h-4 w-4" />
                                <span className="text-sm">Completed</span>
                            </div>
                            <p className="text-2xl font-bold">{stats.completedCourses}</p>
                        </div>
                    </div>

                    <div className="pt-4 border-t">
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                            <TrendingUp className="h-4 w-4" />
                            <span className="text-sm">Total Points</span>
                        </div>
                        <p className="text-3xl font-bold text-purple-600">{stats.totalPoints}</p>
                    </div>
                </CardContent>
            </Card>

            {/* Progress to Next Badge */}
            {stats.nextBadge && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Next Badge Progress</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{stats.currentBadge}</span>
                            <span className="text-sm font-medium">{stats.nextBadge}</span>
                        </div>
                        <Progress value={progressToNextBadge} />
                        <p className="text-sm text-muted-foreground text-center">
                            {stats.coursesToNextBadge} more course{stats.coursesToNextBadge !== 1 ? 's' : ''} to unlock <strong>{stats.nextBadge}</strong> badge
                        </p>
                    </CardContent>
                </Card>
            )}

            {stats.currentBadge === 'Master' && (
                <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300">
                    <CardContent className="p-6 text-center">
                        <Award className="h-12 w-12 mx-auto text-yellow-600 mb-3" />
                        <p className="font-semibold text-yellow-900">You've reached Master level!</p>
                        <p className="text-sm text-yellow-800 mt-1">Keep learning to maintain your streak</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

function getRequiredForBadge(badgeName: string): number {
    switch (badgeName) {
        case 'Beginner': return 1;
        case 'Advanced': return 5;
        case 'Expert': return 10;
        case 'Master': return 25;
        default: return 1;
    }
}
