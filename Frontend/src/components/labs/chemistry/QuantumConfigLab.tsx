
import React, { useState, useEffect, useMemo } from 'react';
import { ElementData } from '../../../types/types';
import { FlaskConical, RefreshCw, Zap, Activity, Info, AlertTriangle, CheckCircle2, ArrowUp, ArrowDown, Layers, Binary } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface OrbitalState {
  id: string;
  electrons: number[]; // 1 for spin up, -1 for spin down
  capacity: number;
  energy: number;
}

const ORBITAL_LAYOUT = [
  { id: '1s', boxes: 1, energy: 1 },
  { id: '2s', boxes: 1, energy: 2 },
  { id: '2p', boxes: 3, energy: 3 },
  { id: '3s', boxes: 1, energy: 4 },
  { id: '3p', boxes: 3, energy: 5 },
  { id: '4s', boxes: 1, energy: 6 },
  { id: '3d', boxes: 5, energy: 7 },
  { id: '4p', boxes: 3, energy: 8 },
  { id: '5s', boxes: 1, energy: 9 },
  { id: '4d', boxes: 5, energy: 10 },
  { id: '5p', boxes: 3, energy: 11 },
  { id: '6s', boxes: 1, energy: 12 },
  { id: '4f', boxes: 7, energy: 13 },
  { id: '5d', boxes: 5, energy: 14 },
  { id: '6p', boxes: 3, energy: 15 },
  { id: '7s', boxes: 1, energy: 16 },
  { id: '5f', boxes: 7, energy: 17 },
  { id: '6d', boxes: 5, energy: 18 },
  { id: '7p', boxes: 3, energy: 19 },
];

interface QuantumConfigLabProps {
  element: ElementData;
}

