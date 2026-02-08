import { Zap, Shield, Users, Trophy } from "lucide-react";

const features = [
    {
        title: "Learn from the best",
        description: "Our instructors are industry experts and professional creators who are excited to share their wisdom.",
        icon: Trophy,
    },
    {
        title: "Get feedback on your work",
        description: "Receive personalized feedback from instructors and peers to help you improve your skills.",
        icon: Users,
    },
    {
        title: "Learn at your own pace",
        description: "Watch bite-sized lessons on your schedule, from your computer or mobile device.",
        icon: Zap,
    },
    {
        title: "Satisfaction Guaranteed",
        description: "We are committed to your satisfaction with our high-quality content and community.",
        icon: Shield,
    },
];

export function WhyChoose() {
    return (
        <section className="py-24 bg-background">
            <div className="container px-4 md:px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                        Why Learn With Us?
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                        Discover a learning experience designed to help you achieve your goals.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <div key={index} className="flex flex-col items-center text-center p-6 rounded-xl border bg-card/50 hover:bg-card transition-colors">
                            <div className="p-4 rounded-full bg-primary/10 text-primary mb-6">
                                <feature.icon className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                            <p className="text-muted-foreground">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
