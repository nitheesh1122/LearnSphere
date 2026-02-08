'use server';

import prisma from '../prisma';
import { startOfDay } from 'date-fns';

export type LearningActivityType = 'LESSON_VIEW' | 'LESSON_COMPLETE' | 'QUIZ_ATTEMPT' | 'COURSE_COMPLETE';

/**
 * Records a learning activity for the user.
 * Normalized to the current day.
 */
export async function recordLearningActivity(
    userId: string,
    type: LearningActivityType,
    timeSpent: number = 0 // in seconds
) {
    const today = startOfDay(new Date());

    try {
        await prisma.learningActivity.upsert({
            where: {
                userId_activityDate: {
                    userId,
                    activityDate: today,
                },
            },
            update: {
                activityCount: { increment: 1 },
                totalTimeSpent: { increment: timeSpent },
            },
            create: {
                userId,
                activityDate: today,
                activityCount: 1,
                totalTimeSpent: timeSpent,
            },
        });
    } catch (error) {
        console.error('Failed to record learning activity:', error);
        // Non-blocking for the main flow
    }
}

/**
 * Retrieves streak statistics for a user.
 */
export async function getUserStreakStats(userId: string) {
    // Fetch activity for the last 90 days
    const ninetyDaysAgo = startOfDay(new Date());
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const activities = await prisma.learningActivity.findMany({
        where: {
            userId,
            activityDate: { gte: ninetyDaysAgo },
        },
        orderBy: { activityDate: 'asc' },
    });

    const activityMap = activities.reduce((acc, curr) => {
        const key = curr.activityDate.toISOString().split('T')[0];
        acc[key] = {
            count: curr.activityCount,
            timeSpent: curr.totalTimeSpent,
        };
        return acc;
    }, {} as Record<string, { count: number; timeSpent: number }>);

    // Calculate streaks
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    // We need to check day by day to handle gaps correctly
    const today = startOfDay(new Date());
    const checkDate = new Date(today);

    // Check current streak (working backwards from today)
    while (true) {
        const key = checkDate.toISOString().split('T')[0];
        if (activityMap[key]) {
            currentStreak++;
            checkDate.setDate(checkDate.getDate() - 1);
        } else {
            // If today is missing, check yesterday. If yesterday is also missing, streak is 0.
            if (currentStreak === 0) {
                // If today is empty, streak might still be active if yesterday was active.
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                const yKey = yesterday.toISOString().split('T')[0];
                if (activityMap[yKey]) {
                    // Current streak continues from yesterday
                    // Let's restart the loop from yesterday
                    checkDate.setDate(today.getDate() - 1);
                    continue;
                }
            }
            break;
        }
    }

    // Calculate longest streak (working forwards through all available data)
    const allActivities = await prisma.learningActivity.findMany({
        where: { userId },
        orderBy: { activityDate: 'asc' },
    });

    if (allActivities.length > 0) {
        let lastDate: Date | null = null;

        for (const activity of allActivities) {
            if (!lastDate) {
                tempStreak = 1;
            } else {
                const diffDays = Math.floor((activity.activityDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
                if (diffDays === 1) {
                    tempStreak++;
                } else {
                    tempStreak = 1;
                }
            }
            longestStreak = Math.max(longestStreak, tempStreak);
            lastDate = activity.activityDate;
        }
    }

    // Active days in last 30
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activeDaysLast30 = activities.filter(a => a.activityDate >= thirtyDaysAgo).length;

    return {
        dailyActivityMap: activityMap,
        currentStreak,
        longestStreak,
        activeDaysLast30,
    };
}
