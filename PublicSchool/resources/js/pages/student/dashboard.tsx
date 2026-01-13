import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from '@/lib/toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { AnnouncementSpotlight, type AnnouncementHighlight } from '@/components/dashboard/AnnouncementSpotlight';

interface Course {
    id: number;
    name: string;
    description: string;
    max_students: number;
    enrolled_students_count?: number;
    teacher?: {
        name: string;
    };
    pivot?: {
        enrolled_at: string;
        completed_at?: string;
        pass_status: 'pending' | 'pass' | 'fail';
    };
}

interface Props {
    enrolledCourses: Course[];
    completedCourses: Course[];
    availableCourses: Course[];
    canEnrollMore: boolean;
    isOldStudent?: boolean;
    announcements: AnnouncementHighlight[];
}

export default function StudentDashboard({
    enrolledCourses,
    completedCourses,
    availableCourses,
    canEnrollMore,
    isOldStudent = false,
    announcements,
}: Props) {
    const enrollInCourse = (courseId: number) => {
        router.post(`/student/courses/${courseId}/enroll`, {}, {
            onSuccess: () => toast.success('Successfully enrolled in course'),
            onError: (errors) => {
                const errorMsg = Object.values(errors).flat()[0] as string;
                toast.error(errorMsg || 'Failed to enroll in course');
            },
        });
    };

    const unenrollFromCourse = (courseId: number) => {
        if (confirm('Are you sure you want to unenroll from this course?')) {
            router.delete(`/student/courses/${courseId}/unenroll`, {
                onSuccess: () => toast.success('Successfully unenrolled from course'),
                onError: () => toast.error('Failed to unenroll from course'),
            });
        }
    };

    if (isOldStudent) {
        return (
            <AppLayout>
                <Head title="Student Dashboard" />

                <DashboardLayout title={<span>Completed Courses</span>}>
                    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
                        <div>
                            {completedCourses.length === 0 ? (
                                <Card>
                                    <CardContent className="py-8 text-center text-muted-foreground">
                                        No completed courses yet.
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {completedCourses.map((course) => (
                                        <Card key={course.id}>
                                            <CardHeader>
                                                <CardTitle>{course.name}</CardTitle>
                                                <CardDescription className="line-clamp-2">
                                                    {course.description || 'No description'}
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-4">
                                                    <div className="text-sm">
                                                        <p className="text-muted-foreground">Teacher:</p>
                                                        <p className="font-medium">{course.teacher?.name || 'Not assigned'}</p>
                                                    </div>
                                                    <div className="text-sm">
                                                        <p className="text-muted-foreground">Completed:</p>
                                                        <p className="font-medium">
                                                            {course.pivot!.completed_at
                                                                ? new Date(course.pivot!.completed_at).toLocaleDateString()
                                                                : 'N/A'}
                                                        </p>
                                                    </div>
                                                    <Badge variant={course.pivot!.pass_status === 'pass' ? 'success' : 'destructive'}>
                                                        {course.pivot!.pass_status.toUpperCase()}
                                                    </Badge>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>

                        <AnnouncementSpotlight announcements={announcements} />
                    </div>
                </DashboardLayout>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <Head title="Student Dashboard" />

            <DashboardLayout title={<span>My Courses</span>}>
                <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
                    <div>
                        <Tabs defaultValue="enrolled" className="space-y-6">
                            <TabsList>
                                <TabsTrigger value="enrolled">
                                    Enrolled ({enrolledCourses.length}/4)
                                </TabsTrigger>
                                <TabsTrigger value="completed">
                                    Completed ({completedCourses.length})
                                </TabsTrigger>
                                <TabsTrigger value="available">
                                    Available ({availableCourses.length})
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="enrolled">
                                {enrolledCourses.length === 0 ? (
                                    <Card>
                                        <CardContent className="py-8 text-center text-muted-foreground">
                                            You are not enrolled in any courses. Check the Available tab to enroll.
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                        {enrolledCourses.map((course) => (
                                            <Card key={course.id}>
                                                <CardHeader>
                                                    <CardTitle>{course.name}</CardTitle>
                                                    <CardDescription className="line-clamp-2">
                                                        {course.description || 'No description'}
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="space-y-4">
                                                        <div className="text-sm">
                                                            <p className="text-muted-foreground">Teacher:</p>
                                                            <p className="font-medium">{course.teacher?.name || 'Not assigned'}</p>
                                                        </div>
                                                        <div className="text-sm">
                                                            <p className="text-muted-foreground">Enrolled:</p>
                                                            <p className="font-medium">
                                                                {new Date(course.pivot!.enrolled_at).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                        <Badge variant="secondary">In Progress</Badge>
                                                        <Button
                                                            variant="outline"
                                                            className="w-full"
                                                            onClick={() => unenrollFromCourse(course.id)}
                                                        >
                                                            Unenroll
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="completed">
                                {completedCourses.length === 0 ? (
                                    <Card>
                                        <CardContent className="py-8 text-center text-muted-foreground">
                                            No completed courses yet.
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                        {completedCourses.map((course) => (
                                            <Card key={course.id}>
                                                <CardHeader>
                                                    <CardTitle>{course.name}</CardTitle>
                                                    <CardDescription className="line-clamp-2">
                                                        {course.description || 'No description'}
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="space-y-4">
                                                        <div className="text-sm">
                                                            <p className="text-muted-foreground">Teacher:</p>
                                                            <p className="font-medium">{course.teacher?.name || 'Not assigned'}</p>
                                                        </div>
                                                        <div className="text-sm">
                                                            <p className="text-muted-foreground">Completed:</p>
                                                            <p className="font-medium">
                                                                {course.pivot!.completed_at
                                                                    ? new Date(course.pivot!.completed_at).toLocaleDateString()
                                                            : 'N/A'}
                                                                </p>
                                                        </div>
                                                        <Badge variant={course.pivot!.pass_status === 'pass' ? 'success' : 'destructive'}>
                                                            {course.pivot!.pass_status.toUpperCase()}
                                                        </Badge>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="available">
                                {!canEnrollMore && (
                                    <Card className="mb-6 border-yellow-500">
                                        <CardContent className="py-4">
                                            <p className="text-yellow-600 font-medium">
                                                You have reached the maximum of 4 enrolled courses. Complete or unenroll from a course to enroll in new ones.
                                            </p>
                                        </CardContent>
                                    </Card>
                                )}

                                {availableCourses.length === 0 ? (
                                    <Card>
                                        <CardContent className="py-8 text-center text-muted-foreground">
                                            No courses available for enrollment at this time.
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                        {availableCourses.map((course) => (
                                            <Card key={course.id}>
                                                <CardHeader>
                                                    <CardTitle>{course.name}</CardTitle>
                                                    <CardDescription className="line-clamp-2">
                                                        {course.description || 'No description'}
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="space-y-4">
                                                        <div className="text-sm">
                                                            <p className="text-muted-foreground">Teacher:</p>
                                                            <p className="font-medium">{course.teacher?.name || 'Not assigned'}</p>
                                                        </div>
                                                        <div className="text-sm">
                                                            <p className="text-muted-foreground">Capacity:</p>
                                                            <p className="font-medium">
                                                                {course.enrolled_students_count} / {course.max_students}
                                                            </p>
                                                        </div>
                                                        <Button
                                                            className="w-full"
                                                            onClick={() => enrollInCourse(course.id)}
                                                            disabled={!canEnrollMore}
                                                        >
                                                            Enroll
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
                    </div>

                    <AnnouncementSpotlight announcements={announcements} />
                </div>
            </DashboardLayout>
        </AppLayout>
    );
}

