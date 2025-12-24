import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import AppLogoIcon from '@/components/app-logo-icon';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    return (
        <header className="flex h-16 shrink-0 items-center gap-3 border-b border-sidebar-border/50 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4 bg-[color:var(--classical-accent)/3]">
            <div className="flex items-center gap-4">
                <SidebarTrigger className="-ml-1" />
                <a href="/" className="flex items-center gap-3">
                    <div className="rounded-md bg-[color:var(--classical-accent)/12] p-1">
                        <AppLogoIcon className="size-7 fill-current text-[var(--classical-primary)]" />
                    </div>
                    <div className="flex flex-col leading-tight">
                        <span className="classical-title text-base font-semibold">PublicSchool</span>
                        <span className="text-[11px] text-[var(--classical-muted)]">A tidy learning experience</span>
                    </div>
                </a>
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
        </header>
    );
}
