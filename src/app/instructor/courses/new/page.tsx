import CourseForm from '@/components/instructor/course-form';

export default function CreateCoursePage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Create Course</h1>
                <p className="text-sm text-muted-foreground">
                    Start a new course. You can add content later.
                </p>
            </div>
            <div className="border p-6 rounded-md bg-white">
                <CourseForm />
            </div>
        </div>
    );
}
