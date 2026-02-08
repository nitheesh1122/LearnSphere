import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest, { params }: { params: Promise<{ certificateId: string }> }) {
    try {
        const { certificateId } = await params;
        
        // Fetch certificate with user and course data
        const certificate = await prisma.certificate.findUnique({
            where: { id: certificateId },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        });

        if (!certificate) {
            return NextResponse.json(
                { error: 'Certificate not found' },
                { status: 404 }
            );
        }

        // Fetch course separately
        const course = await prisma.course.findUnique({
            where: { id: certificate.courseId },
            select: {
                title: true,
                instructor: {
                    select: {
                        name: true,
                    },
                },
            },
        });

        if (!course) {
            return NextResponse.json(
                { error: 'Course not found' },
                { status: 404 }
            );
        }

        // Generate certificate HTML with real data
        const certificateHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Course Completion Certificate</title>
                <style>
                    body {
                        font-family: 'Arial', sans-serif;
                        margin: 0;
                        padding: 20px;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        min-height: 100vh;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    .certificate {
                        width: 800px;
                        max-width: 90%;
                        background: white;
                        border-radius: 15px;
                        padding: 40px;
                        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                        position: relative;
                        text-align: center;
                    }
                    .certificate-header {
                        border-bottom: 3px solid #e5e7eb;
                        padding-bottom: 20px;
                        margin-bottom: 20px;
                    }
                    .certificate-title {
                        font-size: 36px;
                        font-weight: bold;
                        color: #2d3748;
                        margin-bottom: 10px;
                    }
                    .certificate-content {
                        margin: 20px 0;
                    }
                    .certificate-name {
                        font-size: 24px;
                        font-weight: bold;
                        color: #1a202c;
                        margin-bottom: 15px;
                        padding: 15px;
                        background: #f8f9fa;
                        border-radius: 8px;
                    }
                    .certificate-course {
                        font-size: 18px;
                        color: #374151;
                        margin-bottom: 10px;
                        font-style: italic;
                    }
                    .certificate-date {
                        font-size: 14px;
                        color: #6b7280;
                        margin-top: 20px;
                    }
                    .certificate-footer {
                        margin-top: 30px;
                        padding-top: 20px;
                        border-top: 2px solid #e5e7eb;
                        font-size: 12px;
                        color: #6b7280;
                    }
                    .seal {
                        position: absolute;
                        bottom: 20px;
                        right: 20px;
                        width: 60px;
                        height: 60px;
                        background: #ffd700;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-weight: bold;
                        color: #333;
                        font-size: 10px;
                    }
                </style>
            </head>
            <body>
                <div class="certificate">
                    <div class="certificate-header">
                        <div class="certificate-title">Certificate of Completion</div>
                    </div>
                    <div class="certificate-content">
                        <div class="certificate-name">${certificate.user.name || 'Student Name'}</div>
                        <div class="certificate-course">has successfully completed the course</div>
                        <div class="certificate-course">"${course.title || 'Course Title'}"</div>
                        <div class="certificate-date">Completed on ${new Date(certificate.issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                    </div>
                    <div class="certificate-footer">
                        Certificate ID: ${certificate.id}
                        <div class="seal">VERIFIED</div>
                    </div>
                </div>
            </body>
            </html>
        `;

        return new NextResponse(certificateHTML, {
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'Content-Disposition': `inline; filename="certificate-${certificateId}.html"`,
            },
        });
    } catch (error) {
        console.error('Certificate generation error:', error);
        return NextResponse.json(
            { error: 'Failed to generate certificate' },
            { status: 500 }
        );
    }
}
