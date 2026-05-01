import React, { useState, useMemo } from 'react';
import { ElementData } from '../../../types/types';

type Property = 'radius' | 'ionization' | 'electronegativity';

interface TrendsVisualizerProps {
  elements: ElementData[];
}

const TrendsVisualizer: React.FC<TrendsVisualizerProps> = ({ elements }) => {
  const [activeProperty, setActiveProperty] = useState<Property>('radius');
  const [hoveredElement, setHoveredElement] = useState<ElementData | null>(null);

  const stats = useMemo(() => {
    if (!elements || elements.length === 0) return { min: 0, max: 0 };
    const values = elements.map(e => e[activeProperty]).filter(v => v > 0);
    if (values.length === 0) return { min: 0, max: 0 };
    return {
      min: Math.min(...values),
      max: Math.max(...values),
    };
  }, [activeProperty, elements]);

  const getColor = (value: number) => {
    if (value === 0 || isNaN(value)) return 'rgba(255, 255, 255, 0.05)';
    if (stats.max === stats.min) return 'rgba(255, 255, 255, 0.05)';
    const normalized = (value - stats.min) / (stats.max - stats.min);
    
    switch (activeProperty) {
      case 'radius': // Blue to Cyan
        return `rgba(59, 130, 246, ${0.1 + normalized * 0.9})`;
      case 'ionization': // Red to Orange
        return `rgba(239, 68, 68, ${0.1 + normalized * 0.9})`;
      case 'electronegativity': // Green to Yellow
        return `rgba(16, 185, 129, ${0.1 + normalized * 0.9})`;
    }
  };

  const propertyLabels = {
    radius: { name: 'Atomic Radius', unit: 'pm', desc: 'The total distance from the nucleus of an atom to the outermost orbital of its electron cloud.' },
    ionization: { name: 'Ionization Energy', unit: 'kJ/mol', desc: 'The minimum amount of energy required to remove the most loosely bound electron of an isolated neutral gaseous atom.' },
    electronegativity: { name: 'Electronegativity', unit: 'χ', desc: 'A chemical property that describes the tendency of an atom to attract a shared pair of electrons towards itself.' },
  };

  if (!elements || elements.length === 0) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="glass-panel p-8 rounded-[40px] border border-white/10 shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none font-black text-9xl uppercase select-none">
          {activeProperty}
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-2">Full Periodicity Heatmap (1-118)</h4>
            <h2 className="text-4xl font-black text-white tracking-tight">{propertyLabels[activeProperty].name}</h2>
            <p className="text-white/40 text-xs font-medium max-w-2xl leading-relaxed mt-2">{propertyLabels[activeProperty].desc}</p>
          </div>
          <div className="flex bg-slate-900/80 p-1.5 rounded-2xl border border-white/10 shadow-xl self-start md:self-center">
            {(Object.keys(propertyLabels) as Property[]).map(prop => (
              <button
                key={prop}
                onClick={() => setActiveProperty(prop)}
                className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeProperty === prop ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-white/30 hover:text-white hover:bg-white/5'
                }`}
              >
                {prop}
              </button>
            ))}
          </div>
        </div>

        {/* Optimized 18-Column Grid Layout */}
        <div className="overflow-x-auto pb-6 scrollbar-hide">
          <div className="grid grid-cols-18 gap-1.5 min-w-[1200px] w-full">
            {Array.from({ length: 7 }).map((_, periodIdx) => (
              Array.from({ length: 18 }).map((_, groupIdx) => {
                const period = periodIdx + 1;
                const group = groupIdx + 1;
                const el = elements.find(e => e.period === period && e.group === group);

                if (!el) return <div key={`empty-${period}-${group}`} className="w-full aspect-square opacity-[0.03] bg-white rounded-lg"></div>;

                const val = el[activeProperty];
                const color = getColor(val);
                const isHovered = hoveredElement?.symbol === el.symbol;

                return (
                  <div
                    key={el.symbol}
                    onMouseEnter={() => setHoveredElement(el)}
                    onMouseLeave={() => setHoveredElement(null)}
                    className="relative group cursor-crosshair"
                  >
                    <div 
                      className="w-full aspect-square rounded-lg border border-white/5 flex flex-col items-center justify-center transition-all duration-300"
                      style={{ 
                        backgroundColor: color,
                        transform: isHovered ? 'scale(1.2) translateZ(30px)' : 'scale(1)',
                        zIndex: isHovered ? 50 : 1,
                        boxShadow: isHovered ? `0 10px 40px -5px ${color}` : 'none'
                      }}
                    >
                      <span className="text-[7px] text-white/50 absolute top-1 left-1.5 font-mono">{el.number}</span>
                      <span className="text-[12px] font-black text-white">{el.symbol}</span>
                      
                      {activeProperty === 'radius' && val > 0 && stats.max > 0 && (
                        <div 
                          className="absolute inset-0 m-auto rounded-full bg-white/5 border border-white/10 pointer-events-none"
                          style={{ 
                            width: `${(val / stats.max) * 80}%`, 
                            height: `${(val / stats.max) * 80}%`
                          }}
                        />
                      )}
                    </div>
                  </div>
                );
              })
            ))}
          </div>

          {/* Centered F-Block (Lanthanides & Actinides) */}
          <div className="mt-10 pt-10 border-t border-white/5 grid grid-cols-18 gap-1.5 min-w-[1200px] w-full">
             <div className="col-span-2"></div>
             {Array.from({ length: 15 }).map((_, i) => {
                const el = elements.find(e => e.number === 57 + i);
                if (!el) return <div key={`f1-${i}`} className="w-full aspect-square opacity-0"></div>;
                return <TrendCell key={el.symbol} el={el} activeProperty={activeProperty} getColor={getColor} stats={stats} setHovered={setHoveredElement} hovered={hoveredElement} />;
             })}
             <div className="col-span-1"></div>
             
             <div className="col-span-2 flex items-center justify-center">
                <div className="h-px w-full bg-white/10"></div>
             </div>
             {Array.from({ length: 15 }).map((_, i) => {
                const el = elements.find(e => e.number === 89 + i);
                if (!el) return <div key={`f2-${i}`} className="w-full aspect-square opacity-0"></div>;
                return <TrendCell key={el.symbol} el={el} activeProperty={activeProperty} getColor={getColor} stats={stats} setHovered={setHoveredElement} hovered={hoveredElement} />;
             })}
          </div>
        </div>

        {/* Legend Overlay */}
        <div className="mt-12 flex flex-col md:flex-row items-center justify-between p-8 bg-slate-900/40 rounded-[32px] border border-white/5 backdrop-blur-sm">
          <div className="flex items-center gap-6">
             <div className="space-y-1">
               <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Intensity Scale</span>
               <div className="w-80 h-4 rounded-full bg-gradient-to-r from-slate-800 via-indigo-500 to-indigo-400 opacity-60 shadow-inner"></div>
             </div>
             <div className="flex gap-10 text-[11px] font-mono">
                <div className="flex flex-col">
                  <span className="text-white/20 uppercase text-[9px]">Min Value</span>
                  <span className="text-white font-black">{stats.min} {propertyLabels[activeProperty].unit}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-white/20 uppercase text-[9px]">Max Value</span>
                  <span className="text-indigo-400 font-black">{stats.max} {propertyLabels[activeProperty].unit}</span>
                </div>
             </div>
          </div>
          
          <div className="flex items-center gap-3 text-[10px] font-black text-white/20 uppercase tracking-widest bg-white/5 px-4 py-2 rounded-xl">
            <i className="fas fa-mouse-pointer text-indigo-500"></i>
            Hover elements for detail
          </div>
        </div>
      </div>

      {/* Dynamic Detail Card */}
      {hoveredElement && (
        <div className="glass-panel p-10 rounded-[48px] border-l-8 border-l-indigo-600 bg-indigo-600/5 animate-in slide-in-from-bottom-6 duration-400 flex flex-col md:flex-row items-center gap-12 shadow-2xl">
           <div className="flex items-center gap-10">
             <div className="w-32 h-32 rounded-[40px] bg-indigo-600 flex flex-col items-center justify-center shadow-2xl shadow-indigo-600/40 transition-transform hover:rotate-3">
               <span className="text-sm font-mono text-white/40 mb-1">{hoveredElement.number}</span>
               <span className="text-5xl font-black text-white tracking-tighter">{hoveredElement.symbol}</span>
             </div>
             <div>
               <h3 className="text-5xl font-black text-white tracking-tighter">{hoveredElement.name}</h3>
               <div className="flex gap-4 mt-2">
                 <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">Period {hoveredElement.period}</span>
                 <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">Group {hoveredElement.group || 'F-Block'}</span>
               </div>
             </div>
           </div>
           
           <div className="flex-1">
              <p className="text-xs text-white/40 leading-relaxed font-bold uppercase tracking-wider max-w-lg">
                {hoveredElement.summary}
              </p>
           </div>

           <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
             <DataPoint label="Radius" value={hoveredElement.radius} unit="pm" />
             <DataPoint label="Ionization" value={hoveredElement.ionization || '--'} unit="kJ" />
             <DataPoint label="Electroneg." value={hoveredElement.electronegativity || 'N/A'} unit="χ" />
           </div>
        </div>
      )}
    </div>
  );
};

const DataPoint = ({ label, value, unit }: { label: string, value: any, unit: string }) => (
  <div className="p-5 bg-white/5 rounded-3xl border border-white/5 min-w-[120px]">
    <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-2">{label}</p>
    <p className="text-2xl font-black text-white tabular-nums">{value} <span className="text-[10px] text-white/30 font-mono">{unit}</span></p>
  </div>
);

const TrendCell = ({ el, activeProperty, getColor, stats, setHovered, hovered }: any) => {
  const val = el[activeProperty];
  const color = getColor(val);
  const isHovered = hovered?.symbol === el.symbol;

  return (
    <div
      onMouseEnter={() => setHovered(el)}
      onMouseLeave={() => setHovered(null)}
      className="relative group cursor-crosshair"
    >
      <div 
        className="w-full aspect-square rounded-lg border border-white/5 flex flex-col items-center justify-center transition-all duration-300"
        style={{ 
          backgroundColor: color,
          transform: isHovered ? 'scale(1.2) translateZ(20px)' : 'scale(1)',
          zIndex: isHovered ? 50 : 1,
          boxShadow: isHovered ? `0 10px 40px -5px ${color}` : 'none'
        }}
      >
        <span className="text-[7px] text-white/50 absolute top-1 left-1.5 font-mono">{el.number}</span>
        <span className="text-[12px] font-black text-white">{el.symbol}</span>
      </div>
    </div>
  );
};

export default TrendsVisualizer;
