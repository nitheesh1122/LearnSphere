import { getCourseAnalytics } from '@/lib/actions/admin';
import AnalyticsTable from '@/components/admin/analytics-table';

export default async function AdminAnalyticsPage() {
    const data = await getCourseAnalytics();

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Course Analytics</h1>
            <p className="text-muted-foreground">
                Overview of course performance and student retention.
            </p>
            <AnalyticsTable data={data} />
        </div>
    );
}
