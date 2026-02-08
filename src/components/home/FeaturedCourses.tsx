import Link from "next/link";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import prisma from "@/lib/prisma";

export async function FeaturedCourses() {
    const courses = await prisma.course.findMany({
        where: { published: true },
        take: 4,
        include: {
            instructor: {
                select: { name: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <section className="py-16 bg-muted/30">
            <div className="container px-4 md:px-6">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Featured Classes</h2>
                        <p className="text-muted-foreground mt-2">Hand-picked by our editors</p>
                    </div>
                    <Link href="/search"><Button variant="outline">See All</Button></Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {courses.length > 0 ? (
                        courses.map((course) => (
                            <Link key={course.id} href={`/courses/${course.id}`} className="group relative overflow-hidden rounded-lg border bg-background transition-all hover:shadow-lg block">
                                <div className="aspect-video w-full bg-gray-200 relative overflow-hidden">
                                    {/* Placeholder for Course Image - in real app would be dynamic */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-muted-foreground text-xs p-4 text-center">
                                        {course.title}
                                    </div>
                                    <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                        POPULAR
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h3 className="line-clamp-2 text-lg font-semibold group-hover:text-primary transition-colors">
                                        {course.title}
                                    </h3>
                                    <p className="mt-2 text-sm text-muted-foreground">{course.instructor.name}</p>

                                    <div className="mt-4 flex items-center justify-between">
                                        <div className="flex items-center text-sm">
                                            <Star className="mr-1 h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                                            <span>4.9</span> {/* Hardcoded rating as not in model yet */}
                                            <span className="mx-1 text-muted-foreground">•</span>
                                            <span className="text-muted-foreground">${course.price}</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12 text-muted-foreground">
                            No courses found. Seed the database to see courses here.
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
