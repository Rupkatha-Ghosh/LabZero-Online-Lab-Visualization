import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCw, Info, Magnet, Sparkles } from 'lucide-react';

const ComplexNumbersLab: React.FC = () => {
  const [point, setPoint] = useState({ x: 1, y: 0.5 });
  const [showUnitCircle, setShowUnitCircle] = useState(true);
  const [isError, setIsError] = useState(false);

  // Trigger visual error
  const triggerError = () => {
    setIsError(true);
    setTimeout(() => setIsError(false), 500);
  };

  // Rotate point by 90 degrees (Multiply by i)
  const rotate90 = () => {
    if (Math.abs(point.x) < 0.01 && Math.abs(point.y) < 0.01) {
      triggerError();
      return;
    }
    setPoint(prev => ({ x: -prev.y, y: prev.x }));
  };

  // Convert to display coordinates
  const scale = 120;
  const toDisplay = (val: number, isY: boolean) => {
    return isY ? 250 - val * scale : 250 + val * scale;
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full">
      <div className={`flex-1 glass-panel p-8 rounded-[40px] flex flex-col justify-center items-center relative overflow-hidden transition-colors duration-300 ${isError ? 'bg-rose-500/20 border-rose-500/50' : ''}`}>
        <AnimatePresence>
          {isError && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
            >
               <div className="bg-rose-500 text-white px-6 py-3 rounded-2xl font-mono text-xs uppercase tracking-widest shadow-2xl">
                 Singularity Warning: Value too small
               </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="w-full h-full bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>

        <svg viewBox="0 0 500 500" className="w-[350px] h-[350px] relative z-10">
          {/* Unit Circle */}
          {showUnitCircle && (
            <circle cx="250" cy="250" r={scale} fill="none" stroke="rgba(99, 102, 241, 0.2)" strokeWidth="1" strokeDasharray="4 4" />
          )}

          {/* Axes */}
          <line x1="50" y1="250" x2="450" y2="250" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
          <line x1="250" y1="50" x2="250" y2="450" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

          {/* Point Vector */}
          <motion.line
            x1="250"
            y1="250"
            animate={{ x2: toDisplay(point.x, false), y2: toDisplay(point.y, true) }}
            stroke="#6366f1"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Point */}
          <motion.circle
            animate={{ cx: toDisplay(point.x, false), cy: toDisplay(point.y, true) }}
            r="8"
            fill="#6366f1"
            className="cursor-pointer"
            drag
            dragConstraints={{ left: 50, right: 450, top: 50, bottom: 450 }}
            onDrag={(_, info) => {
              const rect = (document.querySelector('svg') as any)?.getBoundingClientRect();
              if (rect) {
                const newX = (point.x * scale + info.delta.x) / scale;
                const newY = (point.y * scale - info.delta.y) / scale;
                setPoint({ x: newX, y: newY });
              }
            }}
          />
          
          {/* Labels */}
          <text x="460" y="245" fill="rgba(255,255,255,0.3)" fontSize="10" className="font-mono">RE</text>
          <text x="255" y="40" fill="rgba(255,255,255,0.3)" fontSize="10" className="font-mono">IM</text>
        </svg>

        <div className="mt-8 flex gap-4">
          <button 
            onClick={rotate90}
            className="px-6 py-3 rounded-2xl bg-indigo-600 text-white text-xs font-mono uppercase tracking-widest hover:bg-indigo-500 transition-all flex items-center gap-2"
          >
            <RotateCw size={14} /> Multiply by i (90°)
          </button>
          <button 
            onClick={() => setPoint({ x: 1, y: 0 })}
            className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-white text-xs font-mono uppercase tracking-widest hover:bg-white/10 transition-all"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="w-full lg:w-96 space-y-6">
        <div className="p-8 rounded-[32px] bg-white/[0.02] border border-white/5 space-y-4">
          <div className="text-indigo-400 font-mono text-[10px] uppercase tracking-widest mb-1 flex items-center gap-2">
            <Magnet size={12} /> Live Coordinates
          </div>
          <div className="text-3xl font-display font-bold text-white">
            {point.x.toFixed(2)} + {point.y.toFixed(2)}<span className="text-indigo-400 italic">i</span>
          </div>
          <p className="text-slate-500 text-xs leading-relaxed font-light">
            In complex analysis, multiplying by <span className="text-white font-mono">i</span> is a rotational operator. Drag the point or use the button to see the Argand plane in action.
          </p>
        </div>

        <div className="p-8 rounded-[32px] bg-indigo-600/10 border border-indigo-500/20 space-y-4">
          <h3 className="text-white font-bold text-sm flex items-center gap-2">
            <Sparkles size={16} className="text-indigo-400" />
            Mathematical Fact
          </h3>
          <p className="text-indigo-300 text-xs font-light leading-relaxed">
            Did you know? Euler's formula <span className="font-mono text-white italic">eⁱᶿ = cosᶿ + i sinᶿ</span> relates trigonometric functions to complex powers.
          </p>
        </div>

        <button 
          onClick={() => setShowUnitCircle(!showUnitCircle)}
          className="w-full p-4 rounded-2xl bg-white/5 border border-white/5 text-[10px] font-mono uppercase tracking-widest text-slate-500 hover:text-white transition-all flex items-center justify-center gap-2"
        >
          <Info size={14} /> {showUnitCircle ? 'Hide' : 'Show'} Unit Circle (r=1)
        </button>
      </div>
    </div>
  );
};

export default ComplexNumbersLab;
