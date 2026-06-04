import { AlertCircle, ArrowLeft, BarChart3, FileDown, FilePlus2, LayoutDashboard, LineChart, Loader2, MessageSquareText, PieChart as PieChartIcon, RefreshCw, ScanText, Star, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useAuth } from '../../../context/AuthContext';
import AdminFilterBar from '../components/admin/AdminFilterBar';
import AdminFormsTable from '../components/admin/AdminFormsTable';
import FeedbackFormBuilderModal from '../components/admin/FeedbackFormBuilderModal';
import FeedbackFormPdfGenerator from '../components/FeedbackFormPdfGenerator';
import PieDonutChart from '../components/analytics/PieDonutChart';
import FeedbackPageShell from '../components/common/FeedbackPageShell';
import FeedbackSkeleton from '../components/common/FeedbackSkeleton';
import SentimentSummary from '../components/text-analysis/SentimentSummary';
import WordCloud from '../components/text-analysis/WordCloud';
import { useFeedbackAdmin } from '../hooks/useFeedbackAdmin';
import { fetchAdminFeedbackOverview, getFeedbackApiError } from '../services/feedbackApi';
import {
  FeedbackAdminListQuery,
  FeedbackAdminOverview,
  FeedbackAnalytics,
  FeedbackForm,
  FeedbackFormDraft,
  FeedbackQuestionType,
  FeedbackSubmittedResponse,
  TextFeedbackAnalysis,
} from '../types/feedback.types';

interface FeedbackAdminPageProps {
  onBack?: () => void;
  onOpenAnalytics?: (formId: string) => void;
  onOpenTextAnalysis?: (formId: string) => void;
}

