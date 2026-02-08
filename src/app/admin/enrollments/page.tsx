import { getAllEnrollments } from '@/lib/actions/admin';
import EnrollmentList from '@/components/admin/enrollment-list';

export default async function AdminEnrollmentsPage() {
    const enrollments = await getAllEnrollments();

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">All Enrollments</h1>
            <EnrollmentList enrollments={enrollments} />
        </div>
    );
}
