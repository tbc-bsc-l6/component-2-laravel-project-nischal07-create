import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

interface Course {
    id: number;
    name: string;
    description: string;
    enrolled_students_count: number;
    completed_students_count: number;
    max_students: number;
}

interface Props {
    courses: Course[];
}

export default function TeacherDashboard({ courses }: Props) {
    return (
        <AppLayout>
            <Head title="Teacher Dashboard" />

            <DashboardLayout title={<span>My Courses</span>}>
                {courses.length === 0 ? (
                    <Card>
                        <CardContent className="py-8 text-center text-muted-foreground">
                            No courses assigned yet. Contact your administrator.
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {courses.map((course) => (
                            <Card key={course.id}>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="mr-2">{course.name}</CardTitle>
                                        {(() => {
                                            const pending = Math.max(0, course.enrolled_students_count - course.completed_students_count);
                                            return pending > 0 ? (
                                                <Badge variant="destructive">{pending} Pending</Badge>
                                            ) : null;
                                        })()}
                                    </div>
                                    <CardDescription className="line-clamp-2">
                                        {course.description || 'No description'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Enrolled Students:</span>
                                            <Badge variant="secondary">
                                                {course.enrolled_students_count} / {course.max_students}
                                            </Badge>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Completed:</span>
                                            <Badge variant="outline">
                                                {course.completed_students_count}
                                            </Badge>
                                        </div>
                                        <Link href={`/teacher/courses/${course.id}`}>
                                            <Button className="w-full">View Students</Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </DashboardLayout>
        </AppLayout>
    );
}

