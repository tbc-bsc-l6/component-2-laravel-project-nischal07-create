import { Head, Link } from '@inertiajs/react';
import type { PageProps } from '@/types';

interface ShowProps {
  announcement: {
    id: number;
    title: string;
    body: string;
    published_at?: string | null;
    is_pinned: boolean;
  };
}

export default function AnnouncementShow({ announcement }: PageProps<ShowProps>) {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <Head title={announcement.title} />
      <Link href="/announcements" className="text-sm text-blue-600 hover:underline">← Back</Link>
      <div className="mt-4 border rounded p-6 bg-white/80 dark:bg-slate-800/60">
        <div className="flex items-center gap-2 mb-3">
          {announcement.is_pinned && (
            <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-800">Pinned</span>
          )}
          <span className="text-xs text-slate-500">
            {announcement.published_at ? new Date(announcement.published_at).toLocaleString() : ''}
          </span>
        </div>
        <h1 className="text-2xl font-semibold">{announcement.title}</h1>
        <div className="prose dark:prose-invert mt-4 whitespace-pre-wrap">{announcement.body}</div>
      </div>
    </div>
  );
}
