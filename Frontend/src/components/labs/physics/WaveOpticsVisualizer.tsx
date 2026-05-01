import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Settings2, Zap, Info, Maximize2, Lightbulb } from 'lucide-react';

const WaveOpticsVisualizer: React.FC = () => {
  const [wavelength, setWavelength] = useState(550); // nm
  const [slitDistance, setSlitDistance] = useState(2000); // nm
  const [screenDistance, setScreenDistance] = useState(100); // cm
  const [intensity, setIntensity] = useState(0.8);

  // Convert wavelength to RGB color
  const getWavelengthColor = (nm: number) => {
    let r, g, b;
    if (nm >= 380 && nm < 440) {
      r = -(nm - 440) / (440 - 380); g = 0; b = 1;
    } else if (nm >= 440 && nm < 490) {
      r = 0; g = (nm - 440) / (490 - 440); b = 1;
    } else if (nm >= 490 && nm < 510) {
      r = 0; g = 1; b = -(nm - 510) / (510 - 490);
    } else if (nm >= 510 && nm < 580) {
      r = (nm - 510) / (580 - 510); g = 1; b = 0;
    } else if (nm >= 580 && nm < 645) {
      r = 1; g = -(nm - 645) / (645 - 580); b = 0;
    } else if (nm >= 645 && nm <= 780) {
      r = 1; g = 0; b = 0;
    } else {
      r = 0; g = 0; b = 0;
    }
    return `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`;
  };

  const currentColor = getWavelengthColor(wavelength);

  // Generate interference pattern data
  // y = I0 * cos^2(pi * d * sin(theta) / lambda)
  // small angle approx: sin(theta) = x/L
  const pattern = useMemo(() => {
    const points = [];
    const width = 800;
    const L = screenDistance * 10000; // convert cm to nm
    const d = slitDistance;
    const lambda = wavelength;

    for (let x = -width / 2; x <= width / 2; x += 2) {
      const theta = x / 100; // arbitrary scale for visualization
      const phase = (Math.PI * d * theta) / lambda;
      const val = Math.pow(Math.cos(phase), 2);
      points.push({ x: x + width / 2, val });
    }
    return points;
  }, [wavelength, slitDistance, screenDistance]);

  return (
    <div className="min-h-full flex flex-col items-center p-8 space-y-10 max-w-[1400px] mx-auto overflow-y-auto scrollbar-hide">
      <div className="w-full flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-indigo-400 font-mono text-[10px] tracking-[0.5em] uppercase">
            <div className="w-8 h-px bg-indigo-500/50" />
            Young's Double Slit Lab
          </div>
          <h2 className="text-4xl md:text-6xl font-display font-black text-white tracking-tighter uppercase leading-none">
            Wave <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-600 animate-gradient-x">Interference</span>
          </h2>
        </div>

        <div className="flex gap-4">
          <div className="glass-panel px-6 py-4 rounded-3xl border border-white/5 flex items-center gap-4 bg-white/[0.02]">
            <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
              <Maximize2 size={16} />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Fringe Width</p>
              <p className="text-xl font-mono font-black text-white tracking-tighter">
                {((wavelength * screenDistance) / (slitDistance / 100)).toFixed(2)}mm
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 w-full">
        {/* Controls */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel p-8 rounded-[3rem] border border-white/5 bg-white/[0.01] backdrop-blur-3xl shadow-2xl space-y-8">
            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
              <Settings2 size={16} className="text-indigo-400" />
              <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Wave Parameters</h3>
            </div>

            <ControlSlider 
              label="Wavelength" 
              value={wavelength} 
              unit="nm" 
              min={380} 
              max={780} 
              color={currentColor}
              onChange={setWavelength} 
            />
            
            <ControlSlider 
              label="Slit Distance (d)" 
              value={slitDistance} 
              unit="nm" 
              min={1000} 
              max={5000} 
              onChange={setSlitDistance} 
            />

            <ControlSlider 
              label="Screen Distance (D)" 
              value={screenDistance} 
              unit="cm" 
              min={50} 
              max={200} 
              onChange={setScreenDistance} 
            />

            <div className="p-6 bg-indigo-500/5 rounded-3xl border border-indigo-500/10 space-y-4">
               <div className="flex items-center gap-2 text-indigo-400">
                 <Lightbulb size={14} />
                 <span className="text-[10px] font-black uppercase tracking-widest">Physics Insight</span>
               </div>
               <p className="text-xs text-slate-400 leading-relaxed">
                 Observe how <span className="text-white font-bold">shorter wavelengths</span> (violet) produce tighter fringes, while <span className="text-white font-bold">longer wavelengths</span> (red) spread them further apart.
               </p>
            </div>
          </div>
        </div>

        {/* Visualizer */}
        <div className="lg:col-span-8 space-y-8">
          {/* Main Visualizer Panel */}
          <div className="relative group glass-panel rounded-[4rem] border border-white/5 bg-black/40 overflow-hidden shadow-inner flex flex-col items-center justify-center min-h-[500px]">
             {/* Background Grid */}
             <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.05),transparent_70%)]" />

             {/* Interference Screen */}
             <div className="relative w-full h-40 bg-black/60 border-y border-white/5 overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 flex">
                   {pattern.map((p, i) => (
                     <div 
                       key={i} 
                       style={{ 
                         flex: 1, 
                         backgroundColor: currentColor,
                         opacity: p.val * intensity 
                       }} 
                     />
                   ))}
                </div>
                {/* Labels */}
                <div className="absolute inset-x-0 bottom-2 px-8 flex justify-between items-center pointer-events-none">
                  <span className="text-[8px] font-mono text-white/20 uppercase tracking-[0.3em]">Screen Intensity Pattern</span>
                  <div className="flex items-center gap-1">
                    <Zap size={10} className="text-amber-400/40" />
                    <span className="text-[8px] font-mono text-white/20 uppercase tracking-[0.3em]">Live Simulation</span>
                  </div>
                </div>
             </div>

             {/* Graph Representation */}
             <div className="w-full h-48 mt-8 px-12 flex items-end justify-between relative">
                <svg viewBox="0 0 800 150" className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="intensityGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={currentColor} />
                      <stop offset="100%" stopColor="transparent" />
                    </linearGradient>
                  </defs>
                  <motion.path
                    d={`M ${pattern.map(p => `${p.x},${150 - (p.val * 120)}`).join(' L ')} L 800,150 L 0,150 Z`}
                    fill="url(#intensityGrad)"
                    className="opacity-20"
                  />
                  <motion.path
                    d={`M ${pattern.map(p => `${p.x},${150 - (p.val * 120)}`).join(' L ')}`}
                    fill="none"
                    stroke={currentColor}
                    strokeWidth="2"
                    className="opacity-60 shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                  />
                </svg>
             </div>

             {/* Schematic Hint */}
             <div className="mt-12 flex items-center gap-20">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-1 h-20 bg-white/10 rounded-full relative">
                     <div className="absolute top-1/4 -left-1 w-3 h-0.5 bg-cyan-400 rounded-full" />
                     <div className="absolute bottom-1/4 -left-1 w-3 h-0.5 bg-cyan-400 rounded-full" />
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Double Slit</span>
                </div>
                <div className="flex flex-col items-center gap-4">
                   <div className="w-40 h-[2px] bg-gradient-to-r from-cyan-400/40 to-transparent relative">
                      <motion.div 
                        animate={{ x: [0, 160], opacity: [0, 1, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="absolute -top-1 w-2 h-2 rounded-full bg-cyan-400 blur-sm"
                      />
                   </div>
                   <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">D = {screenDistance}cm</span>
                </div>
                <div className="flex flex-col items-center gap-4">
                  <div className="w-1 h-20 bg-white/20 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.1)]" />
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Screen</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ControlSlider = ({ label, value, unit, min, max, onChange, color }: any) => (
  <div className="space-y-4">
    <div className="flex justify-between items-center">
      <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">{label}</span>
      <span className={`text-[11px] font-mono font-black ${color ? '' : 'text-indigo-400'} uppercase tracking-tight`} style={color ? { color } : {}}>
        {value}{unit}
      </span>
    </div>
    <div className="relative group">
       <input 
         type="range" 
         min={min} 
         max={max} 
         value={value} 
         onChange={(e) => onChange(parseInt(e.target.value))}
         className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-indigo-500 group-hover:bg-white/10 transition-all"
       />
       {/* Range markers */}
       <div className="absolute -bottom-4 inset-x-0 flex justify-between px-1 opacity-20 pointer-events-none">
          <span className="text-[8px] font-mono text-white">{min}</span>
          <span className="text-[8px] font-mono text-white">{max}</span>
       </div>
    </div>
  </div>
);

export default WaveOpticsVisualizer;
