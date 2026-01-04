import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex items-center gap-3">
                <div className="brand-badge">
                    <AppLogoIcon className="size-6 fill-current text-white" />
                </div>
                <div className="flex flex-col leading-tight">
                    <span className="brand-title text-lg">PublicSchool</span>
                    <span className="text-xs text-[var(--classical-muted)]">Learn. Grow. Thrive.</span>
                </div>
            </div>
        </>
    );
}
