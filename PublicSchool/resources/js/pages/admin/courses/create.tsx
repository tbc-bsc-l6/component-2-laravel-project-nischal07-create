import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';

interface Teacher {
    id: number;
    name: string;
}

interface Props {
    teachers: Teacher[];
}

export default function CreateCourse({ teachers }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        is_available: true,
        max_students: 10,
        teacher_id: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/courses');
    };

    return (
        <AppLayout>
            <Head title="Create Course" />

            <div className="site-container py-8">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="classical-title text-2xl">Create New Course</h1>
                    <Link href="/admin/courses">
                        <Button variant="outline">Back to Courses</Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between w-full">
                            <div>
                                <div className="text-lg font-semibold">New Course details</div>
                                <div className="text-sm text-[var(--classical-muted)]">Fill required fields to create a course</div>
                            </div>
                        </div>
                    </CardHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <CardContent>
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
                        <Label htmlFor="max_students">Maximum Students *</Label>
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
                        <Label htmlFor="teacher_id">Assign Teacher</Label>
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

                        </CardContent>

                        <CardFooter className="justify-end gap-4">
                            <Link href="/admin/courses">
                                <Button type="button" variant="outline">Cancel</Button>
                            </Link>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Creating...' : 'Create Course'}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </AppLayout>
    );
}

