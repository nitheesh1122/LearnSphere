import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import CourseCatalog from '@/components/learner/course-catalog';

export default async function CatalogPage() {
    const session = await auth();

    // Fetch published courses with visibility enforcement
    // EVERYONE: visible to all
    // SIGNED_IN: visible only to authenticated users
    const visibilityFilter = session?.user?.id
        ? { visibility: { in: ['EVERYONE', 'SIGNED_IN'] } }
        : { visibility: 'EVERYONE' };

    const courses = await prisma.course.findMany({
        where: {
            published: true,
            deletedAt: null,
            ...visibilityFilter,
        },
        include: {
            instructor: {
                select: {
                    name: true,
                    email: true,
                },
            },
            _count: {
                select: {
                    enrollments: true,
                    contents: true,
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Course Catalog</h1>
                <p className="text-muted-foreground mt-2">
                    Discover courses and start your learning journey
                </p>
            </div>

            <CourseCatalog courses={courses} isAuthenticated={!!session?.user?.id} />
        </div>
    );
}
