import {
  AlertCircle,
  ArrowLeft,
  BarChart3,
  BookOpenCheck,
  CheckCircle2,
  CheckSquare,
  FileText,
  LayoutDashboard,
  ListChecks,
  Loader2,
  Radio,
  Send,
  Star,
  Users,
  Video,
} from 'lucide-react';
import { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { User, UserRole } from '../../../types/types';
import FeedbackPageShell from '../components/common/FeedbackPageShell';
import { getFeedbackApiError, submitSiteFeedback } from '../services/feedbackApi';

interface SiteFeedbackPageProps {
  user: User | null;
  theme: 'dark' | 'light';
  canManageFeedback: boolean;
  onBack: () => void;
  onLogin: () => void;
  onManageFeedback: () => void;
}

const platformFeatures = [
  { label: 'Classroom management', icon: Users },
  { label: 'Notes and PDF sharing', icon: FileText },
  { label: 'Assignment distribution', icon: CheckSquare },
  { label: 'Student-teacher interaction', icon: BookOpenCheck },
  { label: 'Online live class integration', icon: Video },
  { label: 'Feedback collection and analysis', icon: BarChart3 },
];

type RoleFeedbackConfig = {
  badge: string;
  title: string;
  description: string;
  fields: {
    course: { label: string; placeholder: string };
    classroom: { label: string; placeholder: string };
    teacher: { label: string; placeholder: string };
    session: { label: string; placeholder: string };
  };
  feedbackAreas: string[];
  usageSteps: string[];
};

const roleFeedbackConfig: Record<UserRole, RoleFeedbackConfig> = {
  student: {
    badge: 'Student Feedback',
    title: 'Student learning feedback',
    description:
      'Share feedback about your course, teacher, live class, resources, assignments, and overall learning experience.',
    fields: {
      course: { label: 'Course', placeholder: 'Example: Physics' },
      classroom: { label: 'Classroom', placeholder: 'Example: Class 11 A' },
      teacher: { label: 'Teacher', placeholder: 'Teacher name' },
      session: { label: 'Session', placeholder: 'Example: Live class / Lab session' },
    },
    feedbackAreas: [
      'Platform usability',
      'Teaching effectiveness',
      'Classroom experience',
      'System performance',
    ],
    usageSteps: [
      'Login/Register with a student account.',
      'Open the feedback page from the floating feedback button or Dashboard -> Feedback.',
      'Select Course, Classroom, Teacher, and Session.',
      'Answer learning experience, rating, checkbox, radio, and text feedback questions.',
      'Submit feedback for teacher and platform improvement.',
    ],
  },
  teacher: {
    badge: 'Teacher Feedback',
    title: 'Teacher workflow feedback',
    description:
      'Share feedback about classroom management, resource delivery, student interaction, assignments, and live teaching tools.',
    fields: {
      course: { label: 'Course / Subject', placeholder: 'Example: Chemistry' },
      classroom: { label: 'Classroom handled', placeholder: 'Example: Class 12 B' },
      teacher: { label: 'Student group', placeholder: 'Example: Batch A / Section 2' },
      session: { label: 'Teaching session', placeholder: 'Example: Weekly live lecture' },
    },
    feedbackAreas: [
      'Classroom management',
      'Resource sharing workflow',
      'Student interaction',
      'Live class performance',
    ],
    usageSteps: [
      'Login/Register with a teacher account.',
      'Open the feedback page from the floating feedback button or Dashboard -> Feedback.',
      'Select Course, Classroom, Student Group, and Teaching Session.',
      'Answer workflow, resource sharing, live class, and interaction feedback questions.',
      'Submit feedback for institute and platform improvement.',
    ],
  },
  institute: {
    badge: 'Institute Feedback',
    title: 'Institute management feedback',
    description:
      'Share feedback about department operations, classroom analytics, teacher coordination, system performance, and platform adoption.',
    fields: {
      course: { label: 'Department / Program', placeholder: 'Example: Science Department' },
      classroom: { label: 'Classroom / Cohort', placeholder: 'Example: Senior Secondary' },
      teacher: { label: 'Coordinator / Teacher', placeholder: 'Coordinator or teacher name' },
      session: { label: 'Review period', placeholder: 'Example: May 2026' },
    },
    feedbackAreas: [
      'Academic operations',
      'Teacher coordination',
      'Analytics dashboard',
      'System scalability',
    ],
    usageSteps: [
      'Login/Register with an institute account.',
      'Open the feedback page from the floating feedback button or Dashboard -> Feedback.',
      'Select Department, Classroom/Cohort, Coordinator, and Review Period.',
      'Answer operations, analytics, coordination, and system performance questions.',
      'Submit feedback for platform planning and institutional reporting.',
    ],
  },
};

const questionTypes = [
  { label: 'Text Feedback', icon: FileText },
  { label: 'Rating Scale', icon: Star },
  { label: 'Checkbox Questions', icon: CheckSquare },
  { label: 'Radio Questions', icon: Radio },
  { label: 'Dropdown Questions', icon: ListChecks },
];

const SiteFeedbackPage = ({
  user,
  theme,
  canManageFeedback,
  onBack,
  onLogin,
  onManageFeedback,
}: SiteFeedbackPageProps) => {
  const feedbackRole = user?.role ?? 'student';
  const roleConfig = roleFeedbackConfig[feedbackRole];
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [feedbackType, setFeedbackType] = useState(roleConfig.feedbackAreas[0]);
  const [selectedAreas, setSelectedAreas] = useState<string[]>(roleConfig.feedbackAreas);
  const [course, setCourse] = useState('');
  const [classroom, setClassroom] = useState('');
  const [teacher, setTeacher] = useState('');
  const [session, setSession] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [error, setError] = useState('Could not submit feedback. Please try again.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isLight = theme === 'light';

  const inputClass = `mt-2 w-full rounded-2xl border px-4 py-3 text-sm outline-none transition focus:ring-2 ${
    isLight
      ? 'border-slate-200 bg-white text-slate-950 placeholder:text-slate-400 focus:border-indigo-400 focus:ring-indigo-100'
      : 'border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus:border-cyan-300/60 focus:ring-cyan-300/15'
  }`;

  useEffect(() => {
    setFeedbackType(roleConfig.feedbackAreas[0]);
    setSelectedAreas(roleConfig.feedbackAreas);
  }, [feedbackRole, roleConfig.feedbackAreas]);

  const toggleArea = (area: string) => {
    setSelectedAreas((current) =>
      current.includes(area)
        ? current.filter((item) => item !== area)
        : [...current, area]
    );
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user) {
      onLogin();
      return;
    }

    setIsSubmitting(true);
    setStatus('idle');

    try {
      const structuredComment = [
        `Feedback Category: ${roleConfig.badge}`,
        `User Role: ${feedbackRole}`,
        `Feedback Type: ${feedbackType}`,
        `${roleConfig.fields.course.label}: ${course || 'Not specified'}`,
        `${roleConfig.fields.classroom.label}: ${classroom || 'Not specified'}`,
        `${roleConfig.fields.teacher.label}: ${teacher || 'Not specified'}`,
        `${roleConfig.fields.session.label}: ${session || 'Not specified'}`,
        `Covered Areas: ${selectedAreas.length ? selectedAreas.join(', ') : 'Not specified'}`,
        `Comment: ${comment.trim() || 'No written comment provided.'}`,
      ].join('\n');

      await submitSiteFeedback({
        rating,
        comment: structuredComment,
      });
      setStatus('success');
      setComment('');
    } catch (submitError) {
      setError(getFeedbackApiError(submitError));
      setStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FeedbackPageShell tone="cyan">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white/85 px-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-white"
          >
            <ArrowLeft size={16} />
            Back
          </button>

          {canManageFeedback && (
            <button
              type="button"
              onClick={onManageFeedback}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              <LayoutDashboard size={16} />
              Manage forms
            </button>
          )}
        </div>

        <section className="flex flex-col gap-5">
          <article className="rounded-3xl border border-slate-200/80 bg-white/85 p-6 shadow-sm backdrop-blur sm:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-600">
              Name of the Project
            </p>
            <h1 className="mt-3 text-4xl font-black text-slate-950 sm:text-5xl">
              LABZERO
            </h1>
            <p className="mt-3 text-lg font-bold text-slate-800">
              Intelligent Collaborative Learning & Virtual Classroom Platform
            </p>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              LabZero is a modern educational collaboration platform designed
              to bridge the gap between traditional classroom learning and
              digital education systems. It creates a centralized ecosystem
              for digital learning, communication, live classrooms, academic
              tools, and feedback analytics.
            </p>

            {!user && (
              <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Please sign in before submitting feedback.
              </div>
            )}
          </article>

          <article className="rounded-3xl border border-slate-200/80 bg-white/85 p-5 shadow-sm backdrop-blur">
            <h2 className="text-lg font-black text-slate-950">
              Platform Framework
            </h2>
            <div className="mt-4 flex flex-col gap-3">
              {platformFeatures.map((feature) => (
                <div
                  key={feature.label}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-3 py-3"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
                    <feature.icon size={18} />
                  </span>
                  <span className="text-sm font-semibold text-slate-700">
                    {feature.label}
                  </span>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-3xl border border-slate-200/80 bg-white/85 p-5 shadow-sm backdrop-blur">
            <h2 className="text-lg font-black text-slate-950">
              Unique Selling Proposition
            </h2>
            <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
              <p>
                LabZero combines collaborative learning, virtual classroom
                interaction, analytics, and intelligent feedback management
                within a single educational platform.
              </p>
              <p>
                The feedback module collects multiple forms of feedback,
                stores them dynamically, and generates graphical analytical
                reports for better understanding.
              </p>
              <p>
                The architecture is designed around React, TypeScript, API
                services, and WebSocket/WebRTC-ready live interaction flows.
              </p>
            </div>
          </article>

          <form
            onSubmit={handleSubmit}
            className={`rounded-3xl border p-5 shadow-sm backdrop-blur sm:p-6 ${
              isLight
                ? 'border-slate-200/80 bg-white/90 text-slate-950'
                : 'border-slate-700/70 bg-slate-950/90 text-slate-50'
            }`}
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">
                {roleConfig.badge}
              </p>
              <h2 className="mt-2 text-2xl font-black">{roleConfig.title}</h2>
              <p className={`mt-2 text-sm leading-6 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                {roleConfig.description}
              </p>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="feedback-course" className={`text-sm font-semibold ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>
                  {roleConfig.fields.course.label}
                </label>
                <input
                  id="feedback-course"
                  value={course}
                  onChange={(event) => setCourse(event.target.value)}
                  placeholder={roleConfig.fields.course.placeholder}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="feedback-classroom" className={`text-sm font-semibold ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>
                  {roleConfig.fields.classroom.label}
                </label>
                <input
                  id="feedback-classroom"
                  value={classroom}
                  onChange={(event) => setClassroom(event.target.value)}
                  placeholder={roleConfig.fields.classroom.placeholder}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="feedback-teacher" className={`text-sm font-semibold ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>
                  {roleConfig.fields.teacher.label}
                </label>
                <input
                  id="feedback-teacher"
                  value={teacher}
                  onChange={(event) => setTeacher(event.target.value)}
                  placeholder={roleConfig.fields.teacher.placeholder}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="feedback-session" className={`text-sm font-semibold ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>
                  {roleConfig.fields.session.label}
                </label>
                <input
                  id="feedback-session"
                  value={session}
                  onChange={(event) => setSession(event.target.value)}
                  placeholder={roleConfig.fields.session.placeholder}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="mt-5">
              <label className={`text-sm font-semibold ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>
                Feedback focus
              </label>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {roleConfig.feedbackAreas.map((area) => (
                  <button
                    key={area}
                    type="button"
                    onClick={() => setFeedbackType(area)}
                    className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
                      feedbackType === area
                        ? 'border-indigo-500 bg-indigo-600 text-white'
                        : isLight
                          ? 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-white'
                          : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    {area}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <label className={`text-sm font-semibold ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>
                Areas covered
              </label>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {roleConfig.feedbackAreas.map((area) => (
                  <label
                    key={area}
                    className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                      selectedAreas.includes(area)
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                        : isLight
                          ? 'border-slate-200 bg-white text-slate-600'
                          : 'border-white/10 bg-white/5 text-slate-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedAreas.includes(area)}
                      onChange={() => toggleArea(area)}
                      className="h-4 w-4 rounded border-slate-300 text-emerald-600"
                    />
                    {area}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label
                className={`text-sm font-semibold ${
                  isLight ? 'text-slate-700' : 'text-slate-200'
                }`}
              >
                Overall rating
              </label>
              <div className="mt-3 flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    aria-label={`Rate ${value} out of 5`}
                    className={`flex h-11 w-11 items-center justify-center rounded-xl border transition ${
                      value <= rating
                        ? 'border-amber-400 bg-amber-400 text-slate-950'
                        : isLight
                          ? 'border-slate-200 bg-slate-50 text-slate-400 hover:text-amber-500'
                          : 'border-white/10 bg-white/5 text-slate-500 hover:text-amber-300'
                    }`}
                  >
                    <Star
                      size={19}
                      fill={value <= rating ? 'currentColor' : 'none'}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <label
                htmlFor="site-feedback-comment"
                className={`text-sm font-semibold ${
                  isLight ? 'text-slate-700' : 'text-slate-200'
                }`}
              >
                Feedback
              </label>
              <textarea
                id="site-feedback-comment"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                rows={7}
                placeholder="Tell us what worked well or what should be improved."
                className={`mt-2 w-full resize-none rounded-2xl border px-4 py-3 text-sm outline-none transition focus:ring-2 ${
                  isLight
                    ? 'border-slate-200 bg-white text-slate-950 placeholder:text-slate-400 focus:border-indigo-400 focus:ring-indigo-100'
                    : 'border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus:border-cyan-300/60 focus:ring-cyan-300/15'
                }`}
              />
            </div>

            {status === 'success' && (
              <div className="mt-5 flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                <CheckCircle2 size={17} />
                Feedback submitted. Thank you.
              </div>
            )}

            {status === 'error' && (
              <div className="mt-5 flex items-center gap-2 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                <AlertCircle size={17} />
                {error}
              </div>
            )}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              {!user && (
                <button
                  type="button"
                  onClick={onLogin}
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Sign in
                </button>
              )}
              <button
                type="submit"
                disabled={!user || isSubmitting}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
                Submit feedback
              </button>
            </div>
          </form>
        </section>

        <section className="mt-5 flex flex-col gap-5">
          <article className="rounded-3xl border border-slate-200/80 bg-white/85 p-5 shadow-sm backdrop-blur">
            <h2 className="text-lg font-black text-slate-950">
              Instruction / Manual / Demo
            </h2>
            <div className="mt-4 space-y-3">
              {roleConfig.usageSteps.map((step, index) => (
                <div key={step} className="flex gap-3 rounded-2xl bg-slate-50/80 px-3 py-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-xs font-black text-white">
                    {index + 1}
                  </span>
                  <p className="text-sm font-medium text-slate-700">{step}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-3xl border border-slate-200/80 bg-white/85 p-5 shadow-sm backdrop-blur">
            <h2 className="text-lg font-black text-slate-950">
              Supported Question Types
            </h2>
            <div className="mt-4 flex flex-col gap-3">
              {questionTypes.map((questionType) => (
                <div
                  key={questionType.label}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-3 py-3"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700">
                    <questionType.icon size={18} />
                  </span>
                  <span className="text-sm font-semibold text-slate-700">
                    {questionType.label}
                  </span>
                </div>
              ))}
            </div>
          </article>
        </section>
      </div>
    </FeedbackPageShell>
  );
};

export default SiteFeedbackPage;
