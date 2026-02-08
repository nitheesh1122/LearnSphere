import Link from "next/link";
import { Facebook, Twitter, Instagram, Linkedin, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button"; // Assuming input is not in ui folder yet, using button for subs

export function Footer() {
    return (
        <footer className="bg-muted text-muted-foreground border-t">
            <div className="container px-4 py-16 md:px-6">
                <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
                    <div className="col-span-2 lg:col-span-2 mr-4">
                        <Link href="/" className="mb-4 inline-block">
                            <span className="text-xl font-bold bg-gradient-to-r from-green-300 to-green-500 bg-clip-text text-transparent">
                                SKILLSHARE
                            </span>
                        </Link>
                        <p className="mb-4 text-sm max-w-sm">
                            Skillshare is the world's largest online learning community for creatives.
                        </p>
                        <div className="flex space-x-4">
                            <Link href="#" className="hover:text-foreground"><Facebook className="h-5 w-5" /></Link>
                            <Link href="#" className="hover:text-foreground"><Twitter className="h-5 w-5" /></Link>
                            <Link href="#" className="hover:text-foreground"><Instagram className="h-5 w-5" /></Link>
                            <Link href="#" className="hover:text-foreground"><Linkedin className="h-5 w-5" /></Link>
                        </div>
                    </div>

                    <div>
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">Company</h3>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="#" className="hover:underline">About Us</Link></li>
                            <li><Link href="#" className="hover:underline">Careers</Link></li>
                            <li><Link href="#" className="hover:underline">Press</Link></li>
                            <li><Link href="#" className="hover:underline">Blog</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">Community</h3>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="#" className="hover:underline">Team Plans</Link></li>
                            <li><Link href="#" className="hover:underline">Gift Membership</Link></li>
                            <li><Link href="#" className="hover:underline">Scholarships</Link></li>
                            <li><Link href="#" className="hover:underline">Teacher Help</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">Teaching</h3>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="#" className="hover:underline">Become a Teacher</Link></li>
                            <li><Link href="#" className="hover:underline">Teacher Handbook</Link></li>
                            <li><Link href="#" className="hover:underline">Teacher Academy</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row text-xs">
                    <p>© 2024 LearnSphere (Skillshare Clone). All rights reserved.</p>
                    <div className="flex gap-4">
                        <Link href="#" className="hover:underline">Privacy Policy</Link>
                        <Link href="#" className="hover:underline">Terms of Service</Link>
                        <Link href="#" className="hover:underline">Cookie Settings</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
