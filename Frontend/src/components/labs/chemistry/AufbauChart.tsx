
import React from 'react';
import { Activity, Zap, Layers, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AufbauChartProps {
  atomicNumber: number;
  currentConfig?: Record<string, number[]>;
}

const levels = [
  { id: '1s', capacity: 2, energy: 1 },
  { id: '2s', capacity: 2, energy: 2 },
  { id: '2p', capacity: 6, energy: 3 },
  { id: '3s', capacity: 2, energy: 4 },
  { id: '3p', capacity: 6, energy: 5 },
  { id: '4s', capacity: 2, energy: 6 },
  { id: '3d', capacity: 10, energy: 7 },
  { id: '4p', capacity: 6, energy: 8 },
  { id: '5s', capacity: 2, energy: 9 },
  { id: '4d', capacity: 10, energy: 10 },
  { id: '5p', capacity: 6, energy: 11 },
  { id: '6s', capacity: 2, energy: 12 },
  { id: '4f', capacity: 14, energy: 13 },
  { id: '5d', capacity: 10, energy: 14 },
  { id: '6p', capacity: 6, energy: 15 },
  { id: '7s', capacity: 2, energy: 16 },
  { id: '5f', capacity: 14, energy: 17 },
  { id: '6d', capacity: 10, energy: 18 },
  { id: '7p', capacity: 6, energy: 19 },
];

const AufbauChart: React.FC<AufbauChartProps> = ({ atomicNumber, currentConfig }) => {
  let remainingTarget = atomicNumber;

  const getActualCount = (levelId: string) => {
    if (!currentConfig) return 0;
    return (Object.entries(currentConfig) as [string, number[]][])
      .filter(([key]) => key.startsWith(levelId))
      .reduce((acc, [_, spins]) => acc + (spins as number[]).length, 0);
  };

  return (
    <div className="glass-panel p-10 rounded-[48px] border border-white/5 h-full flex flex-col bg-[#020617]/40 shadow-2xl">
      <div className="flex items-center gap-2 mb-10">
        <Layers size={14} className="text-indigo-500" />
        <h4 className="text-[10px] font-mono font-bold text-indigo-400/60 uppercase tracking-[0.4em]">Energy Distribution</h4>
      </div>

      <div className="flex-1 flex flex-col-reverse gap-6 px-2">
        {levels.map((level) => {
          const targetFilled = Math.min(level.capacity, remainingTarget);
          remainingTarget = Math.max(0, remainingTarget - level.capacity);
          
          const actualFilled = getActualCount(level.id);
          const targetPercent = (targetFilled / level.capacity) * 100;
          const actualPercent = (actualFilled / level.capacity) * 100;

          const isOverfilled = actualFilled > targetFilled;
          const isUnderfilled = actualFilled < targetFilled && targetFilled > 0;

          return (
            <div key={level.id} className="group relative">
              <div className="flex justify-between items-center mb-1.5 px-1">
                <span className={`text-[10px] font-mono font-bold transition-all duration-500 ${actualFilled > 0 ? "text-indigo-400 scale-110" : targetFilled > 0 ? "text-slate-600" : "text-slate-800"}`}>
                  {level.id.toUpperCase()}
                </span>
                <div className="flex items-center gap-2">
                  {actualFilled > 0 && (
                    <span className={`text-[9px] font-mono font-bold ${isOverfilled ? 'text-rose-500' : 'text-indigo-400'}`}>
                      {actualFilled}
                    </span>
                  )}
                  <span className="text-[8px] font-mono font-bold text-slate-800">
                    / {level.capacity}
                  </span>
                </div>
              </div>
              <div className="h-3 bg-[#020617] rounded-full overflow-hidden border border-white/5 shadow-inner relative">
                {/* Target Ghost */}
                {targetFilled > 0 && (
                  <div 
                    className="absolute inset-y-0 bg-white/5 border-r border-white/10"
                    style={{ width: `${targetPercent}%` }}
                  />
                )}
                
                {/* Actual Progress */}
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${actualPercent}%` }}
                  transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                  className={`h-full shadow-[0_0_15px_rgba(99,102,241,0.3)] ${
                    isOverfilled ? 'bg-gradient-to-r from-rose-600 to-rose-400' : 'bg-gradient-to-r from-indigo-600 to-indigo-400'
                  }`}
                />
              </div>
              
              {actualFilled > 0 && (
                <div className="absolute -right-1 top-0 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {Array.from({ length: Math.min(actualFilled, 6) }).map((_, i) => (
                    <div key={i} className={`w-1 h-1 rounded-full animate-pulse ${isOverfilled ? 'bg-rose-400/40' : 'bg-indigo-400/40'}`}></div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8 p-6 bg-[#020617] rounded-2xl border border-white/5 flex items-start gap-4">
        <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
          <Info size={14} className="text-indigo-400" />
        </div>
        <p className="text-[10px] text-slate-500 leading-relaxed font-light italic">
          Electrons fill the lowest energy orbitals first before moving to higher levels, following the <span className="text-indigo-400 font-bold">Aufbau Principle</span>.
        </p>
      </div>
    </div>
  );
};

export default AufbauChart;
