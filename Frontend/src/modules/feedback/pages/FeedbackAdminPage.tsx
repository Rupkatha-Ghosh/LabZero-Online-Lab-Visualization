import { AlertCircle, FilePlus2, LayoutDashboard, Loader2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import AdminFilterBar from '../components/admin/AdminFilterBar';
import AdminFormsTable from '../components/admin/AdminFormsTable';
import FeedbackFormBuilderModal from '../components/admin/FeedbackFormBuilderModal';
import FeedbackPageShell from '../components/common/FeedbackPageShell';
import FeedbackSkeleton from '../components/common/FeedbackSkeleton';
import { useFeedbackAdmin } from '../hooks/useFeedbackAdmin';
import {
  FeedbackAdminListQuery,
  FeedbackForm,
  FeedbackFormDraft,
} from '../types/feedback.types';

const FeedbackAdminPage = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [query, setQuery] = useState<FeedbackAdminListQuery>({
    page: 1,
    limit: 10,
  });
  const [editingForm, setEditingForm] = useState<FeedbackForm | null>(null);
  const [builderOpen, setBuilderOpen] = useState(false);
  const admin = useFeedbackAdmin(query);

  const canAdmin = Boolean(
    user?.role === 'teacher' ||
      user?.role === 'institute' ||
      user?.is_staff ||
      user?.is_superuser
  );
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
  };

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
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <FilePlus2 size={17} />
              Create form
            </button>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <SummaryCard label="Forms" value={admin.pagination.total} />
          <SummaryCard
            label="Current page"
            value={`${admin.pagination.page}/${Math.max(admin.pagination.totalPages, 1)}`}
          />
          <SummaryCard
            label="Visible rows"
            value={admin.forms.length}
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
              void admin.deleteForm(form);
            }
          }}
          onStatusChange={(form, status) => void admin.updateStatus(form, status)}
          onViewAnalytics={(form) => {
            window.location.href = `?analyticsFormId=${form._id}`;
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
        You need an institute or staff account to manage feedback forms.
      </p>
    </div>
  </div>
);

export default FeedbackAdminPage;
