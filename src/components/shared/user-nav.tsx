import { signOut } from '@/auth';
import { Button } from '@/components/ui/button';

export default function UserNav() {
    return (
        <div className="flex items-center gap-4">
            <form
                action={async () => {
                    'use server';
                    await signOut();
                }}
            >
                <Button variant="outline" size="sm">
                    Sign Out
                </Button>
            </form>
        </div>
    );
}