const QuantumConfigLab: React.FC<QuantumConfigLabProps> = ({ element }) => {
  const [userConfig, setUserConfig] = useState<Record<string, number[]>>({});
  const [violations, setViolations] = useState<string[]>([]);

  useEffect(() => {
    setUserConfig({});
  }, [element.number]);

  const totalElectrons = useMemo(() => {
    return Object.values(userConfig).reduce<number>((acc, curr) => acc + (curr as number[]).length, 0);
  }, [userConfig]);

  useEffect(() => {
    const newViolations: string[] = [];
    
    let prevFull = true;
    for (const level of ORBITAL_LAYOUT) {
      const levelElectrons = (Object.entries(userConfig) as [string, number[]][])
        .filter(([key]) => key.startsWith(level.id))
        .reduce((acc, [_, spins]) => acc + (spins as number[]).length, 0);
      
      const maxCapacity = level.boxes * 2;
      
      if (levelElectrons > 0 && !prevFull) {
        newViolations.push(`Aufbau Violation: ${level.id} started before lower levels filled.`);
      }
      
      if (levelElectrons < maxCapacity) prevFull = false;
    }

    ORBITAL_LAYOUT.filter(l => l.boxes > 1).forEach(level => {
      const subshellBoxes = Array.from({ length: level.boxes }).map((_, i) => userConfig[`${level.id}-${i}`] || []);
      const totalInSubshell = (subshellBoxes as number[][]).reduce((acc, b) => acc + (b as number[]).length, 0);
      
      if (totalInSubshell > 1 && totalInSubshell <= level.boxes) {
        const hasPairs = subshellBoxes.some(b => b.length > 1);
        if (hasPairs) {
          newViolations.push(`Hund's Violation in ${level.id}: Orbitals must be singly occupied first.`);
        }
        const spins = subshellBoxes.flat();
        if (new Set(spins).size > 1) {
          newViolations.push(`Hund's Violation in ${level.id}: Single electrons must have parallel spins.`);
        }
      }
    });

    setViolations(newViolations);
  }, [userConfig]);

  const handleBoxClick = (orbId: string, boxIdx: number) => {
    const key = `${orbId}-${boxIdx}`;
    const current = userConfig[key] || [];
    
    let next: number[] = [];
    if (current.length === 0) next = [1]; 
    else if (current.length === 1 && current[0] === 1) next = [1, -1]; 
    else if (current.length === 1 && current[0] === -1) next = [1, -1]; 
    else next = []; 

    setUserConfig(prev => ({ ...prev, [key]: next }));
  };

  const autoFill = () => {
    const newConfig: Record<string, number[]> = {};
    let remaining = element.number;

    for (const level of ORBITAL_LAYOUT) {
      if (remaining <= 0) break;
      
      const toFill = Math.min(remaining, level.boxes * 2);
      remaining -= toFill;

      for (let i = 0; i < toFill; i++) {
        const boxIdx = i % level.boxes;
        const key = `${level.id}-${boxIdx}`;
        if (!newConfig[key]) newConfig[key] = [];
        
        if (i < level.boxes) newConfig[key].push(1); 
        else newConfig[key].push(-1); 
      }
    }
    setUserConfig(newConfig);
  };

  const reset = () => setUserConfig({});

  return (
    <div className="space-y-10">
      <div className="glass-panel p-10 rounded-[48px] border border-white/5 shadow-2xl relative overflow-hidden bg-[#020617]/40">
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none font-display font-black text-[12rem] uppercase select-none leading-none">
          Quantum
        </div>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10 mb-16 relative z-10">
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Binary size={12} className="text-indigo-500" />
              <h4 className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-[0.4em]">Electronic Configuration Lab / v2.0</h4>
            </div>
            <h2 className="text-5xl font-display font-bold text-white tracking-tighter uppercase leading-none">Orbital Box Simulation</h2>
            <p className="text-slate-500 text-sm mt-4 max-w-2xl font-light leading-relaxed">
              Manually place electrons to explore the fundamental principles of quantum mechanics. Achieve the target <span className="text-indigo-400 font-bold font-mono">Z={element.number}</span> for <span className="text-white font-bold">{element.name}</span>.
            </p>
          </div>
          
          <div className="flex gap-4 bg-[#020617]/60 p-2 rounded-2xl border border-white/10 shadow-2xl">
            <button 
              onClick={autoFill}
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-[10px] font-mono font-bold uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] active:scale-95 flex items-center gap-2"
            >
              <Zap size={14} />
              Auto-Fill
            </button>
            <button 
              onClick={reset}
              className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-mono font-bold uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2"
            >
              <RefreshCw size={14} />
              Reset
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 relative z-10">
          <div className="p-8 bg-[#020617]/60 rounded-[32px] border border-white/5 shadow-inner group">
            <div className="flex items-center gap-2 mb-4">
              <Activity size={12} className="text-slate-600" />
              <p className="text-[10px] font-mono font-bold text-slate-600 uppercase tracking-widest">Target Atomic Number</p>
            </div>
            <p className="text-5xl font-display font-bold text-white tracking-tighter">{element.number}</p>
          </div>
          <div className={`p-8 rounded-[32px] border transition-all duration-500 shadow-inner ${totalElectrons === element.number ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-[#020617]/60 border-white/5'}`}>
            <div className="flex items-center gap-2 mb-4">
              <Activity size={12} className={totalElectrons === element.number ? 'text-emerald-500' : 'text-slate-600'} />
              <p className={`text-[10px] font-mono font-bold uppercase tracking-widest ${totalElectrons === element.number ? 'text-emerald-500/60' : 'text-slate-600'}`}>Electrons Placed</p>
            </div>
            <p className={`text-5xl font-display font-bold tracking-tighter ${totalElectrons > element.number ? 'text-red-500' : totalElectrons === element.number ? 'text-emerald-400' : 'text-indigo-400'}`}>
              {totalElectrons}
            </p>
          </div>
          <div className={`p-8 rounded-[32px] border transition-all duration-500 shadow-inner ${violations.length > 0 ? 'bg-red-500/10 border-red-500/30' : 'bg-[#020617]/60 border-white/5'}`}>
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={12} className={violations.length > 0 ? 'text-red-500' : 'text-slate-600'} />
              <p className={`text-[10px] font-mono font-bold uppercase tracking-widest ${violations.length > 0 ? 'text-red-500/60' : 'text-slate-600'}`}>Rule Status</p>
            </div>
            <div className="flex items-center gap-3">
              {violations.length === 0 ? (
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 size={20} />
                  <span className="text-sm font-display font-bold uppercase tracking-tight">All Principles Satisfied</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-500">
                  <AlertTriangle size={20} className="animate-pulse" />
                  <span className="text-sm font-display font-bold uppercase tracking-tight">{violations.length} Violation(s)</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <AnimatePresence>
          {violations.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-12 p-8 bg-red-950/20 border border-red-500/20 rounded-[32px] space-y-3 relative z-10"
            >
              {violations.map((v, i) => (
                <div key={i} className="flex items-center gap-3 text-red-400 text-xs font-mono font-bold">
                  <AlertTriangle size={14} />
                  {v}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col-reverse gap-6 p-12 bg-[#020617]/60 rounded-[48px] border border-white/5 relative z-10 shadow-2xl">
          {ORBITAL_LAYOUT.map((level) => {
            const isTarget = totalElectrons > 0 && Object.keys(userConfig).some(k => k.startsWith(level.id));
            
            return (
              <div key={level.id} className="flex items-center gap-12 group">
                <div className="w-20 flex flex-col items-center">
                  <span className={`text-[11px] font-mono font-bold transition-all duration-500 ${isTarget ? 'text-indigo-400 scale-110' : 'text-slate-700'}`}>
                    {level.id.toUpperCase()}
                  </span>
                  <div className={`w-1 h-6 rounded-full mt-2 transition-all duration-500 ${isTarget ? 'bg-indigo-500/40' : 'bg-white/5'}`}></div>
                </div>

                <div className="flex gap-4">
                  {Array.from({ length: level.boxes }).map((_, i) => {
                    const spins = userConfig[`${level.id}-${i}`] || [];
                    return (
                      <button
                        key={i}
                        onClick={() => handleBoxClick(level.id, i)}
                        className={`
                          w-16 h-16 rounded-2xl border-2 transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden
                          ${spins.length > 0 
                            ? 'bg-indigo-600/10 border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.15)]' 
                            : 'bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/[0.08]'
                          }
                        `}
                      >
                        <AnimatePresence>
                          {spins.includes(1) && (
                            <motion.div 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 10 }}
                              className="text-indigo-400"
                            >
                              <ArrowUp size={24} strokeWidth={3} />
                            </motion.div>
                          )}
                          {spins.includes(-1) && (
                            <motion.div 
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="text-indigo-300"
                            >
                              <ArrowDown size={24} strokeWidth={3} />
                            </motion.div>
                          )}
                        </AnimatePresence>
                        
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center pointer-events-none transition-opacity">
                           {spins.length === 0 && <span className="text-[8px] font-mono font-bold text-slate-700 uppercase tracking-widest">Add</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="ml-auto text-[9px] font-mono text-slate-800 font-bold tracking-widest group-hover:text-slate-600 transition-colors">
                   CAPACITY: {level.boxes * 2}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-16 p-10 bg-[#020617] rounded-[40px] border border-white/5 overflow-x-auto whitespace-nowrap shadow-2xl relative z-10">
           <div className="flex items-center gap-3 mb-6">
             <Layers size={14} className="text-slate-600" />
             <span className="text-[10px] font-mono font-bold text-slate-600 uppercase tracking-[0.3em]">Computed Configuration String</span>
           </div>
           <div className="inline-flex gap-6 items-center">
             {ORBITAL_LAYOUT.map(level => {
               const count = (Object.entries(userConfig) as [string, number[]][])
                 .filter(([key]) => key.startsWith(level.id))
                 .reduce((acc, [_, spins]) => acc + (spins as number[]).length, 0);
               
               if (count === 0) return null;
               return (
                 <motion.div 
                   key={level.id} 
                   initial={{ opacity: 0, scale: 0.8 }}
                   animate={{ opacity: 1, scale: 1 }}
                   className="flex items-baseline"
                 >
                   <span className="text-3xl font-display font-bold text-white tracking-tight">{level.id}</span>
                   <sup className="text-lg font-mono font-black text-indigo-400 ml-0.5">{count}</sup>
                 </motion.div>
               );
             })}
             {totalElectrons === 0 && <span className="text-2xl font-display font-bold text-slate-800 italic uppercase tracking-widest">Awaiting Input...</span>}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <TheoryCard 
          icon={<ArrowUp size={20} />} 
          title="Aufbau Principle" 
          desc="Electrons fill subshells of the lowest available energy first (e.g. 1s before 2s)." 
         />
         <TheoryCard 
          icon={<RefreshCw size={20} />} 
          title="Pauli Principle" 
          desc="An orbital can hold at most two electrons, and they must have opposite spins." 
         />
         <TheoryCard 
          icon={<Layers size={20} />} 
          title="Hund's Rule" 
          desc="Every orbital in a subshell is singly occupied with one electron before any orbital is doubly occupied." 
         />
      </div>
    </div>
  );
};

const TheoryCard = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div className="glass-panel p-10 rounded-[40px] border border-white/5 bg-[#020617]/40 hover:bg-[#020617]/60 transition-all duration-500 group">
    <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 flex items-center justify-center mb-8 shadow-inner group-hover:bg-indigo-600/30 transition-all duration-500">
      <div className="text-indigo-400 group-hover:scale-110 transition-transform duration-500">
        {icon}
      </div>
    </div>
    <h4 className="text-xl font-display font-bold text-white mb-4 tracking-tight uppercase">{title}</h4>
    <p className="text-xs text-slate-500 leading-relaxed font-light">{desc}</p>
  </div>
);

export default QuantumConfigLab;