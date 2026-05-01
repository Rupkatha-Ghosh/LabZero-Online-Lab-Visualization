import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Calculator, Triangle, Ruler, Sparkles } from 'lucide-react';

const PythagorasLab: React.FC = () => {
  const [base, setBase] = useState(150);
  const [height, setHeight] = useState(150);

  const hypotenuse = Math.sqrt(base * base + height * height);
  const angle = Math.atan2(height, base) * (180 / Math.PI);

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full">
      <div className="flex-1 glass-panel p-8 rounded-[40px] flex flex-col justify-center items-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="w-full h-full bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]" />
        </div>

        <svg viewBox="0 0 400 400" className="w-[300px] h-[300px] relative z-10">
          {/* Base */}
          <line x1="50" y1="350" x2={50 + base} y2="350" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
          {/* Height */}
          <line x1={50 + base} y1="350" x2={50 + base} y2={350 - height} stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
          {/* Hypotenuse */}
          <motion.line 
            x1="50" 
            y1="350" 
            animate={{ x2: 50 + base, y2: 350 - height }}
            stroke="#6366f1" 
            strokeWidth="4" 
            strokeLinecap="round"
          />

          {/* Right Angle Marker */}
          <rect x={50 + base - 15} y="335" width="15" height="15" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />

          {/* Labels */}
          <text x={50 + base / 2} y="380" fill="#94a3b8" fontSize="12" textAnchor="middle" className="font-mono uppercase tracking-widest">a</text>
          <text x={70 + base} y={350 - height / 2} fill="#94a3b8" fontSize="12" className="font-mono uppercase tracking-widest">b</text>
          <motion.text 
            animate={{ x: 50 + base / 3, y: 340 - height / 2 }}
            fill="#6366f1" 
            fontSize="14" 
            className="font-display font-bold italic"
          >c</motion.text>
        </svg>

        <div className="w-full max-w-md space-y-8 mt-12">
          <div className="space-y-4">
            <div className="flex justify-between text-[10px] font-mono text-slate-500 uppercase tracking-widest">
              <span>Base (a): {base.toFixed(0)} units</span>
            </div>
            <input 
              type="range" min="50" max="300" value={base} 
              onChange={(e) => setBase(parseInt(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>
          <div className="space-y-4">
            <div className="flex justify-between text-[10px] font-mono text-slate-500 uppercase tracking-widest">
              <span>Height (b): {height.toFixed(0)} units</span>
            </div>
            <input 
              type="range" min="50" max="300" value={height} 
              onChange={(e) => setHeight(parseInt(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>
        </div>
      </div>

      <div className="w-full lg:w-96 space-y-6">
        <div className="p-8 rounded-[32px] bg-white/[0.02] border border-white/5 space-y-8">
          <div>
            <div className="text-indigo-400 font-mono text-[10px] uppercase tracking-widest mb-2 flex items-center gap-2">
              <Calculator size={12} /> Calculation Result
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-display font-bold text-white tracking-tighter italic">
                {hypotenuse.toFixed(1)}
              </span>
              <span className="text-slate-600 text-sm font-mono uppercase tracking-widest italic">Hypotenuse</span>
            </div>
          </div>

          <div className="space-y-4 pt-8 border-t border-white/5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-mono italic">a² + b² = c²</span>
              <span className="text-indigo-400 font-mono">{Math.pow(base, 2).toFixed(0)} + {Math.pow(height, 2).toFixed(0)} = {Math.pow(hypotenuse, 2).toFixed(0)}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-mono italic">θ (Angle)</span>
              <span className="text-white font-mono">{angle.toFixed(1)}°</span>
            </div>
          </div>
        </div>

        <div className="p-8 rounded-[32px] bg-indigo-600 shadow-2xl shadow-indigo-600/20 text-white relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-6 opacity-20 transform translate-x-4 -translate-y-4 rotate-12 group-hover:scale-110 transition-transform duration-700">
            <Triangle size={120} />
          </div>
          <div className="relative z-10 space-y-4">
            <h3 className="text-xl font-display font-bold italic tracking-tight uppercase flex items-center gap-2">
              <Sparkles size={18} /> Deep Insight
            </h3>
            <p className="text-indigo-100 text-[11px] leading-relaxed font-light">
              This theorem is the bridge between distance and coordinate geometry. In computer science, we use it to calculate Euclidian distance in any dimensional space.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PythagorasLab;
