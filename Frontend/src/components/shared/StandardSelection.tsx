import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight, GraduationCap } from 'lucide-react';

interface StandardSelectionProps {
  onSelectClass: (className: string) => void;
}

const StandardSelection: React.FC<StandardSelectionProps> = ({ onSelectClass }) => {
  const classes = [
    { title: 'Class 9', description: 'Foundation Science & Arithmetic', icon: '09' },
    { title: 'Class 10', description: 'Advanced Geometry & Core Physics', icon: '10' },
    { title: 'Class 11', description: 'Quantum Theory & Vector Space', icon: '11' },
    { title: 'Class 12', description: 'Organic Patterns & Calculus', icon: '12' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 md:py-24 flex flex-col items-center justify-center min-h-[calc(100vh-160px)]">
      <div className="text-center mb-20 space-y-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-mono uppercase tracking-[0.2em] mb-4"
        >
          <Sparkles size={14} /> Modular Learning Environment
        </motion.div>
        <h1 className="text-5xl md:text-7xl font-display font-bold text-white tracking-tighter leading-none italic uppercase">
          Select Your <span className="text-indigo-500">Standard</span>
        </h1>
        <p className="text-slate-500 max-w-xl mx-auto text-lg font-light leading-relaxed">
          Unlock a curriculum-focused immersive laboratory experience designed for your specific academic journey.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full">
        {classes.map((cls, i) => (
          <motion.div
            key={cls.title}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => onSelectClass(cls.title)}
            className="group relative p-8 md:p-12 rounded-[48px] bg-white/[0.02] border border-white/5 hover:border-indigo-500/30 hover:bg-indigo-500/[0.03] transition-all cursor-pointer overflow-hidden flex flex-col items-start"
          >
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-indigo-500/5 blur-[60px] group-hover:bg-indigo-500/10 transition-all" />
            
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 group-hover:text-indigo-400 group-hover:border-indigo-500/20 transition-all mb-8">
              <span className="text-2xl font-mono font-bold tracking-tighter">{cls.icon}</span>
            </div>

            <div className="space-y-2 mt-auto">
              <h2 className="text-3xl font-display font-bold text-white uppercase italic spacing-tight group-hover:text-indigo-400 transition-colors">
                {cls.title}
              </h2>
              <p className="text-slate-500 text-sm font-light leading-snug">
                {cls.description}
              </p>
            </div>

            <div className="mt-8 flex items-center gap-2 text-[10px] font-mono text-indigo-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all">
              Launch Laboratory <ArrowRight size={14} />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-24 pt-12 border-t border-white/5 w-full flex flex-col md:flex-row items-center justify-between gap-8 opacity-40 grayscale group hover:grayscale-0 hover:opacity-100 transition-all">
        <div className="flex items-center gap-8">
           <div className="text-[10px] font-mono uppercase tracking-[0.4em] text-slate-500 flex items-center gap-2">
             <GraduationCap size={14} /> 2026 Academic Edition
           </div>
        </div>
      </div>
    </div>
  );
};

export default StandardSelection;
