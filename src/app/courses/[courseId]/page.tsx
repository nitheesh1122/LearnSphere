import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Star, Clock, Globe, BarChart, Lock, PlayCircle, CheckCircle, BookOpen } from "lucide-react";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { checkEnrollmentStatus } from "@/lib/actions/enrollment";

interface CoursePageProps {
    params: Promise<{
        courseId: string;
    }>;
}

export default async function CoursePage({ params }: CoursePageProps) {
    const { courseId } = await params;

    const course = await prisma.course.findUnique({
        where: { id: courseId },
        include: {
            instructor: true,
            contents: {
                where: { hidden: false },
                orderBy: { order: 'asc' }
            }
        }
    });

    if (!course) {
        notFound();
    }

    const { enrolled } = await checkEnrollmentStatus(courseId);
    
    // Debug: Log enrollment status
    console.log('Course ID:', courseId);
    console.log('Enrollment status:', enrolled);

    // Find the preview lesson (if any)
    const previewLesson = await prisma.courseContent.findFirst({
        where: {
            courseId,
            isPreview: true,
            hidden: false,
        },
    });

    // If enrolled, redirect to the learning view?
    // The user requested: "if user enroll course then they can view the entire course"
    // Usually this means going to the learning dashboard/player.
    // But sometimes users want to see the landing page to review what they bought or leave a review.
    // Let's keep them here but unlock the lessons, which links to the player.

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 bg-background">
                {/* Hero Section with Video */}
                <div className="bg-zinc-950 text-white py-12">
                    <div className="container px-4 md:px-6">
                        <Link href="/" className="inline-flex items-center text-sm text-zinc-400 hover:text-white mb-6">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
                        </Link>

                        <div className="grid md:grid-cols-3 gap-8 items-start">
                            <div className="md:col-span-2 space-y-6">
                                <h1 className="text-3xl md:text-5xl font-bold tracking-tight">{course.title}</h1>
                                <p className="text-xl text-zinc-300">{course.description}</p>

                                <div className="flex flex-wrap items-center gap-6 text-sm text-zinc-400">
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-white border border-zinc-700">
                                            {course.instructor.name?.charAt(0) || "I"}
                                        </div>
                                        <span>By <span className="text-white font-medium">{course.instructor.name}</span></span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                        <span className="text-white font-bold">4.9</span>
                                        <span>(120 reviews)</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <BarChart className="h-4 w-4" />
                                        <span>{course.level}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Enrollment Card (Floating if needed, but here inline for now) */}
                            <div className="md:col-span-1 bg-zinc-900 rounded-xl border border-zinc-800 p-6 space-y-4 shadow-xl">
                                <div className="text-3xl font-bold text-white flex items-center justify-between">
                                    <span>${course.price}</span>
                                    {enrolled && <span className="text-sm font-normal text-green-400 bg-green-400/10 px-2 py-1 rounded">Enrolled</span>}
                                </div>

                                {enrolled ? (
                                    <Link href={`/learner/learn/${courseId}`}>
                                        <Button className="w-full text-lg h-12 bg-green-600 hover:bg-green-700">
                                            Continue Learning
                                        </Button>
                                    </Link>
                                ) : (
                                    <Link href={`/learner/course/${courseId}`}>
                                        <Button className="w-full text-lg h-12">
                                            Enroll Now
                                        </Button>
                                    </Link>
                                    // Note: Simple link to learner view which handles enrollment logic
                                )}

                                <p className="text-xs text-center text-zinc-500">30-Day Money-Back Guarantee</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Course Preview Section */}
                <div className="bg-zinc-100 py-12 border-b">
                    <div className="container px-4 md:px-6">
                        <h2 className="text-2xl font-bold mb-6">Course Preview</h2>
                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Preview Video */}
                            <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-lg relative">
                                {previewLesson?.contentUrl ? (
                                    <div>
                                        <video
                                            src={previewLesson.contentUrl}
                                            controls
                                            className="w-full h-full"
                                            poster={course.imageUrl || undefined}
                                        />
                                        <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded text-sm">
                                            Preview: {previewLesson.title}
                                        </div>
                                    </div>
                                ) : course.previewVideoUrl ? (
                                    <video
                                        src={course.previewVideoUrl}
                                        controls
                                        className="w-full h-full"
                                        poster={course.imageUrl || undefined}
                                    />
                                ) : course.imageUrl ? (
                                    <img src={course.imageUrl} alt={course.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-zinc-500">
                                        No Preview Available
                                    </div>
                                )}
                            </div>

                            {/* Course Introduction */}
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-xl font-semibold mb-3">What You'll Learn</h3>
                                    <ul className="space-y-3">
                                        <li className="flex items-start gap-3">
                                            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                            <span>Master the core concepts and fundamentals</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                            <span>Build real-world projects and portfolio pieces</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                            <span>Learn industry best practices and standards</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                            <span>Get hands-on experience with practical exercises</span>
                                        </li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="text-xl font-semibold mb-3">Course Details</h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div className="flex items-center gap-2">
                                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                                            <span>{course.contents.length} Lessons</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <BarChart className="h-4 w-4 text-muted-foreground" />
                                            <span>{course.level} Level</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                            <span>Self-paced learning</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Globe className="h-4 w-4 text-muted-foreground" />
                                            <span>Lifetime access</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-xl font-semibold mb-3">Requirements</h3>
                                    <ul className="space-y-2 text-sm text-muted-foreground">
                                        <li>• Basic computer skills</li>
                                        <li>• No prior experience required</li>
                                        <li>• Commitment to learn and practice</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Course Content */}
                <div className="container px-4 md:px-6 py-12">
                    <div className="grid md:grid-cols-3 gap-12">
                        <div className="md:col-span-2 space-y-8">
                            <section>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold">Course Content</h2>
                                    <span className="text-muted-foreground">{course.contents.length} lessons • {course.level} level</span>
                                </div>
                                <div className="border rounded-xl divide-y overflow-hidden">
                                    {course.contents.map((lesson, index) => (
                                        <div key={lesson.id} className={`p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors ${!enrolled ? 'opacity-75' : ''}`}>
                                            <div className="flex-shrink-0 w-8 text-muted-foreground font-medium text-center">
                                                {index + 1}
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-medium flex items-center gap-2">
                                                    {lesson.title}
                                                    {lesson.isPreview && (
                                                        <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                                                            Preview
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                                                    <span className="uppercase text-[10px] tracking-wider font-semibold border px-1 rounded">
                                                        {lesson.type === 'VIDEO' && '🎥 Video'}
                                                        {lesson.type === 'TEXT' && '📖 Reading'}
                                                        {lesson.type === 'QUIZ' && '📝 Quiz'}
                                                        {lesson.type === 'IMAGE' && '🖼️ Image'}
                                                        {lesson.type === 'DOCUMENT' && '📄 Document'}
                                                    </span>
                                                    {lesson.type === 'VIDEO' && <span>Video content</span>}
                                                    {lesson.type === 'TEXT' && <span>Reading material</span>}
                                                    {lesson.type === 'QUIZ' && <span>Knowledge check</span>}
                                                    {lesson.type === 'IMAGE' && <span>Visual content</span>}
                                                    {lesson.type === 'DOCUMENT' && <span>Downloadable resource</span>}
                                                </div>
                                            </div>
                                            <div className="flex-shrink-0">
                                                {enrolled ? (
                                                    <Link href={`/learner/learn/${courseId}/lesson/${lesson.id}`}>
                                                        <Button variant="ghost" size="sm" className="gap-2 text-primary hover:text-primary/80">
                                                            <PlayCircle className="h-4 w-4" /> Start
                                                        </Button>
                                                    </Link>
                                                ) : lesson.isPreview ? (
                                                    <Link href={`/learner/learn/${courseId}/lesson/${lesson.id}`}>
                                                        <Button variant="ghost" size="sm" className="gap-2 text-blue-600 hover:text-blue-700">
                                                            <PlayCircle className="h-4 w-4" /> Preview
                                                        </Button>
                                                    </Link>
                                                ) : (
                                                    <Lock className="h-4 w-4 text-muted-foreground" />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {course.contents.length === 0 && (
                                        <div className="p-8 text-center text-muted-foreground">
                                            No lessons available yet.
                                        </div>
                                    )}
                                </div>
                                {!enrolled && (
                                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                        <p className="text-sm text-blue-800">
                                            <strong>Preview Available:</strong> You can watch the preview lesson to get a taste of the course content before enrolling.
                                        </p>
                                    </div>
                                )}
                            </section>
                        </div>

                        {/* Sidebar - Enhanced Course Info */}
                        <div className="space-y-6">
                            <div className="p-6 bg-muted/30 rounded-xl border">
                                <h3 className="font-bold mb-4">This Course Includes</h3>
                                <ul className="space-y-3 text-sm">
                                    <li className="flex gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                                        <span>{course.contents.length} lessons of content</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                                        <span>Self-paced learning</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                                        <span>Lifetime access</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                                        <span>Certificate of completion</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                                        <span>Access on all devices</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="p-6 bg-muted/30 rounded-xl border">
                                <h3 className="font-bold mb-4">Target Audience</h3>
                                <ul className="space-y-2 text-sm text-muted-foreground">
                                    <li>• Beginners looking to learn</li>
                                    <li>• Students seeking practical skills</li>
                                    <li>• Professionals wanting to upskill</li>
                                    <li>• Anyone interested in the topic</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

            </main>
            <Footer />
        </div>
    );
}