const FeedbackAdminPage = ({ onBack, onOpenAnalytics, onOpenTextAnalysis }: FeedbackAdminPageProps) => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [query, setQuery] = useState<FeedbackAdminListQuery>({
    page: 1,
    limit: 10,
  });
  const [editingForm, setEditingForm] = useState<FeedbackForm | null>(null);
  const [builderOpen, setBuilderOpen] = useState(false);
  const canAdmin = Boolean(
    user?.is_staff ||
    user?.is_superuser ||
    user?.role === 'teacher' ||
    user?.role === 'institute'
  );
  const admin = useFeedbackAdmin(query, canAdmin);
  const [overview, setOverview] = useState<FeedbackAdminOverview | null>(null);
  const [overviewLoading, setOverviewLoading] = useState(false);
  const [overviewError, setOverviewError] = useState<string | null>(null);
  const currentUser = useMemo(
    () =>
      user
        ? {
          userId: user.id,
          name: [user.first_name, user.last_name].filter(Boolean).join(' '),
          email: user.email,
          role: user.role,
        }
        : undefined,
    [user]
  );

  const openCreate = () => {
    setEditingForm(null);
    setBuilderOpen(true);
  };

  const saveForm = async (draft: FeedbackFormDraft) => {
    if (editingForm) {
      await admin.updateForm(editingForm, draft);
    } else {
      await admin.createForm(draft);
    }
    setBuilderOpen(false);
    setEditingForm(null);
    void loadOverview();
  };

  const loadOverview = async () => {
    if (!canAdmin) return;

    setOverviewLoading(true);
    setOverviewError(null);
    try {
      setOverview(await fetchAdminFeedbackOverview());
    } catch (requestError) {
      setOverviewError(getFeedbackApiError(requestError));
    } finally {
      setOverviewLoading(false);
    }
  };

  useEffect(() => {
    void loadOverview();
  }, [canAdmin]);

  if (isAuthLoading) {
    return (
      <AdminShell>
        <LoadingState label="Checking admin access..." />
      </AdminShell>
    );
  }

  if (!canAdmin) {
    return (
      <AdminShell>
        <AccessDenied />
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
        <header className="rounded-3xl border border-slate-200/80 bg-white/85 p-5 shadow-sm backdrop-blur sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-600">
                LabZero Administration
              </p>
              <h1 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">
                Feedback Admin Panel
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                Create forms, manage sections and questions, publish collection
                windows, and jump into analytics from one workspace.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {onBack && (
                <button
                  type="button"
                  onClick={onBack}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <ArrowLeft size={16} />
                  Back
                </button>
              )}
              <FeedbackFormPdfGenerator />
              <button
                type="button"
                onClick={() => {
                  if (onOpenAnalytics) {
                    onOpenAnalytics('site-feedback');
                  } else {
                    window.location.href = '?analyticsFormId=site-feedback';
                  }
                }}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                title="View per-question analytics for site feedback (30 responses, 21 questions)"
              >
                <LineChart size={16} />
                Per-Question Analytics
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onOpenTextAnalysis) {
                    onOpenTextAnalysis('site-feedback');
                  } else {
                    window.location.href = '?textAnalysisFormId=site-feedback';
                  }
                }}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                title="View text analysis (keywords, word cloud, sentiment) for site feedback"
              >
                <ScanText size={16} />
                Text Analysis
              </button>
              <button
                type="button"
                onClick={openCreate}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <FilePlus2 size={17} />
                Create form
              </button>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <SummaryCard label="Forms" value={overview?.overall.totalForms ?? admin.pagination.total} />
          <SummaryCard
            label="Total responses"
            value={overview?.overall.totalResponses ?? 0}
          />
          <SummaryCard
            label="Site feedback"
            value={overview?.overall.siteFeedback.total ?? 0}
          />
        </section>

        <FeedbackOverview
          overview={overview}
          isLoading={overviewLoading}
          error={overviewError}
          onRefresh={loadOverview}
          onOpenAnalytics={onOpenAnalytics}
        />

        <section className="grid gap-4 md:grid-cols-3">
          <SummaryCard
            label="Current page"
            value={`${admin.pagination.page}/${Math.max(admin.pagination.totalPages, 1)}`}
          />
          <SummaryCard
            label="Visible rows"
            value={admin.forms.length}
          />
          <SummaryCard
            label="Questions"
            value={overview?.overall.totalQuestions ?? 0}
          />
        </section>

        <AdminFilterBar query={query} onChange={setQuery} />

        {admin.error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {admin.error}
          </div>
        )}

        <AdminFormsTable
          forms={admin.forms}
          isLoading={admin.isLoading}
          isMutating={admin.isMutating}
          page={admin.pagination.page}
          totalPages={admin.pagination.totalPages}
          onPageChange={(page) => setQuery((current) => ({ ...current, page }))}
          onEdit={(form) => {
            setEditingForm(form);
            setBuilderOpen(true);
          }}
          onDelete={(form) => {
            if (window.confirm(`Delete "${form.title}" and all responses?`)) {
              void admin.deleteForm(form).then(loadOverview);
            }
          }}
          onStatusChange={(form, status) => void admin.updateStatus(form, status).then(loadOverview)}
          onViewAnalytics={(form) => {
            if (onOpenAnalytics) {
              onOpenAnalytics(form._id);
            } else {
              window.location.href = `?analyticsFormId=${form._id}`;
            }
          }}
        />
      </div>

      <FeedbackFormBuilderModal
        open={builderOpen}
        form={editingForm}
        currentUser={currentUser}
        isSaving={admin.isMutating}
        onClose={() => {
          setBuilderOpen(false);
          setEditingForm(null);
        }}
        onSave={saveForm}
      />
    </AdminShell>
  );
};

const AdminShell = ({ children }: { children: React.ReactNode }) => (
  <FeedbackPageShell tone="indigo">{children}</FeedbackPageShell>
);

