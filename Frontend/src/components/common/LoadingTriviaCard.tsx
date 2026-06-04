import React, { useMemo, useState, useCallback } from 'react';
import { Sparkles, RefreshCw, Quote } from 'lucide-react';
import { LOADING_TRIVIA, TriviaFact } from '../../data/loadingTrivia';

export interface LoadingTriviaCardProps {
  className?: string;
  variant?: 'inline' | 'overlay';
  theme?: 'dark' | 'light';
}

const pickRandom = (exclude?: TriviaFact): TriviaFact => {
  if (LOADING_TRIVIA.length <= 1) return LOADING_TRIVIA[0];
  let next: TriviaFact;
  do {
    next = LOADING_TRIVIA[Math.floor(Math.random() * LOADING_TRIVIA.length)];
  } while (next === exclude);
  return next;
};

export const LoadingTriviaCard: React.FC<LoadingTriviaCardProps> = ({
  className = '',
  variant = 'inline',
  theme = 'dark',
}) => {
  const [fact, setFact] = useState<TriviaFact>(() => pickRandom());
  const isDark = theme === 'dark';

  const refresh = useCallback(() => {
    setFact(prev => pickRandom(prev));
  }, []);

  const isOverlay = variant === 'overlay';

  return (
    <div
      className={`${className} ${
        isOverlay
          ? `pointer-events-auto backdrop-blur-xl border rounded-2xl shadow-xl ${
              isDark
                ? 'bg-slate-900/70 border-white/10'
                : 'bg-white/85 border-slate-200'
            }`
          : ''
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3 p-3.5 sm:p-4">
        <div className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-lg ${
          isDark
            ? 'bg-gradient-to-br from-indigo-500/30 to-cyan-500/30 text-indigo-200'
            : 'bg-gradient-to-br from-indigo-100 to-cyan-100 text-indigo-600'
        }`}>
          {fact.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <Sparkles size={10} className={isDark ? 'text-cyan-300' : 'text-cyan-600'} />
            <span className={`text-[9px] font-mono uppercase tracking-[0.25em] font-bold ${
              isDark ? 'text-cyan-300/80' : 'text-cyan-700/80'
            }`}>
              Did you know?
            </span>
          </div>
          <p className={`text-[12.5px] leading-snug font-medium ${
            isDark ? 'text-slate-100' : 'text-slate-800'
          }`}>
            <Quote size={10} className={`inline -mt-1 mr-0.5 ${
              isDark ? 'text-slate-500' : 'text-slate-400'
            }`} />
            {fact.fact}
          </p>
        </div>
        <button
          onClick={refresh}
          aria-label="Show another fact"
          className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
            isDark
              ? 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 border border-slate-200'
          }`}
        >
          <RefreshCw size={12} />
        </button>
      </div>
    </div>
  );
};

export default LoadingTriviaCard;
