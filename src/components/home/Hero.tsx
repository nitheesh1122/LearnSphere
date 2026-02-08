import { Button } from "@/components/ui/button";
import Link from "next/link";

export function Hero() {
    return (
        <section className="relative overflow-hidden bg-muted/30 py-16 md:py-24 lg:py-32">
            <div className="container px-4 md:px-6">
                <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
                    <div className="flex flex-col justify-center space-y-8">
                        <div className="space-y-4">
                            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none max-w-3xl">
                                Explore your creativity with thousands of hands-on classes.
                            </h1>
                            <p className="max-w-[600px] text-muted-foreground md:text-xl lg:text-lg xl:text-xl">
                                Get unlimited access to thousands of inspiring classes. Start your journey today and learn from the best.
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link href="/register">
                                <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white rounded-md px-8 text-lg h-12">
                                    Get Started for Free
                                </Button>
                            </Link>
                            <Link href="/catalog">
                                <Button variant="outline" size="lg" className="rounded-md px-8 text-lg h-12">
                                    View Plans
                                </Button>
                            </Link>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex -space-x-2">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="h-8 w-8 rounded-full border-2 border-background bg-gray-300" />
                                ))}
                            </div>
                            <p>Join 10M+ creative members</p>
                        </div>
                    </div>
                    <div className="mx-auto w-full max-w-[500px] lg:max-w-none">
                        <div className="aspect-square overflow-hidden rounded-xl bg-gray-100 object-cover object-center sm:aspect-video lg:aspect-square relative">
                            <div className="absolute inset-0 bg-gradient-to-tr from-green-100 to-blue-50 opacity-50"></div>
                            <img 
                                src="https://images.unsplash.com/photo-1522202176988-6732805c08d5?auto=format&fit=crop&w=800&q=80"
                                alt="Students learning online"
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
