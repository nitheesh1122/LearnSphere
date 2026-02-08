"use client";

import { updateQuizQuestions } from '@/lib/actions/quiz';
import { useTransition } from 'react';
import { toast } from 'sonner';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Check, GripVertical, Type, List, AlignLeft, Hash } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { saveQuiz } from '@/lib/actions/quiz';

interface Answer {
    id: string;
    text: string;
    isCorrect: boolean;
}

interface Question {
    id: string;
    text: string;
    type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'ESSAY';
    points: number;
    order: number;
    answers: Answer[];
    required: boolean;
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
    console.log('QuizBuilder Component: Received quiz data:', quiz);
    console.log('QuizBuilder Component: Questions count:', quiz.questions?.length || 0);

    const [questions, setQuestions] = useState<Question[]>(quiz.questions || []);
    const [passingScore, setPassingScore] = useState(quiz.passingScore);
    const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const addQuestion = (type: Question['type'] = 'MULTIPLE_CHOICE') => {
        const newQuestion: Question = {
            id: `temp-${Date.now()}`,
            text: '',
            type,
            points: 10,
            order: questions.length,
            required: true,
            answers: type === 'TRUE_FALSE'
                ? [
                    { id: `tf-true-${Date.now()}`, text: 'True', isCorrect: false },
                    { id: `tf-false-${Date.now()}`, text: 'False', isCorrect: false },
                ]
                : type === 'MULTIPLE_CHOICE'
                    ? [
                        { id: `temp-a1-${Date.now()}`, text: '', isCorrect: false },
                        { id: `temp-a2-${Date.now()}`, text: '', isCorrect: false },
                        { id: `temp-a3-${Date.now()}`, text: '', isCorrect: false },
                        { id: `temp-a4-${Date.now()}`, text: '', isCorrect: false },
                    ]
                    : [],
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
        if (editingQuestionId === id) {
            setEditingQuestionId(null);
        }
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
                // For multiple choice, only one answer can be correct
                if (q.type === 'MULTIPLE_CHOICE') {
                    return {
                        ...q,
                        answers: q.answers.map(a => ({
                            ...a,
                            isCorrect: a.id === answerId ? !a.isCorrect : false,
                        })),
                    };
                } else {
                    // For true/false, toggle the selected answer
                    return {
                        ...q,
                        answers: q.answers.map(a => ({
                            ...a,
                            isCorrect: a.id === answerId ? !a.isCorrect : a.isCorrect,
                        })),
                    };
                }
            }
            return q;
        }));
    };

    const handleSaveQuiz = async () => {
        setIsSaving(true);
        try {
            console.log('Saving quiz:', { questions, passingScore });

            const result = await saveQuiz(quiz.id, { questions, passingScore });

            if (result.success) {
                alert('Quiz saved successfully!');
            } else {
                alert(result.error || 'Error saving quiz');
            }
        } catch (error) {
            console.error('Error saving quiz:', error);
            alert('Error saving quiz');
        } finally {
            setIsSaving(false);
        }
    };

    const getQuestionIcon = (type: Question['type']) => {
        switch (type) {
            case 'MULTIPLE_CHOICE':
                return <List className="h-4 w-4" />;
            case 'TRUE_FALSE':
                return <Hash className="h-4 w-4" />;
            case 'SHORT_ANSWER':
                return <Type className="h-4 w-4" />;
            case 'ESSAY':
                return <AlignLeft className="h-4 w-4" />;
            default:
                return <Type className="h-4 w-4" />;
        }
    };

    const getQuestionTypeLabel = (type: Question['type']) => {
        switch (type) {
            case 'MULTIPLE_CHOICE':
                return 'Multiple Choice';
            case 'TRUE_FALSE':
                return 'True/False';
            case 'SHORT_ANSWER':
                return 'Short Answer';
            case 'ESSAY':
                return 'Essay';
            default:
                return 'Multiple Choice';
        }
    };

    return (
        <div className="space-y-6">
            {/* Debug Info */}
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-semibold text-yellow-900 mb-2">Quiz Builder Debug</h4>
                <p className="text-sm text-yellow-800">
                    Quiz ID: {quiz.id}<br />
                    Questions: {questions.length}<br />
                    Passing Score: {passingScore}%
                </p>
            </div>

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
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Total Points</label>
                            <Input
                                value={questions.reduce((sum, q) => sum + q.points, 0)}
                                disabled
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Time Limit (minutes)</label>
                            <Input type="number" placeholder="No limit" min={1} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Add Question Buttons */}
            <Card>
                <CardHeader>
                    <CardTitle>Add Questions</CardTitle>
                    <CardDescription>Choose the type of question you want to add</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <Button
                            variant="outline"
                            onClick={() => addQuestion('MULTIPLE_CHOICE')}
                            className="h-20 flex flex-col gap-2"
                        >
                            <List className="h-6 w-6" />
                            <span className="text-xs">Multiple Choice</span>
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => addQuestion('TRUE_FALSE')}
                            className="h-20 flex flex-col gap-2"
                        >
                            <Hash className="h-6 w-6" />
                            <span className="text-xs">True/False</span>
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => addQuestion('SHORT_ANSWER')}
                            className="h-20 flex flex-col gap-2"
                        >
                            <Type className="h-6 w-6" />
                            <span className="text-xs">Short Answer</span>
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => addQuestion('ESSAY')}
                            className="h-20 flex flex-col gap-2"
                        >
                            <AlignLeft className="h-6 w-6" />
                            <span className="text-xs">Essay</span>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Questions */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Questions ({questions.length})</h3>
                </div>

                {questions.length === 0 ? (
                    <Card>
                        <CardContent className="p-12 text-center text-muted-foreground">
                            <div className="space-y-4">
                                <p>No questions yet. Add your first question above.</p>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-w-md mx-auto">
                                    <div className="text-center p-2 border rounded">
                                        <List className="h-4 w-4 mx-auto mb-1" />
                                        <span className="text-xs">Multiple Choice</span>
                                    </div>
                                    <div className="text-center p-2 border rounded">
                                        <Hash className="h-4 w-4 mx-auto mb-1" />
                                        <span className="text-xs">True/False</span>
                                    </div>
                                    <div className="text-center p-2 border rounded">
                                        <Type className="h-4 w-4 mx-auto mb-1" />
                                        <span className="text-xs">Short Answer</span>
                                    </div>
                                    <div className="text-center p-2 border rounded">
                                        <AlignLeft className="h-4 w-4 mx-auto mb-1" />
                                        <span className="text-xs">Essay</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    questions.map((question, idx) => (
                        <Card key={question.id} className={editingQuestionId === question.id ? 'ring-2 ring-blue-500' : ''}>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                                        <CardTitle className="text-base">Question {idx + 1}</CardTitle>
                                        <Badge variant="outline" className="flex items-center gap-1">
                                            {getQuestionIcon(question.type)}
                                            {getQuestionTypeLabel(question.type)}
                                        </Badge>
                                        <Badge variant="outline">{question.points} points</Badge>
                                        {question.required && (
                                            <Badge variant="destructive" className="text-xs">Required</Badge>
                                        )}
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
                                        rows={3}
                                    />
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Points</label>
                                        <Input
                                            type="number"
                                            value={question.points}
                                            onChange={(e) => updateQuestion(question.id, 'points', Number(e.target.value))}
                                            min={1}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Question Type</label>
                                        <Select
                                            value={question.type}
                                            onValueChange={(value: Question['type']) => updateQuestion(question.id, 'type', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="MULTIPLE_CHOICE">Multiple Choice</SelectItem>
                                                <SelectItem value="TRUE_FALSE">True/False</SelectItem>
                                                <SelectItem value="SHORT_ANSWER">Short Answer</SelectItem>
                                                <SelectItem value="ESSAY">Essay</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Required</label>
                                        <div className="flex items-center space-x-2 mt-2">
                                            <Checkbox
                                                id={`required-${question.id}`}
                                                checked={question.required}
                                                onCheckedChange={(checked) => updateQuestion(question.id, 'required', checked)}
                                            />
                                            <Label htmlFor={`required-${question.id}`} className="text-sm">
                                                Must answer
                                            </Label>
                                        </div>
                                    </div>
                                </div>

                                {/* Answer Options for Multiple Choice and True/False */}
                                {(question.type === 'MULTIPLE_CHOICE' || question.type === 'TRUE_FALSE') && (
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <label className="text-sm font-medium">
                                                {question.type === 'MULTIPLE_CHOICE' ? 'Answer Options' : 'Answer Options'}
                                                <span className="text-xs text-muted-foreground ml-2">
                                                    (Mark the correct answer)
                                                </span>
                                            </label>
                                            {question.type === 'MULTIPLE_CHOICE' && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => addAnswer(question.id)}
                                                >
                                                    <Plus className="mr-2 h-3 w-3" />
                                                    Add Option
                                                </Button>
                                            )}
                                        </div>

                                        {question.answers.map((answer, ansIdx) => (
                                            <div key={answer.id} className="flex items-center gap-2">
                                                <Checkbox
                                                    checked={answer.isCorrect}
                                                    onCheckedChange={() => toggleCorrectAnswer(question.id, answer.id)}
                                                />
                                                <Input
                                                    placeholder={question.type === 'TRUE_FALSE'
                                                        ? answer.text
                                                        : `Option ${ansIdx + 1}`
                                                    }
                                                    value={answer.text}
                                                    onChange={(e) => updateAnswer(question.id, answer.id, 'text', e.target.value)}
                                                    className="flex-1"
                                                    disabled={question.type === 'TRUE_FALSE'}
                                                />
                                                {answer.isCorrect && (
                                                    <Badge variant="default" className="bg-green-600">
                                                        <Check className="h-3 w-3 mr-1" />
                                                        Correct
                                                    </Badge>
                                                )}
                                                {question.type === 'MULTIPLE_CHOICE' && question.answers.length > 2 && (
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

                                        {question.type === 'MULTIPLE_CHOICE' && (
                                            <p className="text-xs text-muted-foreground">
                                                💡 Tip: Only one answer can be marked as correct for multiple choice questions
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Instructions for Short Answer and Essay */}
                                {(question.type === 'SHORT_ANSWER' || question.type === 'ESSAY') && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Answer Guidelines</label>
                                        <Textarea
                                            placeholder="Provide guidelines or sample answers for grading..."
                                            rows={2}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            {question.type === 'SHORT_ANSWER'
                                                ? '💡 Students will provide a brief text answer. You can manually grade these.'
                                                : '💡 Students will write a detailed essay. You can manually grade these based on content, structure, and quality.'
                                            }
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Save Button */}
            <div className="flex justify-end gap-4">
                <Button variant="outline">
                    Preview Quiz
                </Button>
                <Button
                    size="lg"
                    disabled={questions.length === 0 || isSaving}
                    onClick={handleSaveQuiz}
                >
                    {isSaving ? 'Saving...' : 'Save Quiz'}
                </Button>
            </div>
        </div>
    );
}

