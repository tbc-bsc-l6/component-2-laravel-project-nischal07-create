import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/lib/toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
    teachers: { id: number; name: string }[];
}

export default function CoursesIndex({ courses, teachers }: Props) {

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

    const assignTeacher = (courseId: number, teacherId: number) => {
        router.post(`/admin/courses/${courseId}/assign-teacher`, { teacher_id: teacherId }, {
            onSuccess: () => toast.success('Teacher assigned successfully'),
            onError: () => toast.error('Failed to assign teacher'),
        });
    };

    return (
        <AppLayout>
            <Head title="Manage Courses" />

            <div className="site-container py-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="classical-title text-2xl">Manage Courses</h1>
                    <Link href="/admin/courses/create">
                        <Button>Create New Course</Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {courses.map((course) => (
                        <Card key={course.id} className="muted-bg hover:shadow-lg transition-all">
                            <CardHeader>
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <div className="font-semibold text-lg">{course.name}</div>
                                        <div className="text-sm text-[var(--classical-muted)]">{new Date(course.created_at).toLocaleDateString()}</div>
                                    </div>
                                    <div>
                                        <Badge variant={course.is_available ? 'success' : 'secondary'}>
                                            {course.is_available ? 'Available' : 'Unavailable'}
                                        </Badge>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent>
                                <p className="mb-3 text-sm text-muted-foreground">{course.description}</p>

                                <div className="flex items-center gap-3">
                                    <div className="min-w-[160px]">
                                        <Select
                                            value={course.teacher ? course.teacher.id.toString() : 'none'}
                                            onValueChange={(value) => assignTeacher(course.id, value === 'none' ? null : parseInt(value))}
                                        >
                                            <SelectTrigger className="h-9 w-full">
                                                <SelectValue placeholder={course.teacher ? course.teacher.name : 'No teacher assigned'} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">No teacher assigned</SelectItem>
                                                {teachers.map((t) => (
                                                    <SelectItem key={t.id} value={t.id.toString()}>
                                                        {t.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {course.teacher && <Badge>{course.teacher.name}</Badge>}
                                </div>

                                <div className="mt-3 text-sm">Enrolled: <span className="font-medium">{course.enrolled_students_count}</span> / {course.max_students}</div>
                            </CardContent>

                            <CardFooter className="justify-end gap-2">
                                <Link href={`/admin/courses/${course.id}/edit`}>
                                    <Button size="sm" variant="outline">Edit</Button>
                                </Link>
                                <Button size="sm" variant="outline" onClick={() => toggleAvailability(course.id)}>
                                    {course.is_available ? 'Disable' : 'Enable'}
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => deleteCourse(course.id)}>
                                    Delete
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}

