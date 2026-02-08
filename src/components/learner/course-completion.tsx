'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Award, Download, ExternalLink, CheckCircle } from 'lucide-react';
import { generateCertificate } from '@/lib/actions/certificate';
import { useRouter } from 'next/navigation';

interface CourseCompletionProps {
    courseId: string;
    courseName: string;
    completionStatus: any;
    existingCertificate?: any;
}

export default function CourseCompletion({
    courseId,
    courseName,
    completionStatus,
    existingCertificate
}: CourseCompletionProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [certificate, setCertificate] = useState(existingCertificate);
    const [error, setError] = useState('');

    const handleGenerateCertificate = () => {
        setError('');
        startTransition(() => {
            generateCertificate(courseId).then((result) => {
                if (result.error) {
                    setError(result.error);
                } else if (result.success && result.certificate) {
                    console.log('Certificate generated:', result.certificate);
                    setCertificate(result.certificate);
                    router.refresh();
                } else {
                    console.error('Certificate generation failed:', result);
                    setError('Failed to generate certificate');
                }
            });
        });
    };

    const verificationUrl = certificate?.id
        ? `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify/certificate/${certificate.id}`
        : '';

    return (
        <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-green-200">
            <CardHeader>
                <div className="flex items-center justify-center mb-4">
                    <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                        <Award className="h-10 w-10 text-green-600" />
                    </div>
                </div>
                <CardTitle className="text-center text-2xl text-green-900">
                    🎉 Congratulations! Course Completed!
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="text-center">
                    <p className="text-lg font-semibold mb-2">{courseName}</p>
                    <div className="flex items-center justify-center gap-2 text-green-700">
                        <CheckCircle className="h-5 w-5" />
                        <span>All requirements met</span>
                    </div>
                </div>

                {completionStatus?.progress && (
                    <div className="bg-white rounded-lg p-4 border">
                        <p className="text-sm text-muted-foreground mb-2">Completion Summary</p>
                        <p className="font-semibold">
                            {completionStatus.progress.completed} / {completionStatus.progress.total} lessons completed
                        </p>
                    </div>
                )}

                {certificate ? (
                    <div className="space-y-4">
                        <div className="bg-white rounded-lg p-6 border border-green-200">
                            <div className="flex items-center gap-3 mb-4">
                                <Award className="h-6 w-6 text-purple-600" />
                                <p className="font-semibold">Your Certificate</p>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-muted-foreground">Certificate ID</p>
                                    <p className="font-mono text-sm font-semibold">{certificate.certificateId}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-muted-foreground">Issued On</p>
                                    <p className="font-semibold">
                                        {new Date(certificate.issuedAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </p>
                                </div>

                                <div className="pt-3 border-t">
                                    <p className="text-sm text-muted-foreground mb-2">Verification Link</p>
                                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                                        <code className="text-xs flex-1 truncate">{verificationUrl}</code>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                navigator.clipboard.writeText(verificationUrl);
                                            }}
                                        >
                                            Copy
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => certificate?.id && window.open(`/api/certificate/pdf/${certificate.id}`, '_blank')}
                                className="flex-1"
                                disabled={!certificate?.id}
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Download Certificate
                            </Button>
                            <Button
                                variant="default"
                                onClick={() => window.open(verificationUrl, '_blank')}
                                className="flex-1"
                            >
                                <ExternalLink className="mr-2 h-4 w-4" />
                                View Certificate
                            </Button>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                            <p className="text-sm text-blue-900">
                                <strong>Note:</strong> In a production environment, a PDF certificate would be generated and available for download. The verification link can be shared to prove course completion.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="bg-white rounded-lg p-6 border text-center">
                            <Award className="h-12 w-12 mx-auto text-purple-600 mb-3" />
                            <p className="font-semibold mb-2">Generate Your Certificate</p>
                            <p className="text-sm text-muted-foreground mb-4">
                                You've completed all course requirements. Generate your verified certificate now!
                            </p>
                        </div>

                        {error && (
                            <div className="text-destructive text-sm text-center">{error}</div>
                        )}

                        <Button
                            onClick={handleGenerateCertificate}
                            disabled={isPending}
                            className="w-full"
                            size="lg"
                        >
                            <Download className="mr-2 h-5 w-5" />
                            Generate Certificate
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
