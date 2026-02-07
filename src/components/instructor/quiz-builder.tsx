'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Check, GripVertical } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

interface Answer {
    id: string;
    text: string;
    isCorrect: boolean;
}

interface Question {
    id: string;
    text: string;
    type: string;
    points: number;
    order: number;
    answers: Answer[];
}

interface Quiz {
    id: string;
    passingScore: number;
    questions: Question[];
}

interface QuizBuilderProps {
    quiz: Quiz;
    courseId: string;
}

export default function QuizBuilder({ quiz, courseId }: QuizBuilderProps) {
    const [questions, setQuestions] = useState<Question[]>(quiz.questions || []);
    const [passingScore, setPassingScore] = useState(quiz.passingScore);
    const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

    const addQuestion = () => {
        const newQuestion: Question = {
            id: `temp-${Date.now()}`,
            text: '',
            type: 'MULTIPLE_CHOICE',
            points: 10,
            order: questions.length,
            answers: [
                { id: `temp-a1-${Date.now()}`, text: '', isCorrect: false },
                { id: `temp-a2-${Date.now()}`, text: '', isCorrect: false },
            ],
        };
        setQuestions([...questions, newQuestion]);
        setEditingQuestionId(newQuestion.id);
    };

    const updateQuestion = (id: string, field: string, value: any) => {
        setQuestions(questions.map(q =>
            q.id === id ? { ...q, [field]: value } : q
        ));
    };

    const deleteQuestion = (id: string) => {
        setQuestions(questions.filter(q => q.id !== id));
    };

    const addAnswer = (questionId: string) => {
        setQuestions(questions.map(q => {
            if (q.id === questionId) {
                return {
                    ...q,
                    answers: [
                        ...q.answers,
                        { id: `temp-a-${Date.now()}`, text: '', isCorrect: false },
                    ],
                };
            }
            return q;
        }));
    };

    const updateAnswer = (questionId: string, answerId: string, field: string, value: any) => {
        setQuestions(questions.map(q => {
            if (q.id === questionId) {
                return {
                    ...q,
                    answers: q.answers.map(a =>
                        a.id === answerId ? { ...a, [field]: value } : a
                    ),
                };
            }
            return q;
        }));
    };

    const deleteAnswer = (questionId: string, answerId: string) => {
        setQuestions(questions.map(q => {
            if (q.id === questionId) {
                return {
                    ...q,
                    answers: q.answers.filter(a => a.id !== answerId),
                };
            }
            return q;
        }));
    };

    const toggleCorrectAnswer = (questionId: string, answerId: string) => {
        setQuestions(questions.map(q => {
            if (q.id === questionId) {
                return {
                    ...q,
                    answers: q.answers.map(a => ({
                        ...a,
                        isCorrect: a.id === answerId ? !a.isCorrect : a.isCorrect,
                    })),
                };
            }
            return q;
        }));
    };

    return (
        <div className="space-y-6">
            {/* Quiz Settings */}
            <Card>
                <CardHeader>
                    <CardTitle>Quiz Settings</CardTitle>
                    <CardDescription>Configure quiz behavior and scoring</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Passing Score (%)</label>
                            <Input
                                type="number"
                                value={passingScore}
                                onChange={(e) => setPassingScore(Number(e.target.value))}
                                min={0}
                                max={100}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Total Questions</label>
                            <Input value={questions.length} disabled />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Questions */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Questions</h3>
                    <Button onClick={addQuestion}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Question
                    </Button>
                </div>

                {questions.length === 0 ? (
                    <Card>
                        <CardContent className="p-12 text-center text-muted-foreground">
                            No questions yet. Click "Add Question" to start building your quiz.
                        </CardContent>
                    </Card>
                ) : (
                    questions.map((question, idx) => (
                        <Card key={question.id}>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                                        <CardTitle className="text-base">Question {idx + 1}</CardTitle>
                                        <Badge variant="outline">{question.points} points</Badge>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => deleteQuestion(question.id)}
                                        className="text-destructive"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Question Text</label>
                                    <Textarea
                                        placeholder="Enter your question..."
                                        value={question.text}
                                        onChange={(e) => updateQuestion(question.id, 'text', e.target.value)}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Points</label>
                                        <Input
                                            type="number"
                                            value={question.points}
                                            onChange={(e) => updateQuestion(question.id, 'points', Number(e.target.value))}
                                            min={1}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-medium">Answer Options</label>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => addAnswer(question.id)}
                                        >
                                            <Plus className="mr-2 h-3 w-3" />
                                            Add Option
                                        </Button>
                                    </div>

                                    {question.answers.map((answer, ansIdx) => (
                                        <div key={answer.id} className="flex items-center gap-2">
                                            <Checkbox
                                                checked={answer.isCorrect}
                                                onCheckedChange={() => toggleCorrectAnswer(question.id, answer.id)}
                                            />
                                            <Input
                                                placeholder={`Option ${ansIdx + 1}`}
                                                value={answer.text}
                                                onChange={(e) => updateAnswer(question.id, answer.id, 'text', e.target.value)}
                                                className="flex-1"
                                            />
                                            {answer.isCorrect && (
                                                <Badge variant="default" className="bg-green-600">
                                                    <Check className="h-3 w-3 mr-1" />
                                                    Correct
                                                </Badge>
                                            )}
                                            {question.answers.length > 2 && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => deleteAnswer(question.id, answer.id)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
                <Button size="lg" disabled={questions.length === 0}>
                    Save Quiz
                </Button>
            </div>
        </div>
    );
}
