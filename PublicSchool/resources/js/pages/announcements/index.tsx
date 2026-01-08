import { Head, Link, usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';

interface AnnouncementListItem {
  id: number;
  title: string;
  excerpt: string;
  published_at?: string | null;
  is_pinned: boolean;
}

interface IndexProps {
  announcements: {
    data: AnnouncementListItem[];
    links: { url: string | null; label: string; active: boolean }[];
  };
  filters: { q?: string };
}

export default function AnnouncementsIndex({ announcements, filters }: PageProps<IndexProps>) {
  const { props } = usePage<PageProps<IndexProps>>();

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Head title="Announcements" />
      <h1 className="text-2xl font-semibold mb-4">Announcements</h1>

      <form method="get" action="/announcements" className="mb-6">
        <input
          name="q"
          defaultValue={filters?.q ?? ''}
          placeholder="Search announcements..."
          className="w-full border rounded px-3 py-2"
        />
      </form>

      <ul className="space-y-4">
        {announcements?.data?.map((a) => (
          <li key={a.id} className="border rounded p-4 bg-white/80 dark:bg-slate-800/60">
            <div className="flex items-center gap-2 mb-2">
              {a.is_pinned && (
                <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-800">Pinned</span>
              )}
              <span className="text-xs text-slate-500">
                {a.published_at ? new Date(a.published_at).toLocaleString() : ''}
              </span>
            </div>
            <h2 className="text-lg font-medium">
              <Link href={`/announcements/${a.id}`} className="hover:underline">
                {a.title}
              </Link>
            </h2>
            <p className="text-slate-600 dark:text-slate-300 mt-2">{a.excerpt}</p>
          </li>
        ))}
      </ul>

      <nav className="flex flex-wrap gap-2 mt-6">
        {announcements?.links?.map((link, i) => (
          <Link
            key={i}
            href={link.url || ''}
            preserveState
            className={`px-3 py-1 rounded border ${link.active ? 'bg-slate-900 text-white' : 'bg-white dark:bg-slate-800'}`}
            dangerouslySetInnerHTML={{ __html: link.label }}
          />
        ))}
      </nav>
    </div>
  );
}
