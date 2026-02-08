import { certificateTemplate } from './certificate-template';

export async function generateCertificatePDF(certificateId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: 'Unauthorized' };
    }

    try {
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
            return { error: 'Certificate not found' };
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
            return { error: 'Course not found' };
        }
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
                        background-color: #f5f5f5;
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

        // In a real implementation, you would use a PDF library like puppeteer or jsPDF
        // For now, we'll store the HTML and return the URL
        const pdfUrl = `/api/certificate/pdf/${certificateId}`;

        // Update certificate with PDF URL
        await prisma.certificate.update({
            where: { id: certificateId },
            data: {
                pdfUrl,
            },
        });

        revalidatePath(`/verify/certificate/${certificateId}`);

        return {
            success: true,
            pdfUrl,
            certificate: {
                id: certificate.id,
                issuedAt: certificate.issuedAt,
                userName: certificate.user.name,
                courseName: certificate.course.title,
                instructorName: certificate.course.instructor.name,
            },
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return { error: `PDF generation failed: ${errorMessage}` };
    }
}

export async function checkCourseCompletion(courseId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: 'Unauthorized' };
    }

    try {
        // Get all non-hidden lessons
        const allLessons = await prisma.courseContent.findMany({
            where: {
                courseId,
                hidden: false,
            },
            include: {
                quiz: {
                    select: {
                        id: true,
                        passingScore: true,
                    },
                },
            },
        });

        // Get user's progress
        const completedLessons = await prisma.contentProgress.findMany({
            where: {
                userId: session.user.id,
                contentId: { in: allLessons.map((l: typeof allLessons[number]) => l.id) },
                isCompleted: true,
            },
        });

        // Check quiz requirements
        for (const lesson of allLessons) {
            if (lesson.type === 'QUIZ' && lesson.quiz) {
                const passedAttempts = await prisma.quizAttempt.findMany({
                    where: {
                        userId: session.user.id,
                        quizId: lesson.quiz.id,
                        score: { gte: lesson.quiz.passingScore },
                    },
                });

                if (passedAttempts.length === 0) {
                    return {
                        completed: false,
                        reason: `Quiz "${lesson.title}" must be passed`
                    };
                }
            }
        }

        const isComplete = completedLessons.length === allLessons.length;

        return {
            completed: isComplete,
            progress: {
                completed: completedLessons.length,
                total: allLessons.length,
            },
        };
    } catch (error) {
        return { error: 'Failed to check completion status' };
    }
}

export async function generateCertificate(courseId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: 'Unauthorized' };
    }

    try {
        // Check if course is completed
        const completionCheck = await checkCourseCompletion(courseId);
        if (!completionCheck.completed) {
            return { error: 'Course not completed yet' };
        }

        // Get enrollment
        const enrollment = await prisma.enrollment.findUnique({
            where: {
                userId_courseId: {
                    userId: session.user.id,
                    courseId,
                },
            },
            include: {
                course: true,
                user: true,
            },
        });

        if (!enrollment) {
            return { error: 'Not enrolled in this course' };
        }

        // Mark enrollment as completed if not already
        if (!enrollment.completedAt) {
            await prisma.enrollment.update({
                where: {
                    userId_courseId: {
                        userId: session.user.id,
                        courseId,
                    },
                },
                data: {
                    completedAt: new Date(),
                },
            });
        }

        // Check if certificate already exists
        let certificate = await prisma.certificate.findFirst({
            where: {
                userId: session.user.id,
                courseId,
            },
        });

        if (!certificate) {
            // Create certificate record
            certificate = await prisma.certificate.create({
                data: {
                    userId: session.user.id,
                    courseId,
                    pdfUrl: '', // Will be generated on demand
                    issuedAt: new Date(),
                },
            });
        }

        // Generate PDF immediately
        const pdfResult = await generateCertificatePDF(certificate.id);

        revalidatePath(`/learner/learn/${courseId}`);

        return {
            success: true,
            certificate: {
                id: certificate.id,
                issuedAt: certificate.issuedAt,
                pdfUrl: pdfResult.pdfUrl,
            },
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return { error: `Certificate generation failed: ${errorMessage}` };
    }
}

export async function verifyCertificate(certificateId: string) {
    try {
        const certificate = await prisma.certificate.findUnique({
            where: { id: certificateId },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
                course: {
                    select: {
                        title: true,
                        instructor: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
        });

        if (!certificate) {
            return { valid: false };
        }

        // Fetch course separately since there's no direct relation
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
            return { valid: false };
        }

        return {
            valid: true,
            certificate: {
                certificateId: certificate.id,
                userName: certificate.user.name || 'Unknown',
                courseName: course.title,
                instructorName: course.instructor.name || 'Unknown',
                issuedAt: certificate.issuedAt,
                pdfUrl: certificate.pdfUrl,
            },
        };
    } catch (error) {
        return { valid: false };
    }
}