const SummaryCard = ({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) => (
  <article className="rounded-2xl border border-slate-200/80 bg-white/85 p-5 shadow-sm backdrop-blur">
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="mt-2 text-3xl font-black text-slate-950">{value}</p>
      </div>
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 text-indigo-700">
        <LayoutDashboard size={20} />
      </span>
    </div>
  </article>
);

const LoadingState = ({ label }: { label: string }) => (
  <div className="mx-auto flex min-h-[70vh] max-w-xl items-center justify-center px-4">
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-600 shadow-sm">
      <Loader2 size={18} className="animate-spin text-indigo-600" />
      {label}
    </div>
  </div>
);

const AccessDenied = () => (
  <div className="mx-auto flex min-h-[70vh] max-w-xl items-center justify-center px-4">
    <div className="w-full rounded-3xl border border-rose-200 bg-white p-6 text-center shadow-sm">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
        <AlertCircle size={24} />
      </div>
      <h1 className="mt-4 text-xl font-bold text-slate-950">
        Admin access required
      </h1>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        You need an admin account to manage feedback forms and view analytics.
      </p>
    </div>
  </div>
);

const chartColors = ['#4f46e5', '#0891b2', '#059669', '#d97706', '#c026d3', '#e11d48', '#475569'];
const choiceQuestionTypes = ['checkbox', 'radio', 'dropdown'] as const;
type ChoiceQuestionType = Extract<FeedbackQuestionType, (typeof choiceQuestionTypes)[number]>;
const choiceTypeLabels: Record<ChoiceQuestionType, string> = {
  checkbox: 'Checkbox',
  radio: 'Radio',
  dropdown: 'Dropdown',
};

const createEmptyChoiceCounts = (): Record<ChoiceQuestionType, Record<string, number>> => ({
  checkbox: {},
  radio: {},
  dropdown: {},
});

const isChoiceQuestionType = (type: FeedbackQuestionType): type is ChoiceQuestionType =>
  choiceQuestionTypes.includes(type as ChoiceQuestionType);

const getChoiceCountsByType = (
  overview: FeedbackAdminOverview
): Record<ChoiceQuestionType, Record<string, number>> => {
  const countsByType = createEmptyChoiceCounts();
  const analyticsGroups = [
    overview.overall.siteFeedback.analytics,
    ...overview.forms.map((item) => item.analytics),
  ].filter((analytics): analytics is FeedbackAnalytics => Boolean(analytics));

  analyticsGroups.forEach((analytics) => {
    analytics.questionStats.forEach((question) => {
      if (!isChoiceQuestionType(question.type)) {
        return;
      }

      Object.entries(question.optionCounts ?? {}).forEach(([option, count]) => {
        countsByType[question.type][option] =
          (countsByType[question.type][option] ?? 0) + count;
      });
    });
  });

  return countsByType;
};

const siteFeedbackFormMock: FeedbackForm = {
  _id: 'site-feedback',
  title: 'Site feedback',
  description: 'Feedback submitted from the LabZero feedback page.',
  anonymousAllowed: false,
  status: 'published',
  sections: [
    {
      title: 'Written Feedback',
      questionIds: ['sf-text-1', 'sf-text-2', 'sf-text-3', 'sf-text-4', 'sf-text-5'],
      order: 0,
      questions: [
        { _id: 'sf-text-1', prompt: 'Which laboratory simulation or interactive visualization helped you understand a concept best, and why?', type: 'text', required: true, order: 0, sectionTitle: 'Written Feedback' },
        { _id: 'sf-text-2', prompt: 'What technical issues did you face while running or interacting with the 3D/graphical lab visualizations?', type: 'text', required: true, order: 1, sectionTitle: 'Written Feedback' },
        { _id: 'sf-text-3', prompt: 'How interactive and collaborative was your experience during live virtual lab sessions?', type: 'text', required: true, order: 2, sectionTitle: 'Written Feedback' },
        { _id: 'sf-text-4', prompt: 'What improvements would you suggest for better learning?', type: 'text', required: true, order: 3, sectionTitle: 'Written Feedback' },
        { _id: 'sf-text-5', prompt: 'Any additional comments regarding student experience?', type: 'text', required: true, order: 4, sectionTitle: 'Written Feedback' },
      ]
    },
    {
      title: 'Ratings',
      questionIds: ['sf-rating-1', 'sf-rating-2', 'sf-rating-3', 'sf-rating-4', 'sf-rating-5'],
      order: 1,
      questions: [
        { _id: 'sf-rating-1', prompt: 'Rate the overall usability of LabZero.', type: 'rating', required: true, order: 0, sectionTitle: 'Ratings' },
        { _id: 'sf-rating-2', prompt: 'Rate the quality of classroom interaction.', type: 'rating', required: true, order: 1, sectionTitle: 'Ratings' },
        { _id: 'sf-rating-3', prompt: 'Rate the ease of accessing study resources and lecture notes.', type: 'rating', required: true, order: 2, sectionTitle: 'Ratings' },
        { _id: 'sf-rating-4', prompt: 'Rate the responsiveness and interactive control smoothness of the lab simulations.', type: 'rating', required: true, order: 3, sectionTitle: 'Ratings' },
        { _id: 'sf-rating-5', prompt: 'Rate how well the virtual lab simulation matched your real-world lab expectations.', type: 'rating', required: true, order: 4, sectionTitle: 'Ratings' },
      ]
    },
    {
      title: 'Feature Usage and Improvements',
      questionIds: ['sf-checkbox-1', 'sf-checkbox-2', 'sf-checkbox-3'],
      order: 2,
      questions: [
        { _id: 'sf-checkbox-1', prompt: 'Which features do you use regularly?', type: 'checkbox', required: true, order: 0, sectionTitle: 'Feature Usage and Improvements' },
        { _id: 'sf-checkbox-2', prompt: 'What improvements would you like?', type: 'checkbox', required: true, order: 1, sectionTitle: 'Feature Usage and Improvements' },
        { _id: 'sf-checkbox-3', prompt: 'Which devices do you use for LabZero?', type: 'checkbox', required: true, order: 2, sectionTitle: 'Feature Usage and Improvements' },
      ]
    },
    {
      title: 'Usage and Satisfaction',
      questionIds: ['sf-radio-1', 'sf-radio-2', 'sf-radio-3'],
      order: 3,
      questions: [
        { _id: 'sf-radio-1', prompt: 'What is your initial impression of the LabZero onboarding tour?', type: 'radio', required: true, order: 0, sectionTitle: 'Usage and Satisfaction' },
        { _id: 'sf-radio-2', prompt: 'Overall satisfaction with the platform?', type: 'radio', required: true, order: 1, sectionTitle: 'Usage and Satisfaction' },
        { _id: 'sf-radio-3', prompt: 'How easily can you follow laboratory procedures using the platform?', type: 'radio', required: true, order: 2, sectionTitle: 'Usage and Satisfaction' },
      ]
    },
    {
      title: 'Academic and Access Details',
      questionIds: ['sf-dropdown-1', 'sf-dropdown-2', 'sf-dropdown-3', 'sf-dropdown-4', 'sf-dropdown-5'],
      order: 4,
      questions: [
        { _id: 'sf-dropdown-1', prompt: 'Select your department.', type: 'dropdown', required: true, order: 0, sectionTitle: 'Academic and Access Details' },
        { _id: 'sf-dropdown-2', prompt: 'Select your year/semester.', type: 'dropdown', required: true, order: 1, sectionTitle: 'Academic and Access Details' },
        { _id: 'sf-dropdown-3', prompt: 'Select your student level / institution type.', type: 'dropdown', required: true, order: 2, sectionTitle: 'Academic and Access Details' },
        { _id: 'sf-dropdown-4', prompt: 'Select your internet connectivity quality.', type: 'dropdown', required: true, order: 3, sectionTitle: 'Academic and Access Details' },
        { _id: 'sf-dropdown-5', prompt: 'Select how easily you were able to navigate to the lab visualization page.', type: 'dropdown', required: true, order: 4, sectionTitle: 'Academic and Access Details' },
      ]
    }
  ]
};

const FeedbackOverview = ({
  overview,
  isLoading,
  error,
  onRefresh,
  onOpenAnalytics,
}: {
  overview: FeedbackAdminOverview | null;
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
  onOpenAnalytics?: (formId: string) => void;
}) => {
  const choiceCountsByType = overview
    ? getChoiceCountsByType(overview)
    : createEmptyChoiceCounts();

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 rounded-3xl border border-slate-200/80 bg-white/85 p-5 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-600">
            Visualization mapping
          </p>
          <h2 className="mt-1 text-2xl font-black text-slate-950">
            Feedback Overview
          </h2>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
        >
          <RefreshCw size={16} className={isLoading ? 'animate-spin' : undefined} />
          Refresh overview
        </button>
      </div>

      {isLoading && <FeedbackSkeleton rows={2} variant="cards" />}

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {error}
        </div>
      )}

      {overview && !isLoading && (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <OverviewMetric label="All responses" value={overview.overall.totalResponses} icon={Users} />
            <OverviewMetric label="Average rating" value={overview.overall.averageRating.toFixed(2)} icon={Star} />
            <OverviewMetric label="Satisfaction" value={`${overview.overall.satisfactionPercentage}%`} icon={BarChart3} />
            <OverviewMetric label="Text responses" value={overview.overall.textAnalysis.totalTextResponses} icon={MessageSquareText} />
          </section>

          <section className="grid gap-5 xl:grid-cols-2">
            <OverviewCard title="Scale / Rating" subtitle="Histogram / Bar Graph">
              <BarVisualization data={toChartData(overview.overall.ratingDistribution)} />
            </OverviewCard>
            <OverviewCard title="Checkbox / Radio / Dropdown" subtitle="Pie Chart">
              <ChoicePieGrid data={choiceCountsByType} />
            </OverviewCard>
            <OverviewCard title="Question Types" subtitle="Overall form composition">
              <BarVisualization data={toChartData(overview.overall.questionTypeCounts)} />
            </OverviewCard>
            <OverviewCard title="Text Feedback" subtitle="Word Cloud / Sentiment Analysis">
              <div className="grid gap-4 md:grid-cols-2">
                <WordCloud words={overview.overall.textAnalysis.wordFrequencies.slice(0, 28)} />
                <SentimentSummary
                  sentiment={overview.overall.textAnalysis.sentiment}
                  totalResponses={overview.overall.textAnalysis.totalTextResponses}
                />
              </div>
            </OverviewCard>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-black text-slate-950">
              Submitted Feedback Analysis
            </h3>
            <div className="grid gap-4">
              {overview.overall.siteFeedback.analytics && (
                <FormOverviewCard
                  form={siteFeedbackFormMock}
                  analytics={overview.overall.siteFeedback.analytics}
                  textAnalysis={
                    overview.overall.siteFeedback.textAnalysis ??
                    overview.overall.siteFeedback.analytics.responses?.[0]?.analysis.textAnalysis ?? {
                      totalTextResponses: 0,
                      keywords: [],
                      wordFrequencies: [],
                      sentiment: {
                        positive: 0,
                        neutral: 0,
                        negative: 0,
                        averageScore: 0,
                        satisfactionPercentage: 0,
                      },
                    }
                  }
                  onViewAnalytics={(form) => {
                    if (onOpenAnalytics) {
                      onOpenAnalytics(form._id);
                    } else {
                      window.location.href = `?analyticsFormId=${form._id}`;
                    }
                  }}
                />
              )}
              {overview.forms.map((item) => (
                <FormOverviewCard
                  key={item.form._id}
                  form={item.form}
                  analytics={item.analytics}
                  textAnalysis={item.textAnalysis}
                  onViewAnalytics={(form) => {
                    if (onOpenAnalytics) {
                      onOpenAnalytics(form._id);
                    } else {
                      window.location.href = `?analyticsFormId=${form._id}`;
                    }
                  }}
                />
              ))}
            </div>
          </section>
        </>
      )}
    </section>
  );
};

