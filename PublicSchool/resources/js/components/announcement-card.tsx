import { Link } from '@inertiajs/react';

export function AnnouncementCard({
  id,
  title,
  excerpt,
  published_at,
  is_pinned,
}: {
  id: number;
  title: string;
  excerpt: string;
  published_at?: string | null;
  is_pinned: boolean;
}) {
  return (
    <li className="border rounded p-4 bg-white/80 dark:bg-slate-800/60">
      <div className="flex items-center gap-2 mb-2">
        {is_pinned && (
          <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-800">Pinned</span>
        )}
        <span className="text-xs text-slate-500">
          {published_at ? new Date(published_at).toLocaleString() : ''}
        </span>
      </div>
      <h2 className="text-lg font-medium">
        <Link href={`/announcements/${id}`} className="hover:underline">
          {title}
        </Link>
      </h2>
      <p className="text-slate-600 dark:text-slate-300 mt-2">{excerpt}</p>
    </li>
  );
}
