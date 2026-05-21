import React from 'react';
import {
  Award,
  BarChart3,
  BookOpenCheck,
  CalendarCheck,
  Flame,
  Medal,
  Target,
  Trophy,
  Users,
  Zap,
} from 'lucide-react';
import { SubjectId } from '../../types/types';
import { safeLocalStorage } from '../../utils/safeStorage';

type LeaderboardTheme = 'dark' | 'light';
type LeaderboardMode = 'student' | 'teacher' | 'institute';

interface DashboardLeaderboardProps {
  mode: LeaderboardMode;
  theme?: LeaderboardTheme;
  classes?: any[];
  currentUser?: any;
  topicMetrics?: LeaderboardTopicMetric[];
}

interface LeaderboardStudent {
  id: string;
  name: string;
  className: string;
  attendance: number;
  streak: number;
  challengeXp: number;
  labs: number;
  tasks: number;
  score: number;
}

interface LeaderboardTopicMetric {
  id: string;
  name: string;
  accent: string;
  streak: number;
  xp: number;
  cleared: number;
  progress?: number;
}

const subjects = [
  { id: SubjectId.PHYSICS, name: 'Physics', accent: 'bg-sky-400' },
  { id: SubjectId.CHEMISTRY, name: 'Chemistry', accent: 'bg-cyan-400' },
  { id: SubjectId.MATH, name: 'Mathematics', accent: 'bg-violet-400' },
  { id: SubjectId.BIOLOGY, name: 'Biology', accent: 'bg-emerald-400' },
];

const fallbackStudents = [
  { id: 'sample-1', first_name: 'Aarav', last_name: 'Sharma', username: 'aarav' },
  { id: 'sample-2', first_name: 'Maya', last_name: 'Banerjee', username: 'maya' },
  { id: 'sample-3', first_name: 'Rohan', last_name: 'Iyer', username: 'rohan' },
  { id: 'sample-4', first_name: 'Sara', last_name: 'Khan', username: 'sara' },
];

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const getTodayKey = () => new Date().toISOString().slice(0, 10);

const getName = (student: any, index: number) => {
  const fullName = `${student?.first_name || ''} ${student?.last_name || ''}`.trim();
  return fullName || student?.name || student?.username || `Student ${index + 1}`;
};

