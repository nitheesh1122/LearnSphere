import { Header } from "@/components/layout/Header";
import { Hero } from "@/components/home/Hero";
import { Categories } from "@/components/home/Categories";
import { FeaturedCourses } from "@/components/home/FeaturedCourses";
import { WhyChoose } from "@/components/home/WhyChoose";
import { Testimonials } from "@/components/home/Testimonials";
import { Footer } from "@/components/layout/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <Categories />
        <FeaturedCourses />
        <WhyChoose />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
}
