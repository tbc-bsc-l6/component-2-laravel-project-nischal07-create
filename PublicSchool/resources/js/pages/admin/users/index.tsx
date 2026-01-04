import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/lib/toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { useMemo, useState } from 'react';
import { Users as UsersIcon } from 'lucide-react';

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
}

interface Props {
    users: User[];
    roles: UserRole[];
}

export default function UsersIndex({ users, roles }: Props) {
    const page = usePage();
    const flash = (page.props as any).flash || {};

    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState<'all' | string>('all');

    const changeRole = (userId: number, roleId: number) => {
        router.post(
            `/admin/users/${userId}/change-role`,
            {
                user_role_id: roleId,
            },
            {
                onSuccess: () => toast.success('User role updated successfully'),
                onError: (errors) => {
                    const errorMsg = Object.values(errors).flat()[0] as string;
                    toast.error(errorMsg || 'Failed to update user role');
                },
            },
        );
    };

    const deleteUser = (userId: number) => {
        if (confirm('Are you sure you want to delete this user?')) {
            router.delete(`/admin/users/${userId}`, {
                onSuccess: () => toast.success('User deleted successfully'),
                onError: (errors) => {
                    const errorMsg = Object.values(errors).flat()[0] as string;
                    toast.error(errorMsg || 'Failed to delete user');
                },
            });
        }
    };

    const filteredUsers = useMemo(() => {
        const term = search.toLowerCase().trim();

        return users.filter((user) => {
            const matchesSearch =
                !term ||
                user.name.toLowerCase().includes(term) ||
                user.email.toLowerCase().includes(term);

            const matchesRole =
                roleFilter === 'all' || user.role.id.toString() === roleFilter;

            return matchesSearch && matchesRole;
        });
    }, [users, search, roleFilter]);

    const totalUsers = users.length;
    const totalTeachers = users.filter((u) => u.role.name === 'teacher').length;
    const totalStudents = users.filter((u) => u.role.name === 'student' || u.role.name === 'old_student').length;

    return (
        <AppLayout>
            <Head title="Manage Users" />

            <div className="container mx-auto space-y-6 py-8">
                {flash.success && (
                    <div className="mb-2">
                        <Alert>
                            <AlertTitle>Success</AlertTitle>
                            <AlertDescription>{flash.success}</AlertDescription>
                        </Alert>
                    </div>
                )}
                {flash.error && (
                    <div className="mb-2">
                        <Alert variant="destructive">
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{flash.error}</AlertDescription>
                        </Alert>
                    </div>
                )}
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <div className="flex items-center gap-2">
                            <UsersIcon className="h-6 w-6 text-primary" />
                            <h1 className="text-3xl font-semibold tracking-tight">Manage Users</h1>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                            View all users, change their roles, and remove access when needed.
                        </p>
                    </div>
                    <Link href="/admin/users/create-teacher">
                        <Button size="sm">Create New Teacher</Button>
                    </Link>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                    <Card className="border-dashed">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total Users
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pb-4">
                            <p className="text-2xl font-semibold">{totalUsers}</p>
                        </CardContent>
                    </Card>
                    <Card className="border-dashed">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Teachers
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pb-4">
                            <p className="text-2xl font-semibold">{totalTeachers}</p>
                        </CardContent>
                    </Card>
                    <Card className="border-dashed">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Students
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pb-4">
                            <p className="text-2xl font-semibold">{totalStudents}</p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader className="flex flex-col gap-4 pb-4 sm:flex-row sm:items-center sm:justify-between">
                        <CardTitle className="text-base font-semibold">User List</CardTitle>
                        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
                            <div className="w-full sm:w-64">
                                <Input
                                    type="search"
                                    placeholder="Search by name or email..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="h-9"
                                />
                            </div>
                            <div className="w-full sm:w-56">
                                <Select
                                    value={roleFilter}
                                    onValueChange={(value) => setRoleFilter(value)}
                                >
                                    <SelectTrigger className="h-9 w-full">
                                        <SelectValue placeholder="Filter by role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All roles</SelectItem>
                                        {roles.map((role) => (
                                            <SelectItem key={role.id} value={role.id.toString()}>
                                                {role.display_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="px-0 pb-0">
                        <div className="border-t">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/40">
                                        <TableHead className="w-[220px]">Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead className="w-[140px]">Current Role</TableHead>
                                        <TableHead className="w-[220px]">Change Role</TableHead>
                                        <TableHead className="w-[110px] text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredUsers.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                                                No users found. Try adjusting your filters.
                                            </TableCell>
                                        </TableRow>
                                    )}

                                    {filteredUsers.map((user) => (
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
                                            <TableCell>
                                                <Select
                                                    value={user.role.id.toString()}
                                                    onValueChange={(value) => changeRole(user.id, parseInt(value))}
                                                >
                                                    <SelectTrigger className="h-9 w-full max-w-[220px]">
                                                        <SelectValue placeholder="Select role" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {roles.map((role) => (
                                                            <SelectItem key={role.id} value={role.id.toString()}>
                                                                {role.display_name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {user.role.name !== 'admin' && (
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => deleteUser(user.id)}
                                                    >
                                                        Delete
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
