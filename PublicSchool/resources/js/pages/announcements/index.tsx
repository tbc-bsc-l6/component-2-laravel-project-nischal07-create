import { Head, Link, usePage } from '@inertiajs/react';
import { AnnouncementCard } from '@/components/announcement-card';
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
          <AnnouncementCard key={a.id} {...a} />
        ))}
      </ul>

      <nav className="flex flex-wrap gap-2 mt-6" aria-label="Pagination">
        {announcements?.links?.map((link, i) => {
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
              href={link.url}
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
