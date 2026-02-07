import { getAllCourses } from '@/lib/actions/admin';
import CourseList from '@/components/admin/course-list';

export default async function AdminCoursesPage() {
    const courses = await getAllCourses();

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Course Moderation</h1>
            <CourseList courses={courses} />
        </div>
    );
}
