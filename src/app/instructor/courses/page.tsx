import { getInstructorCourses } from '@/lib/actions/course';
import CoursesDashboard from '@/components/instructor/courses-dashboard';

export default async function CoursesPage() {
    const courses = await getInstructorCourses();

    return (
        <CoursesDashboard courses={courses} />
    );
}
