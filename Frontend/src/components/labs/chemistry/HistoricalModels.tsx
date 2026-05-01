
import React, { useState, useRef, useEffect } from 'react';
import * as d3 from 'd3';

type ModelID = 'dalton' | 'thomson' | 'rutherford' | 'bohr';

interface AtomicModel {
  id: ModelID;
  year: number;
  name: string;
  scientist: string;
  description: string;
  keyFeature: string;
}

const MODELS: AtomicModel[] = [
  {
    id: 'dalton',
    year: 1803,
    name: 'Billiard Ball Model',
    scientist: 'John Dalton',
    description: 'Atoms are indivisible, indestructible solid spheres.',
    keyFeature: 'Indivisibility'
  },
  {
    id: 'thomson',
    year: 1904,
    name: 'Plum Pudding Model',
    scientist: 'J.J. Thomson',
    description: 'Atoms are positive spheres with embedded negative electrons.',
    keyFeature: 'Subatomic Particles'
  },
  {
    id: 'rutherford',
    year: 1911,
    name: 'Nuclear Model',
    scientist: 'Ernest Rutherford',
    description: 'A tiny, dense, positive nucleus with electrons in empty space.',
    keyFeature: 'The Nucleus'
  },
  {
    id: 'bohr',
    year: 1913,
    name: 'Planetary Model',
    scientist: 'Niels Bohr',
    description: 'Electrons orbit the nucleus in fixed, quantized energy levels.',
    keyFeature: 'Energy Shells'
  }
];

