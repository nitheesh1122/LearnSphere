'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { format, subDays, isSameDay } from 'date-fns';

interface StreakMapProps {
    activityMap: Record<string, { count: number; timeSpent: number }>;
    stats: {
        currentStreak: number;
        longestStreak: number;
        activeDaysLast30: number;
    };
}

export function StreakMap({ activityMap, stats }: StreakMapProps) {
    const today = new Date();
    const days = Array.from({ length: 91 }, (_, i) => subDays(today, 90 - i));

    const getIntensity = (count: number) => {
        if (count === 0) return 'bg-slate-100';
        if (count === 1) return 'bg-blue-200';
        if (count === 2) return 'bg-blue-400';
        return 'bg-blue-600';
    };

    return (
        <Card className="p-6">
            <div className="flex flex-wrap gap-8 mb-8">
                <div>
                    <p className="text-sm text-muted-foreground">Current Streak</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.currentStreak} Days</p>
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">Longest Streak</p>
                    <p className="text-2xl font-bold text-slate-700">{stats.longestStreak} Days</p>
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">Active Days (30d)</p>
                    <p className="text-2xl font-bold text-slate-700">{stats.activeDaysLast30}</p>
                </div>
            </div>

            <div className="flex flex-col">
                <p className="text-sm font-medium mb-3">Activity Map (Last 90 Days)</p>
                <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-2">
                    <TooltipProvider>
                        {days.map((day) => {
                            const dateKey = day.toISOString().split('T')[0];
                            const activity = activityMap[dateKey];
                            const count = activity?.count || 0;
                            const timeSpent = activity?.timeSpent || 0;
                            const minutes = Math.floor(timeSpent / 60);

                            return (
                                <Tooltip key={dateKey}>
                                    <TooltipTrigger asChild>
                                        <div
                                            className={cn(
                                                "w-3.5 h-3.5 rounded-[2px] cursor-help transition-colors",
                                                getIntensity(count)
                                            )}
                                        />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <div className="text-xs p-1">
                                            <p className="font-semibold">{format(day, 'MMM d, yyyy')}</p>
                                            <p>{count} activities</p>
                                            {minutes > 0 && <p>{minutes}m learning time</p>}
                                        </div>
                                    </TooltipContent>
                                </Tooltip>
                            );
                        })}
                    </TooltipProvider>
                </div>
                <div className="flex items-center gap-2 mt-4 text-[10px] text-muted-foreground justify-end">
                    <span>Less</span>
                    <div className="flex gap-1">
                        <div className="w-3 h-3 rounded-[2px] bg-slate-100" />
                        <div className="w-3 h-3 rounded-[2px] bg-blue-200" />
                        <div className="w-3 h-3 rounded-[2px] bg-blue-400" />
                        <div className="w-3 h-3 rounded-[2px] bg-blue-600" />
                    </div>
                    <span>More</span>
                </div>
            </div>
        </Card>
    );
}
