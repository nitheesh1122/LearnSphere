'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

interface Quiz {
    id: string;
    contentId: string;
    passingScore: number;
    _count?: {
        questions: number;
    };
}

interface QuizListProps {
    courseId: string;
    quizzes: Quiz[];
}

export default function QuizList({ courseId, quizzes }: QuizListProps) {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-semibold">Course Quizzes</h2>
                    <p className="text-sm text-muted-foreground">
                        Quizzes are linked to lessons. Create a lesson of type "Quiz" first.
                    </p>
                </div>
            </div>

            <div className="space-y-2">
                {quizzes.length === 0 ? (
                    <div className="text-center p-8 border border-dashed rounded-lg text-muted-foreground">
                        No quizzes yet. Add a lesson with type "Quiz" to get started.
                    </div>
                ) : (
                    quizzes.map((quiz) => (
                        <div
                            key={quiz.id}
                            className="flex items-center justify-between p-4 border rounded-md bg-white hover:border-gray-300 transition-all shadow-sm"
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex flex-col">
                                    <span className="font-medium">Quiz #{quiz.contentId.slice(0, 8)}</span>
                                    <span className="text-sm text-muted-foreground">
                                        {quiz._count?.questions || 0} questions • Passing: {quiz.passingScore}%
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Link href={`/instructor/courses/${courseId}/quiz/${quiz.id}`}>
                                    <Button variant="outline" size="sm">
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit Questions
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
