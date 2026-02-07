import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, Award, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-indigo-600" />
            <span className="text-xl font-bold">LearnSphere</span>
          </div>
          <div className="flex gap-3">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="container max-w-5xl text-center stagger-children">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium mb-8">
            <Award className="h-4 w-4" />
            <span>Enterprise Learning Management</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
            Transform Learning<br />Into Growth
          </h1>

          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            A modern platform for educators and learners. Create courses, track progress, and celebrate achievements—all in one place.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link href="/register">
              <Button size="lg" className="group">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">
                Login to Continue
              </Button>
            </Link>
          </div>

          {/* Feature Highlights */}
          <div className="grid md:grid-cols-3 gap-8 text-left">
            <div className="p-6 rounded-lg bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="font-semibold mb-2">For Everyone</h3>
              <p className="text-sm text-gray-600">
                Role-based access for learners, instructors, and administrators.
              </p>
            </div>

            <div className="p-6 rounded-lg bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="font-semibold mb-2">Rich Content</h3>
              <p className="text-sm text-gray-600">
                Support for videos, documents, quizzes, and interactive lessons.
              </p>
            </div>

            <div className="p-6 rounded-lg bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                <Award className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Achievements</h3>
              <p className="text-sm text-gray-600">
                Track progress, earn certificates, and celebrate milestones.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white py-8">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
          <p>© 2026 LearnSphere. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
