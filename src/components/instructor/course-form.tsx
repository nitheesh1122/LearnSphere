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
        imageUrl?: string | null;
        previewVideoUrl?: string | null;
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
            level: 'BEGINNER',
            visibility: 'EVERYONE',
            imageUrl: course?.imageUrl || '',
            previewVideoUrl: course?.previewVideoUrl || '',
        },
    });

    const [uploading, setUploading] = useState<Record<string, boolean>>({});

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'imageUrl' | 'previewVideoUrl') => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size before upload
        const isImage = fieldName === 'imageUrl';
        const maxSize = isImage ? 5 * 1024 * 1024 : 50 * 1024 * 1024; // 5MB for images, 50MB for videos
        const maxSizeMB = Math.round(maxSize / (1024 * 1024));
        
        if (file.size > maxSize) {
            setError(`File too large. Max size is ${maxSizeMB}MB for ${isImage ? 'images' : 'videos'}`);
            return;
        }

        // Validate file type
        const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg'];
        const allowedTypes = isImage ? allowedImageTypes : allowedVideoTypes;
        
        if (!allowedTypes.includes(file.type)) {
            setError(`Invalid file type. Allowed types: ${isImage ? 'JPEG, PNG, GIF, WebP' : 'MP4, WebM, OGG'}`);
            return;
        }

        setUploading(prev => ({ ...prev, [fieldName]: true }));
        setError('');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Upload failed');
            }

            // Set the URL in form
            form.setValue(fieldName, data.url, { 
                shouldValidate: true,
                shouldDirty: true 
            });
            
            // Trigger form validation to clear any error messages
            form.trigger(fieldName);
            
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Upload failed';
            console.error('File upload error:', errorMessage);
            setError(errorMessage);
            
            // Clear the field if upload failed
            form.setValue(fieldName, '');
        } finally {
            setUploading(prev => ({ ...prev, [fieldName]: false }));
        }
    };

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
                        name="imageUrl"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Course Image (Max 5MB - JPEG, PNG, GIF, WebP)</FormLabel>
                                <FormControl>
                                    <div className="space-y-2">
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            disabled={isPending || uploading['imageUrl']}
                                            onChange={(e) => handleFileUpload(e, 'imageUrl')}
                                            className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                        />
                                        {uploading['imageUrl'] && (
                                            <div className="text-xs text-blue-600 flex items-center gap-1">
                                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                                                Uploading image...
                                            </div>
                                        )}
                                        {field.value && !uploading['imageUrl'] && (
                                            <div className="space-y-2">
                                                <div className="relative aspect-video rounded-md overflow-hidden border">
                                                    <img src={field.value} alt="Course preview" className="object-cover w-full h-full" />
                                                    <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs">
                                                        ✓ Uploaded
                                                    </div>
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {field.value}
                                                </div>
                                            </div>
                                        )}
                                        <Input type="hidden" {...field} />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="previewVideoUrl"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Preview Video (Max 50MB - MP4, WebM, OGG)</FormLabel>
                                <FormControl>
                                    <div className="space-y-2">
                                        <Input
                                            type="file"
                                            accept="video/*"
                                            disabled={isPending || uploading['previewVideoUrl']}
                                            onChange={(e) => handleFileUpload(e, 'previewVideoUrl')}
                                            className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                        />
                                        {uploading['previewVideoUrl'] && (
                                            <div className="text-xs text-blue-600 flex items-center gap-1">
                                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                                                Uploading video...
                                            </div>
                                        )}
                                        {field.value && !uploading['previewVideoUrl'] && (
                                            <div className="space-y-2">
                                                <div className="relative aspect-video rounded-md overflow-hidden border bg-black">
                                                    <video src={field.value} controls className="w-full h-full" />
                                                    <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs">
                                                        ✓ Uploaded
                                                    </div>
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {field.value}
                                                </div>
                                            </div>
                                        )}
                                        <Input type="hidden" {...field} />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

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
                                    <Input
                                        type="number"
                                        step="0.01"
                                        disabled={isPending || form.watch('accessType') !== 'PAID'}
                                        {...field}
                                        onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                                    />
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
        </Form >
    );
}
