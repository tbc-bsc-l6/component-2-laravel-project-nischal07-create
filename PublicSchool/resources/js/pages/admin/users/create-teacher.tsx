import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export default function CreateTeacher() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });
    const page = usePage();
    const flash = (page.props as any).flash || {};

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/users/create-teacher', {
            onSuccess: (page) => {
                // Inertia will redirect to users index on success; no further action needed.
                // But log to console for debugging in case UI seems unresponsive.
                // eslint-disable-next-line no-console
                console.log('Teacher created, navigation:', page);
            },
            onError: (errs) => {
                // eslint-disable-next-line no-console
                console.error('Create teacher errors:', errs);
            },
            onFinish: () => {
                // eslint-disable-next-line no-console
                console.log('Request finished');
            },
        });
    };

    return (
        <AppLayout>
            <Head title="Create Teacher" />

            <div className="container mx-auto py-8 max-w-2xl">
                {flash.success && (
                    <div className="mb-4">
                        <Alert>
                            <AlertTitle>Success</AlertTitle>
                            <AlertDescription>{flash.success}</AlertDescription>
                        </Alert>
                    </div>
                )}

                {Object.keys(errors).length > 0 && (
                    <div className="mb-4">
                        <Alert variant="destructive">
                            <AlertTitle>There were problems with your submission</AlertTitle>
                            <AlertDescription>
                                Please check the highlighted fields and try again.
                            </AlertDescription>
                        </Alert>
                    </div>
                )}

                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Create New Teacher</h1>
                    <Link href="/admin/users">
                        <Button variant="outline">Back to Users</Button>
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
                    <div>
                        <Label htmlFor="name">Name *</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            aria-invalid={!!errors.name}
                        />
                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    </div>

                    <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            aria-invalid={!!errors.email}
                        />
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>

                    <div>
                        <Label htmlFor="password">Password *</Label>
                        <Input
                            id="password"
                            type="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            aria-invalid={!!errors.password}
                        />
                        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                    </div>

                    <div>
                        <Label htmlFor="password_confirmation">Confirm Password *</Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                        />
                        {errors.password_confirmation && (
                            <p className="text-red-500 text-sm mt-1">{errors.password_confirmation}</p>
                        )}
                    </div>

                    <div className="flex justify-end gap-4">
                        <Link href="/admin/users">
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </Link>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Creating...' : 'Create Teacher'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