const HistoricalModels: React.FC = () => {
  const [activeModel1, setActiveModel1] = useState<ModelID>('dalton');
  const [activeModel2, setActiveModel2] = useState<ModelID>('bohr');
  const [compareMode, setCompareMode] = useState(false);
  const [timelineIndex, setTimelineIndex] = useState(0);

  const canvasRef1 = useRef<SVGSVGElement | null>(null);
  const canvasRef2 = useRef<SVGSVGElement | null>(null);

  const activeModel = MODELS[timelineIndex];

  useEffect(() => {
    if (!compareMode) {
      renderModel(canvasRef1, MODELS[timelineIndex].id);
    } else {
      renderModel(canvasRef1, activeModel1);
      renderModel(canvasRef2, activeModel2);
    }
  }, [timelineIndex, activeModel1, activeModel2, compareMode]);

  const renderModel = (ref: React.RefObject<SVGSVGElement | null>, id: ModelID) => {
    if (!ref.current) return;
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const width = 600;
    const height = 450;
    const centerX = width / 2;
    const centerY = height / 2;
    const g = svg.append("g").attr("transform", `translate(${centerX}, ${centerY})`);
    const defs = svg.append("defs");

    // Gradients
    const sphereGrad = defs.append("radialGradient").attr("id", `sphereGrad-${id}`).attr("cx", "30%").attr("cy", "30%");
    sphereGrad.append("stop").attr("offset", "0%").attr("stop-color", "#818cf8");
    sphereGrad.append("stop").attr("offset", "100%").attr("stop-color", "#312e81");

    const glow = defs.append("filter").attr("id", "glow").append("feGaussianBlur").attr("stdDeviation", "2.5").attr("result", "blur");
    const feMerge = d3.select(glow.node()?.parentNode as any).append("feMerge");
    feMerge.append("feMergeNode").attr("in", "blur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    if (id === 'dalton') {
      g.append("circle").attr("r", 120).attr("fill", `url(#sphereGrad-${id})`).style("filter", "url(#glow)");
    } else if (id === 'thomson') {
      // Positive Pudding
      g.append("circle").attr("r", 140).attr("fill", "rgba(99, 102, 241, 0.2)").attr("stroke", "rgba(99, 102, 241, 0.4)").attr("stroke-width", 2);
      // Negative Electrons
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const r = 80;
        g.append("circle")
          .attr("cx", Math.cos(angle) * r).attr("cy", Math.sin(angle) * r)
          .attr("r", 10).attr("fill", "#fbbf24").style("filter", "url(#glow)");
      }
    } else if (id === 'rutherford') {
      // Tiny Nucleus
      g.append("circle").attr("r", 8).attr("fill", "#ef4444").style("filter", "url(#glow)");
      // Chaotic Orbits
      for (let i = 0; i < 3; i++) {
        const rot = i * 60;
        g.append("ellipse")
          .attr("rx", 180).attr("ry", 60)
          .attr("fill", "none").attr("stroke", "rgba(255,255,255,0.1)").attr("stroke-width", 1)
          .attr("transform", `rotate(${rot})`);
        
        const electron = g.append("circle").attr("r", 4).attr("fill", "#38bdf8").style("filter", "url(#glow)");
        d3.timer((elapsed) => {
          const t = elapsed * 0.005;
          electron
            .attr("cx", 180 * Math.cos(t))
            .attr("cy", 60 * Math.sin(t))
            .attr("transform", `rotate(${rot})`);
        });
      }
    } else if (id === 'bohr') {
      // Nucleus
      g.append("circle").attr("r", 15).attr("fill", "#ef4444").style("filter", "url(#glow)");
      // Orbits
      [60, 110, 160].forEach((r, idx) => {
        g.append("circle").attr("r", r).attr("fill", "none").attr("stroke", "rgba(255,255,255,0.1)").attr("stroke-dasharray", "4,4");
        const electron = g.append("circle").attr("r", 6).attr("fill", "#4ade80").style("filter", "url(#glow)");
        d3.timer((elapsed) => {
          const t = elapsed * (0.002 / (idx + 1));
          electron.attr("cx", r * Math.cos(t)).attr("cy", r * Math.sin(t));
        });
      });
    }
  };

  return (
    <div className="space-y-10">
      {/* Header with Timeline */}
      <div className="glass-panel p-10 rounded-[48px] border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
          <i className="fas fa-history text-9xl text-white"></i>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
          <div>
            <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-2">Evolution of Theory</h4>
            <h2 className="text-4xl font-black text-white tracking-tight">Timeline of Discovery</h2>
            <p className="text-white/40 text-sm mt-2 max-w-xl">Scrub through history to see how our understanding of the atom evolved over a century of research.</p>
          </div>
          <button 
            onClick={() => setCompareMode(!compareMode)}
            className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 border ${compareMode ? 'bg-indigo-600 border-indigo-400 shadow-xl' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'}`}
          >
            <i className={`fas ${compareMode ? 'fa-th-large' : 'fa-columns'}`}></i> {compareMode ? 'Close Lab' : 'Compare Models'}
          </button>
        </div>

        {!compareMode ? (
          <div className="space-y-12">
            {/* Range Slider Timeline */}
            <div className="relative px-2">
              <input 
                type="range" 
                min="0" 
                max="3" 
                step="1" 
                value={timelineIndex} 
                onChange={(e) => setTimelineIndex(parseInt(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between mt-6">
                {MODELS.map((m, i) => (
                  <button 
                    key={m.id}
                    onClick={() => setTimelineIndex(i)}
                    className={`flex flex-col items-center gap-2 transition-all ${timelineIndex === i ? 'scale-110' : 'opacity-40 grayscale'}`}
                  >
                    <span className="text-lg font-black text-white">{m.year}</span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400">{m.scientist.split(' ')[1]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Single Model View */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="glass-panel rounded-[40px] bg-slate-950/40 p-4 border-white/5 shadow-inner flex items-center justify-center aspect-square">
                 <svg ref={canvasRef1} className="w-full h-full" viewBox="0 0 600 450" />
              </div>
              <div className="space-y-8 p-4">
                <div className="inline-block px-5 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{activeModel.keyFeature}</span>
                </div>
                <h3 className="text-5xl font-black text-white tracking-tighter leading-none">{activeModel.name}</h3>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/20">
                    <i className="fas fa-user-graduate"></i>
                  </div>
                  <span className="text-xl font-bold text-white/60">{activeModel.scientist}</span>
                </div>
                <p className="text-lg text-white/40 leading-relaxed font-medium">"{activeModel.description}"</p>
                <div className="p-6 bg-white/5 rounded-3xl border border-white/5 flex gap-4 items-center">
                   <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg">
                      <i className="fas fa-lightbulb text-white"></i>
                   </div>
                   <p className="text-xs text-white/60 font-bold uppercase tracking-wide leading-relaxed">
                     This model established the concept of <span className="text-white">{activeModel.keyFeature}</span> in modern physics.
                   </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Compare Mode Lab */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[600px]">
            <div className="glass-panel rounded-[40px] bg-slate-950/40 border border-white/5 p-8 flex flex-col gap-6 relative">
              <select 
                value={activeModel1} 
                onChange={(e) => setActiveModel1(e.target.value as ModelID)}
                className="bg-slate-900 border border-white/10 rounded-2xl px-6 py-4 text-xl font-black text-white focus:outline-none"
              >
                {MODELS.map(m => <option key={m.id} value={m.id}>{m.name} ({m.year})</option>)}
              </select>
              <div className="flex-1 flex items-center justify-center">
                <svg ref={canvasRef1} className="w-full h-full" viewBox="0 0 600 450" />
              </div>
              <div className="absolute top-1/2 -right-4 w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-black shadow-lg z-10 border-4 border-[#020617]">VS</div>
            </div>

            <div className="glass-panel rounded-[40px] bg-slate-950/40 border border-white/5 p-8 flex flex-col gap-6">
              <select 
                value={activeModel2} 
                onChange={(e) => setActiveModel2(e.target.value as ModelID)}
                className="bg-slate-900 border border-white/10 rounded-2xl px-6 py-4 text-xl font-black text-white focus:outline-none"
              >
                {MODELS.map(m => <option key={m.id} value={m.id}>{m.name} ({m.year})</option>)}
              </select>
              <div className="flex-1 flex items-center justify-center">
                <svg ref={canvasRef2} className="w-full h-full" viewBox="0 0 600 450" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoricalModels;
