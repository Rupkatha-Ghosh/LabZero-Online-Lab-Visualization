import { RotateCcw, Search } from 'lucide-react';
import {
  FeedbackAnalyticsFilters,
  FeedbackFilterOption,
} from '../../types/feedback.types';

interface FilterPanelProps {
  filters: FeedbackAnalyticsFilters;
  classroomOptions?: FeedbackFilterOption[];
  teacherOptions?: FeedbackFilterOption[];
  departmentOptions?: FeedbackFilterOption[];
  onChange: (filters: FeedbackAnalyticsFilters) => void;
  onReset: () => void;
}

const FilterPanel = ({
  filters,
  classroomOptions = [],
  teacherOptions = [],
  departmentOptions = [],
  onChange,
  onReset,
}: FilterPanelProps) => {
  const updateFilter = (key: keyof FeedbackAnalyticsFilters, value: string) => {
    onChange({
      ...filters,
      [key]: value || undefined,
    });
  };

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white/85 p-4 shadow-sm backdrop-blur sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
            <Search size={17} />
          </span>
          <div>
            <h2 className="text-base font-bold text-slate-950">Filters</h2>
            <p className="text-xs text-slate-500">
              Classroom, teacher, date, and department
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          <RotateCcw size={14} />
          Reset
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <SelectFilter
          label="Classroom"
          value={filters.classroomId ?? ''}
          options={classroomOptions}
          fallback="All classrooms"
          onChange={(value) => updateFilter('classroomId', value)}
        />
        <SelectFilter
          label="Teacher"
          value={filters.teacherId ?? ''}
          options={teacherOptions}
          fallback="All teachers"
          onChange={(value) => updateFilter('teacherId', value)}
        />
        <DateFilter
          label="From"
          value={filters.startDate ?? ''}
          onChange={(value) => updateFilter('startDate', value)}
        />
        <DateFilter
          label="To"
          value={filters.endDate ?? ''}
          onChange={(value) => updateFilter('endDate', value)}
        />
        <div className="md:col-span-2 xl:col-span-4">
          <SelectFilter
            label="Department"
            value={filters.department ?? ''}
            options={departmentOptions}
            fallback="All departments"
            onChange={(value) => updateFilter('department', value)}
          />
        </div>
      </div>
    </section>
  );
};

const SelectFilter = ({
  label,
  value,
  options,
  fallback,
  onChange,
}: {
  label: string;
  value: string;
  options: FeedbackFilterOption[];
  fallback: string;
  onChange: (value: string) => void;
}) => (
  <label className="block">
    <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
      {label}
    </span>
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15"
    >
      <option value="">{fallback}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </label>
);

const DateFilter = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) => (
  <label className="block">
    <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
      {label}
    </span>
    <input
      type="date"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15"
    />
  </label>
);

export default FilterPanel;
