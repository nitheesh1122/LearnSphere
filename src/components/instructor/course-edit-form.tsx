'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CourseFormSchema } from '@/lib/definitions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { FormProvider } from 'react-hook-form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { updateCourse } from '@/lib/actions/course';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import LessonList from './lesson-list';
import QuizList from './quiz-list';
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CourseEditFormProps {
    course: any; // Using any to avoid strict type mismatch during rapid dev
    lessons: any[];
    quizzes?: any[];
}

export default function CourseEditForm({ course, lessons, quizzes = [] }: CourseEditFormProps) {
    const [error, setError] = useState<string | undefined>('');
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    // Prepare default values including joining tags array to string
    const defaultTags = course.tags ? course.tags.join(', ') : '';

    const form = useForm<z.infer<typeof CourseFormSchema>>({
        resolver: zodResolver(CourseFormSchema),
        defaultValues: {
            title: course.title || '',
            description: course.description || '',
            price: course.price || 0,
            accessType: (course.accessType as 'OPEN' | 'INVITE' | 'PAID') || 'OPEN',
            published: course.published || false,
            tags: defaultTags,
            website: course.website || '',
            level: (course.level as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED') || 'BEGINNER',
            visibility: (course.visibility as 'EVERYONE' | 'SIGNED_IN') || 'EVERYONE',
            responsibleId: course.responsibleId || '',
        },
    });

    const onSubmit = (values: z.infer<typeof CourseFormSchema>) => {
        setError('');
        startTransition(() => {
            updateCourse(course.id, values).then((data) => {
                if (data?.error) {
                    setError(data.error);
                } else {
                    router.refresh(); // Refresh to show updated data
                }
            });
        });
    };

    // Merge quiz information with lessons
    const lessonsWithQuizIds = lessons.map(lesson => {
        const quiz = quizzes.find(q => q.contentId === lesson.id);
        return {
            ...lesson,
            quizId: quiz?.id,
        };
    });

    return (
        <FormProvider {...form}>
            <div className="space-y-6">
                {/* Header Actions */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Badge variant={course.published ? 'default' : 'secondary'}>
                            {course.published ? 'Published' : 'Draft'}
                        </Badge>
                        {form.formState.isDirty && <span className="text-xs text-muted-foreground italic">Unsaved changes</span>}
                    </div>
                    <div className="flex gap-2">
                        {/* Publish Toggle is inside the form as a checkbox, but we can also have a quick action here later */}
                        <Button type="button" onClick={form.handleSubmit(onSubmit)} disabled={isPending}>
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </div>
                </div>

                <Tabs defaultValue="content" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="content">Curriculum</TabsTrigger>
                        <TabsTrigger value="description">Description</TabsTrigger>
                        <TabsTrigger value="options">Options & Access</TabsTrigger>
                        <TabsTrigger value="quiz">Quizzes</TabsTrigger>
                    </TabsList>

                    {/* Tab 1: Curriculum (Outside form to avoid nesting) */}
                    <TabsContent value="content" className="space-y-4">
                        <div className="border p-6 rounded-md bg-white">
                            <LessonList courseId={course.id} lessons={lessonsWithQuizIds} />
                        </div>
                    </TabsContent>

                    {/* Tab 2: Description (Basic Settings) */}
                    <TabsContent value="description" className="space-y-4">
                        <div className="border p-6 rounded-md bg-white space-y-6">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Course Title</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Course Title" {...field} disabled={isPending} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Detailed description..." className="min-h-[150px]" {...field} disabled={isPending} />
                                        </FormControl>
                                        <FormDescription>
                                            Supports basic text for now. Rich text coming soon.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="tags"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tags</FormLabel>
                                            <FormControl>
                                                <Input placeholder="React, NextJS, Web Dev" {...field} disabled={isPending} />
                                            </FormControl>
                                            <FormDescription>Comma separated</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="level"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Difficulty Level</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select level" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="BEGINNER">Beginner</SelectItem>
                                                    <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                                                    <SelectItem value="ADVANCED">Advanced</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name="website"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Website / External Link</FormLabel>
                                        <FormControl>
                                            <Input placeholder="https://example.com" {...field} disabled={isPending} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </TabsContent>

                    {/* Tab 3: Options (Access & Publish) */}
                    <TabsContent value="options" className="space-y-4">
                        <div className="border p-6 rounded-md bg-white space-y-6">
                            {/* Explanation Section */}
                            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 text-sm">
                                <h4 className="font-semibold text-blue-900 mb-2">Understanding Access Controls</h4>
                                <ul className="space-y-1 text-blue-800">
                                    <li><strong>Visibility:</strong> Who can see the course in the catalog</li>
                                    <li><strong>Access:</strong> Who can enroll and view course content</li>
                                </ul>
                            </div>

                            {/* Visibility */}
                            <FormField
                                control={form.control}
                                name="visibility"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Visibility</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="EVERYONE">Everyone (Public)</SelectItem>
                                                <SelectItem value="SIGNED_IN">Signed In Users Only</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>
                                            Controls who can discover this course in the catalog.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Access Rules */}
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="accessType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Access Rule</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="OPEN">Open (Free for all)</SelectItem>
                                                    <SelectItem value="INVITE">Invitation Only</SelectItem>
                                                    <SelectItem value="PAID">Paid</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormDescription>
                                                How students can access content.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="price"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Price ($)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.01" {...field} disabled={isPending || form.watch('accessType') !== 'PAID'} />
                                            </FormControl>
                                            <FormDescription>
                                                {form.watch('accessType') === 'PAID' ? 'Required for paid courses' : 'Only for paid courses'}
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Publishing */}
                            <FormField
                                control={form.control}
                                name="published"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-gray-50">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                                disabled={isPending}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel className="text-base">
                                                Publish Course
                                            </FormLabel>
                                            <FormDescription>
                                                Make this course live. Students matching your visibility and access rules will be able to enroll.
                                            </FormDescription>
                                        </div>
                                    </FormItem>
                                )}
                            />
                        </div>
                    </TabsContent>

                    {/* Tab 4: Quiz */}
                    <TabsContent value="quiz" className="space-y-4">
                        <div className="border p-6 rounded-md bg-white">
                            <QuizList courseId={course.id} quizzes={quizzes} />
                        </div>
                    </TabsContent>
                </Tabs>

                {error && <div className="text-destructive text-sm">{error}</div>}
            </div>
        </FormProvider>
    );
}
