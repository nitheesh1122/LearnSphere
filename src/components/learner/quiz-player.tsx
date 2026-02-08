'use client';

import { useState, useTransition, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, ChevronRight, ChevronLeft, Award, Clock, Eye, EyeOff } from 'lucide-react';
import { submitQuizAttemptEnhanced, getQuizResults, retakeQuiz } from '@/lib/actions/enhanced-quiz';
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
    const [showAnswers, setShowAnswers] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
    
    // Tab switching warning states
    const [tabSwitchWarnings, setTabSwitchWarnings] = useState(0);
    const [showTabWarning, setShowTabWarning] = useState(false);
    const [quizStarted, setQuizStarted] = useState(false);
    const quizRef = useRef<HTMLDivElement>(null);

    const currentQuestion = quiz.questions[currentQuestionIndex];
    const progress = quiz.questions.length > 0 ? ((currentQuestionIndex + 1) / quiz.questions.length) * 100 : 0;

    // Tab switching detection
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden && quizStarted && quizState === 'questions') {
                const newWarnings = tabSwitchWarnings + 1;
                setTabSwitchWarnings(newWarnings);
                
                if (newWarnings >= 3) {
                    // Auto submit after 3 warnings
                    handleSubmit();
                } else {
                    setShowTabWarning(true);
                    setTimeout(() => setShowTabWarning(false), 3000);
                }
            }
        };

        const handleBlur = (e: FocusEvent) => {
            if (quizStarted && quizState === 'questions' && !quizRef.current?.contains(e.relatedTarget as Node)) {
                const newWarnings = tabSwitchWarnings + 1;
                setTabSwitchWarnings(newWarnings);
                
                if (newWarnings >= 3) {
                    // Auto submit after 3 warnings
                    handleSubmit();
                } else {
                    setShowTabWarning(true);
                    setTimeout(() => setShowTabWarning(false), 3000);
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleBlur);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleBlur);
        };
    }, [quizStarted, quizState, tabSwitchWarnings]);

    // Early safety check - if quiz has no questions or currentQuestion is undefined
    if (!currentQuestion || quiz.questions.length === 0) {
        return (
            <div className="space-y-4">
                <Card>
                    <CardContent className="p-8 text-center">
                        <h3 className="text-lg font-semibold mb-2">No Questions Available</h3>
                        <p className="text-muted-foreground">
                            This quiz doesn't have any questions yet. Please contact your instructor to add questions to the quiz.
                        </p>
                        <Button onClick={() => router.push(`/learner/learn/${courseId}`)}>
                            Back to Course
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const bestAttempt = previousAttempts.length > 0
        ? previousAttempts.reduce((best, current) => current.score > best.score ? current : best)
        : null;

    const handleStartQuiz = () => {
        setQuizStarted(true);
        startTransition(() => {
            // For now, create a mock attempt since enhanced quiz actions may not be available
            const mockAttemptId = `attempt-${Date.now()}`;
            setAttemptId(mockAttemptId);
            setQuizState('questions');
            // Start timer if quiz has time limit
            if (quiz.timeLimit) {
                setTimeRemaining(quiz.timeLimit * 60); // Convert minutes to seconds
            }
        });
    };

    const handleAnswerChange = (questionId: string, answer: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: [answer] }));
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
            // Mock submission - calculate score and show results
            const totalQuestions = quiz.questions.length;
            let correctCount = 0;
            
            quiz.questions.forEach((question: any) => {
                const userAnswer = answers[question.id] || [];
                const correctAnswerIds = question.answers
                    .filter((a: any) => a.isCorrect)
                    .map((a: any) => a.id);
                
                if (question.type === 'MULTIPLE_CHOICE' || question.type === 'TRUE_FALSE') {
                    if (userAnswer.length === correctAnswerIds.length &&
                        userAnswer.every(id => correctAnswerIds.includes(id))) {
                        correctCount++;
                    }
                } else if (question.type === 'SHORT_ANSWER') {
                    const userText = userAnswer[0] || '';
                    const correctAnswers = question.answers
                        .filter((a: any) => a.isCorrect)
                        .map((a: any) => a.text.toLowerCase().trim());
                    
                    if (correctAnswers.some((correct: string) => 
                        userText.toLowerCase().trim().includes(correct))) {
                        correctCount++;
                    }
                } else if (question.type === 'ESSAY') {
                    if (userAnswer.length > 0 && userAnswer[0].trim().length > 10) {
                        correctCount++;
                    }
                }
            });
            
            const score = Math.round((correctCount / totalQuestions) * 100);
            const passed = score >= quiz.passingScore;
            
            setResult({
                score,
                passed,
                correctAnswers: correctCount,
                totalQuestions,
                completedAt: new Date()
            });
            setQuizState('result');
            setQuizStarted(false);
        });
    };

    const renderQuestionInput = (question: any) => {
        const currentAnswer = answers[question.id] || (question.type === 'MULTIPLE_CHOICE' || question.type === 'TRUE_FALSE' ? [] : ['']);

        switch (question.type) {
            case 'MULTIPLE_CHOICE':
                return (
                    <RadioGroup
                        value={currentAnswer[0] || ''}
                        onValueChange={(value: string) => handleAnswerChange(question.id, value)}
                    >
                        {question.answers.map((answer: any) => (
                            <div key={answer.id} className="flex items-center space-x-2">
                                <RadioGroupItem value={answer.id} id={answer.id} />
                                <Label htmlFor={answer.id} className="flex-1 cursor-pointer">
                                    {answer.text}
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>
                );

            case 'TRUE_FALSE':
                return (
                    <RadioGroup
                        value={currentAnswer[0] || ''}
                        onValueChange={(value: string) => handleAnswerChange(question.id, value)}
                    >
                        {question.answers.map((answer: any) => (
                            <div key={answer.id} className="flex items-center space-x-2">
                                <RadioGroupItem value={answer.id} id={answer.id} />
                                <Label htmlFor={answer.id} className="flex-1 cursor-pointer">
                                    {answer.text}
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>
                );

            case 'SHORT_ANSWER':
                return (
                    <Input
                        value={currentAnswer[0] || ''}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        placeholder="Enter your answer..."
                    />
                );

            case 'ESSAY':
                return (
                    <Textarea
                        placeholder="Write your essay here..."
                        value={currentAnswer[0] || ''}
                        onChange={(e: any) => handleAnswerChange(question.id, e.target.value)}
                        rows={8}
                    />
                );

            default:
                return null;
        }
    };

    const isQuestionAnswered = (question: any) => {
        const answer = answers[question.id];
        if (question.type === 'MULTIPLE_CHOICE' || question.type === 'TRUE_FALSE') {
            return answer && answer.length > 0 && answer[0] !== '';
        }
        return answer && answer.length > 0 && answer[0] && answer[0].trim() !== '';
    };

    if (quizState === 'intro') {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">{quiz.content.title}</CardTitle>
                    <CardDescription>Quiz Assessment</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">Total Questions</p>
                            <p className="text-2xl font-bold">{quiz.questions.length}</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">Passing Score</p>
                            <p className="text-2xl font-bold">{quiz.passingScore}%</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">Total Points</p>
                            <p className="text-2xl font-bold">{quiz.questions.reduce((sum: number, q: any) => sum + q.points, 0)}</p>
                        </div>
                        {quiz.timeLimit && (
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">Time Limit</p>
                                <p className="text-2xl font-bold">{quiz.timeLimit} min</p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-3">
                        <h4 className="font-semibold">Question Types:</h4>
                        <div className="flex flex-wrap gap-2">
                            {quiz.questions.some((q: any) => q.type === 'MULTIPLE_CHOICE') && (
                                <Badge variant="outline">Multiple Choice</Badge>
                            )}
                            {quiz.questions.some((q: any) => q.type === 'TRUE_FALSE') && (
                                <Badge variant="outline">True/False</Badge>
                            )}
                            {quiz.questions.some((q: any) => q.type === 'SHORT_ANSWER') && (
                                <Badge variant="outline">Short Answer</Badge>
                            )}
                            {quiz.questions.some((q: any) => q.type === 'ESSAY') && (
                                <Badge variant="outline">Essay</Badge>
                            )}
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
                            <li>• For multiple choice, select one answer</li>
                            <li>• For short answer and essay, provide written responses</li>
                            <li>• You need {quiz.passingScore}% to pass</li>
                            {quiz.timeLimit && <li>• Time limit: {quiz.timeLimit} minutes</li>}
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
            <div className="space-y-6">
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
                            <p className="text-sm text-muted-foreground mt-1">
                                {result.pointsEarned} out of {result.totalPoints} points earned
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
                                            setShowAnswers(false);
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

                {/* Detailed Results */}
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle>Detailed Results</CardTitle>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowAnswers(!showAnswers)}
                            >
                                {showAnswers ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                                {showAnswers ? 'Hide Answers' : 'Show Answers'}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {quiz.questions.map((question: any, index: number) => {
                            const userAnswer = answers[question.id];
                            const isCorrect = result.questionResults?.[question.id]?.correct || false;
                            const correctAnswer = question.answers.find((a: any) => a.isCorrect);
                            const points = result.questionResults?.[question.id]?.points || 0;

                            return (
                                <div key={question.id} className="border rounded-lg p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Badge variant="outline">Question {index + 1}</Badge>
                                                <Badge variant="outline">{question.type.replace('_', ' ')}</Badge>
                                                <Badge variant="outline">{question.points} points</Badge>
                                                {isCorrect ? (
                                                    <Badge className="bg-green-600">
                                                        <CheckCircle className="h-3 w-3 mr-1" />
                                                        Correct
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="destructive">
                                                        <XCircle className="h-3 w-3 mr-1" />
                                                        Incorrect
                                                    </Badge>
                                                )}
                                            </div>
                                            <h4 className="font-medium">{question.text}</h4>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium">{points}/{question.points} pts</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2 text-sm">
                                        <div>
                                            <span className="font-medium">Your Answer: </span>
                                            {question.type === 'MULTIPLE_CHOICE' || question.type === 'TRUE_FALSE' ? (
                                                <span className={isCorrect ? 'text-green-600' : 'text-red-600'}>
                                                    {userAnswer ? question.answers.find((a: any) => a.id === userAnswer)?.text : 'Not answered'}
                                                </span>
                                            ) : (
                                                <span className={isCorrect ? 'text-green-600' : 'text-red-600'}>
                                                    {userAnswer || 'Not answered'}
                                                </span>
                                            )}
                                        </div>

                                        {showAnswers && !isCorrect && (
                                            <div>
                                                <span className="font-medium">Correct Answer: </span>
                                                <span className="text-green-600">
                                                    {question.type === 'MULTIPLE_CHOICE' || question.type === 'TRUE_FALSE' ? (
                                                        correctAnswer?.text
                                                    ) : (
                                                        'Will be graded by instructor'
                                                    )}
                                                </span>
                                            </div>
                                        )}

                                        {!isCorrect && (
                                            <div className="text-xs text-muted-foreground mt-2">
                                                {question.type === 'SHORT_ANSWER' || question.type === 'ESSAY' ? (
                                                    'This question requires manual grading by the instructor.'
                                                ) : (
                                                    'Review the course material and try again.'
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Questions view
    const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
    const allQuestionsAnswered = quiz.questions.every((q: any) => isQuestionAnswered(q));

    // Safety check - if no current question, show error message
    if (!currentQuestion || quiz.questions.length === 0) {
        return (
            <div className="space-y-4">
                <Card>
                    <CardContent className="p-8 text-center">
                        <h3 className="text-lg font-semibold mb-2">No Questions Available</h3>
                        <p className="text-muted-foreground">
                            This quiz doesn't have any questions yet. Please add questions to the quiz first.
                        </p>
                        <Button onClick={() => router.push(`/instructor/courses/${courseId}/quiz/${quiz.id}`)}>
                            Configure Quiz
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-4" ref={quizRef}>
            {/* Tab Switching Warning */}
            {showTabWarning && (
                <div className="fixed top-4 right-4 z-50 bg-red-50 border border-red-200 rounded-lg p-4 max-w-sm shadow-lg">
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                            <div className="h-6 w-6 bg-red-100 rounded-full flex items-center justify-center">
                                <span className="text-red-600 font-bold text-sm">!</span>
                            </div>
                        </div>
                        <div className="flex-1">
                            <h4 className="font-semibold text-red-900 mb-1">Tab Switching Detected!</h4>
                            <p className="text-sm text-red-800 mb-2">
                                Warning {tabSwitchWarnings} of 3: Do not switch tabs during the quiz. Your quiz will be automatically submitted after 3 warnings.
                            </p>
                            <div className="w-full bg-red-100 rounded-full h-2">
                                <div 
                                    className="bg-red-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${(tabSwitchWarnings / 3) * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Progress and Timer */}
            <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">
                        Question {currentQuestionIndex + 1} of {quiz.questions.length}
                    </span>
                    <div className="flex items-center gap-4">
                        {timeRemaining !== null && (
                            <div className="flex items-center gap-1 text-sm">
                                <Clock className="h-4 w-4" />
                                <span className={timeRemaining < 300 ? 'text-red-600 font-medium' : ''}>
                                    {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                                </span>
                            </div>
                        )}
                        <span className="text-sm text-muted-foreground">
                            {Math.round(progress)}% Complete
                        </span>
                    </div>
                </div>
                <Progress value={progress} />
            </div>

            {/* Question Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                        <Badge className="w-fit">Question {currentQuestionIndex + 1}</Badge>
                        <Badge variant="outline">{currentQuestion.type.replace('_', ' ')}</Badge>
                        <Badge variant="outline">{currentQuestion.points} points</Badge>
                        {currentQuestion.required && (
                            <Badge variant="destructive" className="text-xs">Required</Badge>
                        )}
                    </div>
                    <CardTitle className="text-xl">{currentQuestion.text}</CardTitle>
                    <CardDescription>
                        {currentQuestion.type === 'MULTIPLE_CHOICE' && 'Select one answer'}
                        {currentQuestion.type === 'TRUE_FALSE' && 'Select True or False'}
                        {currentQuestion.type === 'SHORT_ANSWER' && 'Provide a brief answer'}
                        {currentQuestion.type === 'ESSAY' && 'Write a detailed response'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {renderQuestionInput(currentQuestion)}

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
