import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, BookOpen, UserCog, UserSquare2 } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { AnnouncementSpotlight, type AnnouncementHighlight } from '@/components/dashboard/AnnouncementSpotlight';

interface Stats {
    total_users: number;
    total_admins: number;
    total_teachers: number;
    total_students: number;
    total_courses: number;
    available_courses: number;
}

interface UserRole {
    id: number;
    name: string;
    display_name: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    created_at: string;
}

interface CourseTeacher {
    id: number;
    name: string;
}

interface Course {
    id: number;
    name: string;
    is_available: boolean;
    students_count: number;
    max_students: number;
    teacher?: CourseTeacher | null;
    created_at: string;
}

interface Props {
    stats: Stats;
    recentUsers: User[];
    recentCourses: Course[];
    announcements: AnnouncementHighlight[];
}

export default function AdminDashboard({ stats, recentUsers, recentCourses, announcements }: Props) {
    return (
        <AppLayout>
            <Head title="Admin Dashboard" />

            <DashboardLayout
                title={
                    <>
                        <div className="flex items-center gap-2">
                            <Users className="h-7 w-7 text-primary" />
                            <span>Admin Dashboard</span>
                        </div>
                    </>
                }
                subtitle="Overview of users and courses in the system."
                actions={
                    <>
                        <Link href="/admin/users">
                            <Button size="sm" variant="outline" className="gap-2">
                                <UserCog className="h-4 w-4" />
                                Manage Users
                            </Button>
                        </Link>
                        <Link href="/admin/courses">
                            <Button size="sm" className="gap-2">
                                <BookOpen className="h-4 w-4" />
                                Manage Courses
                            </Button>
                        </Link>
                    </>
                }
            >
                {/* Top stats */}
                <div className="card-grid">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total Users
                            </CardTitle>
                            <CardDescription>All registered accounts</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-semibold">{stats.total_users}</p>
                            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                                <span>Admins: {stats.total_admins}</span>
                                <span className="h-1 w-1 rounded-full bg-muted-foreground" />
                                <span>Teachers: {stats.total_teachers}</span>
                                <span className="h-1 w-1 rounded-full bg-muted-foreground" />
                                <span>Students: {stats.total_students}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total Courses
                            </CardTitle>
                            <CardDescription>Teaching modules in the system</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-semibold">{stats.total_courses}</p>
                            <p className="mt-2 text-xs text-muted-foreground">
                                {stats.available_courses} currently open for enrollment
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Quick Actions
                            </CardTitle>
                            <CardDescription>Common admin tasks</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-2">
                            <Link href="/admin/users/create-teacher">
                                <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                                    <UserSquare2 className="h-4 w-4" />
                                    Create Teacher Account
                                </Button>
                            </Link>
                            <Link href="/admin/courses/create">
                                <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                                    <BookOpen className="h-4 w-4" />
                                    Create New Course
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Recent Users */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base font-semibold">Recent Users</CardTitle>
                            <CardDescription>Latest accounts created in the system.</CardDescription>
                        </CardHeader>
                        <CardContent className="px-0 pb-0">
                            {recentUsers.length === 0 ? (
                                <p className="px-6 pb-6 text-sm text-muted-foreground">No users found.</p>
                            ) : (
                                <div className="border-t">
                                    <div className="table-responsive">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-muted/40">
                                                    <TableHead className="w-[180px]">Name</TableHead>
                                                    <TableHead>Email</TableHead>
                                                    <TableHead className="w-[120px]">Role</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {recentUsers.map((user) => (
                                                    <TableRow key={user.id}>
                                                        <TableCell className="font-medium">{user.name}</TableCell>
                                                        <TableCell className="text-muted-foreground">{user.email}</TableCell>
                                                        <TableCell>
                                                            <Badge
                                                                variant={
                                                                    user.role.name === 'admin'
                                                                        ? 'outline'
                                                                        : user.role.name === 'teacher'
                                                                            ? 'success'
                                                                            : 'secondary'
                                                                }
                                                            >
                                                                {user.role.display_name}
                                                            </Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Courses */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base font-semibold">Recent Courses</CardTitle>
                            <CardDescription>Latest courses added by admins.</CardDescription>
                        </CardHeader>
                        <CardContent className="px-0 pb-0">
                            {recentCourses.length === 0 ? (
                                <p className="px-6 pb-6 text-sm text-muted-foreground">No courses found.</p>
                            ) : (
                                <div className="border-t">
                                    <div className="table-responsive">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-muted/40">
                                                    <TableHead className="w-[180px]">Course</TableHead>
                                                    <TableHead>Teacher</TableHead>
                                                    <TableHead className="w-[120px] text-right">Students</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {recentCourses.map((course) => (
                                                    <TableRow key={course.id}>
                                                        <TableCell className="font-medium">{course.name}</TableCell>
                                                        <TableCell className="text-muted-foreground">
                                                            {course.teacher?.name || 'Not assigned'}
                                                        </TableCell>
                                                        <TableCell className="text-right text-muted-foreground">
                                                            {course.students_count} / {course.max_students}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <AnnouncementSpotlight announcements={announcements} />
                </div>
                </DashboardLayout>
        </AppLayout>
    );
}
