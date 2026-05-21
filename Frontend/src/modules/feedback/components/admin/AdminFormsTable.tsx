import {
  BarChart3,
  Edit3,
  Eye,
  Loader2,
  Power,
  Trash2,
} from 'lucide-react';
import { FeedbackForm } from '../../types/feedback.types';

interface AdminFormsTableProps {
  forms: FeedbackForm[];
  isLoading: boolean;
  isMutating: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onEdit: (form: FeedbackForm) => void;
  onDelete: (form: FeedbackForm) => void;
  onStatusChange: (
    form: FeedbackForm,
    status: 'draft' | 'published' | 'closed'
  ) => void;
  onViewAnalytics: (form: FeedbackForm) => void;
}

const AdminFormsTable = ({
  forms,
  isLoading,
  isMutating,
  page,
  totalPages,
  onPageChange,
  onEdit,
  onDelete,
  onStatusChange,
  onViewAnalytics,
}: AdminFormsTableProps) => (
  <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/85 shadow-sm backdrop-blur">
    <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
      <h2 className="font-bold text-slate-950">Feedback forms</h2>
      {(isLoading || isMutating) && (
        <Loader2 size={18} className="animate-spin text-indigo-600" />
      )}
    </div>

    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3">Form</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Classroom</th>
            <th className="px-4 py-3">Questions</th>
            <th className="px-4 py-3">Updated</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {forms.map((form) => {
            const questionCount = form.sections.reduce(
              (sum, section) => sum + section.questions.length,
              0
            );

            return (
              <tr key={form._id} className="hover:bg-slate-50/80">
                <td className="px-4 py-4">
                  <p className="font-semibold text-slate-950">{form.title}</p>
                  <p className="mt-1 max-w-sm truncate text-xs text-slate-500">
                    {form.description || 'No description'}
                  </p>
                </td>
                <td className="px-4 py-4">
                  <StatusSelect
                    status={form.status ?? 'draft'}
                    onChange={(status) => onStatusChange(form, status)}
                  />
                </td>
                <td className="px-4 py-4 text-slate-600">
                  {form.classroomCourseMetadata?.classroomName ||
                    form.classroomCourseMetadata?.courseName ||
                    'All classrooms'}
                </td>
                <td className="px-4 py-4 text-slate-600">{questionCount}</td>
                <td className="px-4 py-4 text-slate-500">
                  {form.endsAt ? new Date(form.endsAt).toLocaleDateString() : 'Open'}
                </td>
                <td className="px-4 py-4">
                  <div className="flex justify-end gap-2">
                    <IconButton label="Edit" onClick={() => onEdit(form)} icon={Edit3} />
                    <IconButton
                      label="Analytics"
                      onClick={() => onViewAnalytics(form)}
                      icon={BarChart3}
                    />
                    <IconButton
                      label="Preview"
                      onClick={() => window.open(`?feedbackFormId=${form._id}`, '_blank')}
                      icon={Eye}
                    />
                    <IconButton
                      label="Delete"
                      onClick={() => onDelete(form)}
                      icon={Trash2}
                      danger
                    />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>

    {forms.length === 0 && !isLoading && (
      <div className="flex min-h-48 items-center justify-center text-sm text-slate-500">
        No feedback forms found.
      </div>
    )}

    <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-500">
        Page {page} of {Math.max(totalPages, 1)}
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(page - 1, 1))}
          disabled={page <= 1}
          className="h-9 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={() => onPageChange(Math.min(page + 1, totalPages))}
          disabled={page >= totalPages}
          className="h-9 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  </section>
);

const StatusSelect = ({
  status,
  onChange,
}: {
  status: 'draft' | 'published' | 'closed';
  onChange: (status: 'draft' | 'published' | 'closed') => void;
}) => (
  <label className="inline-flex items-center gap-2">
    <Power size={14} className="text-slate-400" />
    <select
      value={status}
      onChange={(event) =>
        onChange(event.target.value as 'draft' | 'published' | 'closed')
      }
      className="h-9 rounded-xl border border-slate-200 bg-white px-2 text-xs font-semibold capitalize text-slate-700 outline-none"
    >
      <option value="draft">Draft</option>
      <option value="published">Published</option>
      <option value="closed">Closed</option>
    </select>
  </label>
);

const IconButton = ({
  label,
  icon: Icon,
  danger,
  onClick,
}: {
  label: string;
  icon: typeof Edit3;
  danger?: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    title={label}
    className={`flex h-9 w-9 items-center justify-center rounded-xl border transition ${
      danger
        ? 'border-rose-200 text-rose-600 hover:bg-rose-50'
        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
    }`}
  >
    <Icon size={16} />
  </button>
);

export default AdminFormsTable;
