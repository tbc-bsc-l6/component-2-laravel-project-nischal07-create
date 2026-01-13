import { dashboard, login, register } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AppLogo from '@/components/app-logo';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth } = usePage<SharedData>().props;
    const [role, setRole] = useState('student');

    useEffect(() => {
        try {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } catch (e) {
            // ignore in non-browser environments
        }
    }, []);

    return (
        <>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
                    rel="stylesheet"
                />
            </Head>
            <div className="flex min-h-screen flex-col items-center bg-[#FDFDFC] p-6 text-[#1b1b18] lg:justify-center lg:p-8 dark:bg-[#0a0a0a]">
                <header className="mb-6 w-full max-w-[335px] text-sm not-has-[nav]:hidden lg:max-w-4xl">
                    <nav className="flex items-center justify-between gap-3">
                        <div>
                            <AppLogo />
                        </div>
                        <div className="flex items-center gap-3">
                        {auth.user ? (
                            <Link
                                href={dashboard()}
                                className="inline-block rounded-md px-4 py-1 text-sm font-medium bg-[color:var(--classical-accent)/8] text-[var(--classical-primary)] hover:bg-[color:var(--classical-accent)/12] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--classical-accent)/40]"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <a
                                    href="/login"
                                    className="inline-block rounded-md px-4 py-1 text-sm font-medium bg-transparent text-[var(--classical-primary)] hover:bg-[color:var(--classical-accent)/6] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--classical-accent)/40]"
                                >
                                    Log in
                                </a>
                                {canRegister && (
                                    <a
                                        href="/register"
                                        className="inline-block rounded-md px-4 py-1 text-sm font-medium bg-[color:var(--classical-primary)/10] text-[var(--classical-primary)] hover:bg-[color:var(--classical-primary)/14] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--classical-accent)/40]"
                                    >
                                        Register
                                    </a>
                                )}
                            </>
                        )}
                        </div>
                    </nav>
                </header>
                <div className="flex w-full items-center justify-center opacity-100 transition-opacity duration-750 lg:grow starting:opacity-0">
                    <main className="flex w-full max-w-[335px] flex-col-reverse lg:max-w-4xl lg:flex-row">
                        <div className="flex-1 rounded-br-lg rounded-bl-lg hero-card p-6 pb-12 text-[13px] leading-[20px] shadow-sm lg:rounded-tl-lg lg:rounded-br-none lg:p-20">
                            <h1 className="mb-1 classical-title text-3xl">
                                Welcome to PublicSchool
                            </h1>
                            <p className="mb-4 text-[var(--classical-muted)]">
                                Join as a student, teacher, or admin. Choose your role below and get started with a tidy, classical learning experience.
                            </p>

                            <div className="mb-4 rounded-md border border-[color:var(--classical-border)] bg-white/60 p-3 text-sm text-[var(--classical-primary)] dark:bg-white/10">
                                <strong className="block mb-1">What's new</strong>
                                <a href="/announcements" className="underline">Read announcements</a> or subscribe via RSS to stay in sync with updates.
                            </div>

                            {/* Role selector + CTA */}
                            <div className="mb-4 flex flex-col gap-3">
                                <div className="max-w-xs">
                                    <Select onValueChange={(v) => setRole(v)} value={role}>
                                        <SelectTrigger className="h-10">
                                            <SelectValue placeholder="Select your role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="student">Student</SelectItem>
                                            <SelectItem value="teacher">Teacher</SelectItem>
                                            <SelectItem value="admin">Admin</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex items-center gap-3">
                                    {canRegister ? (
                                        <a href={`/register?role=${role}`}>
                                            <Button size="lg" className="px-6">Get started as {role}</Button>
                                        </a>
                                    ) : (
                                        <a href="/login">
                                            <Button size="lg">Log in</Button>
                                        </a>
                                    )}
                                    <a href="/admin/courses" className="ml-2 self-end">
                                        <Button variant="outline" size="lg" className="px-4">Browse courses</Button>
                                    </a>
                                </div>
                                </div>
                        </div>
                    </main>
                </div>
                <div className="hidden h-14.5 lg:block"></div>
            </div>
        </>
    );
}
