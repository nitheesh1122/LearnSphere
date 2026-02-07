'use client';

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Users, BookOpen, Clock, DollarSign } from 'lucide-react';
import Link from 'next/link';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface Course {
    id: string;
    title: string;
    description: string | null;
    tags: string[];
    level: string;
    price: number | null;
    accessType: string;
    instructor: {
        name: string | null;
        email: string;
    };
    _count: {
        enrollments: number;
        contents: number;
    };
}

interface CourseCatalogProps {
    courses: Course[];
    isAuthenticated: boolean;
}

export default function CourseCatalog({ courses, isAuthenticated }: CourseCatalogProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [levelFilter, setLevelFilter] = useState<string>('all');
    const [priceFilter, setPriceFilter] = useState<string>('all');

    // Extract unique tags
    const allTags = useMemo(() => {
        const tags = new Set<string>();
        courses.forEach(course => course.tags.forEach(tag => tags.add(tag)));
        return Array.from(tags);
    }, [courses]);

    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    const toggleTag = (tag: string) => {
        setSelectedTags(prev =>
            prev.includes(tag)
                ? prev.filter(t => t !== tag)
                : [...prev, tag]
        );
    };

    const filteredCourses = useMemo(() => {
        return courses.filter(course => {
            // Search filter
            const matchesSearch = searchQuery.trim() === '' ||
                course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (course.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

            // Level filter
            const matchesLevel = levelFilter === 'all' || course.level === levelFilter;

            // Price filter
            const matchesPrice =
                priceFilter === 'all' ||
                (priceFilter === 'free' && course.accessType === 'OPEN') ||
                (priceFilter === 'paid' && course.accessType === 'PAID');

            // Tag filter
            const matchesTags = selectedTags.length === 0 ||
                selectedTags.some(tag => course.tags.includes(tag));

            return matchesSearch && matchesLevel && matchesPrice && matchesTags;
        });
    }, [courses, searchQuery, levelFilter, priceFilter, selectedTags]);

    return (
        <div className="space-y-6">
            {/* Search and Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Search & Filters</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search courses..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>

                    {/* Filters Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Level</label>
                            <Select value={levelFilter} onValueChange={setLevelFilter}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Levels</SelectItem>
                                    <SelectItem value="BEGINNER">Beginner</SelectItem>
                                    <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                                    <SelectItem value="ADVANCED">Advanced</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Price</label>
                            <Select value={priceFilter} onValueChange={setPriceFilter}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Prices</SelectItem>
                                    <SelectItem value="free">Free</SelectItem>
                                    <SelectItem value="paid">Paid</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Tags */}
                    {allTags.length > 0 && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Tags</label>
                            <div className="flex flex-wrap gap-2">
                                {allTags.map(tag => (
                                    <Badge
                                        key={tag}
                                        variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                                        className="cursor-pointer"
                                        onClick={() => toggleTag(tag)}
                                    >
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Results */}
            <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                    {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} found
                </p>
            </div>

            {/* Course Grid */}
            {filteredCourses.length === 0 ? (
                <Card>
                    <CardContent className="p-12 text-center text-muted-foreground">
                        No courses match your filters. Try adjusting your search criteria.
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCourses.map(course => (
                        <Card key={course.id} className="flex flex-col hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex justify-between items-start mb-2">
                                    <Badge variant="outline">{course.level}</Badge>
                                    {course.accessType === 'PAID' && course.price && (
                                        <Badge variant="secondary" className="flex items-center gap-1">
                                            <DollarSign className="h-3 w-3" />
                                            {course.price}
                                        </Badge>
                                    )}
                                    {course.accessType === 'OPEN' && (
                                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                                            Free
                                        </Badge>
                                    )}
                                </div>
                                <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                                <CardDescription className="line-clamp-2">
                                    {course.description || 'No description available'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 flex flex-col justify-between">
                                <div className="space-y-3 mb-4">
                                    <div className="text-sm text-muted-foreground">
                                        By {course.instructor.name || 'Unknown Instructor'}
                                    </div>

                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <Users className="h-4 w-4" />
                                            {course._count.enrollments}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <BookOpen className="h-4 w-4" />
                                            {course._count.contents} lessons
                                        </div>
                                    </div>

                                    {course.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1">
                                            {course.tags.slice(0, 3).map(tag => (
                                                <Badge key={tag} variant="outline" className="text-xs">
                                                    {tag}
                                                </Badge>
                                            ))}
                                            {course.tags.length > 3 && (
                                                <Badge variant="outline" className="text-xs">
                                                    +{course.tags.length - 3} more
                                                </Badge>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <Link href={`/learner/course/${course.id}`}>
                                    <Button className="w-full">
                                        View Details
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
