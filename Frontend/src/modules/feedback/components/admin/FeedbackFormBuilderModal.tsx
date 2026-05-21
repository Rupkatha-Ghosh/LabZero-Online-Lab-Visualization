import { ArrowDown, ArrowUp, GripVertical, Plus, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  FeedbackForm,
  FeedbackFormDraft,
  FeedbackQuestionDraft,
  FeedbackQuestionType,
  FeedbackUserDetails,
} from '../../types/feedback.types';
import {
  createEmptyFormDraft,
  createEmptyQuestion,
  createEmptySection,
  formToDraft,
  reorderItems,
  validateFormDraft,
} from '../../utils/feedbackAdmin';

interface FeedbackFormBuilderModalProps {
  open: boolean;
  form?: FeedbackForm | null;
  currentUser?: FeedbackUserDetails;
  isSaving?: boolean;
  onClose: () => void;
  onSave: (draft: FeedbackFormDraft) => Promise<void>;
}

const questionTypes: FeedbackQuestionType[] = [
  'text',
  'rating',
  'checkbox',
  'radio',
  'dropdown',
];

const FeedbackFormBuilderModal = ({
  open,
  form,
  currentUser,
  isSaving,
  onClose,
  onSave,
}: FeedbackFormBuilderModalProps) => {
  const [draft, setDraft] = useState<FeedbackFormDraft>(() =>
    createEmptyFormDraft(currentUser)
  );
  const [errors, setErrors] = useState<string[]>([]);
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setDraft(form ? formToDraft(form, currentUser) : createEmptyFormDraft(currentUser));
    setErrors([]);
    setActiveSectionIndex(0);
  }, [currentUser, form, open]);

  if (!open) {
    return null;
  }

  const activeSection = draft.sections[activeSectionIndex];

  const saveForm = async () => {
    const nextErrors = validateFormDraft(draft);
    setErrors(nextErrors);

    if (nextErrors.length > 0) {
      return;
    }

    await onSave(draft);
  };

  const updateDraft = (patch: Partial<FeedbackFormDraft>) => {
    setDraft((current) => ({ ...current, ...patch }));
  };

  const updateActiveSection = (patch: Partial<typeof activeSection>) => {
    setDraft((current) => ({
      ...current,
      sections: current.sections.map((section, index) =>
        index === activeSectionIndex ? { ...section, ...patch } : section
      ),
    }));
  };

  const updateQuestion = (
    questionIndex: number,
    patch: Partial<FeedbackQuestionDraft>
  ) => {
    updateActiveSection({
      questions: activeSection.questions.map((question, index) =>
        index === questionIndex ? normalizeQuestion({ ...question, ...patch }) : question
      ),
    });
  };

  const addQuestion = () => {
    if (activeSection.questions.length >= 5) {
      setErrors([`${activeSection.title} already has the maximum 5 questions.`]);
      return;
    }

    updateActiveSection({
      questions: [
        ...activeSection.questions,
        createEmptyQuestion('text', activeSection.questions.length),
      ],
    });
  };

  const removeQuestion = (questionIndex: number) => {
    if (activeSection.questions.length <= 3) {
      setErrors([`${activeSection.title} must keep at least 3 questions.`]);
      return;
    }

    updateActiveSection({
      questions: activeSection.questions.filter((_, index) => index !== questionIndex),
    });
  };

  const reorderQuestion = (toIndex: number) => {
    if (dragIndex === null || dragIndex === toIndex) {
      return;
    }

    moveQuestion(dragIndex, toIndex);
    setDragIndex(null);
  };

  const moveQuestion = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || toIndex < 0 || toIndex >= activeSection.questions.length) {
      return;
    }

    updateActiveSection({
      questions: reorderItems(activeSection.questions, fromIndex, toIndex),
    });
  };

  return (
    <div className="fixed inset-0 z-[240] flex items-end justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:items-center">
      <div className="flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">
              {form ? 'Edit feedback form' : 'Create feedback form'}
            </p>
            <h2 className="mt-1 text-2xl font-black text-slate-950">
              Form Builder
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close form builder"
          >
            <X size={20} />
          </button>
        </header>

        <div className="grid min-h-0 flex-1 overflow-hidden lg:grid-cols-[280px_1fr]">
          <aside className="overflow-y-auto border-b border-slate-200 bg-slate-50 p-4 lg:border-b-0 lg:border-r">
            <button
              type="button"
              onClick={() =>
                setDraft((current) => ({
                  ...current,
                  sections: [...current.sections, createEmptySection(current.sections.length)],
                }))
              }
              className="mb-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <Plus size={16} />
              Add section
            </button>

            <div className="space-y-2">
              {draft.sections.map((section, index) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSectionIndex(index)}
                  className={`w-full rounded-2xl border p-3 text-left transition ${
                    index === activeSectionIndex
                      ? 'border-indigo-300 bg-white shadow-sm'
                      : 'border-slate-200 bg-white/60 hover:bg-white'
                  }`}
                >
                  <p className="font-semibold text-slate-950">{section.title}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {section.questions.length} questions
                  </p>
                </button>
              ))}
            </div>
          </aside>

          <div className="min-h-0 overflow-y-auto p-4 sm:p-5">
            <div className="grid gap-3 md:grid-cols-2">
              <TextInput
                label="Title"
                value={draft.title}
                onChange={(value) => updateDraft({ title: value })}
              />
              <SelectInput
                label="Status"
                value={draft.status}
                options={['draft', 'published', 'closed']}
                onChange={(value) =>
                  updateDraft({
                    status: value as 'draft' | 'published' | 'closed',
                  })
                }
              />
              <TextInput
                label="Classroom"
                value={draft.classroomCourseMetadata.classroomName ?? ''}
                onChange={(value) =>
                  updateDraft({
                    classroomCourseMetadata: {
                      ...draft.classroomCourseMetadata,
                      classroomName: value,
                    },
                  })
                }
              />
              <TextInput
                label="Department"
                value={draft.classroomCourseMetadata.subject ?? ''}
                onChange={(value) =>
                  updateDraft({
                    classroomCourseMetadata: {
                      ...draft.classroomCourseMetadata,
                      subject: value,
                    },
                  })
                }
              />
              <label className="md:col-span-2">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Description
                </span>
                <textarea
                  value={draft.description ?? ''}
                  onChange={(event) => updateDraft({ description: event.target.value })}
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15"
                />
              </label>
            </div>

            {activeSection && (
              <section className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-4 grid gap-3 md:grid-cols-2">
                  <TextInput
                    label="Section title"
                    value={activeSection.title}
                    onChange={(value) => updateActiveSection({ title: value })}
                  />
                  <TextInput
                    label="Section description"
                    value={activeSection.description ?? ''}
                    onChange={(value) => updateActiveSection({ description: value })}
                  />
                </div>

                <div className="space-y-3">
                  {activeSection.questions.map((question, questionIndex) => (
                    <QuestionEditor
                      key={question.id}
                      question={question}
                      index={questionIndex}
                      onDragStart={() => setDragIndex(questionIndex)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={() => reorderQuestion(questionIndex)}
                      onMoveUp={() =>
                        moveQuestion(questionIndex, questionIndex - 1)
                      }
                      onMoveDown={() =>
                        moveQuestion(questionIndex, questionIndex + 1)
                      }
                      onChange={(patch) => updateQuestion(questionIndex, patch)}
                      onDelete={() => removeQuestion(questionIndex)}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addQuestion}
                  className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <Plus size={16} />
                  Add question
                </button>
              </section>
            )}

            {errors.length > 0 && (
              <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                {errors.map((error) => (
                  <p key={error}>{error}</p>
                ))}
              </div>
            )}
          </div>
        </div>

        <footer className="flex flex-col-reverse gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="h-11 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={saveForm}
            disabled={isSaving}
            className="h-11 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? 'Saving...' : 'Save form'}
          </button>
        </footer>
      </div>
    </div>
  );
};

const QuestionEditor = ({
  question,
  index,
  onChange,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
  onMoveUp,
  onMoveDown,
}: {
  question: FeedbackQuestionDraft;
  index: number;
  onChange: (patch: Partial<FeedbackQuestionDraft>) => void;
  onDelete: () => void;
  onDragStart: () => void;
  onDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  onDrop: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) => (
  <div
    draggable
    onDragStart={onDragStart}
    onDragOver={onDragOver}
    onDrop={onDrop}
    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
  >
    <div className="mb-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
        <GripVertical size={16} className="text-slate-400" />
        Question {index + 1}
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onMoveUp}
          className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100"
          aria-label="Move question up"
        >
          <ArrowUp size={16} />
        </button>
        <button
          type="button"
          onClick={onMoveDown}
          className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100"
          aria-label="Move question down"
        >
          <ArrowDown size={16} />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="rounded-xl p-2 text-rose-500 transition hover:bg-rose-50"
          aria-label="Delete question"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>

    <div className="grid gap-3 md:grid-cols-[1fr_180px]">
      <TextInput
        label="Prompt"
        value={question.prompt}
        onChange={(value) => onChange({ prompt: value })}
      />
      <SelectInput
        label="Type"
        value={question.type}
        options={questionTypes}
        onChange={(value) => onChange({ type: value as FeedbackQuestionType })}
      />
    </div>

    {question.type === 'rating' && (
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <TextInput
          label="Min rating"
          type="number"
          value={String(question.minRating ?? 1)}
          onChange={(value) => onChange({ minRating: Number(value) })}
        />
        <TextInput
          label="Max rating"
          type="number"
          value={String(question.maxRating ?? 5)}
          onChange={(value) => onChange({ maxRating: Number(value) })}
        />
      </div>
    )}

    {['checkbox', 'radio', 'dropdown'].includes(question.type) && (
      <div className="mt-3 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Options
        </p>
        {question.options.map((option, optionIndex) => (
          <input
            key={`${question.id}-${optionIndex}`}
            value={option.label}
            onChange={(event) => {
              const options = question.options.map((item, index) =>
                index === optionIndex
                  ? {
                      label: event.target.value,
                      value: event.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, '_')
                        .replace(/^_|_$/g, ''),
                    }
                  : item
              );
              onChange({ options });
            }}
            className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15"
          />
        ))}
        <button
          type="button"
          onClick={() =>
            onChange({
              options: [
                ...question.options,
                {
                  label: `Option ${question.options.length + 1}`,
                  value: `option_${question.options.length + 1}`,
                },
              ],
            })
          }
          className="text-sm font-semibold text-indigo-600"
        >
          Add option
        </button>
      </div>
    )}
  </div>
);

const TextInput = ({
  label,
  value,
  type = 'text',
  onChange,
}: {
  label: string;
  value: string;
  type?: string;
  onChange: (value: string) => void;
}) => (
  <label>
    <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
      {label}
    </span>
    <input
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15"
    />
  </label>
);

const SelectInput = ({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) => (
  <label>
    <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
      {label}
    </span>
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm capitalize outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15"
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  </label>
);

const normalizeQuestion = (
  question: FeedbackQuestionDraft
): FeedbackQuestionDraft => {
  if (question.type === 'rating') {
    return {
      ...question,
      options: [],
      minRating: question.minRating ?? 1,
      maxRating: question.maxRating ?? 5,
    };
  }

  if (['checkbox', 'radio', 'dropdown'].includes(question.type)) {
    return {
      ...question,
      options:
        question.options.length >= 2
          ? question.options
          : [
              { label: 'Option 1', value: 'option_1' },
              { label: 'Option 2', value: 'option_2' },
            ],
      minRating: undefined,
      maxRating: undefined,
    };
  }

  return {
    ...question,
    options: [],
    minRating: undefined,
    maxRating: undefined,
  };
};

export default FeedbackFormBuilderModal;
