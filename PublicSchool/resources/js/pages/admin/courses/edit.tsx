import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/lib/toast';

interface Teacher {
    id: number;
    name: string;
}

interface Student {
    id: number;
    name: string;
    email: string;
    pivot: {
        enrolled_at: string;
        completed_at?: string;
        pass_status: 'pending' | 'pass' | 'fail';
    };
}

interface Course {
    id: number;
    name: string;
    description: string;
    is_available: boolean;
    max_students: number;
    teacher_id: number | null;
    teacher?: Teacher | null;
    students: Student[];
}

interface Props {
    course: Course;
    teachers: Teacher[];
}

export default function EditCourse({ course, teachers }: Props) {
    const { data, setData, put, processing, errors, transform } = useForm({
        name: course.name ?? '',
        description: course.description ?? '',
        is_available: course.is_available ?? true,
        max_students: course.max_students ?? 10,
        teacher_id: course.teacher_id ? course.teacher_id.toString() : '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        transform((current) => ({
            ...current,
            teacher_id: current.teacher_id ? parseInt(current.teacher_id, 10) : null,
        }));

        put(`/admin/courses/${course.id}`, {
            preserveScroll: true,
            onSuccess: () => toast.success('Course updated successfully'),
            onError: () => toast.error('Failed to update course'),
        });
    };

    const removeStudent = (studentId: number) => {
        if (confirm('Remove this student from the course? (Completed history is preserved)')) {
            router.delete(`/admin/courses/${course.id}/students/${studentId}`, {
                preserveScroll: true,
                onSuccess: () => toast.success('Student removed from course'),
                onError: (errs) => {
                    const errorMsg = Object.values(errs).flat()[0] as string;
                    toast.error(errorMsg || 'Failed to remove student');
                },
            });
        }
    };

    const enrolledStudents = course.students.filter((s) => s.pivot.pass_status === 'pending');
    const completedStudents = course.students.filter((s) => s.pivot.pass_status !== 'pending');

    return (
        <AppLayout>
            <Head title={`Edit ${course.name}`} />

            <div className="container mx-auto py-8 space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">Edit Course</h1>
                        <p className="text-muted-foreground mt-1">Manage details, teacher assignment, and enrollments</p>
                    </div>
                    <Link href="/admin/courses">
                        <Button variant="outline">Back to Courses</Button>
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
                    <div>
                        <Label htmlFor="name">Course Name *</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            aria-invalid={!!errors.name}
                        />
                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    </div>

                    <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            rows={4}
                        />
                        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                    </div>

                    <div>
                        <Label htmlFor="max_students">Maximum Students (max 10) *</Label>
                        <Input
                            id="max_students"
                            type="number"
                            min="1"
                            max="10"
                            value={data.max_students}
                            onChange={(e) => setData('max_students', parseInt(e.target.value))}
                        />
                        {errors.max_students && <p className="text-red-500 text-sm mt-1">{errors.max_students}</p>}
                    </div>

                    <div>
                        <Label htmlFor="teacher_id">Assigned Teacher</Label>
                        <Select
                            value={data.teacher_id || 'none'}
                            onValueChange={(value) => setData('teacher_id', value === 'none' ? '' : value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a teacher" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">No teacher</SelectItem>
                                {teachers.map((teacher) => (
                                    <SelectItem key={teacher.id} value={teacher.id.toString()}>
                                        {teacher.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.teacher_id && <p className="text-red-500 text-sm mt-1">{errors.teacher_id}</p>}
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="is_available"
                            checked={data.is_available}
                            onCheckedChange={(checked) => setData('is_available', checked as boolean)}
                        />
                        <Label htmlFor="is_available">Course is available for enrollment</Label>
                    </div>

                    <div className="flex justify-end gap-4">
                        <Link href="/admin/courses">
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </Link>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>

                <Card>
                    <CardHeader>
                        <CardTitle>Currently Enrolled Students</CardTitle>
                        <CardDescription>
                            {enrolledStudents.length} / {course.max_students} enrolled
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {enrolledStudents.length === 0 ? (
                            <p className="text-center text-muted-foreground py-6">No students currently enrolled.</p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Enrolled</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {enrolledStudents.map((student) => (
                                        <TableRow key={student.id}>
                                            <TableCell className="font-medium">{student.name}</TableCell>
                                            <TableCell>{student.email}</TableCell>
                                            <TableCell>{new Date(student.pivot.enrolled_at).toLocaleDateString()}</TableCell>
                                            <TableCell>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => removeStudent(student.id)}
                                                >
                                                    Remove
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Completed Students</CardTitle>
                        <CardDescription>
                            Completion history is preserved even if the course is archived.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {completedStudents.length === 0 ? (
                            <p className="text-center text-muted-foreground py-6">No completed students yet.</p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Completed</TableHead>
                                        <TableHead>Result</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {completedStudents.map((student) => (
                                        <TableRow key={student.id}>
                                            <TableCell className="font-medium">{student.name}</TableCell>
                                            <TableCell>{student.email}</TableCell>
                                            <TableCell>
                                                {student.pivot.completed_at
                                                    ? new Date(student.pivot.completed_at).toLocaleDateString()
                                                    : 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={student.pivot.pass_status === 'pass' ? 'success' : 'destructive'}
                                                >
                                                    {student.pivot.pass_status.toUpperCase()}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
