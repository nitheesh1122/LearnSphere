'use client';

import { useState, useEffect, useTransition, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ChevronRight, FileText, Image as ImageIcon, Video, Download, Play, Pause } from 'lucide-react';
import { trackLessonAccess, markLessonComplete } from '@/lib/actions/progress';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';

interface ContentViewerProps {
    lesson: any;
    isCompleted: boolean;
    allLessons: any[];
}

export default function ContentViewer({ lesson, isCompleted, allLessons }: ContentViewerProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [completed, setCompleted] = useState(isCompleted);
    const [watchTime, setWatchTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [readingProgress, setReadingProgress] = useState(0);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const completionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const currentIndex = allLessons.findIndex(l => l.id === lesson.id);
    const nextLesson = allLessons[currentIndex + 1];
    const canGoNext = nextLesson && !nextLesson.isLocked;

    // Track lesson access on mount
    useEffect(() => {
        startTransition(() => {
            trackLessonAccess(lesson.id);
        });
    }, [lesson.id]);

    // Auto-complete based on content type
    const checkForAutoCompletion = () => {
        if (completed) return;

        if (lesson.type === 'VIDEO') {
            // Multiple criteria for video completion
            const hasWatchedEnough = watchTime > 30; // Watched at least 30 seconds
            const hasWatchedSignificant = videoRef.current && 
                (videoRef.current.duration > 0 && watchTime >= Math.min(30, videoRef.current.duration * 0.8)); // 80% or 30 seconds
            const hasEnded = videoRef.current?.ended;
            
            if (hasWatchedEnough || hasWatchedSignificant || hasEnded) {
                handleAutoComplete();
            }
        } else if (lesson.type === 'TEXT' && readingProgress > 0.8) { // Read 80% of content
            handleAutoComplete();
        } else if (lesson.type === 'IMAGE' || lesson.type === 'DOCUMENT') {
            // For images and documents, mark as complete after 10 seconds
            if (!completionTimeoutRef.current) {
                completionTimeoutRef.current = setTimeout(() => handleAutoComplete(), 10000);
            }
        }
    };

    const handleAutoComplete = () => {
        if (!completed) {
            startTransition(() => {
                markLessonComplete(lesson.id).then((result) => {
                    if (result.success) {
                        setCompleted(true);
                        setShowSuccessMessage(true);
                        // Show success message briefly before refreshing
                        setTimeout(() => {
                            window.location.reload();
                        }, 2000);
                    } else {
                        console.error('Failed to mark lesson complete:', result.error);
                    }
                });
            });
        }
    };

    const handleNext = () => {
        if (nextLesson) {
            router.push(`/learner/learn/lesson/${nextLesson.id}`);
        }
    };

    // Video tracking
    const handleVideoPlay = () => {
        setIsPlaying(true);
        checkForAutoCompletion();
    };

    const handleVideoPause = () => {
        setIsPlaying(false);
        checkForAutoCompletion();
    };

    const handleVideoTimeUpdate = () => {
        if (videoRef.current) {
            setWatchTime(videoRef.current.currentTime);
            checkForAutoCompletion();
        }
    };

    const handleVideoEnded = () => {
        // Video ended - mark as complete immediately
        if (!completed) {
            handleAutoComplete();
        }
    };

    // Reading progress tracking
    const handleScroll = () => {
        if (contentRef.current && lesson.type === 'TEXT') {
            const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
            const progress = scrollTop / (scrollHeight - clientHeight);
            setReadingProgress(progress);
            checkForAutoCompletion();
        }
    };

    useEffect(() => {
        if (lesson.type === 'TEXT') {
            const element = contentRef.current;
            if (element) {
                element.addEventListener('scroll', handleScroll);
                return () => element.removeEventListener('scroll', handleScroll);
            }
        }
    }, [lesson.type]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (completionTimeoutRef.current) {
                clearTimeout(completionTimeoutRef.current);
            }
        };
    }, []);

    const renderContent = () => {
        switch (lesson.type) {
            case 'VIDEO':
                return (
                    <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
                        {lesson.contentUrl ? (
                            <>
                                <video
                                    ref={videoRef}
                                    src={lesson.contentUrl}
                                    className="w-full h-full"
                                    controls
                                    onPlay={handleVideoPlay}
                                    onPause={handleVideoPause}
                                    onTimeUpdate={handleVideoTimeUpdate}
                                    onEnded={handleVideoEnded}
                                    onLoadedMetadata={checkForAutoCompletion}
                                />
                                {completed && (
                                    <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm">
                                        <CheckCircle className="inline mr-1 h-4 w-4" />
                                        Completed
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-full text-white">
                                <div className="text-center">
                                    <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>No video URL provided</p>
                                </div>
                            </div>
                        )}
                    </div>
                );

            case 'TEXT':
                return (
                    <div 
                        ref={contentRef}
                        className="prose max-w-none max-h-[600px] overflow-y-auto p-4 bg-white rounded-lg"
                        onScroll={handleScroll}
                    >
                        {lesson.contentUrl ? (
                            <>
                                <ReactMarkdown>{lesson.contentUrl}</ReactMarkdown>
                                {completed && (
                                    <div className="sticky bottom-4 right-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm">
                                        <CheckCircle className="inline mr-1 h-4 w-4" />
                                        Completed
                                    </div>
                                )}
                            </>
                        ) : (
                            <p className="text-muted-foreground">No content available</p>
                        )}
                    </div>
                );

            case 'IMAGE':
                return (
                    <div className="flex justify-center">
                        {lesson.contentUrl ? (
                            <div className="relative">
                                <img
                                    src={lesson.contentUrl}
                                    alt={lesson.title}
                                    className="max-w-full h-auto rounded-lg"
                                    onLoad={checkForAutoCompletion}
                                />
                                {completed && (
                                    <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm">
                                        <CheckCircle className="inline mr-1 h-4 w-4" />
                                        Completed
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center text-muted-foreground">
                                <ImageIcon className="h-12 w-12 mx-auto mb-4" />
                                <p>No image provided</p>
                            </div>
                        )}
                    </div>
                );

            case 'DOCUMENT':
                return (
                    <div className="space-y-4">
                        {lesson.contentUrl ? (
                            <>
                                <embed
                                    src={lesson.contentUrl}
                                    type="application/pdf"
                                    className="w-full h-[600px] rounded-lg border"
                                    onLoad={checkForAutoCompletion}
                                />
                                {completed && (
                                    <div className="bg-green-600 text-white px-3 py-1 rounded-full text-sm inline-block">
                                        <CheckCircle className="inline mr-1 h-4 w-4" />
                                        Completed
                                    </div>
                                )}
                                <a
                                    href={lesson.contentUrl}
                                    download
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-blue-600 hover:underline"
                                >
                                    <Download className="h-4 w-4" />
                                    Download Document
                                </a>
                            </>
                        ) : (
                            <div className="text-center text-muted-foreground py-12">
                                <FileText className="h-12 w-12 mx-auto mb-4" />
                                <p>No document provided</p>
                            </div>
                        )}
                    </div>
                );

            default:
                return (
                    <div className="text-center text-muted-foreground py-12">
                        <p>Content type not supported</p>
                    </div>
                );
        }
    };

    // Parse attachments if they exist
    const attachments = lesson.attachments ? JSON.parse(JSON.stringify(lesson.attachments)) : [];

    return (
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <Badge>{lesson.type}</Badge>
                            {completed && (
                                <Badge variant="default" className="bg-green-600">
                                    <CheckCircle className="mr-1 h-3 w-3" />
                                    Completed
                                </Badge>
                            )}
                        </div>
                        <CardTitle className="text-2xl">{lesson.title}</CardTitle>
                        {lesson.description && (
                            <CardDescription className="mt-2">{lesson.description}</CardDescription>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Main Content */}
                <div className="bg-gray-50 p-6 rounded-lg">
                    {renderContent()}
                </div>

                {/* Attachments */}
                {attachments.length > 0 && (
                    <div className="space-y-2">
                        <h3 className="font-semibold">Attachments</h3>
                        <div className="space-y-2">
                            {attachments.map((attachment: any, index: number) => (
                                <a
                                    key={index}
                                    href={attachment.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 p-3 border rounded-md hover:bg-gray-50"
                                >
                                    <Download className="h-4 w-4" />
                                    <span>{attachment.name}</span>
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t">
                    {showSuccessMessage && (
                        <div className="flex items-center gap-2 text-green-600 font-medium animate-pulse">
                            <CheckCircle className="h-5 w-5" />
                            Lesson completed! Next lesson unlocked.
                        </div>
                    )}
                    
                    {canGoNext && (
                        <Button
                            onClick={handleNext}
                            variant="default"
                            className="ml-auto"
                        >
                            Next Lesson
                            <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                    )}

                    {!canGoNext && nextLesson && (
                        <Button variant="outline" disabled className="ml-auto">
                            Complete this lesson to unlock next
                        </Button>
                    )}

                    {!nextLesson && completed && (
                        <div className="ml-auto text-green-600 font-medium">
                            🎉 Course Completed! Great job!
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
