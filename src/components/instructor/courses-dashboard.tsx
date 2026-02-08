'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutGrid, List as ListIcon, PlusCircle, Search } from 'lucide-react';
import Link from 'next/link';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { CourseList } from './course-list';
import { CourseKanban } from './course-kanban';

interface CoursesDashboardProps {
    courses: any[]; // Using any for now to avoid comprehensive type defs in this step
}

export default function CoursesDashboard({ courses }: CoursesDashboardProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'list' | 'kanban'>('kanban');

    const filteredCourses = courses.filter((course) =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Courses</h1>
                    <p className="text-sm text-muted-foreground">
                        Manage your curriculum and content.
                    </p>
                </div>
                <Link href="/instructor/courses/new">
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Course
                    </Button>
                </Link>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-lg border shadow-sm">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search courses..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground hidden sm:inline-block">View:</span>
                    <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'list' | 'kanban')}>
                        <TabsList>
                            <TabsTrigger value="kanban"><LayoutGrid className="h-4 w-4" /></TabsTrigger>
                            <TabsTrigger value="list"><ListIcon className="h-4 w-4" /></TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </div>

            {/* Views */}
            {viewMode === 'kanban' ? (
                <CourseKanban courses={filteredCourses} />
            ) : (
                <CourseList courses={filteredCourses} />
            )}
        </div>
    );
}
