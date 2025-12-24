import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/lib/toast';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';

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
    max_students: number;
    students: Student[];
}

interface Props {
    course: Course;
}

export default function CourseDetails({ course }: Props) {
    // maintain local students state for optimistic updates
    const [students, setStudents] = useState<Student[]>(course.students || []);
    const [processingIds, setProcessingIds] = useState<number[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
    const [selectedStudentName, setSelectedStudentName] = useState<string | null>(null);
    const [selectedPassStatus, setSelectedPassStatus] = useState<'pending' | 'pass' | 'fail'>('pass');

    const gradeStudent = (studentId: number, passStatus: 'pending' | 'pass' | 'fail') => {
        // mark as processing
        setProcessingIds((p) => [...p, studentId]);

        router.post(`/teacher/courses/${course.id}/students/${studentId}/grade`, {
            pass_status: passStatus,
        }, {
            onSuccess: () => {
                toast.success(`Student graded as ${passStatus.toUpperCase()}`);
                // optimistic update: update student pivot locally
                setStudents((prev) =>
                    prev.map((s) =>
                        s.id === studentId
                            ? {
                                  ...s,
                                  pivot: {
                                      ...s.pivot,
                                      pass_status: passStatus,
                                      completed_at: passStatus === 'pending' ? undefined : new Date().toISOString(),
                                  },
                              }
                            : s,
                    ),
                );

                // close dialog after success
                setDialogOpen(false);
                setSelectedStudentId(null);
                setSelectedStudentName(null);
            },
            onError: (err) => {
                // show server returned message if available
                try {
                    const message = err?.response?.data?.message;
                    if (message) {
                        toast.error(message);
                        return;
                    }
                } catch (e) {
                    // ignore
                }

                toast.error('Failed to grade student');
            },
            onFinish: () => {
                // remove from processing
                setProcessingIds((p) => p.filter((id) => id !== studentId));
            },
        });
    };

    const openConfirm = (student: Student, passStatus: 'pending' | 'pass' | 'fail') => {
        setSelectedStudentId(student.id);
        setSelectedStudentName(student.name);
        setSelectedPassStatus(passStatus);
        setDialogOpen(true);
    };

    const enrolledStudents = students.filter((s) => s.pivot.pass_status === 'pending');
    const completedStudents = students.filter((s) => s.pivot.pass_status !== 'pending');

    return (
        <AppLayout>
            <Head title={course.name} />

            <div className="container mx-auto py-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold">{course.name}</h1>
                        <p className="text-muted-foreground mt-2">{course.description}</p>
                    </div>
                    <Link href="/teacher/dashboard">
                        <Button variant="outline">Back to Dashboard</Button>
                    </Link>
                </div>

                <div className="grid gap-6">
                    {/* Enrolled Students */}
                    <Card>
                        {/* modal state for grading confirmation */}
                        <CardHeader>
                            <CardTitle>Currently Enrolled Students</CardTitle>
                            <CardDescription>
                                {enrolledStudents.length} / {course.max_students} students enrolled
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {enrolledStudents.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">
                                    No students currently enrolled
                                </p>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Enrolled Date</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {enrolledStudents.map((student) => (
                                            <TableRow key={student.id}>
                                                <TableCell className="font-medium">{student.name}</TableCell>
                                                <TableCell>{student.email}</TableCell>
                                                <TableCell>
                                                    {new Date(student.pivot.enrolled_at).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="default"
                                                            onClick={() => openConfirm(student, 'pass')}
                                                            disabled={processingIds.includes(student.id)}
                                                        >
                                                            {processingIds.includes(student.id) ? 'Processing...' : 'Pass'}
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() => openConfirm(student, 'fail')}
                                                            disabled={processingIds.includes(student.id)}
                                                        >
                                                            {processingIds.includes(student.id) ? 'Processing...' : 'Fail'}
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>

                    {/* Confirmation Dialog */}
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Confirm Grading</DialogTitle>
                                <DialogDescription>
                                    {selectedStudentName
                                        ? `Set ${selectedStudentName}'s status:`
                                        : 'Choose grading status'}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="p-4">
                                <label className="block mb-2 text-sm">Status</label>
                                <select
                                    value={selectedPassStatus}
                                    onChange={(e) => setSelectedPassStatus(e.target.value as any)}
                                    className="w-full rounded-md border px-3 py-2"
                                >
                                    <option value="pending">Pending (reset)</option>
                                    <option value="pass">Pass</option>
                                    <option value="fail">Fail</option>
                                </select>
                            </div>
                            <DialogFooter className="flex gap-2 justify-end">
                                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button
                                    onClick={() => {
                                        if (!selectedStudentId) return;
                                        gradeStudent(selectedStudentId, selectedPassStatus);
                                    }}
                                >
                                    Confirm
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Completed Students */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Completed Students</CardTitle>
                            <CardDescription>
                                Students who have completed this course
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {completedStudents.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">
                                    No completed students yet
                                </p>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Completed Date</TableHead>
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
                                                    <div className="flex flex-col">
                                                        <div>
                                                            <Badge
                                                                variant={student.pivot.pass_status === 'pass' ? 'success' : 'destructive'}
                                                            >
                                                                {student.pivot.pass_status.toUpperCase()}
                                                            </Badge>
                                                        </div>
                                                        <div className="mt-2 flex gap-2">
                                                            <Button
                                                                size="sm"
                                                                variant="default"
                                                                onClick={() => gradeStudent(student.id, 'pass')}
                                                                disabled={processingIds.includes(student.id)}
                                                            >
                                                                Pass
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="destructive"
                                                                onClick={() => gradeStudent(student.id, 'fail')}
                                                                disabled={processingIds.includes(student.id)}
                                                            >
                                                                Fail
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => openConfirm(student, student.pivot.pass_status)}
                                                                disabled={processingIds.includes(student.id)}
                                                            >
                                                                Edit
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => openConfirm(student, 'pending')}
                                                                disabled={processingIds.includes(student.id)}
                                                            >
                                                                Reset
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}

