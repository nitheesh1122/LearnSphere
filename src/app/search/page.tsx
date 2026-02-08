import Link from "next/link";
import { Star } from "lucide-react";
import prisma from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

interface SearchPageProps {
    searchParams: {
        q?: string;
        category?: string;
    };
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string; category?: string }> }) {
    const { q: query, category } = await searchParams;

    const where: any = { published: true };

    if (query) {
        where.OR = [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } }
        ];
    }

    // Note: Category filtering would require a relation or tag search. 
    // For now we're just handling the text search or showing all.

    const courses = await prisma.course.findMany({
        where,
        include: {
            instructor: {
                select: { name: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 container px-4 py-8 md:px-6">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight mb-2">
                        {query ? `Search Results for "${query}"` : "Explore Courses"}
                    </h1>
                    <p className="text-muted-foreground">
                        Found {courses.length} courses
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {courses.length > 0 ? (
                        courses.map((course) => (
                            <Link key={course.id} href={`/courses/${course.id}`} className="group relative overflow-hidden rounded-lg border bg-background transition-all hover:shadow-lg block">
                                <div className="aspect-video w-full bg-gray-200 relative overflow-hidden">
                                    {/* Placeholder for Course Image */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-muted-foreground text-xs p-4 text-center">
                                        {course.title}
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
                                            <span>4.9</span>
                                            <span className="mx-1 text-muted-foreground">•</span>
                                            <span className="text-muted-foreground">${course.price}</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12 text-muted-foreground">
                            No courses found matching your criteria.
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
