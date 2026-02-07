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
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { createCourse, updateCourse } from '@/lib/actions/course';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

interface CourseFormProps {
    course?: {
        id: string;
        title: string;
        description: string | null;
        price: number | null;
        accessType: string;
        published: boolean;
    };
}

export default function CourseForm({ course }: CourseFormProps) {
    const [error, setError] = useState<string | undefined>('');
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const form = useForm<z.infer<typeof CourseFormSchema>>({
        resolver: zodResolver(CourseFormSchema),
        defaultValues: {
            title: course?.title || '',
            description: course?.description || '',
            price: course?.price || 0,
            accessType: (course?.accessType as 'OPEN' | 'INVITE' | 'PAID') || 'OPEN',
            published: course?.published || false,
        },
    });

    const onSubmit = (values: z.infer<typeof CourseFormSchema>) => {
        setError('');
        startTransition(() => {
            if (course) {
                updateCourse(course.id, values).then((data) => {
                    if (data?.error) {
                        setError(data.error);
                    } else {
                        // Success handled by revalidatePath in action
                    }
                });
            } else {
                createCourse(values).then((data) => {
                    if (data?.error) {
                        setError(data.error);
                    }
                });
            }
        });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Course Title</FormLabel>
                            <FormControl>
                                <Input placeholder="Introduction to..." {...field} disabled={isPending} />
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
                                <Textarea placeholder="Course description..." {...field} disabled={isPending} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="accessType"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Access Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="OPEN">Open</SelectItem>
                                        <SelectItem value="INVITE">Invitation Only</SelectItem>
                                        <SelectItem value="PAID">Paid</SelectItem>
                                    </SelectContent>
                                </Select>
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
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="published"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    disabled={isPending}
                                />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel>
                                    Publish Course
                                </FormLabel>
                                <FormDescription>
                                    Make this course visible to students.
                                </FormDescription>
                            </div>
                        </FormItem>
                    )}
                />

                {error && <div className="text-destructive text-sm">{error}</div>}

                <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => router.back()} disabled={isPending}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isPending}>
                        {course ? 'Update Course' : 'Create Course'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
