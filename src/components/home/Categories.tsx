import { Palette, TrendingUp, Code, Camera, Music, PenTool, Layout, Monitor } from "lucide-react";
import Link from "next/link";

const categories = [
    { name: "Creative", icon: Palette, color: "text-purple-500", bg: "bg-purple-100" },
    { name: "Business", icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-100" },
    { name: "Technology", icon: Code, color: "text-green-500", bg: "bg-green-100" },
    { name: "Lifestyle", icon: Camera, color: "text-yellow-500", bg: "bg-yellow-100" },
    { name: "Music", icon: Music, color: "text-pink-500", bg: "bg-pink-100" },
    { name: "Writing", icon: PenTool, color: "text-orange-500", bg: "bg-orange-100" },
    { name: "Design", icon: Layout, color: "text-indigo-500", bg: "bg-indigo-100" },
    { name: "Marketing", icon: Monitor, color: "text-teal-500", bg: "bg-teal-100" },
];

export function Categories() {
    return (
        <section className="py-16 bg-background">
            <div className="container px-4 md:px-6">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold tracking-tight">Browse Categories</h2>
                    <Link href="#" className="text-sm font-medium text-primary hover:underline">
                        View All Categories
                    </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                    {categories.map((category) => (
                        <Link
                            key={category.name}
                            href="#"
                            className="group flex flex-col items-center justify-center p-4 rounded-lg border bg-card hover:shadow-md transition-all hover:-translate-y-1"
                        >
                            <div className={`p-3 rounded-full mb-3 ${category.bg} group-hover:scale-110 transition-transform`}>
                                <category.icon className={`h-6 w-6 ${category.color}`} />
                            </div>
                            <span className="text-sm font-medium">{category.name}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
