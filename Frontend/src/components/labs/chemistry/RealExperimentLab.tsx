import { useLanguage } from '../../../context/LanguageContext';
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import {
  Beaker, Droplets, Thermometer, Wind, RefreshCw,
  AlertCircle, Info, Zap, FlaskConical, Droplet, Skull, Sparkles, X
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
  
  const { t } = useLanguage();const [contents, setContents] = useState<{ id: string; amount: number }[]>([]);
  const [temperature, setTemperature] = useState(25);
  const [ph, setPh] = useState(7);
  const [isReacting, setIsReacting] = useState(false);
  const [pouring, setPouring] = useState<string | null>(null);
  const [totalVolume, setTotalVolume] = useState(0);
  const [oopsie, setOopsie] = useState<{
    id: number;
    title: string;
    body: string;
    severity: 'info' | 'warning' | 'danger';
    icon: 'skull' | 'sparkles' | 'alert';
  } | null>(null);
  const oopsieCounterRef = useRef(0);
  // Beaker breaks when overflowed or exothermic burst occurs.
  // The shards + crack overlay are then shown until the user resets.
  const [beakerBroken, setBeakerBroken] = useState(false);
  // Bumped on every reagent add so bubble / gas particles restart their loops.
  const [bubbleSeed, setBubbleSeed] = useState(0);
  
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

      // OOPSIE! Wrong-One detection — encourage students to try
      // "wrong" combos and see safe visual feedback (no explosions).
      const distinctIds = new Set(contents.map((c) => c.id));
      const distinctReagents = contents
        .map((c) => REAGENTS.find((r) => r.id === c.id))
        .filter((r): r is Reagent => Boolean(r));
      const acidCount = distinctReagents.filter((r) => r.type === 'acid').length;
      const baseCount = distinctReagents.filter((r) => r.type === 'base').length;
      const hasWater = distinctReagents.some((r) => r.id === 'h2o');

      // Every fresh add re-seeds the bubble / gas particle loops so they
      // visibly surge instead of looping in place.
      setBubbleSeed((s) => s + 1);

      // Only fire OOPSIE on the *latest* add (contents changed), and
      // when there's at least 2 distinct reagents (a real "combination").
      const triggerOopsie = (
        title: string,
        body: string,
        severity: 'info' | 'warning' | 'danger',
        icon: 'skull' | 'sparkles' | 'alert'
      ) => {
        oopsieCounterRef.current += 1;
        setOopsie({
          id: oopsieCounterRef.current,
          title,
          body,
          severity,
          icon,
        });
      };

      if (distinctIds.size >= 2) {
        if (newVolume >= 500) {
          triggerOopsie(
            'OOPSIE! Beaker overflow',
            'The beaker cannot safely hold more than 500ml of reagent. In a real lab this is a serious spill hazard — always add in small, measured amounts.',
            'warning',
            'alert'
          );
        } else if (reactivityFactor >= 40) {
          triggerOopsie(
            'OOPSIE! Exothermic burst',
            'Concentrated acid + concentrated base in one beaker releases a LOT of heat. In a real lab this can crack glassware and splash — always add acid to water slowly, never the other way around.',
            'warning',
            'alert'
          );
        } else if (acidCount >= 2 && baseCount === 0) {
          triggerOopsie(
            'OOPSIE! Two acids',
            'You just added an acid to an acid — they do not react! In a real lab, this would just make a stronger acid solution. Try pairing an acid with a base to see neutralization.',
            'info',
            'sparkles'
          );
        } else if (baseCount >= 2 && acidCount === 0) {
          triggerOopsie(
            'OOPSIE! Two bases',
            'Bases do not react with other bases — there is nothing to neutralize here. Add a strong acid like HCl or H₂SO₄ to trigger a real reaction.',
            'info',
            'sparkles'
          );
        } else if (hasWater && distinctReagents.length === 1) {
          triggerOopsie(
            'OOPSIE! Just water',
            'Distilled water does not react on its own — it only dilutes. Mix water with an acid or base if you want to see a change in pH.',
            'info',
            'sparkles'
          );
        }
      }

      // Beaker-break visuals: triggered on overflow OR exothermic burst.
      // Lowered to 40 so it can be reached in a few pours during testing
      // (H2SO4 + NaOH + KOH = ~40 reactivity, 3 pours).
      if (newVolume >= 500 || reactivityFactor >= 40) {
        setBeakerBroken(true);
      }

      return () => clearTimeout(timer);
    }
  }, [contents]);

  useEffect(() => {
    if (!oopsie) return;
    const id = window.setTimeout(() => setOopsie(null), 5_000);
    return () => window.clearTimeout(id);
  }, [oopsie]);

  const addReagent = (id: string) => {
  
    if (pouring || totalVolume >= 500 || beakerBroken) return;
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
      // Shake effect on beaker — more violent if already stressed
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
    setBeakerBroken(false);
    setBubbleSeed((s) => s + 1);
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

  // Derived flags for the OOPSIE visual feedback layers.
  const hasAcidBaseMix = contents.some((c) => {
    const r = REAGENTS.find((x) => x.id === c.id);
    return r?.type === 'acid';
  }) && contents.some((c) => {
    const r = REAGENTS.find((x) => x.id === c.id);
    return r?.type === 'base';
  });
  // Gas wisps appear whenever the reaction is vigorous: an acid+base mix
  // or a high temperature reading from prior neutralization heat.
  const isGassing = hasAcidBaseMix || temperature > 50;
  // Bubbles inside the liquid: only when there's actually a mix to bubble.
  const shouldBubble = hasAcidBaseMix && totalVolume > 0;

  return (
    <div className="min-h-full flex flex-col items-center justify-start p-4 md:p-10 space-y-12 max-w-[1600px] mx-auto overflow-y-auto scrollbar-hide">
      
      {/* HUD / Header */}
      <div className="w-full flex flex-col md:flex-row items-center justify-between gap-8 z-10">
        <div className="space-y-2 text-center md:text-left">
          <motion.div 
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-indigo-400 font-mono text-[10px] tracking-[0.5em] uppercase"
          >
            <div className="w-8 h-px bg-indigo-500/50" />{t('Advanced Chemical Simulator')}</motion.div>
          <h2 className="text-4xl md:text-7xl font-display font-black text-white tracking-tighter uppercase leading-none">{t('Reaction')}<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">{t('Dynamics')}</span>
          </h2>
        </div>

        <div className="flex gap-4">
          <MetricDisplay 
            icon={<Thermometer size={16} />} 
            label={t('Temp')} 
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
            label={t('Volume')} 
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
                <Zap size={14} className="text-amber-400" />{t('Chemical Reagents')}</h3>
              <span className={`text-[10px] font-mono ${beakerBroken ? 'text-rose-500' : 'text-slate-600'}`}>
                {beakerBroken ? '⚠ BEAKER CRACKED — Reset to continue' : `Capacity: ${totalVolume}/500ml`}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-hide">
              {REAGENTS.map((reagent) => (
                <ReagentActionCard 
                  key={reagent.id}
                  reagent={reagent}
                  onAdd={() => addReagent(reagent.id)}
                  isPouring={pouring === reagent.id}
                  disabled={pouring !== null || totalVolume >= 500 || beakerBroken}
                />
              ))}
            </div>

            <button
              onClick={resetExperiment}
              className={`w-full py-5 rounded-[2rem] border transition-all duration-500 flex items-center justify-center gap-3 font-mono text-[10px] font-black uppercase tracking-[0.3em] ${
                beakerBroken
                  ? 'bg-rose-500/20 border-rose-500/60 text-rose-300 hover:bg-rose-500/30 animate-pulse shadow-[0_0_30px_rgba(244,63,94,0.35)]'
                  : 'bg-rose-500/5 border-rose-500/10 hover:bg-rose-500/20 hover:border-rose-500/40 text-rose-400'
              }`}
            >
              <RefreshCw size={14} className={isReacting ? 'animate-spin' : ''} />{t(beakerBroken ? 'Repair Beaker' : 'Reset Lab Environment')}</button>
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
                  height: beakerBroken
                    ? '0%'
                    : `${Math.min(96, (totalVolume / 5.2) + 4)}%`,
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

                {/* Acid + Base Bubbles: continuous CO2-like bubbles rising
                    from the bottom of the liquid, popping at the surface. */}
                <AnimatePresence>
                  {shouldBubble && !beakerBroken && (
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                      {Array.from({ length: 14 }).map((_, i) => {
                        const left = 8 + ((i * 37) % 84);
                        const size = 4 + ((i * 7) % 10);
                        return (
                          <motion.div
                            key={`bubble-${bubbleSeed}-${i}`}
                            initial={{ y: 0, opacity: 0, scale: 0.4 }}
                            animate={{
                              y: -380,
                              x: [0, (i % 2 === 0 ? 12 : -12), 0],
                              opacity: [0, 0.85, 0.85, 0],
                              scale: [0.4, 1, 1.1, 0.6],
                            }}
                            transition={{
                              duration: 1.6 + (i % 5) * 0.25,
                              repeat: Infinity,
                              delay: (i * 0.18) % 1.6,
                              ease: 'easeOut',
                            }}
                            className="absolute bottom-0 rounded-full bg-white/70 border border-white/80 shadow-[0_0_8px_rgba(255,255,255,0.6)]"
                            style={{
                              left: `${left}%`,
                              width: `${size}px`,
                              height: `${size}px`,
                            }}
                          />
                        );
                      })}
                    </div>
                  )}
                </AnimatePresence>

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

              {/* Gas Wisps: vapor rising above the liquid surface when the
                  reaction is exothermic or acid+base are mixing. */}
              <AnimatePresence>
                {isGassing && !beakerBroken && totalVolume > 0 && (
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {Array.from({ length: 6 }).map((_, i) => {
                      const left = 12 + ((i * 53) % 76);
                      return (
                        <motion.div
                          key={`gas-${bubbleSeed}-${i}`}
                          initial={{ y: 0, opacity: 0, scale: 0.5 }}
                          animate={{
                            y: -260,
                            x: [(i % 2 === 0 ? 18 : -18), (i % 2 === 0 ? -12 : 12)],
                            opacity: [0, 0.55, 0],
                            scale: [0.5, 1.6, 2.4],
                          }}
                          transition={{
                            duration: 2.4 + (i % 4) * 0.3,
                            repeat: Infinity,
                            delay: (i * 0.32) % 1.8,
                            ease: 'easeOut',
                          }}
                          className="absolute bottom-0 rounded-full bg-white/30 backdrop-blur-md"
                          style={{
                            left: `${left}%`,
                            width: '32px',
                            height: '32px',
                            filter: 'blur(6px)',
                          }}
                        />
                      );
                    })}
                  </div>
                )}
              </AnimatePresence>

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
            
            {/* Beaker Break Overlay — crack pattern + falling glass shards.
                Triggered on overflow or exothermic burst; cleared by reset. */}
            <AnimatePresence>
              {beakerBroken && (
                <>
                  {/* Static crack pattern across the glass body */}
                  <motion.svg
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    viewBox="0 0 320 450"
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    preserveAspectRatio="none"
                  >
                    <g
                      stroke="white"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      fill="none"
                      style={{ filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.7))' }}
                    >
                      <path d="M160 30 L120 110 L165 175 L100 250 L150 340" opacity="0.95" />
                      <path d="M160 30 L210 95 L175 160 L230 235 L195 320" opacity="0.9" />
                      <path d="M120 110 L80 160" opacity="0.7" />
                      <path d="M210 95 L255 145" opacity="0.7" />
                      <path d="M165 175 L195 200" opacity="0.7" />
                      <path d="M100 250 L70 295" opacity="0.6" />
                      <path d="M230 235 L270 285" opacity="0.6" />
                    </g>
                  </motion.svg>

                  {/* Falling glass shards — scatter outward, rotate, fade */}
                  <div className="absolute inset-0 pointer-events-none">
                    {Array.from({ length: 14 }).map((_, i) => {
                      const startX = 140 + (i % 5) * 12;
                      const startY = 200 + Math.floor(i / 5) * 40;
                      const dx = (Math.random() - 0.5) * 420;
                      const dy = 360 + Math.random() * 180;
                      const rot = (Math.random() - 0.5) * 900;
                      return (
                        <motion.div
                          key={`shard-${i}`}
                          initial={{ x: startX, y: startY, rotate: 0, opacity: 1 }}
                          animate={{
                            x: startX + dx,
                            y: startY + dy,
                            rotate: rot,
                            opacity: 0,
                          }}
                          transition={{
                            duration: 1.1 + Math.random() * 0.7,
                            ease: 'easeIn',
                            delay: i * 0.04,
                          }}
                          className="absolute w-3 h-5 bg-white/35 border border-white/70"
                          style={{
                            clipPath:
                              i % 4 === 0
                                ? 'polygon(50% 0%, 0% 100%, 100% 100%)'
                                : i % 4 === 1
                                ? 'polygon(0% 0%, 100% 30%, 70% 100%)'
                                : i % 4 === 2
                                ? 'polygon(20% 0%, 100% 0%, 80% 100%, 0% 80%)'
                                : 'polygon(0% 20%, 60% 0%, 100% 100%, 30% 100%)',
                          }}
                        />
                      );
                    })}
                  </div>
                </>
              )}
            </AnimatePresence>

            {/* Floor Reflection */}
            <div className="absolute -bottom-16 w-[400px] h-20 bg-indigo-500/10 blur-[60px] rounded-full -z-10" />

            {/* Spill on the floor — appears when the beaker breaks */}
            <AnimatePresence>
              {beakerBroken && (
                <motion.div
                  initial={{ opacity: 0, scaleX: 0.4, scaleY: 0.2 }}
                  animate={{ opacity: 1, scaleX: 1, scaleY: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-[520px] h-10 rounded-full pointer-events-none"
                  style={{
                    background:
                      'radial-gradient(ellipse at center, rgba(219,39,119,0.55) 0%, rgba(99,102,241,0.45) 40%, transparent 75%)',
                    filter: 'blur(8px)',
                  }}
                />
              )}
            </AnimatePresence>
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
              <h4 className="text-xl font-display font-black text-white uppercase tracking-tighter">{t('Thermal Breach')}</h4>
              <p className="text-xs text-red-400/80 font-mono uppercase tracking-widest font-bold">{t('Critical Reaction Temperature Detected')}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* OOPSIE! Wrong-One Toast — encourages safe experimentation */}
      <AnimatePresence>
        {oopsie && (
          <motion.div
            key={oopsie.id}
            initial={{ opacity: 0, y: 40, scale: 0.92, rotate: -2 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, y: -20, scale: 0.95, transition: { duration: 0.25 } }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
            className="fixed top-8 left-1/2 -translate-x-1/2 z-[110] max-w-xl w-[92vw] md:w-auto"
          >
            <div
              className={`flex items-start gap-4 px-5 py-4 rounded-2xl backdrop-blur-2xl border-2 shadow-2xl ${
                oopsie.severity === 'danger'
                  ? 'bg-rose-950/85 border-rose-500/60 shadow-rose-500/30'
                  : oopsie.severity === 'warning'
                  ? 'bg-amber-950/85 border-amber-500/60 shadow-amber-500/30'
                  : 'bg-indigo-950/85 border-indigo-500/60 shadow-indigo-500/30'
              }`}
            >
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                  oopsie.severity === 'danger'
                    ? 'bg-rose-600 text-white'
                    : oopsie.severity === 'warning'
                    ? 'bg-amber-500 text-black'
                    : 'bg-indigo-500 text-white'
                }`}
              >
                {oopsie.icon === 'skull' ? <Skull size={22} /> : oopsie.icon === 'sparkles' ? <Sparkles size={22} /> : <AlertCircle size={22} />}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-display font-black uppercase tracking-tighter text-white">
                  {oopsie.title}
                </h4>
                <p className="text-xs text-slate-200/90 mt-1 leading-relaxed">
                  {oopsie.body}
                </p>
              </div>
              <button
                onClick={() => setOopsie(null)}
                className="shrink-0 p-1 rounded-md text-white/60 hover:text-white hover:bg-white/10"
                aria-label="Dismiss"
              >
                <X size={16} />
              </button>
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