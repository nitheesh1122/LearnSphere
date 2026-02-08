'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, CheckCircle, ArrowLeft } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function EmailVerification() {
    const [isLoading, setIsLoading] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [error, setError] = useState('');
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    useEffect(() => {
        if (!token || !email) {
            setError('Invalid verification link');
            return;
        }

        verifyEmail();
    }, [token, email]);

    const verifyEmail = async () => {
        setIsLoading(true);
        setError('');

        try {
            // TODO: Implement email verification API
            const response = await fetch('/api/auth/verify-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token, email }),
            });

            const data = await response.json();

            if (data.success) {
                setIsVerified(true);
            } else {
                setError(data.error || 'Verification failed');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isVerified) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardContent className="p-8 text-center">
                        <CheckCircle className="mx-auto h-12 w-12 text-green-600 mb-4" />
                        <CardTitle className="mb-2">Email Verified!</CardTitle>
                        <p className="text-muted-foreground mb-4">
                            Your email has been successfully verified.
                        </p>
                        <p className="text-sm text-muted-foreground mb-4">
                            You can now log in to your account.
                        </p>
                        <Link href="/login">
                            <Button className="mt-4">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Go to Login
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
            <div className="w-full max-w-md">
                <Card>
                    <CardHeader>
                        <CardTitle>Verify Email</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-muted-foreground mb-4">
                            Click the button below to verify your email address.
                        </p>
                        <div className="text-sm text-muted-foreground mb-4">
                            Verifying: {email}
                        </div>
                        {error && (
                            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                                {error}
                            </div>
                        )}
                        <Button 
                            onClick={verifyEmail}
                            className="w-full" 
                            disabled={isLoading || isVerified}
                        >
                            {isLoading ? 'Verifying...' : isVerified ? 'Verified' : 'Verify Email'}
                        </Button>
                        <div className="mt-4 text-center">
                            <Link href="/login">
                                <Button variant="outline" size="sm">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to Login
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
