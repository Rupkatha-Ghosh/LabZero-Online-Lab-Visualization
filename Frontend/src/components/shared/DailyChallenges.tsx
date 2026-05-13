import React, { useEffect, useMemo, useState } from 'react';
import {
  Award,
  BadgeCheck,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Flame,
  Gift,
  RotateCcw,
  Sparkles,
  Target,
  Trophy,
  XCircle,
  Zap,
} from 'lucide-react';
import { motion } from 'motion/react';
import { SubjectId } from '../../types/types';
import { DailyChallenge, getChallengeBankSize, getDailyChallenges } from '../../data/dailyChallenges';

interface DailyChallengesProps {
  subjectId: SubjectId;
  subjectName: string;
  theme: 'dark' | 'light';
}

interface ChallengeProgress {
  selected: Record<string, string>;
  completed: Record<string, boolean>;
}

interface StreakProgress {
  count: number;
  lastClaimedDate: string | null;
}

const getTodayKey = () => new Date().toISOString().slice(0, 10);

const getPreviousDateKey = (dateKey: string) => {
  const date = new Date(`${dateKey}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
};

const loadProgress = (storageKey: string): ChallengeProgress => {
  try {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : { selected: {}, completed: {} };
  } catch {
    return { selected: {}, completed: {} };
  }
};

const saveProgress = (storageKey: string, progress: ChallengeProgress) => {
  localStorage.setItem(storageKey, JSON.stringify(progress));
};

const loadStreak = (storageKey: string): StreakProgress => {
  try {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : { count: 0, lastClaimedDate: null };
  } catch {
    return { count: 0, lastClaimedDate: null };
  }
};

const saveStreak = (storageKey: string, streak: StreakProgress) => {
  localStorage.setItem(storageKey, JSON.stringify(streak));
};

const getChallengeXp = (challenge: DailyChallenge, wasCorrect: boolean) => {
  if (!wasCorrect) return 3;
  if (challenge.difficulty === 'warmup') return 10;
  if (challenge.difficulty === 'core') return 20;
  return 35;
};

const difficultyStyles: Record<DailyChallenge['difficulty'], string> = {
  warmup: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  core: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  stretch: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
};

const DailyChallenges: React.FC<DailyChallengesProps> = ({ subjectId, subjectName, theme }) => {
  const todayKey = getTodayKey();
  const progressKey = `labzero_daily_challenges_${subjectId}_${todayKey}`;
  const streakKey = `labzero_daily_streak_${subjectId}`;
  const isDark = theme === 'dark';
  const challenges = useMemo(() => getDailyChallenges(subjectId), [subjectId, todayKey]);
  const [progress, setProgress] = useState<ChallengeProgress>(() => loadProgress(progressKey));
  const [streak, setStreak] = useState<StreakProgress>(() => loadStreak(streakKey));
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setProgress(loadProgress(progressKey));
    setStreak(loadStreak(streakKey));
    setActiveIndex(0);
  }, [progressKey, streakKey]);

  const activeChallenge = challenges[activeIndex];
  const bankSize = getChallengeBankSize(subjectId);

  const attemptedCount = challenges.filter((challenge) => progress.selected[challenge.id]).length;
  const completedCount = challenges.filter((challenge) => progress.completed[challenge.id]).length;
  const allAttempted = challenges.length > 0 && attemptedCount === challenges.length;
  const accuracy = challenges.length ? Math.round((completedCount / challenges.length) * 100) : 0;
  const xpEarned = challenges.reduce((total, challenge) => {
    const selected = progress.selected[challenge.id];
    if (!selected) return total;
    return total + getChallengeXp(challenge, progress.completed[challenge.id]);
  }, 0);
  const progressPercent = challenges.length ? Math.round((attemptedCount / challenges.length) * 100) : 0;
  const dailyRank = accuracy === 100 ? 'Mastery' : accuracy >= 60 ? 'Strong' : accuracy > 0 ? 'Practicing' : 'Needs Revision';
  const claimedToday = streak.lastClaimedDate === todayKey;
  const nextUnattemptedIndex = challenges.findIndex((challenge) => !progress.selected[challenge.id]);
  const reviewTopics = challenges
    .filter((challenge) => progress.selected[challenge.id] && !progress.completed[challenge.id])
    .map((challenge) => challenge.topic);
  const masteredTopics = challenges
    .filter((challenge) => progress.completed[challenge.id])
    .map((challenge) => challenge.topic);
  const unlockedBadges = [
    attemptedCount > 0 ? 'First Clear' : null,
    completedCount === challenges.length && challenges.length > 0 ? 'Perfect Run' : null,
    challenges.some((challenge) => progress.completed[challenge.id] && challenge.difficulty === 'stretch') ? 'Stretch Solver' : null,
    allAttempted ? 'Daily Finisher' : null,
  ].filter(Boolean) as string[];

  const updateProgress = (nextProgress: ChallengeProgress) => {
    setProgress(nextProgress);
    saveProgress(progressKey, nextProgress);
  };

  const updateStreak = (nextStreak: StreakProgress) => {
    setStreak(nextStreak);
    saveStreak(streakKey, nextStreak);
  };

  const handleSelect = (challenge: DailyChallenge, option: string) => {
    if (progress.selected[challenge.id]) return;

    updateProgress({
      selected: { ...progress.selected, [challenge.id]: option },
      completed: { ...progress.completed, [challenge.id]: option === challenge.answer },
    });
  };

  const resetToday = () => {
    const emptyProgress = { selected: {}, completed: {} };
    updateProgress(emptyProgress);
    setActiveIndex(0);
  };

  const goToNextQuest = () => {
    if (nextUnattemptedIndex >= 0) {
      setActiveIndex(nextUnattemptedIndex);
      return;
    }
    setActiveIndex((index) => Math.min(challenges.length - 1, index + 1));
  };

  const claimDailyReward = () => {
    if (!allAttempted || claimedToday) return;

    const previousDateKey = getPreviousDateKey(todayKey);
    const nextCount = streak.lastClaimedDate === previousDateKey ? streak.count + 1 : 1;
    updateStreak({ count: nextCount, lastClaimedDate: todayKey });
  };

  if (!activeChallenge) return null;

  const selectedAnswer = progress.selected[activeChallenge.id];
  const wasCorrect = progress.completed[activeChallenge.id];
  const attempted = Boolean(selectedAnswer);
  const activeXp = attempted ? getChallengeXp(activeChallenge, wasCorrect) : getChallengeXp(activeChallenge, true);

  return (
    <section className={`mb-16 border rounded-[32px] overflow-hidden backdrop-blur-xl shadow-2xl ${isDark ? 'bg-slate-950/70 border-white/10' : 'bg-white/85 border-slate-200'}`}>
      <div className={`grid grid-cols-1 xl:grid-cols-[380px_1fr] ${isDark ? 'divide-white/10' : 'divide-slate-200'} xl:divide-x`}>
        <aside className="p-6 md:p-8">
          <div className="flex items-center gap-3 mb-7">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Trophy size={22} />
            </div>
            <div>
              <p className={`text-[9px] font-mono uppercase tracking-[0.3em] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Daily Lab Quest</p>
              <h3 className={`text-2xl font-display font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{subjectName}</h3>
            </div>
          </div>

          <div className={`mb-6 p-4 rounded-2xl border ${isDark ? 'bg-white/[0.03] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex items-center justify-between gap-4 mb-3">
              <div>
                <div className={`text-[9px] font-mono uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Quest Progress</div>
                <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{attemptedCount}/{challenges.length} attempted</div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-amber-400">{xpEarned} XP</div>
                <div className={`text-[9px] font-mono uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{dailyRank}</div>
              </div>
            </div>
            <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-slate-200'}`}>
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-indigo-400 to-amber-400"
                initial={false}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.35 }}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-7">
            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-white/[0.03] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
              <Target size={16} className="text-primary mb-3" />
              <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{completedCount}/{challenges.length}</div>
              <div className={`text-[8px] font-mono uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Cleared</div>
            </div>
            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-white/[0.03] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
              <Flame size={16} className="text-amber-400 mb-3" />
              <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{claimedToday ? streak.count : streak.count}</div>
              <div className={`text-[8px] font-mono uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Streak</div>
            </div>
            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-white/[0.03] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
              <CalendarDays size={16} className="text-emerald-400 mb-3" />
              <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{todayKey.slice(5)}</div>
              <div className={`text-[8px] font-mono uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Today</div>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-6">
            {challenges.map((challenge, index) => {
              const selected = progress.selected[challenge.id];
              const solved = progress.completed[challenge.id];
              const nodeStyle = selected
                ? solved
                  ? 'bg-emerald-500 border-emerald-300 text-white'
                  : 'bg-rose-500 border-rose-300 text-white'
                : activeIndex === index
                  ? 'bg-primary border-primary text-white'
                  : isDark ? 'bg-white/[0.04] border-white/10 text-slate-500' : 'bg-white border-slate-200 text-slate-400';

              return (
                <button
                  key={challenge.id}
                  onClick={() => setActiveIndex(index)}
                  className={`h-9 flex-1 rounded-xl border text-[10px] font-bold transition-all ${nodeStyle}`}
                  title={`Quest ${index + 1}: ${challenge.skill}`}
                >
                  {selected ? (solved ? <CheckCircle2 size={14} className="mx-auto" /> : <XCircle size={14} className="mx-auto" />) : index + 1}
                </button>
              );
            })}
            <button
              onClick={claimDailyReward}
              disabled={!allAttempted || claimedToday}
              className={`h-9 w-11 rounded-xl border flex items-center justify-center transition-all disabled:opacity-40 ${claimedToday ? 'bg-amber-500 text-white border-amber-300' : isDark ? 'border-white/10 text-amber-400 hover:bg-amber-500/10' : 'border-slate-200 text-amber-600 hover:bg-amber-50'}`}
              title={claimedToday ? 'Daily reward claimed' : 'Claim daily reward'}
            >
              <Gift size={15} />
            </button>
          </div>

          <div className="space-y-2">
            {challenges.map((challenge, index) => {
              const solved = progress.completed[challenge.id];
              const selected = progress.selected[challenge.id];

              return (
                <button
                  key={challenge.id}
                  onClick={() => setActiveIndex(index)}
                  className={`w-full min-h-14 px-4 py-3 rounded-2xl border flex items-center justify-between gap-3 text-left transition-all ${activeIndex === index
                    ? 'bg-primary text-white border-primary shadow-lg shadow-indigo-500/20'
                    : isDark ? 'bg-white/[0.03] border-white/5 text-slate-400 hover:text-white hover:border-white/10' : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
                    }`}
                >
                  <div className="min-w-0">
                    <div className="text-[9px] font-mono uppercase tracking-widest truncate">{challenge.topic}</div>
                    <div className="text-xs font-semibold truncate">{challenge.skill}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] font-bold ${activeIndex === index ? 'text-white' : 'text-amber-400'}`}>+{getChallengeXp(challenge, true)}</span>
                    {selected ? (
                      solved ? <CheckCircle2 size={16} className="text-emerald-400" /> : <XCircle size={16} className="text-rose-400" />
                    ) : (
                      <span className={`w-2 h-2 rounded-full ${activeIndex === index ? 'bg-white' : 'bg-slate-500'}`} />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <button
            onClick={resetToday}
            className={`mt-5 w-full h-11 rounded-xl border text-[10px] font-mono uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-colors ${isDark ? 'border-white/10 text-slate-500 hover:text-white hover:bg-white/5' : 'border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
          >
            <RotateCcw size={14} />
            Reset Today
          </button>
        </aside>

        <div className="p-6 md:p-10 flex flex-col justify-between min-h-[620px]">
          <motion.div
            key={activeChallenge.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="flex flex-wrap items-center gap-3 mb-8">
              <span className={`px-3 py-1.5 rounded-full border text-[9px] font-mono uppercase tracking-[0.2em] ${difficultyStyles[activeChallenge.difficulty]}`}>
                {activeChallenge.difficulty}
              </span>
              <span className={`px-3 py-1.5 rounded-full border text-[9px] font-mono uppercase tracking-[0.2em] ${isDark ? 'border-white/10 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                <Zap size={12} className="inline mr-1" />
                {attempted ? activeXp : getChallengeXp(activeChallenge, true)} XP
              </span>
              <span className={`px-3 py-1.5 rounded-full border text-[9px] font-mono uppercase tracking-[0.2em] ${isDark ? 'border-white/10 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                {activeChallenge.estimatedMinutes} min
              </span>
              <span className={`px-3 py-1.5 rounded-full border text-[9px] font-mono uppercase tracking-[0.2em] ${isDark ? 'border-white/10 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                Bank {bankSize}
              </span>
            </div>

            <p className={`text-[10px] font-mono uppercase tracking-[0.4em] mb-5 ${isDark ? 'text-primary' : 'text-indigo-600'}`}>
              {activeChallenge.topic} / {activeChallenge.skill}
            </p>
            <h4 className={`text-2xl md:text-4xl font-display font-bold leading-tight tracking-tight mb-10 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {activeChallenge.prompt}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeChallenge.options.map((option) => {
                const isSelected = selectedAnswer === option;
                const isAnswer = activeChallenge.answer === option;
                const resultStyle = attempted
                  ? isAnswer
                    ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
                    : isSelected
                      ? 'border-rose-500/50 bg-rose-500/10 text-rose-400'
                      : isDark ? 'border-white/5 bg-white/[0.02] text-slate-600' : 'border-slate-100 bg-slate-50 text-slate-400'
                  : isDark ? 'border-white/10 bg-white/[0.03] text-slate-300 hover:text-white hover:border-primary/60 hover:bg-primary/10' : 'border-slate-200 bg-white text-slate-700 hover:text-slate-900 hover:border-indigo-300 hover:bg-indigo-50';

                return (
                  <button
                    key={option}
                    onClick={() => handleSelect(activeChallenge, option)}
                    disabled={attempted}
                    className={`min-h-20 p-5 rounded-2xl border text-left text-sm font-medium transition-all flex items-center justify-between gap-4 ${resultStyle}`}
                  >
                    <span>{option}</span>
                    {attempted && isAnswer && <CheckCircle2 size={18} className="shrink-0" />}
                    {attempted && isSelected && !isAnswer && <XCircle size={18} className="shrink-0" />}
                  </button>
                );
              })}
            </div>

            {attempted && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-8 p-5 rounded-2xl border ${wasCorrect ? 'border-emerald-500/20 bg-emerald-500/10' : 'border-rose-500/20 bg-rose-500/10'}`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
                  <div>
                    <div className={`text-xs font-bold uppercase tracking-widest mb-2 ${wasCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {wasCorrect ? 'Mission Cleared' : 'Needs Revision'}
                    </div>
                    <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{activeChallenge.explanation}</p>
                  </div>
                  <div className={`px-4 py-3 rounded-xl border shrink-0 ${isDark ? 'border-white/10 bg-slate-950/40' : 'border-slate-200 bg-white'}`}>
                    <div className="text-lg font-bold text-amber-400">+{activeXp} XP</div>
                    <div className={`text-[9px] font-mono uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>earned</div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className={`p-3 rounded-xl border ${isDark ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-white'}`}>
                    <div className={`text-[9px] font-mono uppercase tracking-widest mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Your answer</div>
                    <div className={wasCorrect ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>{selectedAnswer}</div>
                  </div>
                  <div className={`p-3 rounded-xl border ${isDark ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-white'}`}>
                    <div className={`text-[9px] font-mono uppercase tracking-widest mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Correct answer</div>
                    <div className="text-emerald-400 font-semibold">{activeChallenge.answer}</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 mt-5">
                  <button
                    onClick={goToNextQuest}
                    className="h-10 px-4 rounded-xl bg-primary text-white text-[10px] font-mono uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-primary/80 transition-colors"
                  >
                    <Sparkles size={14} />
                    {nextUnattemptedIndex >= 0 ? 'Next Quest' : 'View Summary'}
                  </button>
                  <button
                    onClick={() => setActiveIndex(activeIndex)}
                    className={`h-10 px-4 rounded-xl border text-[10px] font-mono uppercase tracking-[0.2em] flex items-center gap-2 transition-colors ${isDark ? 'border-white/10 text-slate-300 hover:bg-white/5' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                  >
                    <BookOpen size={14} />
                    Review Note
                  </button>
                </div>
              </motion.div>
            )}

            {allAttempted && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-8 p-5 rounded-2xl border ${isDark ? 'border-amber-500/20 bg-amber-500/10' : 'border-amber-200 bg-amber-50'}`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                  <div>
                    <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-widest mb-2">
                      <Award size={16} />
                      Daily Outcome
                    </div>
                    <h5 className={`text-2xl font-display font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{dailyRank} - {accuracy}% accuracy</h5>
                    <p className={`mt-2 text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      {completedCount} cleared, {attemptedCount - completedCount} to review, {xpEarned} XP earned today.
                    </p>
                  </div>
                  <button
                    onClick={claimDailyReward}
                    disabled={claimedToday}
                    className="h-12 px-5 rounded-xl bg-amber-500 text-white text-[10px] font-mono uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-amber-400 transition-colors disabled:opacity-50 disabled:hover:bg-amber-500"
                  >
                    <Gift size={16} />
                    {claimedToday ? `Streak ${streak.count} Claimed` : 'Claim Reward'}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-5">
                  <div className={`p-4 rounded-xl border ${isDark ? 'border-white/10 bg-slate-950/30' : 'border-amber-200 bg-white'}`}>
                    <div className={`text-[9px] font-mono uppercase tracking-widest mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Badges</div>
                    <div className="flex flex-wrap gap-2">
                      {unlockedBadges.map((badge) => (
                        <span key={badge} className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                          <BadgeCheck size={12} />
                          {badge}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className={`p-4 rounded-xl border ${isDark ? 'border-white/10 bg-slate-950/30' : 'border-amber-200 bg-white'}`}>
                    <div className={`text-[9px] font-mono uppercase tracking-widest mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Mastered</div>
                    <div className={`text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                      {masteredTopics.slice(0, 2).join(', ') || 'None yet'}
                    </div>
                  </div>
                  <div className={`p-4 rounded-xl border ${isDark ? 'border-white/10 bg-slate-950/30' : 'border-amber-200 bg-white'}`}>
                    <div className={`text-[9px] font-mono uppercase tracking-widest mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Review</div>
                    <div className={`text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                      {reviewTopics.slice(0, 2).join(', ') || 'All clear'}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-10">
            <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              Come back tomorrow to keep the {subjectName} streak alive.
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setActiveIndex((index) => Math.max(0, index - 1))}
                disabled={activeIndex === 0}
                className={`h-11 px-5 rounded-xl border text-[10px] font-mono uppercase tracking-[0.2em] transition-colors disabled:opacity-30 flex items-center gap-2 ${isDark ? 'border-white/10 text-slate-400 hover:text-white' : 'border-slate-200 text-slate-500 hover:text-slate-900'}`}
              >
                <ChevronLeft size={14} />
                Previous
              </button>
              <button
                onClick={() => setActiveIndex((index) => Math.min(challenges.length - 1, index + 1))}
                disabled={activeIndex === challenges.length - 1}
                className="h-11 px-5 rounded-xl bg-primary text-white text-[10px] font-mono uppercase tracking-[0.2em] transition-colors hover:bg-primary/80 disabled:opacity-30 flex items-center gap-2"
              >
                Next
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DailyChallenges;
