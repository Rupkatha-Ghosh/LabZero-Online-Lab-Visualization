import { useLanguage } from '../../../context/LanguageContext';
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Calculator, Triangle, Ruler, Sparkles } from 'lucide-react';

const PythagorasLab: React.FC = () => {
  
  const { t } = useLanguage();const [base, setBase] = useState(150);
  const [height, setHeight] = useState(150);

  const hypotenuse = Math.sqrt(base * base + height * height);
  const angle = Math.atan2(height, base) * (180 / Math.PI);

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full">
      <div className="flex-1 bg-[var(--bg-panel)] backdrop-blur-xl border border-[var(--border-glass)] p-8 rounded-[40px] flex flex-col justify-center items-center relative overflow-hidden shadow-2xl transition-colors duration-500">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="w-full h-full bg-[linear-gradient(var(--border-glass)_1px,transparent_1px),linear-gradient(90deg,var(--border-glass)_1px,transparent_1px)] bg-[size:20px_20px]" />
        </div>

        <svg viewBox="0 0 400 400" className="w-[300px] h-[300px] relative z-10">
          {/* Base */}
          <line x1="50" y1="350" x2={50 + base} y2="350" stroke="var(--text-muted)" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
          {/* Height */}
          <line x1={50 + base} y1="350" x2={50 + base} y2={350 - height} stroke="var(--text-muted)" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
          {/* Hypotenuse */}
          <motion.line 
            x1="50" 
            y1="350" 
            animate={{ x2: 50 + base, y2: 350 - height }}
            stroke="var(--color-primary)" 
            strokeWidth="4" 
            strokeLinecap="round"
          />

          {/* Right Angle Marker */}
          <rect x={50 + base - 15} y="335" width="15" height="15" fill="none" stroke="var(--text-muted)" strokeWidth="1" opacity="0.3" />

          {/* Labels */}
          <text x={50 + base / 2} y="380" fill="var(--text-muted)" fontSize="12" textAnchor="middle" className="font-mono uppercase tracking-widest font-bold">a</text>
          <text x={70 + base} y={350 - height / 2} fill="var(--text-muted)" fontSize="12" className="font-mono uppercase tracking-widest font-bold">b</text>
          <motion.text 
            animate={{ x: 50 + base / 3, y: 340 - height / 2 }}
            fill="var(--color-primary)" 
            fontSize="14" 
            className="font-display font-bold italic"
          >c</motion.text>
        </svg>

        <div className="w-full max-w-md space-y-8 mt-12">
          <div className="space-y-4">
            <div className="flex justify-between text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest font-bold">
              <span>Base (a): {base.toFixed(0)} units</span>
            </div>
            <input 
              type="range" min="50" max="300" value={base} 
              onChange={(e) => setBase(parseInt(e.target.value))}
              className="w-full accent-[var(--color-primary)] h-1"
            />
          </div>
          <div className="space-y-4">
            <div className="flex justify-between text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest font-bold">
              <span>Height (b): {height.toFixed(0)} units</span>
            </div>
            <input 
              type="range" min="50" max="300" value={height} 
              onChange={(e) => setHeight(parseInt(e.target.value))}
              className="w-full accent-[var(--color-primary)] h-1"
            />
          </div>
        </div>
      </div>

      <div className="w-full lg:w-96 space-y-6">
        <div className="p-8 rounded-[32px] bg-[var(--bg-panel)] border border-[var(--border-glass)] space-y-8 shadow-xl">
          <div>
            <div className="text-[var(--color-primary)] font-mono text-[10px] uppercase tracking-widest mb-2 flex items-center gap-2 font-bold">
              <Calculator size={12} />{t('Calculation Result')}</div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-display font-bold text-[var(--text-primary)] tracking-tighter italic">
                {hypotenuse.toFixed(1)}
              </span>
              <span className="text-[var(--text-muted)] text-sm font-mono uppercase tracking-widest italic font-bold">{t('Hypotenuse')}</span>
            </div>
          </div>

          <div className="space-y-4 pt-8 border-t border-[var(--border-glass)]">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[var(--text-muted)] font-mono italic font-bold">a² + b² = c²</span>
              <span className="text-[var(--color-primary)] font-mono font-bold">{Math.pow(base, 2).toFixed(0)} + {Math.pow(height, 2).toFixed(0)} = {Math.pow(hypotenuse, 2).toFixed(0)}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-[var(--text-muted)] font-mono italic font-bold">θ (Angle)</span>
              <span className="text-[var(--text-primary)] font-mono font-bold">{angle.toFixed(1)}°</span>
            </div>
          </div>
        </div>

        <div className="p-8 rounded-[32px] bg-[var(--color-primary)] shadow-2xl shadow-[var(--color-primary)]/20 text-white relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-6 opacity-20 transform translate-x-4 -translate-y-4 rotate-12 group-hover:scale-110 transition-transform duration-700">
            <Triangle size={120} />
          </div>
          <div className="relative z-10 space-y-4">
            <h3 className="text-xl font-display font-bold italic tracking-tight uppercase flex items-center gap-2">
              <Sparkles size={18} />{t('Deep Insight')}</h3>
            <p className="text-white/90 text-[11px] leading-relaxed font-bold">{t('This theorem is the bridge between distance and coordinate geometry. In computer science, we use it to calculate Euclidian distance in any dimensional space.')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PythagorasLab;
