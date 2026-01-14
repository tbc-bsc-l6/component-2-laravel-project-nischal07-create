import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { AnnouncementSpotlight, type AnnouncementHighlight } from '@/components/dashboard/AnnouncementSpotlight';
import { AlertTriangle } from 'lucide-react';

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
    announcements: AnnouncementHighlight[];
}

export default function TeacherDashboard({ courses, announcements }: Props) {
    const pendingCourses = courses
        .map((course) => ({
            ...course,
            pending: Math.max(0, course.enrolled_students_count - course.completed_students_count),
        }))
        .filter((course) => course.pending > 0);

    return (
        <AppLayout>
            <Head title="Teacher Dashboard" />

            <DashboardLayout title={<span>My Courses</span>}>
                <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
                    <div>
                        {courses.length === 0 ? (
                            <Card>
                                <CardContent className="py-8 text-center text-muted-foreground">
                                    No courses assigned yet. Contact your administrator.
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
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
                    </div>

                    <div className="space-y-6">
                        <AnnouncementSpotlight announcements={announcements} />

                        <Card>
                            <CardHeader className="flex flex-row items-center gap-3">
                                <AlertTriangle className="h-5 w-5 text-amber-500" />
                                <div>
                                    <CardTitle className="text-base">Pending grading queue</CardTitle>
                                    <CardDescription>Students waiting for pass/fail decisions.</CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {pendingCourses.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No pending grades right now.</p>
                                ) : (
                                    pendingCourses.map((course) => (
                                        <div key={course.id} className="rounded-lg border p-3">
                                            <div className="flex items-center justify-between">
                                                <p className="font-medium">{course.name}</p>
                                                <Badge variant="destructive">{course.pending} Pending</Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground">{course.enrolled_students_count} enrolled • {course.max_students} max</p>
                                            <Link href={`/teacher/courses/${course.id}`}>
                                                <Button size="sm" variant="outline" className="mt-2 w-full">Review students</Button>
                                            </Link>
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </DashboardLayout>
        </AppLayout>
    );
}

