'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Pencil, Trash, Plus, MoreVertical, GripVertical, File, Video, Type } from 'lucide-react';
import LessonForm from './lesson-form';
import { reorderLesson, deleteLesson } from '@/lib/actions/lesson';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Lesson {
    id: string;
    title: string;
    type: string;
    hidden: boolean;
    order: number;
    contentUrl?: string | null;
    description?: string | null;
    attachments?: any;
}

interface LessonListProps {
    courseId: string;
    lessons: Lesson[];
}

export default function LessonList({ courseId, lessons }: LessonListProps) {
    const [isCreating, setIsCreating] = useState(false);
    const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const onReorder = (id: string, direction: 'up' | 'down') => {
        startTransition(() => {
            reorderLesson(courseId, id, direction);
        });
    };

    const onDelete = (id: string) => {
        if (confirm('Delete this lesson?')) {
            startTransition(() => {
                deleteLesson(courseId, id);
            });
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'VIDEO': return <Video className="h-4 w-4 text-blue-500" />;
            case 'TEXT': return <Type className="h-4 w-4 text-orange-500" />;
            default: return <File className="h-4 w-4 text-gray-500" />;
        }
    };

    return (
        <div className="space-y-4">
            {/* List Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Course Modules</h2>
                <Button onClick={() => setIsCreating(true)} size="sm" disabled={isCreating || !!editingLessonId}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Module
                </Button>
            </div>

            <div className="space-y-2">
                {lessons.length === 0 && !isCreating && (
                    <div className="text-center p-8 border border-dashed rounded-lg text-muted-foreground">
                        No lessons yet. Click "Add Module" to start.
                    </div>
                )}

                {lessons.map((lesson, index) => (
                    <div
                        key={lesson.id}
                        className="group flex flex-col border rounded-md bg-white hover:border-gray-300 transition-all shadow-sm"
                    >
                        {editingLessonId === lesson.id ? (
                            <div className="p-2">
                                <LessonForm
                                    courseId={courseId}
                                    lesson={lesson}
                                    onSuccess={() => setEditingLessonId(null)}
                                    onCancel={() => setEditingLessonId(null)}
                                />
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 p-3">
                                <div className="flex flex-col gap-1 text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity cursor-grab activity-drag-handle">
                                    <GripVertical className="h-5 w-5" />
                                </div>

                                <div className="flex-1 flex items-center gap-3">
                                    {getIcon(lesson.type)}
                                    <span className="font-medium">{lesson.title}</span>
                                    {lesson.hidden && <Badge variant="secondary" className="text-xs">Draft</Badge>}
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-1">
                                    {/* Reorder Buttons (Fallback if drag and drop not implemented fully yet) */}
                                    <div className="flex flex-col mr-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-5 w-5"
                                            disabled={index === 0 || isPending}
                                            onClick={() => onReorder(lesson.id, 'up')}
                                        >
                                            <span className="text-[10px]">▲</span>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-5 w-5"
                                            disabled={index === lessons.length - 1 || isPending}
                                            onClick={() => onReorder(lesson.id, 'down')}
                                        >
                                            <span className="text-[10px]">▼</span>
                                        </Button>
                                    </div>

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setEditingLessonId(lesson.id)}
                                    >
                                        Edit
                                    </Button>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => setEditingLessonId(lesson.id)}>
                                                <Pencil className="mr-2 h-4 w-4" /> Edit Content
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-destructive" onClick={() => onDelete(lesson.id)}>
                                                <Trash className="mr-2 h-4 w-4" /> Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {isCreating && (
                <div className="border rounded-md p-2 bg-gray-50">
                    <LessonForm
                        courseId={courseId}
                        onSuccess={() => setIsCreating(false)}
                        onCancel={() => setIsCreating(false)}
                    />
                </div>
            )}
        </div>
    );
}
