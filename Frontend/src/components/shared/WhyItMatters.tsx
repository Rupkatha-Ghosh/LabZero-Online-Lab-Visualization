import React, { useState } from 'react';
import { Lightbulb, ChevronDown } from 'lucide-react';

interface WhyItMattersProps {
  theme?: 'dark' | 'light';
  items: {
    icon: string;       // emoji
    title: string;
    description: string;
  }[];
}

const WhyItMatters: React.FC<WhyItMattersProps> = ({ theme = 'dark', items }) => {
  const [open, setOpen] = useState(false);
  const isDark = theme === 'dark';

  return (
    <div
      className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
        isDark
          ? 'bg-amber-500/5 border-amber-500/20'
          : 'bg-amber-50 border-amber-200'
      }`}
    >
      {/* Header — always visible */}
      <button
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between px-5 py-4 gap-3 text-left transition-colors ${
          isDark ? 'hover:bg-amber-500/10' : 'hover:bg-amber-100'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
              isDark ? 'bg-amber-500/20' : 'bg-amber-200'
            }`}
          >
            <Lightbulb size={16} className={isDark ? 'text-amber-400' : 'text-amber-600'} />
          </div>
          <span
            className={`text-[11px] font-mono font-bold uppercase tracking-widest ${
              isDark ? 'text-amber-400' : 'text-amber-700'
            }`}
          >
            Why It Matters
          </span>
        </div>
        <ChevronDown
          size={16}
          className={`shrink-0 transition-transform duration-300 ${
            open ? 'rotate-180' : ''
          } ${isDark ? 'text-amber-400' : 'text-amber-600'}`}
        />
      </button>

      {/* Expandable content */}
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
          <div
            className={`grid grid-cols-1 sm:grid-cols-${Math.min(items.length, 3)} gap-4 px-5 pb-5 pt-1`}
          >
            {items.map((item, idx) => (
              <div
                key={idx}
                className={`rounded-xl p-4 flex flex-col gap-2 border ${
                  isDark
                    ? 'bg-[var(--bg-panel)] border-[var(--border-glass)]'
                    : 'bg-white border-amber-100'
                }`}
              >
                <span className="text-2xl">{item.icon}</span>
                <span
                  className={`text-xs font-bold ${
                    isDark ? 'text-white' : 'text-slate-800'
                  }`}
                >
                  {item.title}
                </span>
                <p
                  className={`text-[11px] leading-relaxed ${
                    isDark ? 'text-[var(--text-muted)]' : 'text-slate-500'
                  }`}
                >
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhyItMatters;
