export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-50">
            <div className="w-full max-w-md p-10 bg-white rounded-xl shadow-lg border border-gray-100">
                {children}
            </div>
        </div>
    );
}
