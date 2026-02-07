'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LessonFormSchema } from '@/lib/definitions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createLesson, updateLesson } from '@/lib/actions/lesson';
import { useState, useTransition } from 'react';
import { FileText, Link as LinkIcon, Plus, Trash2, Video } from 'lucide-react';

interface LessonFormProps {
    courseId: string;
    lesson?: {
        id: string;
        title: string;
        type: string;
        hidden: boolean;
        contentUrl?: string | null;
        description?: string | null;
        attachments?: any; // Json
    };
    onSuccess?: () => void;
    onCancel?: () => void;
}

export default function LessonForm({ courseId, lesson, onSuccess, onCancel }: LessonFormProps) {
    const [isPending, startTransition] = useTransition();
    // Parse attachments if they exist (should be array of {name, url, type})
    const initialAttachments = lesson?.attachments ?
        (typeof lesson.attachments === 'string' ? JSON.parse(lesson.attachments) : lesson.attachments)
        : [];

    const [attachments, setAttachments] = useState<any[]>(initialAttachments);
    const [newAttachment, setNewAttachment] = useState({ name: '', url: '' });

    const form = useForm<z.infer<typeof LessonFormSchema>>({
        resolver: zodResolver(LessonFormSchema),
        defaultValues: {
            title: lesson?.title || '',
            type: (lesson?.type as 'VIDEO' | 'TEXT' | 'QUIZ' | 'IMAGE' | 'DOCUMENT') || 'VIDEO',
            hidden: lesson?.hidden || false,
            contentUrl: lesson?.contentUrl || '',
            description: lesson?.description || '',
            attachments: JSON.stringify(initialAttachments),
        },
    });

    const onSubmit = (values: z.infer<typeof LessonFormSchema>) => {
        // Update attachments in values
        values.attachments = JSON.stringify(attachments);

        startTransition(() => {
            if (lesson) {
                updateLesson(courseId, lesson.id, values).then(() => {
                    onSuccess?.();
                });
            } else {
                createLesson(courseId, values).then(() => {
                    form.reset();
                    onSuccess?.();
                });
            }
        });
    };

    const addAttachment = () => {
        if (newAttachment.name && newAttachment.url) {
            setAttachments([...attachments, { ...newAttachment, type: 'LINK' }]);
            setNewAttachment({ name: '', url: '' });
        }
    };

    const removeAttachment = (index: number) => {
        setAttachments(attachments.filter((_, i) => i !== index));
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 border p-4 rounded-md bg-white shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-lg">{lesson ? 'Edit Lesson' : 'New Lesson'}</h3>
                    {onCancel && <Button variant="ghost" size="sm" onClick={onCancel}>Close</Button>}
                </div>

                <Tabs defaultValue="content" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="content">Content</TabsTrigger>
                        <TabsTrigger value="settings">Settings</TabsTrigger>
                        <TabsTrigger value="attachments">Attachments</TabsTrigger>
                    </TabsList>

                    {/* Tab 1: Main Content */}
                    <TabsContent value="content" className="space-y-4 pt-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Lesson Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Introduction to React" {...field} disabled={isPending} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Content Type</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="VIDEO">Video</SelectItem>
                                            <SelectItem value="TEXT">Text / Article</SelectItem>
                                            <SelectItem value="QUIZ">Quiz</SelectItem>
                                            <SelectItem value="DOCUMENT">Document (PDF)</SelectItem>
                                            <SelectItem value="IMAGE">Image</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Conditional Fields based on Type */}
                        {form.watch('type') === 'VIDEO' && (
                            <FormField
                                control={form.control}
                                name="contentUrl"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Video URL</FormLabel>
                                        <FormControl>
                                            <div className="flex gap-2">
                                                <Input placeholder="https://youtube.com/..." {...field} disabled={isPending} />
                                                <Button type="button" variant="outline" size="icon">
                                                    <Video className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </FormControl>
                                        <FormDescription>Embed URL for YouTube, Vimeo, or Loom.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        {form.watch('type') === 'TEXT' && (
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Content (Markdown)</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="# Lesson Content..."
                                                className="min-h-[200px] font-mono"
                                                {...field}
                                                disabled={isPending}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        {form.watch('type') === 'QUIZ' && (
                            <div className="p-4 border border-dashed rounded text-center text-muted-foreground">
                                Quiz questions are managed in the Quiz tab.
                            </div>
                        )}
                    </TabsContent>

                    {/* Tab 2: Settings */}
                    <TabsContent value="settings" className="space-y-4 pt-4">
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Short Description / Subtitle</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Brief summary of this lesson..." {...field} disabled={isPending} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="hidden"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center space-x-2 space-y-0 p-4 border rounded">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            disabled={isPending}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>
                                            Hidden / Draft
                                        </FormLabel>
                                        <FormDescription>
                                            Hide this lesson from students.
                                        </FormDescription>
                                    </div>
                                </FormItem>
                            )}
                        />
                    </TabsContent>

                    {/* Tab 3: Attachments */}
                    <TabsContent value="attachments" className="space-y-4 pt-4">
                        <div className="space-y-4">
                            <div className="text-sm text-muted-foreground">
                                Add downloadable resources like PDFs, source code, or images.
                            </div>

                            <div className="space-y-2">
                                {attachments.map((att, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-2 border rounded bg-gray-50">
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-blue-500" />
                                            <a href={att.url} target="_blank" className="text-sm hover:underline">{att.name}</a>
                                        </div>
                                        <Button type="button" variant="ghost" size="sm" onClick={() => removeAttachment(idx)}>
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-2 items-end border-t pt-4">
                                <div className="grid gap-2 flex-1">
                                    <FormLabel>Name</FormLabel>
                                    <Input
                                        placeholder="Resource Name"
                                        value={newAttachment.name}
                                        onChange={(e) => setNewAttachment({ ...newAttachment, name: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2 flex-1">
                                    <FormLabel>Url</FormLabel>
                                    <Input
                                        placeholder="https://..."
                                        value={newAttachment.url}
                                        onChange={(e) => setNewAttachment({ ...newAttachment, url: e.target.value })}
                                    />
                                </div>
                                <Button type="button" onClick={addAttachment} disabled={!newAttachment.name || !newAttachment.url}>
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>

                <div className="flex justify-end gap-2 pt-4 border-t">
                    {onCancel && (
                        <Button type="button" variant="ghost" onClick={onCancel} disabled={isPending}>
                            Cancel
                        </Button>
                    )}
                    <Button type="submit" disabled={isPending}>
                        {lesson ? 'Save Changes' : 'Create Lesson'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
