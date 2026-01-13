import { Head, Link, usePage, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { AnnouncementCard } from '@/components/announcement-card';

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

export default function AnnouncementsIndex({ announcements, filters }: IndexProps) {
  const [q, setQ] = useState(filters?.q ?? '');

  useEffect(() => {
    const handle = setTimeout(() => {
      router.get(
        '/announcements',
        { q },
        { preserveState: true, preserveScroll: true, replace: true },
      );
    }, 250);

    return () => clearTimeout(handle);
  }, [q]);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Head title="Announcements" />
      <h1 className="text-2xl font-semibold mb-4">Announcements</h1>

      <div className="flex items-center justify-between mb-4 text-sm text-slate-600 dark:text-slate-300">
        <span>Stay up to date with the latest news.</span>
        <Link href="/feed/announcements" className="text-blue-600 hover:underline">
          RSS Feed
        </Link>
      </div>

      <div className="mb-6">
        <input
          name="q"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search announcements..."
          className="w-full border rounded px-3 py-2"
          aria-label="Search announcements"
        />
      </div>

      {announcements?.data?.length ? (
        <ul className="space-y-4">
          {announcements.data.map((a: AnnouncementListItem) => (
            <AnnouncementCard key={a.id} {...a} />
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-500">No announcements found.</p>
      )}

      <nav className="flex flex-wrap gap-2 mt-6" aria-label="Pagination">
        {announcements?.links?.map((link: { url: string | null; label: string; active: boolean }, i) => {
          const isDisabled = !link.url;
          const classes = `px-3 py-1 rounded border transition ${
            link.active
              ? 'bg-slate-900 text-white border-slate-900'
              : 'bg-white dark:bg-slate-800 hover:border-slate-400'
          } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`;

          if (isDisabled) {
            return (
              <span
                key={i}
                className={classes}
                dangerouslySetInnerHTML={{ __html: link.label }}
              />
            );
          }

          return (
            <Link
              key={i}
              href={link.url!}
              preserveState
              preserveScroll
              className={classes}
              dangerouslySetInnerHTML={{ __html: link.label }}
            />
          );
        })}
      </nav>
    </div>
  );
}
