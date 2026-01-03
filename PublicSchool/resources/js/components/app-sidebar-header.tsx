import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import AppLogoIcon from '@/components/app-logo-icon';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { useEffect, useState } from 'react';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const [isDark, setIsDark] = useState<boolean>(() => {
        try {
            const stored = localStorage.getItem('appearance');
            if (stored === 'dark') return true;
            if (stored === 'light') return false;
        } catch (e) {}
        return document.documentElement.classList.contains('dark');
    });

    useEffect(() => {
        document.documentElement.classList.toggle('dark', isDark);
        try { localStorage.setItem('appearance', isDark ? 'dark' : 'light'); } catch (e) {}
    }, [isDark]);
    return (
        <header className="flex h-16 shrink-0 items-center gap-3 border-b border-sidebar-border/50 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4 bg-[color:var(--classical-accent)/3]">
            <div className="flex items-center gap-4">
                <SidebarTrigger className="-ml-1" />
                <a href="/" className="flex items-center gap-3">
                    <div className="brand-badge">
                        <AppLogoIcon className="size-7 fill-current text-white" />
                    </div>
                    <div className="flex flex-col leading-tight">
                        <span className="brand-title text-base">PublicSchool</span>
                        <span className="text-[11px] text-[var(--classical-muted)]">Learn. Grow. Thrive.</span>
                    </div>
                </a>
                <Breadcrumbs breadcrumbs={breadcrumbs} />
                <div className="ml-auto flex items-center gap-2">
                    <button
                        aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
                        title={isDark ? 'Light' : 'Dark'}
                        className="theme-toggle"
                        onClick={() => setIsDark(!isDark)}
                    >
                        {isDark ? (
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 3v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 19v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M4.22 4.22l1.42 1.42" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M18.36 18.36l1.42 1.42" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M1 12h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M21 12h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M4.22 19.78l1.42-1.42" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        ) : (
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        )}
                    </button>
                </div>
            </div>
        </header>
    );
}