const OverviewMetric = ({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: typeof Users;
}) => (
  <article className="rounded-2xl border border-slate-200/80 bg-white/85 p-5 shadow-sm backdrop-blur">
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="mt-2 text-3xl font-black text-slate-950">{value}</p>
      </div>
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-100 bg-cyan-50 text-cyan-700">
        <Icon size={20} />
      </span>
    </div>
  </article>
);

const OverviewCard = ({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) => (
  <article className="rounded-2xl border border-slate-200/80 bg-white/85 p-5 shadow-sm backdrop-blur">
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        <h3 className="font-bold text-slate-950">{title}</h3>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      </div>
      <PieChartIcon size={18} className="text-slate-400" />
    </div>
    {children}
  </article>
);

const ChoicePieGrid = ({
  data,
}: {
  data: Record<ChoiceQuestionType, Record<string, number>>;
}) => (
  <div className="grid gap-3 md:grid-cols-3">
    {choiceQuestionTypes.map((type) => (
      <div key={type} className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">
          {choiceTypeLabels[type]}
        </p>
        <PieVisualization data={toChartData(data[type])} heightClass="h-80" />
      </div>
    ))}
  </div>
);

const FormOverviewCard = ({
  form,
  analytics,
  textAnalysis,
  onViewAnalytics,
}: {
  form: FeedbackForm;
  analytics: FeedbackAnalytics;
  textAnalysis: Omit<TextFeedbackAnalysis, 'formId' | 'questions' | 'generatedAt'>;
  onViewAnalytics?: (form: FeedbackForm) => void;
}) => {
  const ratingStats = analytics.questionStats.filter((question) => question.type === 'rating');
  const ratingDistribution = ratingStats.reduce<Record<string, number>>((distribution, question) => {
    Object.entries(question.ratingDistribution ?? {}).forEach(([rating, count]) => {
      distribution[rating] = (distribution[rating] ?? 0) + count;
    });
    return distribution;
  }, {});
  const choiceCounts = analytics.questionStats.reduce<Record<string, number>>((counts, question) => {
    Object.entries(question.optionCounts ?? {}).forEach(([option, count]) => {
      counts[option] = (counts[option] ?? 0) + count;
    });
    return counts;
  }, {});

  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white/85 p-5 shadow-sm backdrop-blur sm:p-6">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h4 className="text-lg font-bold text-slate-950">{form.title}</h4>
          <p className="mt-1 text-sm text-slate-500">
            {analytics.totalResponses} responses · {form.sections.reduce((acc, sec) => acc + sec.questions.length, 0) || analytics.questionStats.length} questions
          </p>
        </div>
        {onViewAnalytics && (
          <button
            type="button"
            onClick={() => onViewAnalytics(form)}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-slate-950 px-3 text-xs font-semibold text-white transition hover:bg-slate-800"
          >
            <BarChart3 size={14} />
            View Question Analytics
          </button>
        )}
      </div>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <MiniPanel title="Rating">
          <BarVisualization data={toChartData(ratingDistribution)} heightClass="h-72" />
        </MiniPanel>
        <MiniPanel title="Choices">
          <PieVisualization
            data={toChartData(choiceCounts)}
            heightClass="h-96"
            legendGridClassName="sm:grid-cols-2"
            legendMaxHeightClass="max-h-40"
          />
        </MiniPanel>
        <MiniPanel title="Text" wide>
          <div className="grid gap-4 lg:grid-cols-2">
            <WordCloud words={textAnalysis.wordFrequencies.slice(0, 18)} />
            <SentimentSummary
              sentiment={textAnalysis.sentiment}
              totalResponses={textAnalysis.totalTextResponses}
            />
          </div>
        </MiniPanel>
      </div>
      <ResponseAnalysisList responses={analytics.responses ?? []} />
    </article>
  );
};

