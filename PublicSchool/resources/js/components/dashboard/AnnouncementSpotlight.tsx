import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Headphones, Megaphone } from 'lucide-react';
import { Link } from '@inertiajs/react';

export type AnnouncementHighlight = {
    id: number;
    title: string;
    excerpt: string;
    published_at?: string | null;
    is_pinned: boolean;
};

interface AnnouncementSpotlightProps {
    announcements: AnnouncementHighlight[];
    className?: string;
}

export function AnnouncementSpotlight({ announcements, className }: AnnouncementSpotlightProps) {
    return (
        <Card className={cn('h-full', className)}>
            <CardHeader className="flex flex-row items-start justify-between gap-3">
                <div>
                    <div className="flex items-center gap-2 text-primary">
                        <Megaphone className="h-4 w-4" />
                        <span className="text-xs font-semibold uppercase tracking-wide">Announcements</span>
                    </div>
                    <CardTitle className="text-base">Latest updates for everyone</CardTitle>
                    <CardDescription>Stay on top of pinned and recent notices.</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    <Link href="/feed/announcements" className="text-xs text-muted-foreground hover:text-primary">
                        <div className="flex items-center gap-1">
                            <Headphones className="h-4 w-4" />
                            <span>RSS</span>
                        </div>
                    </Link>
                    <Link href="/announcements">
                        <Button size="sm" variant="outline">View all</Button>
                    </Link>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {announcements.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No announcements yet.</p>
                ) : (
                    <div className="space-y-3">
                        {announcements.map((announcement) => (
                            <Link
                                key={announcement.id}
                                href={`/announcements/${announcement.id}`}
                                className="block rounded-lg border border-transparent bg-muted/40 px-3 py-2 transition hover:border-primary/60 hover:bg-background"
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        {announcement.is_pinned && <Badge variant="outline">Pinned</Badge>}
                                        <p className="text-sm font-semibold leading-tight">{announcement.title}</p>
                                    </div>
                                    {announcement.published_at && (
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(announcement.published_at).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{announcement.excerpt}</p>
                            </Link>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