const readJson = <T,>(key: string, fallback: T): T => {
  try {
    const value = safeLocalStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const getLocalChallengeStats = () => {
  let bestStreak = 0;
  let xp = 0;
  let attempted = 0;
  let cleared = 0;

  for (let index = 0; index < safeLocalStorage.length; index += 1) {
    const key = safeLocalStorage.key(index) || '';

    if (key.startsWith('labzero_daily_streak_')) {
      const streak = readJson<{ count?: number }>(key, {});
      bestStreak = Math.max(bestStreak, Number(streak.count || 0));
    }

    if (key.startsWith('labzero_daily_challenges_') && key.endsWith(getTodayKey())) {
      const progress = readJson<{ selected?: Record<string, string>; completed?: Record<string, boolean> }>(key, {});
      const selectedCount = Object.keys(progress.selected || {}).length;
      const clearedCount = Object.values(progress.completed || {}).filter(Boolean).length;
      attempted += selectedCount;
      cleared += clearedCount;
      xp += selectedCount * 8 + clearedCount * 12;
    }
  }

  return { bestStreak, xp, attempted, cleared };
};

const getSubjectStats = (subjectId: SubjectId) => {
  let streak = 0;
  let xp = 0;
  let cleared = 0;

  for (let index = 0; index < safeLocalStorage.length; index += 1) {
    const key = safeLocalStorage.key(index) || '';

    if (key.startsWith(`labzero_daily_streak_${subjectId}_`)) {
      const value = readJson<{ count?: number }>(key, {});
      streak = Math.max(streak, Number(value.count || 0));
    }

    if (key.startsWith(`labzero_daily_challenges_${subjectId}_`) && key.endsWith(getTodayKey())) {
      const progress = readJson<{ selected?: Record<string, string>; completed?: Record<string, boolean> }>(key, {});
      const selectedCount = Object.keys(progress.selected || {}).length;
      const clearedCount = Object.values(progress.completed || {}).filter(Boolean).length;
      cleared += clearedCount;
      xp += selectedCount * 8 + clearedCount * 12;
    }
  }

  return { streak, xp, cleared };
};

const buildRows = (classes: any[], currentUser: any, mode: LeaderboardMode): LeaderboardStudent[] => {
  const localStats = getLocalChallengeStats();
  const classroomRows = classes.flatMap((classroom, classIndex) => {
    const students = Array.isArray(classroom?.students) ? classroom.students : [];
    return students.map((student: any, studentIndex: number) => {
      const seed = classIndex * 7 + studentIndex;
      const attendance = clamp(Number(student?.attendance ?? student?.attendanceRate ?? 82 + (seed % 17)), 70, 99);
      const streak = Number(student?.streak ?? student?.dailyChallengeStreak ?? 5 + (seed % 21));
      const challengeXp = Number(student?.challengeXp ?? student?.xp ?? 120 + seed * 18);
      const labs = Number(student?.labs ?? student?.completedLabs ?? 8 + (seed % 16));
      const tasks = Number(student?.tasks ?? student?.activeTasks ?? classroom?.assignments?.length ?? 0);
      const score = Math.round(attendance * 0.34 + streak * 1.5 + challengeXp * 0.12 + labs * 1.8 + tasks * 2);

      return {
        id: String(student?.id || `${classroom?.id || classIndex}-${studentIndex}`),
        name: getName(student, studentIndex),
        className: classroom?.name || 'LabZero Classroom',
        attendance,
        streak,
        challengeXp,
        labs,
        tasks,
        score,
      };
    });
  });

  const fallbackClassName = classes[0]?.name || 'LabZero Classroom';
  const rows = classroomRows.length > 0
    ? classroomRows
    : fallbackStudents.map((student, index) => {
        const attendance = 92 - index * 3;
        const streak = 14 - index * 2;
        const challengeXp = 310 - index * 34;
        const labs = 18 - index * 2;
        const tasks = Math.max(1, classes[0]?.assignments?.length || 3) - (index % 2);
        const score = Math.round(attendance * 0.34 + streak * 1.5 + challengeXp * 0.12 + labs * 1.8 + tasks * 2);

        return {
          id: student.id,
          name: getName(student, index),
          className: fallbackClassName,
          attendance,
          streak,
          challengeXp,
          labs,
          tasks,
          score,
        };
      });

  if (mode === 'student' || currentUser?.role === 'student') {
    const currentName = getName(currentUser, 0);
    rows.unshift({
      id: String(currentUser?.id || 'current-student'),
      name: currentName,
      className: fallbackClassName,
      attendance: clamp(88 + Math.min(localStats.bestStreak, 10), 88, 99),
      streak: localStats.bestStreak,
      challengeXp: localStats.xp,
      labs: Math.max(6, localStats.cleared + classes.length * 2),
      tasks: classes.reduce((total, classroom) => total + (classroom?.assignments?.length || 0), 0),
      score: Math.round(88 * 0.34 + localStats.bestStreak * 1.5 + localStats.xp * 0.12 + Math.max(6, localStats.cleared) * 1.8),
    });
  }

  return rows
    .sort((left, right) => right.score - left.score)
    .slice(0, 5)
    .map((row, index) => ({ ...row, score: row.score + (index === 0 ? 0 : 0) }));
};

const DashboardLeaderboard: React.FC<DashboardLeaderboardProps> = ({
  mode,
  theme = 'dark',
  classes = [],
  currentUser,
  topicMetrics,
}) => {
  const isDark = theme === 'dark';
  const rows = React.useMemo(() => buildRows(classes, currentUser, mode), [classes, currentUser, mode]);
  const topicRows = React.useMemo(
    () => topicMetrics || subjects.map((subject) => ({ ...subject, ...getSubjectStats(subject.id) })),
    [topicMetrics]
  );
  const topScore = rows[0]?.score || 1;
  const averageAttendance = rows.length
    ? Math.round(rows.reduce((total, row) => total + row.attendance, 0) / rows.length)
    : 0;
  const bestStreak = rows.reduce((max, row) => Math.max(max, row.streak), 0);
  const totalXp = rows.reduce((total, row) => total + row.challengeXp, 0);

  const shellClass = isDark
    ? 'bg-[var(--bg-panel)] border-[var(--border-glass)] text-[var(--text-primary)]'
    : 'bg-white/92 border-slate-200 text-slate-950 shadow-[0_18px_50px_rgba(15,23,42,0.08)]';
  const mutedClass = isDark ? 'text-[var(--text-muted)]' : 'text-slate-500';
  const insetClass = isDark ? 'bg-[var(--bg-deep)] border-[var(--border-glass)]' : 'bg-slate-50 border-slate-200';

  return (
    <section className={`rounded-[32px] border p-6 shadow-xl backdrop-blur-xl ${shellClass}`}>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className={`mb-2 flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.24em] ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
            <Trophy size={14} />
            Leaderboard
          </div>
          <h3 className="text-xl font-display font-semibold tracking-tight">Engagement Dashboard</h3>
          <p className={`mt-1 text-xs leading-relaxed ${mutedClass}`}>Ranked by attendance, daily challenge streaks, XP, labs, and active tasks.</p>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${isDark ? 'border-amber-400/25 bg-amber-500/10 text-amber-300' : 'border-amber-200 bg-amber-50 text-amber-700'}`}>
          <Medal size={22} />
        </div>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-3">
        {[
          { label: 'Attend', value: `${averageAttendance}%`, icon: CalendarCheck, color: isDark ? 'text-emerald-300' : 'text-emerald-700' },
          { label: 'Streak', value: bestStreak, icon: Flame, color: isDark ? 'text-amber-300' : 'text-amber-700' },
          { label: 'XP', value: totalXp, icon: Zap, color: isDark ? 'text-cyan-300' : 'text-cyan-700' },
        ].map((metric) => (
          <div key={metric.label} className={`rounded-2xl border p-3 ${insetClass}`}>
            <metric.icon size={15} className={metric.color} />
            <div className="mt-2 text-lg font-display font-semibold">{metric.value}</div>
            <div className={`text-[8px] font-mono uppercase tracking-widest ${mutedClass}`}>{metric.label}</div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {rows.map((student, index) => {
          const width = Math.max(12, Math.round((student.score / topScore) * 100));
          const rankColor = index === 0
            ? 'text-amber-300'
            : index === 1
              ? isDark ? 'text-slate-300' : 'text-slate-500'
              : index === 2
                ? 'text-orange-300'
                : mutedClass;

          return (
            <div key={`${student.id}-${student.name}`} className={`rounded-2xl border p-4 ${insetClass}`}>
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border font-display text-sm font-bold ${index === 0 ? 'border-amber-300/30 bg-amber-400/15 text-amber-300' : isDark ? 'border-white/10 bg-white/[0.04] text-slate-300' : 'border-slate-200 bg-white text-slate-600'}`}>
                    {index + 1}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">{student.name}</div>
                    <div className={`truncate text-[9px] font-mono uppercase tracking-widest ${mutedClass}`}>{student.className}</div>
                  </div>
                </div>
                <div className={`flex items-center gap-1 text-sm font-bold ${rankColor}`}>
                  <Award size={15} />
                  {student.score}
                </div>
              </div>

              <div className={`h-2 overflow-hidden rounded-full ${isDark ? 'bg-slate-950/70' : 'bg-slate-200'}`}>
                <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-400" style={{ width: `${width}%` }} />
              </div>

              <div className={`mt-3 grid grid-cols-4 gap-2 text-[9px] font-mono uppercase tracking-widest ${mutedClass}`}>
                <span className="flex items-center gap-1"><CalendarCheck size={11} /> {student.attendance}%</span>
                <span className="flex items-center gap-1"><Flame size={11} /> {student.streak}d</span>
                <span className="flex items-center gap-1"><Zap size={11} /> {student.challengeXp}</span>
                <span className="flex items-center gap-1"><BookOpenCheck size={11} /> {student.labs}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className={`mt-6 rounded-2xl border p-4 ${insetClass}`}>
        <div className="mb-4 flex items-center justify-between">
          <div className={`flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] ${mutedClass}`}>
            <BarChart3 size={14} />
            {mode === 'institute' ? 'Institute Topics' : 'Topic Momentum'}
          </div>
          <div className={`flex items-center gap-1 text-[10px] font-mono uppercase tracking-widest ${mutedClass}`}>
            <Users size={12} />
            {mode}
          </div>
        </div>

        <div className="space-y-3">
          {topicRows.map((topic, index) => {
            const progress = topic.progress ?? clamp(topic.xp + topic.streak * 8 + topic.cleared * 12, 8 + index * 10, 100);
            return (
              <div key={topic.id}>
                <div className="mb-1 flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${topic.accent}`} />
                    <span className="truncate text-xs font-semibold">{topic.name}</span>
                  </div>
                  <span className={`shrink-0 text-[9px] font-mono uppercase tracking-widest ${mutedClass}`}>
                    {topic.streak}d / {topic.xp} XP
                  </span>
                </div>
                <div className={`h-1.5 overflow-hidden rounded-full ${isDark ? 'bg-slate-950/70' : 'bg-slate-200'}`}>
                  <div className={`h-full rounded-full ${topic.accent}`} style={{ width: `${progress}%` }} />
                </div>
              </div>
            );
          })}
        </div>

        <div className={`mt-4 flex items-center gap-2 rounded-xl border px-3 py-2 text-[10px] leading-relaxed ${isDark ? 'border-cyan-400/15 bg-cyan-500/10 text-cyan-100' : 'border-cyan-100 bg-cyan-50 text-cyan-800'}`}>
          <Target size={14} className="shrink-0" />
          Daily Challenge streaks update after students claim the reward for all quests.
        </div>
      </div>
    </section>
  );
};

export default DashboardLeaderboard;
