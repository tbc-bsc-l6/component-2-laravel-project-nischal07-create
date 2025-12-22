import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/lib/toast';

interface Course {
    id: number;
    name: string;
    description: string;
    is_available: boolean;
    max_students: number;
    enrolled_students_count: number;
    teacher?: {
        id: number;
        name: string;
    };
    created_at: string;
}

interface Props {
    courses: Course[];
}

export default function CoursesIndex({ courses }: Props) {
    const toggleAvailability = (courseId: number) => {
        router.post(`/admin/courses/${courseId}/toggle-availability`, {}, {
            onSuccess: () => toast.success('Course availability updated'),
            onError: () => toast.error('Failed to update course availability'),
        });
    };

    const deleteCourse = (courseId: number) => {
        if (confirm('Are you sure you want to delete this course?')) {
            router.delete(`/admin/courses/${courseId}`, {
                onSuccess: () => toast.success('Course deleted successfully'),
                onError: () => toast.error('Failed to delete course'),
            });
        }
    };

    return (
        <AppLayout>
            <Head title="Manage Courses" />

            <div className="container mx-auto py-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Manage Courses</h1>
                    <Link href="/admin/courses/create">
                        <Button>Create New Course</Button>
                    </Link>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Teacher</TableHead>
                                <TableHead>Enrolled</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {courses.map((course) => (
                                <TableRow key={course.id}>
                                    <TableCell className="font-medium">{course.name}</TableCell>
                                    <TableCell>
                                        {course.teacher ? course.teacher.name : 'No teacher assigned'}
                                    </TableCell>
                                    <TableCell>
                                        {course.enrolled_students_count} / {course.max_students}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={course.is_available ? 'success' : 'secondary'}>
                                            {course.is_available ? 'Available' : 'Unavailable'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Link href={`/admin/courses/${course.id}/edit`}>
                                                <Button size="sm" variant="outline">Assign</Button>
                                            </Link>
                                            <Button 
                                                size="sm" 
                                                variant="outline"
                                                onClick={() => toggleAvailability(course.id)}
                                            >
                                                {course.is_available ? 'Disable' : 'Enable'}
                                            </Button>
                                            <Button 
                                                size="sm" 
                                                variant="destructive"
                                                onClick={() => deleteCourse(course.id)}
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </AppLayout>
    );
}

