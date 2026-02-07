import { verifyCertificate } from '@/lib/actions/certificate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

interface CertificateVerifyPageProps {
    params: {
        certificateId: string;
    };
}

export default async function CertificateVerifyPage({ params }: CertificateVerifyPageProps) {
    const { certificateId } = params;
    const result = await verifyCertificate(certificateId);

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4 max-w-2xl">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2">Certificate Verification</h1>
                    <p className="text-muted-foreground">
                        Verify the authenticity of LearnSphere certificates
                    </p>
                </div>

                {result.valid ? (
                    <Card className="border-green-200">
                        <CardHeader className="bg-green-50">
                            <div className="flex items-center justify-center mb-4">
                                <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                                    <CheckCircle className="h-10 w-10 text-green-600" />
                                </div>
                            </div>
                            <CardTitle className="text-center text-green-900">
                                Valid Certificate
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6">
                            <div className="space-y-4">
                                <div className="bg-white p-4 rounded-lg border">
                                    <p className="text-sm text-muted-foreground mb-2">Certificate ID</p>
                                    <p className="font-mono font-semibold text-lg">
                                        {result.certificate?.certificateId}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 bg-white rounded-lg border">
                                        <p className="text-sm text-muted-foreground mb-1">Recipient</p>
                                        <p className="font-semibold">{result.certificate?.userName}</p>
                                    </div>

                                    <div className="p-4 bg-white rounded-lg border">
                                        <p className="text-sm text-muted-foreground mb-1">Course</p>
                                        <p className="font-semibold">{result.certificate?.courseName}</p>
                                    </div>

                                    <div className="p-4 bg-white rounded-lg border">
                                        <p className="text-sm text-muted-foreground mb-1">Instructor</p>
                                        <p className="font-semibold">{result.certificate?.instructorName}</p>
                                    </div>

                                    <div className="p-4 bg-white rounded-lg border">
                                        <p className="text-sm text-muted-foreground mb-1">Issued On</p>
                                        <p className="font-semibold">
                                            {result.certificate?.issuedAt && new Date(result.certificate.issuedAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })}
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                                    <p className="text-sm text-blue-900">
                                        <strong>Verified:</strong> This certificate was issued by LearnSphere and is authentic.
                                        The recipient has successfully completed the course and met all requirements.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="border-red-200">
                        <CardHeader className="bg-red-50">
                            <div className="flex items-center justify-center mb-4">
                                <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
                                    <XCircle className="h-10 w-10 text-red-600" />
                                </div>
                            </div>
                            <CardTitle className="text-center text-red-900">
                                Invalid Certificate
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="text-center space-y-4">
                                <p className="text-muted-foreground">
                                    The certificate ID <strong className="font-mono">{certificateId}</strong> could not be verified.
                                </p>
                                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                                    <p className="text-sm text-red-900">
                                        This certificate may be invalid, expired, or the ID may have been entered incorrectly.
                                        Please verify the certificate ID and try again.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="text-center mt-8">
                    <Link href="/learner/catalog" className="text-blue-600 hover:underline">
                        Browse Courses
                    </Link>
                </div>
            </div>
        </div>
    );
}
