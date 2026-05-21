import { Search, SlidersHorizontal } from 'lucide-react';
import { FeedbackAdminListQuery } from '../../types/feedback.types';

interface AdminFilterBarProps {
  query: FeedbackAdminListQuery;
  onChange: (query: FeedbackAdminListQuery) => void;
}

const AdminFilterBar = ({ query, onChange }: AdminFilterBarProps) => {
  const updateQuery = (
    key: keyof FeedbackAdminListQuery,
    value: string | number | undefined
  ) => {
    onChange({
      ...query,
      page: key === 'page' ? Number(value) : 1,
      [key]: value || undefined,
    });
  };

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white/85 p-4 shadow-sm backdrop-blur">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
          <SlidersHorizontal size={17} />
        </span>
        <div>
          <h2 className="text-base font-bold text-slate-950">Search & filters</h2>
          <p className="text-xs text-slate-500">Find forms by title, status, classroom, or department.</p>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-[1.5fr_0.8fr_1fr_1fr]">
        <label className="relative block">
          <Search
            size={17}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={query.search ?? ''}
            onChange={(event) => updateQuery('search', event.target.value)}
            placeholder="Search feedback forms"
            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15"
          />
        </label>

        <select
          value={query.status ?? ''}
          onChange={(event) => updateQuery('status', event.target.value)}
          className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15"
        >
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="closed">Closed</option>
        </select>

        <input
          value={query.department ?? ''}
          onChange={(event) => updateQuery('department', event.target.value)}
          placeholder="Department"
          className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15"
        />

        <select
          value={query.limit}
          onChange={(event) => updateQuery('limit', Number(event.target.value))}
          className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15"
        >
          <option value={10}>10 per page</option>
          <option value={20}>20 per page</option>
          <option value={50}>50 per page</option>
        </select>
      </div>
    </section>
  );
};

export default AdminFilterBar;
