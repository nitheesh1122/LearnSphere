'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, ChevronRight, ChevronLeft, Award } from 'lucide-react';
import { startQuizAttempt, submitQuizAttempt } from '@/lib/actions/quiz';
import { useRouter } from 'next/navigation';

interface QuizPlayerProps {
    quiz: any;
    previousAttempts: any[];
    courseId: string;
}

export default function QuizPlayer({ quiz, previousAttempts, courseId }: QuizPlayerProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [quizState, setQuizState] = useState<'intro' | 'questions' | 'result'>('intro');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string[]>>({});
    const [attemptId, setAttemptId] = useState<string | null>(null);
    const [result, setResult] = useState<any>(null);

    const currentQuestion = quiz.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

    const bestAttempt = previousAttempts.length > 0
        ? previousAttempts.reduce((best, current) => current.score > best.score ? current : best)
        : null;

    const handleStartQuiz = () => {
        startTransition(() => {
            startQuizAttempt(quiz.id).then((res) => {
                if (res.success && res.attemptId) {
                    setAttemptId(res.attemptId);
                    setQuizState('questions');
                }
            });
        });
    };

    const toggleAnswer = (questionId: string, answerId: string) => {
        setAnswers(prev => {
            const currentAnswers = prev[questionId] || [];
            const newAnswers = currentAnswers.includes(answerId)
                ? currentAnswers.filter(id => id !== answerId)
                : [...currentAnswers, answerId];

            return { ...prev, [questionId]: newAnswers };
        });
    };

    const handleNext = () => {
        if (currentQuestionIndex < quiz.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const handleSubmit = () => {
        if (!attemptId) return;

        startTransition(() => {
            submitQuizAttempt(attemptId, answers).then((res) => {
                if (res.success) {
                    setResult(res);
                    setQuizState('result');
                }
            });
        });
    };

    if (quizState === 'intro') {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">{quiz.content.title}</CardTitle>
                    <CardDescription>Quiz Assessment</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">Total Questions</p>
                            <p className="text-2xl font-bold">{quiz.questions.length}</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">Passing Score</p>
                            <p className="text-2xl font-bold">{quiz.passingScore}%</p>
                        </div>
                    </div>

                    {previousAttempts.length > 0 && (
                        <div className="border-t pt-4">
                            <h3 className="font-semibold mb-3">Previous Attempts</h3>
                            <div className="space-y-2">
                                {previousAttempts.map((attempt, index) => (
                                    <div key={attempt.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                                        <span className="text-sm">Attempt {previousAttempts.length - index}</span>
                                        <div className="flex items-center gap-2">
                                            <Badge
                                                variant={attempt.score >= quiz.passingScore ? 'default' : 'destructive'}
                                                className={attempt.score >= quiz.passingScore ? 'bg-green-600' : ''}
                                            >
                                                {attempt.score}%
                                            </Badge>
                                            {attempt.score >= quiz.passingScore ? (
                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                            ) : (
                                                <XCircle className="h-4 w-4 text-red-600" />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {bestAttempt && bestAttempt.score >= quiz.passingScore && (
                                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                                    <div className="flex items-center gap-2 text-green-900">
                                        <Award className="h-5 w-5" />
                                        <p className="font-semibold">You've already passed this quiz!</p>
                                    </div>
                                    <p className="text-sm text-green-800 mt-1">
                                        Best score: {bestAttempt.score}%
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                        <h4 className="font-semibold text-blue-900 mb-2">Instructions</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Answer all questions to submit the quiz</li>
                            <li>• You can navigate between questions</li>
                            <li>• Select all correct answers for each question</li>
                            <li>• You need {quiz.passingScore}% to pass</li>
                        </ul>
                    </div>

                    <Button onClick={handleStartQuiz} disabled={isPending} size="lg" className="w-full">
                        {previousAttempts.length > 0 ? 'Retake Quiz' : 'Start Quiz'}
                    </Button>

                    <Button
                        variant="outline"
                        onClick={() => router.push(`/learner/learn/${courseId}`)}
                        className="w-full"
                    >
                        Back to Course
                    </Button>
                </CardContent>
            </Card>
        );
    }

    if (quizState === 'result' && result) {
        const passed = result.passed;

        return (
            <Card>
                <CardHeader>
                    <div className="text-center space-y-4">
                        {passed ? (
                            <>
                                <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                    <CheckCircle className="h-10 w-10 text-green-600" />
                                </div>
                                <CardTitle className="text-2xl text-green-900">Congratulations! You Passed!</CardTitle>
                            </>
                        ) : (
                            <>
                                <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                                    <XCircle className="h-10 w-10 text-red-600" />
                                </div>
                                <CardTitle className="text-2xl text-red-900">Quiz Not Passed</CardTitle>
                            </>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="text-center">
                        <p className="text-5xl font-bold mb-2">{result.score}%</p>
                        <p className="text-muted-foreground">
                            {result.correctAnswers} out of {result.totalQuestions} questions correct
                        </p>
                    </div>

                    <div className="border-t pt-6 space-y-3">
                        {passed ? (
                            <>
                                <p className="text-center text-green-900">
                                    You've successfully passed this quiz and can proceed to the next lesson.
                                </p>
                                <Button
                                    onClick={() => router.push(`/learner/learn/${courseId}`)}
                                    size="lg"
                                    className="w-full"
                                >
                                    Continue to Next Lesson
                                </Button>
                            </>
                        ) : (
                            <>
                                <p className="text-center text-red-900">
                                    You need {quiz.passingScore}% to pass. Review the material and try again.
                                </p>
                                <Button
                                    onClick={() => {
                                        setQuizState('intro');
                                        setCurrentQuestionIndex(0);
                                        setAnswers({});
                                        setResult(null);
                                    }}
                                    size="lg"
                                    className="w-full"
                                >
                                    Try Again
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => router.push(`/learner/learn/${courseId}`)}
                                    className="w-full"
                                >
                                    Back to Course
                                </Button>
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Questions view
    const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
    const allQuestionsAnswered = quiz.questions.every((q: any) => answers[q.id]?.length > 0);

    return (
        <div className="space-y-4">
            {/* Progress */}
            <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">
                        Question {currentQuestionIndex + 1} of {quiz.questions.length}
                    </span>
                    <span className="text-sm text-muted-foreground">
                        {Math.round(progress)}% Complete
                    </span>
                </div>
                <Progress value={progress} />
            </div>

            {/* Question Card */}
            <Card>
                <CardHeader>
                    <Badge className="w-fit mb-2">Question {currentQuestionIndex + 1}</Badge>
                    <CardTitle className="text-xl">{currentQuestion.text}</CardTitle>
                    <CardDescription>
                        Select all correct answers ({currentQuestion.points} points)
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-3">
                        {currentQuestion.answers.map((answer: any) => {
                            const isSelected = answers[currentQuestion.id]?.includes(answer.id) || false;

                            return (
                                <div
                                    key={answer.id}
                                    onClick={() => toggleAnswer(currentQuestion.id, answer.id)}
                                    className={`flex items-start gap-3 p-4 border rounded-md cursor-pointer transition-colors ${isSelected ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'
                                        }`}
                                >
                                    <Checkbox checked={isSelected} />
                                    <span className="flex-1">{answer.text}</span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-between items-center pt-4 border-t">
                        <Button
                            variant="outline"
                            onClick={handlePrevious}
                            disabled={currentQuestionIndex === 0}
                        >
                            <ChevronLeft className="mr-2 h-4 w-4" />
                            Previous
                        </Button>

                        {isLastQuestion ? (
                            <Button
                                onClick={handleSubmit}
                                disabled={!allQuestionsAnswered || isPending}
                            >
                                Submit Quiz
                            </Button>
                        ) : (
                            <Button onClick={handleNext}>
                                Next
                                <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                        )}
                    </div>

                    {!allQuestionsAnswered && isLastQuestion && (
                        <p className="text-sm text-destructive text-center">
                            Please answer all questions before submitting
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
