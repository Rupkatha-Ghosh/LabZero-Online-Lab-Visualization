import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { 
  Beaker, Droplets, Thermometer, Wind, RefreshCw, 
  AlertCircle, Info, Zap, FlaskConical, Droplet 
} from 'lucide-react';

// Types for our reagents
interface Reagent {
  id: string;
  name: string;
  formula: string;
  type: 'acid' | 'base' | 'neutral';
  strength: number; // 1 for HCl/NaOH, 2 for H2SO4, etc.
  color: string;
  glowColor: string;
}

const REAGENTS: Reagent[] = [
  { id: 'hcl', name: 'Hydrochloric Acid', formula: 'HCl', type: 'acid', strength: 1, color: 'text-sky-400', glowColor: 'rgba(56, 189, 248, 0.5)' },
  { id: 'h2so4', name: 'Sulfuric Acid', formula: 'H₂SO₄', type: 'acid', strength: 2, color: 'text-blue-500', glowColor: 'rgba(59, 130, 246, 0.5)' },
  { id: 'naoh', name: 'Sodium Hydroxide', formula: 'NaOH', type: 'base', strength: 1, color: 'text-pink-400', glowColor: 'rgba(244, 114, 182, 0.5)' },
  { id: 'koh', name: 'Potassium Hydroxide', formula: 'KOH', type: 'base', strength: 1.2, color: 'text-purple-400', glowColor: 'rgba(192, 132, 252, 0.5)' },
  { id: 'h2o', name: 'Distilled Water', formula: 'H₂O', type: 'neutral', strength: 0, color: 'text-cyan-200', glowColor: 'rgba(165, 243, 252, 0.3)' },
];

