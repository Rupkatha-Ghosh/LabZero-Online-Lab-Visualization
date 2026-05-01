import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Thermometer, Zap, Activity, Info, RefreshCw, Gauge, FlaskConical, Wind } from 'lucide-react';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

const ThermodynamicsVisualizer: React.FC = () => {
  const [temperature, setTemperature] = useState(300); // Kelvin
  const [volume, setVolume] = useState(2); // relative units
  const [pressure, setPressure] = useState(1); // relative units
  const [isHeating, setIsHeating] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(null);

  // Ideal Gas Law: PV = nRT
  useEffect(() => {
    const nR = 0.5; // constant for simulation
    const calculatedPressure = (nR * temperature) / volume;
    setPressure(calculatedPressure);
  }, [temperature, volume]);

  // Particle System Logic
  useEffect(() => {
    // Initialize particles
    const initialParticles: Particle[] = Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      x: Math.random() * 280,
      y: Math.random() * 380,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
    }));
    setParticles(initialParticles);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const render = () => {
      ctx.clearRect(0, 0, 300, 400);
      
      const speedFactor = Math.sqrt(temperature / 300);
      const chamberWidth = 300;
      const chamberHeight = 400 * (volume / 4); // Volume affects piston height

      setParticles(prev => prev.map(p => {
        let nx = p.x + p.vx * speedFactor;
        let ny = p.y + p.vy * speedFactor;
        let nvx = p.vx;
        let nvy = p.vy;

        // Collision with walls
        if (nx < 5 || nx > chamberWidth - 5) nvx *= -1;
        if (ny < 5 || ny > chamberHeight - 5) nvy *= -1;

        // Bound within chamber
        nx = Math.max(5, Math.min(chamberWidth - 5, nx));
        ny = Math.max(5, Math.min(chamberHeight - 5, ny));

        // Draw particle
        ctx.beginPath();
        ctx.arc(nx, ny, 3, 0, Math.PI * 2);
        ctx.fillStyle = temperature > 400 ? '#f87171' : temperature > 350 ? '#fbbf24' : '#60a5fa';
        ctx.shadowBlur = 10;
        ctx.shadowColor = ctx.fillStyle;
        ctx.fill();

        return { ...p, x: nx, y: ny, vx: nvx, vy: nvy };
      }));

      animationRef.current = requestAnimationFrame(render);
    };

    render();
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [temperature, volume]);

  return (
    <div className="min-h-full flex flex-col items-center p-8 space-y-12 max-w-[1600px] mx-auto overflow-y-auto scrollbar-hide">
      
      <div className="w-full flex flex-col md:flex-row items-center justify-between gap-8 z-10">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-indigo-400 font-mono text-[10px] tracking-[0.5em] uppercase">
            <div className="w-8 h-px bg-indigo-500/50" />
            Thermodynamics Engine Lab
          </div>
          <h2 className="text-4xl md:text-7xl font-display font-black text-white tracking-tighter uppercase leading-none">
            Kinetic <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-rose-500 to-indigo-600">Dynamics</span>
          </h2>
        </div>

        <div className="flex gap-4">
          <MetricDisplay 
            icon={<Thermometer size={16} />} 
            label="Temp" 
            value={`${temperature.toFixed(0)}K`} 
            color={temperature > 450 ? 'text-orange-500' : 'text-indigo-400'}
          />
          <MetricDisplay 
            icon={<Gauge size={16} />} 
            label="Pressure" 
            value={pressure.toFixed(2)} 
            color="text-rose-400"
          />
          <MetricDisplay 
            icon={<FlaskConical size={16} />} 
            label="Volume" 
            value={`${volume.toFixed(1)}L`} 
            color="text-emerald-400"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 w-full items-start">
        
        {/* Controls Panel */}
        <div className="lg:col-span-4 space-y-8">
          <div className="glass-panel p-8 rounded-[3rem] border border-white/5 bg-white/[0.01] backdrop-blur-3xl shadow-2xl space-y-10">
             <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <h3 className="text-xs font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
                  <Activity size={14} className="text-rose-400" />
                  Control Module
                </h3>
             </div>

             <ControlGroup 
                label="Isothermal Heating" 
                value={temperature} 
                unit="K" 
                min={200} 
                max={600} 
                icon={<Thermometer size={14}/>}
                onChange={setTemperature}
             />

             <ControlGroup 
                label="Compression / Expansion" 
                value={volume} 
                unit="L" 
                min={0.5} 
                max={4} 
                icon={<FlaskConical size={14}/>}
                onChange={setVolume}
             />

             <div className="p-8 bg-rose-500/5 rounded-[2.5rem] border border-rose-500/10 space-y-4">
                <div className="flex items-center gap-2 text-rose-400">
                  <Info size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-rose-400/80">Boyles & Charles Law</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  As you <span className="text-white font-bold">decrease volume</span>, notice how the pressure surges. <span className="text-white font-bold">Increasing temperature</span> adds kinetic energy to the particles, leading to more frequent wall collisions.
                </p>
             </div>

             <button 
                onClick={() => { setTemperature(300); setVolume(2); }}
                className="w-full py-5 rounded-[2rem] bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 transition-all font-mono text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3"
              >
                <RefreshCw size={14} />
                Reset System State
             </button>
          </div>
        </div>

        {/* Visualizer & Graph */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8 h-[650px]">
           
           {/* THE PISTON CHAMBER */}
           <div className="relative glass-panel rounded-[4rem] border border-white/5 bg-black/40 overflow-hidden flex flex-col items-center justify-end p-12 shadow-inner">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(99,102,241,0.05),transparent_70%)]" />
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none" />

              {/* PISTON HEAD */}
              <motion.div 
                animate={{ y: -400 * (volume / 4) }}
                className="absolute bottom-0 w-[80%] z-20"
              >
                <div className="w-full h-12 bg-gradient-to-b from-slate-400 to-slate-600 rounded-xl shadow-2xl border border-white/10 relative">
                   <div className="absolute -top-60 left-1/2 -translate-x-1/2 w-8 h-64 bg-slate-700/40 rounded-t-full border-x border-white/5" />
                </div>
              </motion.div>

              {/* CHAMBER WALLS */}
              <div className="relative w-full h-full border-x-[6px] border-b-[6px] border-white/10 rounded-b-[3rem] bg-white/[0.02] overflow-hidden">
                 <canvas 
                   ref={canvasRef} 
                   width={300} 
                   height={400} 
                   className="w-full h-full"
                 />
                 
                 {/* Temperature Glow */}
                 <motion.div 
                   animate={{ opacity: (temperature - 200) / 600 }}
                   className="absolute inset-0 bg-orange-500/10 blur-3xl pointer-events-none"
                 />
              </div>

              <div className="mt-8 flex items-center gap-4 text-slate-500">
                <Wind size={16} className="animate-pulse" />
                <span className="text-[10px] font-mono uppercase tracking-[0.3em]">Molecular Kinetic Field</span>
              </div>
           </div>

           {/* P-V GRAPH */}
           <div className="glass-panel rounded-[4rem] border border-white/5 bg-black/40 p-12 flex flex-col items-center justify-between shadow-2xl">
              <div className="w-full space-y-2">
                 <h4 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                   <Activity size={14} className="text-indigo-400" />
                   State Diagram
                 </h4>
                 <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">Pressure-Volume Relationship</p>
              </div>

              {/* The SVG Graph */}
              <div className="flex-1 w-full relative mt-10">
                 <svg viewBox="0 0 400 400" className="w-full h-full overflow-visible">
                    {/* Axes */}
                    <line x1="40" y1="360" x2="380" y2="360" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
                    <line x1="40" y1="360" x2="40" y2="40" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
                    
                    {/* Curve (Ideal Gas Isotherm) */}
                    <path 
                      d={Array.from({ length: 50 }).map((_, i) => {
                        const v = 0.5 + (i / 50) * 3.5;
                        const p = (0.5 * temperature) / v;
                        const x = 40 + (v / 4) * 320;
                        const y = 360 - (p / 4) * 320;
                        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                      }).join(' ')}
                      fill="none"
                      stroke="rgba(99, 102, 241, 0.4)"
                      strokeWidth="3"
                      strokeDasharray="8,4"
                    />

                    {/* Current State Point */}
                    <motion.circle 
                      animate={{ 
                        cx: 40 + (volume / 4) * 320, 
                        cy: 360 - (pressure / 4) * 320 
                      }}
                      r="10"
                      fill="#ef4444"
                      className="shadow-[0_0_20px_rgba(239,68,68,0.6)]"
                    />
                    
                    <text x="360" y="380" fill="rgba(255,255,255,0.2)" fontSize="12" fontWeight="900">V</text>
                    <text x="15" y="60" fill="rgba(255,255,255,0.2)" fontSize="12" fontWeight="900" transform="rotate(-90, 15, 60)">P</text>
                 </svg>
              </div>

              <div className="w-full pt-8 border-t border-white/5 grid grid-cols-2 gap-4">
                 <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                    <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Current State</p>
                    <p className="text-sm font-mono font-bold text-white">Ideal Gas</p>
                 </div>
                 <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                    <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Process</p>
                    <p className="text-sm font-mono font-bold text-indigo-400 uppercase">Isothermal</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const MetricDisplay = ({ icon, label, value, color }: any) => (
  <div className="glass-panel px-6 py-4 rounded-3xl border border-white/5 flex items-center gap-4 bg-white/[0.02] shadow-lg">
    <div className={`w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">{label}</p>
      <p className={`text-xl font-mono font-black ${color} tracking-tighter`}>{value}</p>
    </div>
  </div>
);

const ControlGroup = ({ label, value, unit, min, max, icon, onChange }: any) => (
  <div className="space-y-5">
    <div className="flex justify-between items-center">
       <div className="flex items-center gap-2">
         <div className="text-slate-500">{icon}</div>
         <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</span>
       </div>
       <span className="text-xl font-mono font-black text-white tracking-tighter">{value.toFixed(1)}{unit}</span>
    </div>
    <div className="relative group px-1">
      <input 
        type="range" 
        min={min} 
        max={max} 
        step="0.1" 
        value={value} 
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-white/5 rounded-full appearance-none cursor-pointer accent-indigo-500 transition-all hover:bg-white/10"
      />
      <div className="flex justify-between mt-4 opacity-30">
        <span className="text-[9px] font-mono font-black text-white uppercase">{min}</span>
        <span className="text-[9px] font-mono font-black text-white uppercase">{max}</span>
      </div>
    </div>
  </div>
);

export default ThermodynamicsVisualizer;
