import { getAllInvitations } from '@/lib/actions/admin';
import InvitationList from '@/components/admin/invitation-list';

export default async function AdminInvitationsPage() {
    const invitations = await getAllInvitations();

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Invitations</h1>
            <InvitationList invitations={invitations} />
        </div>
    );
}
