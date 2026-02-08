import { Quote } from "lucide-react";

const testimonials = [
    {
        name: "Sarah Jenkins",
        role: "Freelance Designer",
        content: "This platform has completely transformed the way I learn. The courses are high-quality and the community is incredibly supportive.",
        avatar: "S",
    },
    {
        name: "Michael Chen",
        role: "Software Developer",
        content: "I've taken several courses here and they've all been excellent. The instructors really know their stuff and explain concepts clearly.",
        avatar: "M",
    },
    {
        name: "Jessica Williams",
        role: "Marketing Specialist",
        content: "The variety of topics available is amazing. I can learn anything from photography to business strategy all in one place.",
        avatar: "J",
    },
];

export function Testimonials() {
    return (
        <section className="py-24 bg-muted/50">
            <div className="container px-4 md:px-6">
                <h2 className="text-3xl font-bold tracking-tight text-center mb-16">
                    Loved by learners everywhere
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <div key={index} className="bg-background p-8 rounded-2xl shadow-sm border relative">
                            <Quote className="absolute top-8 left-8 h-8 w-8 text-primary/20" />
                            <p className="mb-6 text-muted-foreground relative z-10 pt-4">
                                "{testimonial.content}"
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500">
                                    {testimonial.avatar}
                                </div>
                                <div>
                                    <div className="font-semibold">{testimonial.name}</div>
                                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