const ResponseAnalysisList = ({
  responses,
}: {
  responses: FeedbackSubmittedResponse[];
}) => {
  if (!responses.length) {
    return (
      <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-5 text-sm font-medium text-slate-500">
        No individual responses have been submitted for this form yet.
      </div>
    );
  }

  return (
    <div className="mt-5 space-y-3">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
        Individual response analysis
      </p>
      {responses.map((response, index) => (
        <details
          key={response.id}
          className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm"
        >
          <summary className="flex cursor-pointer list-none flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span>
              <span className="block text-sm font-black text-slate-950">
                Response #{responses.length - index}
              </span>
              <span className="block text-xs text-slate-500">
                {response.submittedAt
                  ? new Date(response.submittedAt).toLocaleString()
                  : 'Submission time unavailable'}
                {' · '}
                {response.anonymous ? 'Anonymous' : 'Identified'}
              </span>
            </span>
            <span className="grid grid-cols-3 gap-2 text-center text-xs sm:min-w-72">
              <span className="rounded-xl bg-amber-50 px-2 py-2 font-bold text-amber-700">
                {response.analysis.averageRating.toFixed(2)} rating
              </span>
              <span className="rounded-xl bg-emerald-50 px-2 py-2 font-bold text-emerald-700">
                {response.analysis.satisfactionPercentage}% satisfied
              </span>
              <span className="rounded-xl bg-cyan-50 px-2 py-2 font-bold text-cyan-700">
                {response.analysis.textResponseCount} text
              </span>
            </span>
          </summary>

          <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_20rem]">
            <div className="space-y-2">
              {response.analysis.answers.map((answer) => (
                <div
                  key={`${response.id}-${answer.questionId}`}
                  className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-3"
                >
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    {answer.type}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {answer.prompt || answer.questionId}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {formatAnswerValue(answer.displayValue ?? answer.value)}
                  </p>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                Text sentiment
              </p>
              <SentimentSummary
                sentiment={response.analysis.textAnalysis.sentiment}
                totalResponses={response.analysis.textAnalysis.totalTextResponses}
              />
            </div>
          </div>
        </details>
      ))}
    </div>
  );
};

const formatAnswerValue = (value: unknown) => {
  if (Array.isArray(value)) {
    return value.join(', ');
  }
  if (value === null || value === undefined || value === '') {
    return 'No answer';
  }
  return String(value);
};

const MiniPanel = ({
  title,
  children,
  wide,
}: {
  title: string;
  children: React.ReactNode;
  wide?: boolean;
}) => (
  <div className={`min-w-0 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 ${wide ? 'xl:col-span-2' : ''}`}>
    <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">{title}</p>
    {children}
  </div>
);

const BarVisualization = ({
  data,
  heightClass = 'h-72',
}: {
  data: Array<{ name: string; value: number; fill: string }>;
  heightClass?: string;
}) => (
  <div className={`min-w-0 ${heightClass}`}>
    {data.length ? (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 12, bottom: 8, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
          <Tooltip cursor={{ fill: 'rgba(79, 70, 229, 0.08)' }} />
          <Bar dataKey="value" radius={[8, 8, 0, 0]}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    ) : (
      <EmptyViz />
    )}
  </div>
);

const PieVisualization = ({
  data,
  heightClass = 'h-72',
  legendGridClassName,
  legendMaxHeightClass,
}: {
  data: Array<{ name: string; value: number; fill: string }>;
  heightClass?: string;
  legendGridClassName?: string;
  legendMaxHeightClass?: string;
}) => (
  <PieDonutChart
    data={data}
    heightClass={heightClass}
    legendGridClassName={legendGridClassName}
    legendMaxHeightClass={legendMaxHeightClass}
  />
);

const EmptyViz = () => (
  <div className="flex h-full min-h-36 items-center justify-center rounded-xl border border-dashed border-slate-200 text-sm text-slate-400">
    No responses yet
  </div>
);

const toChartData = (source: Record<string, number>) =>
  Object.entries(source)
    .filter(([, value]) => value > 0)
    .map(([name, value], index) => ({
      name,
      value,
      fill: chartColors[index % chartColors.length],
    }));

export default FeedbackAdminPage;
