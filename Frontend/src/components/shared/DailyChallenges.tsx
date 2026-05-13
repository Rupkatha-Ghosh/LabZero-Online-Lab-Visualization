import React, { useMemo, useState } from 'react';
import { CalendarDays, CheckCircle2, Flame, RotateCcw, Target, XCircle } from 'lucide-react';
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

const getTodayKey = () => new Date().toISOString().slice(0, 10);

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

const difficultyStyles: Record<DailyChallenge['difficulty'], string> = {
  warmup: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  core: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  stretch: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
};

const DailyChallenges: React.FC<DailyChallengesProps> = ({ subjectId, subjectName, theme }) => {
  const todayKey = getTodayKey();
  const storageKey = `labzero_daily_challenges_${subjectId}_${todayKey}`;
  const isDark = theme === 'dark';
  const challenges = useMemo(() => getDailyChallenges(subjectId), [subjectId, todayKey]);
  const [progress, setProgress] = useState<ChallengeProgress>(() => loadProgress(storageKey));
  const [activeIndex, setActiveIndex] = useState(0);

  const completedCount = challenges.filter((challenge) => progress.completed[challenge.id]).length;
  const bankSize = getChallengeBankSize(subjectId);
  const activeChallenge = challenges[activeIndex];

  const updateProgress = (nextProgress: ChallengeProgress) => {
    setProgress(nextProgress);
    saveProgress(storageKey, nextProgress);
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

  if (!activeChallenge) return null;

  const selectedAnswer = progress.selected[activeChallenge.id];
  const wasCorrect = progress.completed[activeChallenge.id];
  const attempted = Boolean(selectedAnswer);

  return (
    <section className={`mb-16 border rounded-[32px] overflow-hidden backdrop-blur-xl shadow-2xl ${isDark ? 'bg-slate-950/70 border-white/10' : 'bg-white/80 border-slate-200'}`}>
      <div className={`grid grid-cols-1 xl:grid-cols-[360px_1fr] ${isDark ? 'divide-white/10' : 'divide-slate-200'} xl:divide-x`}>
        <aside className="p-6 md:p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <CalendarDays size={22} />
            </div>
            <div>
              <p className={`text-[9px] font-mono uppercase tracking-[0.3em] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Daily Challenges</p>
              <h3 className={`text-2xl font-display font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{subjectName}</h3>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-8">
            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-white/[0.03] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
              <Target size={16} className="text-primary mb-3" />
              <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{completedCount}/{challenges.length}</div>
              <div className={`text-[8px] font-mono uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Solved</div>
            </div>
            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-white/[0.03] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
              <Flame size={16} className="text-amber-400 mb-3" />
              <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{bankSize}</div>
              <div className={`text-[8px] font-mono uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Offline Bank</div>
            </div>
            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-white/[0.03] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
              <CalendarDays size={16} className="text-emerald-400 mb-3" />
              <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{todayKey.slice(5)}</div>
              <div className={`text-[8px] font-mono uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Today</div>
            </div>
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
                  {selected ? (
                    solved ? <CheckCircle2 size={16} className="shrink-0 text-emerald-400" /> : <XCircle size={16} className="shrink-0 text-rose-400" />
                  ) : (
                    <span className={`w-2 h-2 rounded-full shrink-0 ${activeIndex === index ? 'bg-white' : 'bg-slate-500'}`} />
                  )}
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

        <div className="p-6 md:p-10 flex flex-col justify-between min-h-[520px]">
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
                {activeChallenge.estimatedMinutes} min
              </span>
              <span className={`px-3 py-1.5 rounded-full border text-[9px] font-mono uppercase tracking-[0.2em] ${isDark ? 'border-white/10 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                No API
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
              <div className={`mt-8 p-5 rounded-2xl border ${wasCorrect ? 'border-emerald-500/20 bg-emerald-500/10' : 'border-rose-500/20 bg-rose-500/10'}`}>
                <div className={`text-xs font-bold uppercase tracking-widest mb-2 ${wasCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {wasCorrect ? 'Correct' : 'Review'}
                </div>
                <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{activeChallenge.explanation}</p>
              </div>
            )}
          </motion.div>

          <div className="flex justify-end gap-3 mt-10">
            <button
              onClick={() => setActiveIndex((index) => Math.max(0, index - 1))}
              disabled={activeIndex === 0}
              className={`h-11 px-5 rounded-xl border text-[10px] font-mono uppercase tracking-[0.2em] transition-colors disabled:opacity-30 ${isDark ? 'border-white/10 text-slate-400 hover:text-white' : 'border-slate-200 text-slate-500 hover:text-slate-900'}`}
            >
              Previous
            </button>
            <button
              onClick={() => setActiveIndex((index) => Math.min(challenges.length - 1, index + 1))}
              disabled={activeIndex === challenges.length - 1}
              className="h-11 px-5 rounded-xl bg-primary text-white text-[10px] font-mono uppercase tracking-[0.2em] transition-colors hover:bg-primary/80 disabled:opacity-30"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DailyChallenges;
