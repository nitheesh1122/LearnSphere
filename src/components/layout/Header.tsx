"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get("q");
    if (query) {
      router.push(`/search?q=${encodeURIComponent(query.toString())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center px-4">
        {/* Logo */}
        <div className="mr-8 flex items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="text-xl font-bold bg-gradient-to-r from-green-300 to-green-500 bg-clip-text text-transparent">
              SKILLSHARE
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link href="/search" className="hover:text-foreground/80 transition-colors">Explorer</Link>
            <Link href="/search" className="hover:text-foreground/80 transition-colors">Categories</Link>
            <Link href="/#features" className="hover:text-foreground/80 transition-colors">Features</Link>
          </nav>
        </div>

        {/* Search Bar - Desktop */}
        <div className="hidden md:flex flex-1 items-center max-w-md mx-4">
          <form onSubmit={handleSearch} className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              name="q"
              placeholder="What do you want to learn today?"
              className="w-full rounded-full border bg-muted py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </form>
        </div>

        {/* Right Actions */}
        <div className="ml-auto flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white rounded-full px-6">Sign Up</Button>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t p-4 bg-background">
          <nav className="flex flex-col space-y-4">
            <form onSubmit={handleSearch} className="relative w-full mb-4">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                name="q"
                placeholder="Search..."
                className="w-full rounded-md border bg-muted py-2 pl-9 pr-4 text-sm"
              />
            </form>
            <Link href="/search" className="text-sm font-medium py-2">Explorer</Link>
            <Link href="/search" className="text-sm font-medium py-2">Categories</Link>
            <Link href="/#features" className="text-sm font-medium py-2">Features</Link>
            <div className="flex flex-col gap-2 pt-4 border-t">
              <Link href="/login" className="w-full">
                <Button variant="outline" className="w-full justify-center">Sign In</Button>
              </Link>
              <Link href="/register" className="w-full">
                <Button className="w-full justify-center bg-green-600 hover:bg-green-700 text-white">Sign Up</Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