const RealExperimentLab: React.FC = () => {
  const [contents, setContents] = useState<{ id: string; amount: number }[]>([]);
  const [temperature, setTemperature] = useState(25);
  const [ph, setPh] = useState(7);
  const [isReacting, setIsReacting] = useState(false);
  const [pouring, setPouring] = useState<string | null>(null);
  const [totalVolume, setTotalVolume] = useState(0);
  
  const controls = useAnimation();
  const beakerRef = useRef<HTMLDivElement>(null);

  // Simulation Logic
  useEffect(() => {
    if (contents.length > 0) {
      setIsReacting(true);
      const timer = setTimeout(() => setIsReacting(false), 1500);
      
      // Calculate PH and Volume
      let netAcidity = 0;
      let newVolume = 0;
      let reactivityFactor = 0;

      contents.forEach(item => {
        const reagent = REAGENTS.find(r => r.id === item.id);
        if (!reagent) return;
        
        newVolume += item.amount;
        if (reagent.type === 'acid') {
          netAcidity -= item.amount * reagent.strength;
        } else if (reagent.type === 'base') {
          netAcidity += item.amount * reagent.strength;
        }

        // Reactivity for temperature (mixing acids and bases)
        const acids = contents.filter(c => REAGENTS.find(r => r.id === c.id)?.type === 'acid');
        const bases = contents.filter(c => REAGENTS.find(r => r.id === c.id)?.type === 'base');
        
        const totalAcid = acids.reduce((sum, c) => sum + c.amount * (REAGENTS.find(r => r.id === c.id)?.strength || 1), 0);
        const totalBase = bases.reduce((sum, c) => sum + c.amount * (REAGENTS.find(r => r.id === c.id)?.strength || 1), 0);
        
        reactivityFactor = Math.min(totalAcid, totalBase);
      });

      // Calculate pH: log-like mapping
      const phShift = netAcidity / (newVolume || 1);
      const targetPh = 7 + (phShift * 5);
      setPh(Math.max(0, Math.min(14, targetPh)));
      setTotalVolume(newVolume);

      // Temperature Logic
      const newTemp = 25 + (reactivityFactor * 0.4) + (newVolume * 0.02);
      setTemperature(prev => {
        const diff = newTemp - prev;
        return prev + (diff * 0.1); // Smooth transition
      });

      return () => clearTimeout(timer);
    }
  }, [contents]);

  const addReagent = (id: string) => {
    if (pouring || totalVolume >= 500) return;
    setPouring(id);
    
    // Pouring duration
    setTimeout(() => {
      setContents(prev => {
        const existing = prev.find(item => item.id === id);
        if (existing) {
          return prev.map(item => item.id === id ? { ...item, amount: item.amount + 20 } : item);
        }
        return [...prev, { id, amount: 20 }];
      });
      setPouring(null);
      // Shake effect on beaker
      controls.start({
        x: [0, -2, 2, -2, 2, 0],
        transition: { duration: 0.4 }
      });
    }, 800);
  };

  const resetExperiment = () => {
    setContents([]);
    setTemperature(25);
    setPh(7);
    setTotalVolume(0);
  };

  const getLiquidColor = () => {
    // Phenolphthalein indicator: Colorless in acid, Pink/Purple in base
    if (ph > 8.2) {
      const intensity = Math.min(0.8, (ph - 8) * 0.15);
      return `rgba(219, 39, 119, ${intensity})`; 
    }
    // Very acidic might be slightly yellowish or just clear
    if (ph < 3) return 'rgba(255, 255, 200, 0.15)';
    return 'rgba(255, 255, 255, 0.1)';
  };

  return (
    <div className="min-h-full flex flex-col items-center justify-start p-4 md:p-10 space-y-12 max-w-[1600px] mx-auto overflow-y-auto scrollbar-hide">
      
      {/* HUD / Header */}
      <div className="w-full flex flex-col md:flex-row items-center justify-between gap-8 z-10">
        <div className="space-y-2 text-center md:text-left">
          <motion.div 
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-indigo-400 font-mono text-[10px] tracking-[0.5em] uppercase"
          >
            <div className="w-8 h-px bg-indigo-500/50" />
            Advanced Chemical Simulator
          </motion.div>
          <h2 className="text-4xl md:text-7xl font-display font-black text-white tracking-tighter uppercase leading-none">
            Reaction <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">Dynamics</span>
          </h2>
        </div>

        <div className="flex gap-4">
          <MetricDisplay 
            icon={<Thermometer size={16} />} 
            label="Temp" 
            value={`${temperature.toFixed(1)}°C`} 
            color={temperature > 60 ? 'text-orange-500' : 'text-indigo-400'}
            warning={temperature > 75}
          />
          <MetricDisplay 
            icon={<FlaskConical size={16} />} 
            label="pH" 
            value={ph.toFixed(2)} 
            color={ph < 5 ? 'text-red-400' : ph > 9 ? 'text-purple-400' : 'text-green-400'}
          />
          <MetricDisplay 
            icon={<Droplet size={16} />} 
            label="Volume" 
            value={`${totalVolume}ml`} 
            color="text-sky-400"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 w-full items-start">
        
        {/* REAGENT SHELF (Col 4) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel p-8 rounded-[3rem] border border-white/5 bg-white/[0.01] backdrop-blur-3xl shadow-2xl space-y-8">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h3 className="text-xs font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
                <Zap size={14} className="text-amber-400" />
                Chemical Reagents
              </h3>
              <span className="text-[10px] font-mono text-slate-600">Capacity: {totalVolume}/500ml</span>
            </div>

            <div className="grid grid-cols-1 gap-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-hide">
              {REAGENTS.map((reagent) => (
                <ReagentActionCard 
                  key={reagent.id}
                  reagent={reagent}
                  onAdd={() => addReagent(reagent.id)}
                  isPouring={pouring === reagent.id}
                  disabled={pouring !== null || totalVolume >= 500}
                />
              ))}
            </div>

            <button
              onClick={resetExperiment}
              className="w-full py-5 rounded-[2rem] bg-rose-500/5 border border-rose-500/10 hover:bg-rose-500/20 hover:border-rose-500/40 text-rose-400 transition-all duration-500 flex items-center justify-center gap-3 font-mono text-[10px] font-black uppercase tracking-[0.3em]"
            >
              <RefreshCw size={14} className={isReacting ? 'animate-spin' : ''} />
              Reset Lab Environment
            </button>
          </div>
        </div>

        {/* INTERACTIVE STAGE (Col 8) */}
        <div className="lg:col-span-8 relative flex flex-col items-center justify-center min-h-[650px] glass-panel rounded-[4rem] border border-white/5 bg-gradient-to-b from-black/40 to-transparent overflow-hidden shadow-inner">
          
          {/* Enhanced Environment Graphics */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(99,102,241,0.05),transparent_60%)]" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-soft-light pointer-events-none" />
          
          {/* Pouring Animation Stream */}
          <AnimatePresence>
            {pouring && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 350 }}
                exit={{ opacity: 0, height: 400, y: 100 }}
                className="absolute top-0 z-40 flex flex-col items-center"
              >
                <div className={`w-2 rounded-full bg-gradient-to-b ${REAGENTS.find(r => r.id === pouring)?.color.replace('text-', 'from-').replace('400', '500')} to-transparent shadow-[0_0_30px_rgba(255,255,255,0.4)] h-full`} />
                <motion.div 
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 0.2 }}
                  className="w-6 h-6 rounded-full bg-white/20 blur-md -mt-4"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* THE BEAKER (High Fidelity) */}
          <motion.div 
            animate={controls}
            className="relative w-[320px] h-[450px] flex flex-col items-center justify-end"
          >
            {/* Beaker Outer Rim */}
            <div className="absolute top-0 w-[105%] h-12 border-t-2 border-white/20 rounded-[50%] -translate-y-4" />
            
            {/* Beaker Glass Body */}
            <div className="absolute inset-0 border-[4px] border-white/10 rounded-b-[5rem] rounded-t-xl bg-white/[0.03] backdrop-blur-sm shadow-[inset_0_0_60px_rgba(255,255,255,0.05),0_30px_60px_rgba(0,0,0,0.6)] overflow-hidden">
              
              {/* Vertical Thickness Lines */}
              <div className="absolute left-0 top-0 bottom-0 w-px bg-white/10" />
              <div className="absolute right-0 top-0 bottom-0 w-px bg-white/10" />

              {/* Liquid System */}
              <motion.div
                animate={{ 
                  height: `${Math.min(96, (totalVolume / 5.2) + 4)}%`,
                  backgroundColor: getLiquidColor(),
                }}
                className="absolute bottom-0 w-full transition-all duration-[1500ms] cubic-bezier(0.4, 0, 0.2, 1)"
              >
                {/* Surface Dynamics (Waves) */}
                <motion.div 
                  animate={{ 
                    y: isReacting ? [-2, 2, -2] : [-1, 1, -1],
                    rotate: isReacting ? [-0.5, 0.5, -0.5] : [0, 0, 0]
                  }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute top-0 left-0 w-full h-8 bg-gradient-to-b from-white/40 via-white/10 to-transparent blur-[2px]"
                />

                {/* Reaction Particles (High Res) */}
                <AnimatePresence>
                  {isReacting && (
                    <div className="absolute inset-0">
                      {[...Array(20)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ y: 300, x: Math.random() * 300, scale: 0, opacity: 0 }}
                          animate={{ 
                            y: -100, 
                            x: (Math.random() - 0.5) * 50 + (i * 15),
                            scale: [0, 1.2, 0.8],
                            opacity: [0, 0.6, 0]
                          }}
                          transition={{ duration: 1.5 + Math.random(), repeat: Infinity, delay: Math.random() }}
                          className="absolute w-4 h-4 rounded-full bg-white/30 blur-[3px]"
                        />
                      ))}
                    </div>
                  )}
                </AnimatePresence>

                {/* Internal Glow on Action */}
                <AnimatePresence>
                  {pouring && (
                    <motion.div 
                      initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}
                      className={`absolute inset-0 bg-${REAGENTS.find(r => r.id === pouring)?.id === 'h2so4' ? 'blue-500' : 'indigo-500'} blur-3xl`}
                    />
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Beaker Markings */}
              <div className="absolute right-8 h-full flex flex-col justify-between py-16 opacity-30 pointer-events-none">
                {[500, 400, 300, 200, 100].map(val => (
                  <div key={val} className="flex items-center gap-4">
                    <span className="text-[10px] font-mono text-white font-black">{val}</span>
                    <div className="w-8 h-[2px] bg-white rounded-full" />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Floor Reflection */}
            <div className="absolute -bottom-16 w-[400px] h-20 bg-indigo-500/10 blur-[60px] rounded-full -z-10" />
          </motion.div>

          {/* Danger Heat Waves */}
          <AnimatePresence>
            {temperature > 65 && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-x-0 top-1/4 flex justify-around pointer-events-none overflow-hidden h-64"
              >
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <motion.div
                    key={i}
                    animate={{ 
                      y: [0, -200], 
                      x: [0, (i % 2 === 0 ? 30 : -30)],
                      opacity: [0, 0.3, 0],
                      scale: [0.5, 1.5]
                    }}
                    transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.4 }}
                  >
                    <Wind size={64} className="text-white/20" />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Safety Overlay */}
      <AnimatePresence>
        {temperature > 85 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed bottom-12 right-12 flex items-center gap-6 px-10 py-6 bg-red-950/80 border border-red-500/50 rounded-[3rem] backdrop-blur-3xl z-[100] shadow-[0_0_100px_rgba(239,68,68,0.4)]"
          >
            <div className="w-16 h-16 rounded-[2rem] bg-red-600 flex items-center justify-center text-white animate-bounce shadow-lg">
              <AlertCircle size={32} />
            </div>
            <div className="space-y-1">
              <h4 className="text-xl font-display font-black text-white uppercase tracking-tighter">Thermal Breach</h4>
              <p className="text-xs text-red-400/80 font-mono uppercase tracking-widest font-bold">Critical Reaction Temperature Detected</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* --- SUBCOMPONENTS --- */

const MetricDisplay = ({ icon, label, value, color, warning }: any) => (
  <motion.div 
    whileHover={{ y: -4 }}
    className={`px-6 py-4 rounded-[2rem] glass-panel border border-white/5 flex items-center gap-4 shadow-xl ${warning ? 'border-red-500/50 bg-red-500/5' : ''}`}
  >
    <div className={`w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center ${color}`}>
      {icon}
    </div>
    <div className="flex flex-col">
      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">{label}</span>
      <span className={`text-xl font-mono font-black ${color} tracking-tighter`}>{value}</span>
    </div>
  </motion.div>
);

const ReagentActionCard = ({ reagent, onAdd, isPouring, disabled }: any) => (
  <motion.button
    whileHover={{ scale: 1.02, x: 4 }}
    whileTap={{ scale: 0.98 }}
    onClick={onAdd}
    disabled={disabled}
    className={`w-full relative group p-6 rounded-[2.5rem] border border-white/5 bg-white/[0.02] transition-all duration-500 flex items-center gap-6 overflow-hidden ${
      isPouring ? 'ring-2 ring-white/20 bg-white/10' : ''
    }`}
  >
    <div className={`w-14 h-14 rounded-3xl bg-white/5 flex items-center justify-center transition-transform group-hover:scale-110 duration-500 ${reagent.color}`}>
      <Droplets size={24} />
    </div>

    <div className="flex-1 text-left">
      <div className="flex items-center gap-2">
        <span className={`text-[10px] font-black uppercase tracking-widest ${reagent.color}`}>{reagent.formula}</span>
        <div className="w-1 h-1 rounded-full bg-slate-700" />
        <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">{reagent.type}</span>
      </div>
      <h4 className="text-md font-black text-white uppercase tracking-tighter group-hover:text-indigo-400 transition-colors">{reagent.name}</h4>
    </div>

    <div className="flex flex-col items-end gap-1">
      <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border border-white/10 ${isPouring ? 'bg-white text-black' : 'text-slate-400'}`}>
        {isPouring ? 'POURING...' : '+20ml'}
      </div>
      <span className="text-[8px] font-mono text-slate-600">Str: {reagent.strength}x</span>
    </div>

    {/* Hover Glow */}
    <div 
      className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-700 pointer-events-none" 
      style={{ background: `radial-gradient(circle at center, ${reagent.glowColor}, transparent 70%)` }}
    />
  </motion.button>
);

export default RealExperimentLab;