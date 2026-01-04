import { type ReactNode, useState } from 'react';
import { useAppearance } from '@/hooks/use-appearance';

interface Props {
    title: string;
    subtitle?: string;
    actions?: ReactNode;
    sidebar?: ReactNode;
    children: ReactNode;
}

function ThemeToggle() {
    const { appearance, updateAppearance } = useAppearance();

    const current = appearance ?? 'system';

    const isDark = current === 'dark' || (current === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    return (
        <button
            type="button"
            aria-label="Toggle theme"
            className="theme-toggle"
            onClick={() => updateAppearance(isDark ? 'light' : 'dark')}
            title={isDark ? 'Switch to light' : 'Switch to dark'}
        >
            {isDark ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.36 6.36l-1.42-1.42M6.06 6.06L4.64 4.64m12.72 0l-1.42 1.42M6.06 17.94l-1.42 1.42" />
                </svg>
            )}
        </button>
    );
}

export default function DashboardLayout({ title, subtitle, actions, sidebar, children }: Props) {
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    return (
        <div className="admin-layout min-h-screen bg-background text-foreground">
            {/* Desktop sidebar */}
            {sidebar ? (
                <aside className="admin-sidebar hidden md:block">{sidebar}</aside>
            ) : null}

            <div className="flex-1">
                <header className="admin-header">
                    <div className="flex items-center gap-3 w-full">
                        <button
                            type="button"
                            aria-label="Toggle menu"
                            className="md:hidden theme-toggle"
                            onClick={() => setMobileSidebarOpen((s) => !s)}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        <div className="flex items-start flex-1 flex-col sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h1 className="text-lg sm:text-2xl font-semibold tracking-tight">{title}</h1>
                                {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
                            </div>

                            <div className="mt-3 sm:mt-0 flex items-center gap-3">
                                {actions ? <div>{actions}</div> : null}

                                {/* Theme toggle (client-side) */}
                                <ThemeToggle />
                            </div>
                        </div>
                    </div>
                </header>

                <main className="admin-content">
                    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                            {sidebar ? (
                                <div className="hidden md:block md:col-span-3">{/* reserved sidebar column */}</div>
                            ) : null}

                            <div className={sidebar ? 'md:col-span-9' : 'md:col-span-12'}>
                                <div className="space-y-6">{children}</div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Mobile sidebar overlay */}
            {mobileSidebarOpen ? (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setMobileSidebarOpen(false)} />

                    <aside className="absolute left-0 top-0 bottom-0 w-72 bg-sidebar p-4 overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="font-semibold">Menu</h2>
                            </div>
                            <button
                                type="button"
                                aria-label="Close menu"
                                className="theme-toggle"
                                onClick={() => setMobileSidebarOpen(false)}
                            >
                                ✕
                            </button>
                        </div>

                        {/* If the caller passed a sidebar node, render it here; otherwise show actions */}
                        {sidebar ? (
                            <div>{sidebar}</div>
                        ) : (
                            <div>{actions}</div>
                        )}
                    </aside>
                </div>
            ) : null}
        </div>
    );
}
