import {
  AlertCircle,
  BarChart3,
  Download,
  Loader2,
  Percent,
  RefreshCw,
  Star,
  Users,
} from 'lucide-react';
import { lazy, Suspense, useMemo, useState } from 'react';
import FeedbackPageShell from '../components/common/FeedbackPageShell';
import FeedbackSkeleton from '../components/common/FeedbackSkeleton';
import FilterPanel from '../components/analytics/FilterPanel';
import StatisticsCard from '../components/analytics/StatisticsCard';
import { useFeedbackAnalytics } from '../hooks/useFeedbackAnalytics';
import {
  FeedbackAnalyticsFilters,
  FeedbackFilterOption,
} from '../types/feedback.types';
import { exportAnalyticsCsv } from '../utils/feedbackAnalytics';

const AnalyticsCharts = lazy(
  () => import('../components/analytics/AnalyticsCharts')
);

interface AnalyticsDashboardPageProps {
  formId?: string;
  classroomOptions?: FeedbackFilterOption[];
  teacherOptions?: FeedbackFilterOption[];
  departmentOptions?: FeedbackFilterOption[];
}

const getFormIdFromUrl = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get('analyticsFormId') || params.get('feedbackFormId') || '';
};

const defaultFilters: FeedbackAnalyticsFilters = {};

const AnalyticsDashboardPage = ({
  formId,
  classroomOptions,
  teacherOptions,
  departmentOptions,
}: AnalyticsDashboardPageProps) => {
  const resolvedFormId = formId || getFormIdFromUrl();
  const [filters, setFilters] =
    useState<FeedbackAnalyticsFilters>(defaultFilters);
  const { viewModel, isLoading, error, reload } = useFeedbackAnalytics(
    resolvedFormId,
    filters
  );

  const inferredDepartmentOptions = useMemo(() => {
    if (departmentOptions?.length) {
      return departmentOptions;
    }

    const department =
      viewModel?.form?.classroomCourseMetadata?.subject ||
      viewModel?.form?.classroomCourseMetadata?.courseName;

    return department ? [{ label: department, value: department }] : [];
  }, [departmentOptions, viewModel?.form]);

  return (
    <FeedbackPageShell tone="emerald">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
        <header className="rounded-3xl border border-slate-200/80 bg-white/85 p-5 shadow-sm backdrop-blur sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-600">
                LabZero Feedback Analytics
              </p>
              <h1 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">
                {viewModel?.form?.title ?? 'Analytics Dashboard'}
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                Track rating trends, response volume, satisfaction, and choice
                distribution across classrooms and departments.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={reload}
                disabled={isLoading}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  size={16}
                  className={isLoading ? 'animate-spin' : undefined}
                />
                Refresh
              </button>
              <button
                type="button"
                onClick={() => viewModel && exportAnalyticsCsv(viewModel)}
                disabled={!viewModel}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Download size={16} />
                Export CSV
              </button>
            </div>
          </div>
        </header>

        <FilterPanel
          filters={filters}
          classroomOptions={classroomOptions}
          teacherOptions={teacherOptions}
          departmentOptions={inferredDepartmentOptions}
          onChange={setFilters}
          onReset={() => setFilters(defaultFilters)}
        />

        {!resolvedFormId && (
          <ErrorPanel
            title="Missing form id"
            message="Open the dashboard with analyticsFormId or pass a formId prop."
            onRetry={undefined}
          />
        )}

        {resolvedFormId && isLoading && <DashboardLoading />}

        {resolvedFormId && !isLoading && error && (
          <ErrorPanel
            title="Analytics unavailable"
            message={error}
            onRetry={reload}
          />
        )}

        {viewModel && !isLoading && !error && (
          <>
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatisticsCard
                label="Responses"
                value={viewModel.summary.totalResponses}
                detail={`${viewModel.summary.anonymousResponses} anonymous responses`}
                icon={Users}
                tone="cyan"
              />
              <StatisticsCard
                label="Average rating"
                value={viewModel.summary.averageRating.toFixed(2)}
                detail="Mean across rating questions"
                icon={Star}
                tone="amber"
              />
              <StatisticsCard
                label="Satisfaction"
                value={`${viewModel.summary.satisfactionPercentage}%`}
                detail="Based on five-point rating scale"
                icon={Percent}
                tone="emerald"
              />
              <StatisticsCard
                label="Questions"
                value={viewModel.questionStats.length}
                detail="Included in current analytics view"
                icon={BarChart3}
                tone="indigo"
              />
            </section>

            <Suspense fallback={<ChartsLoading />}>
              <AnalyticsCharts questionStats={viewModel.questionStats} />
            </Suspense>
          </>
        )}
      </div>
    </FeedbackPageShell>
  );
};

const DashboardLoading = () => (
  <FeedbackSkeleton rows={4} variant="cards" />
);

const ChartsLoading = () => (
  <div className="grid gap-5 xl:grid-cols-2">
    {Array.from({ length: 4 }, (_, index) => (
      <div
        key={index}
        className="h-80 animate-pulse rounded-2xl border border-slate-200/80 bg-white/70"
      />
    ))}
  </div>
);

const ErrorPanel = ({
  title,
  message,
  onRetry,
}: {
  title: string;
  message: string;
  onRetry?: () => void;
}) => (
  <section className="rounded-3xl border border-rose-200 bg-white p-6 text-center shadow-sm">
    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
      <AlertCircle size={24} />
    </div>
    <h2 className="mt-4 text-xl font-bold text-slate-950">{title}</h2>
    <p className="mt-2 text-sm leading-6 text-slate-600">{message}</p>
    {onRetry && (
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 h-11 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
      >
        Try again
      </button>
    )}
  </section>
);

export default AnalyticsDashboardPage;
