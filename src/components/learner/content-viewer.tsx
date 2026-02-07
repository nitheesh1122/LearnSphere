'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ChevronRight, FileText, Image as ImageIcon, Video, Download } from 'lucide-react';
import { markLessonComplete } from '@/lib/actions/progress';
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

    const currentIndex = allLessons.findIndex(l => l.id === lesson.id);
    const nextLesson = allLessons[currentIndex + 1];
    const canGoNext = nextLesson && !nextLesson.isLocked;

    const handleMarkComplete = () => {
        startTransition(() => {
            markLessonComplete(lesson.id).then(() => {
                setCompleted(true);
                router.refresh();
            });
        });
    };

    const handleNext = () => {
        if (nextLesson) {
            router.push(`/learner/learn/lesson/${nextLesson.id}`);
        }
    };

    const renderContent = () => {
        switch (lesson.type) {
            case 'VIDEO':
                return (
                    <div className="aspect-video bg-black rounded-lg overflow-hidden">
                        {lesson.contentUrl ? (
                            <iframe
                                src={lesson.contentUrl}
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
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
                    <div className="prose max-w-none">
                        {lesson.contentUrl ? (
                            <ReactMarkdown>{lesson.contentUrl}</ReactMarkdown>
                        ) : (
                            <p className="text-muted-foreground">No content available</p>
                        )}
                    </div>
                );

            case 'IMAGE':
                return (
                    <div className="flex justify-center">
                        {lesson.contentUrl ? (
                            <img
                                src={lesson.contentUrl}
                                alt={lesson.title}
                                className="max-w-full h-auto rounded-lg"
                            />
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
                                    className="w-full h-[600px] rounded-lg border" />
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
                    {!completed && (
                        <Button
                            onClick={handleMarkComplete}
                            disabled={isPending}
                            variant="default"
                        >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Mark as Complete
                        </Button>
                    )}

                    {canGoNext && (
                        <Button
                            onClick={handleNext}
                            variant="outline"
                        >
                            Next Lesson
                            <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                    )}

                    {!canGoNext && nextLesson && (
                        <Button variant="outline" disabled>
                            Complete this lesson to unlock next
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
