
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { ElementData } from '../../../types/types';

interface AtomVisualizerProps {
  element: ElementData;
  rotation?: { dx: number, dy: number };
  zoom?: number;
}

const AtomVisualizer: React.FC<AtomVisualizerProps> = ({ element, rotation, zoom = 1 }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [is3D, setIs3D] = useState(false);
  const [manualRotation, setManualRotation] = useState({ x: 0, y: 0 });
  const shellLabels = ['K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T'];

  useEffect(() => {
    if (rotation) {
      setManualRotation(prev => ({
        x: prev.x + rotation.dx,
        y: prev.y + rotation.dy
      }));
    }
  }, [rotation]);
  
  // Shell-specific color palette (Neon/Quantum theme)
  const shellColors = [
    '#fbbf24', // K - Amber
    '#f87171', // L - Red
    '#34d399', // M - Emerald
    '#60a5fa', // N - Blue
    '#a78bfa', // O - Purple
    '#f472b6', // P - Pink
    '#22d3ee', // Q - Cyan
    '#818cf8'  // Default Indigo
  ];

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 800;
    const height = 800;
    const centerX = width / 2;
    const centerY = height / 2;

    const g = svg.append("g")
      .attr(
        "transform",
        `translate(${centerX}, ${centerY}) scale(${zoom}) rotate(${manualRotation.x}) skewX(${manualRotation.y * 0.08}) translate(${-centerX}, ${-centerY})`
      );

    // Gradients & Filters
    const defs = svg.append("defs");
    
    const nucleusGradient = defs.append("radialGradient").attr("id", "nucleusGradient");
    nucleusGradient.append("stop").attr("offset", "0%").attr("stop-color", "#fbbf24");
    nucleusGradient.append("stop").attr("offset", "100%").attr("stop-color", "#ea580c");

    // Dynamic glow filters for each shell color
    shellColors.forEach((color, idx) => {
      const glow = defs.append("filter").attr("id", `glow-${idx}`);
      glow.append("feGaussianBlur").attr("stdDeviation", "2.5").attr("result", "blur");
      const feMerge = glow.append("feMerge");
      feMerge.append("feMergeNode").attr("in", "blur");
      feMerge.append("feMergeNode").attr("in", "SourceGraphic");
    });

    // Nucleus
    const nSize = Math.max(20, Math.min(45, 15 + element.number * 0.3));
    g.append("circle")
      .attr("cx", centerX)
      .attr("cy", centerY)
      .attr("r", nSize)
      .attr("fill", "url(#nucleusGradient)")
      .style("filter", "url(#glow-0)");

    g.append("text")
      .attr("x", centerX)
      .attr("y", centerY + 6)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .attr("font-size", nSize > 30 ? "14px" : "12px")
      .attr("font-weight", "900")
      .text(`${element.number}P`);

    // Shell Scaling
    const numShells = element.electrons.length;
    const innerPadding = nSize + 40;
    const outerPadding = 50;
    const availableSpace = (width / 2) - innerPadding - outerPadding;
    const spacing = numShells > 1 ? availableSpace / (numShells - 1) : 0;

    element.electrons.forEach((count: number, i: number) => {
      const rx = innerPadding + (i * spacing);
      const ry = is3D ? rx * 0.35 : rx;
      const rot = is3D ? (i * 25) : 0;
      const isValence = i === element.electrons.length - 1;
      const shellColor = shellColors[i % shellColors.length];

      const shellGroup = g.append("g")
        .attr("transform", `translate(${centerX}, ${centerY}) rotate(${rot})`);

      // Orbit Path
      shellGroup.append("ellipse")
        .attr("rx", rx)
        .attr("ry", ry)
        .attr("fill", "none")
        .attr("stroke", shellColor)
        .attr("stroke-opacity", isValence ? 0.6 : 0.2)
        .attr("stroke-width", isValence ? 2 : 0.8)
        .attr("stroke-dasharray", isValence ? "none" : "4,6");

      // Shell Label
      if (!is3D) {
        shellGroup.append("text")
          .attr("x", rx + 12)
          .attr("y", 4)
          .attr("fill", shellColor)
          .attr("fill-opacity", isValence ? 0.8 : 0.4)
          .attr("font-size", "11px")
          .attr("font-weight", "bold")
          .attr("font-family", "monospace")
          .text(shellLabels[i]);
      }

      // Electrons
      const baseSpeed = 0.0008;
      const speed = baseSpeed / (1 + i * 0.5);

      for (let j = 0; j < count; j++) {
        const startAngle = (j / count) * 2 * Math.PI;
        const electronSize = isValence ? 6.5 : 4.5;
        
        const electron = shellGroup.append("circle")
          .attr("r", electronSize)
          .attr("fill", shellColor)
          .style("filter", `url(#glow-${i % shellColors.length})`);

        d3.timer((elapsed) => {
          const angle = startAngle + elapsed * speed;
          electron
            .attr("cx", rx * Math.cos(angle))
            .attr("cy", ry * Math.sin(angle));
        });
      }
    });

  }, [element, is3D, manualRotation, zoom]);

  const valenceColor = shellColors[(element.electrons.length - 1) % shellColors.length];

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-700">
      <div className="flex items-center justify-between mb-8 px-4">
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <h2 className="text-4xl font-black text-white tracking-tighter">
              {element.name}
            </h2>
            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
              <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Configuration:</span>
              <span className="text-sm font-mono text-indigo-400">{element.config}</span>
            </div>
          </div>
          <p className="text-white/40 text-[10px] mt-2 uppercase tracking-[0.2em] font-black">Multi-Shell Quantum Simulator v4.2</p>
        </div>
        
        <div className="flex gap-3">
           <button 
             onClick={() => setIs3D(!is3D)}
             className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 border ${is3D ? 'bg-indigo-600 border-indigo-500 shadow-2xl shadow-indigo-600/40 text-white' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'}`}
           >
             <i className={`fas ${is3D ? 'fa-cube' : 'fa-th-large'}`}></i> {is3D ? '3D Mode' : '2D Mode'}
           </button>
        </div>
      </div>

      <div className="flex-1 glass-panel rounded-[48px] p-4 flex items-center justify-center relative bg-slate-900/30 shadow-inner overflow-hidden border-white/5 min-h-[300px]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.05)_0%,transparent_70%)] pointer-events-none"></div>
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

        <svg 
          ref={svgRef} 
          viewBox="0 0 800 800" 
          className="w-full h-full max-w-[800px] max-h-[800px] drop-shadow-[0_0_30px_rgba(99,102,241,0.1)]" 
        />
        
        {/* Valence Highlight Overlay */}
        <div className="absolute top-8 left-8 pointer-events-none animate-in slide-in-from-left-4 duration-500">
          <div className="p-6 bg-white/5 border border-white/10 rounded-[32px] backdrop-blur-xl shadow-2xl">
            <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: valenceColor }}>Valence Shell</p>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black text-white tracking-tighter">{element.electrons[element.electrons.length - 1]}</span>
              <span className="text-xl font-black" style={{ color: valenceColor }}>e⁻</span>
            </div>
            <p className="text-[9px] text-white/20 mt-2 font-bold uppercase tracking-widest leading-tight">Outer shell determines<br/>chemical properties</p>
          </div>
        </div>

        {/* Shell Legend Overlay */}
        <div className="absolute bottom-8 left-8 flex flex-col gap-2">
           <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mb-1 px-4">Particle Map</div>
           <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-white/40 bg-white/5 px-4 py-2 rounded-2xl border border-white/5 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_#ea580c]"></span> Nucleus ({element.number}P)
          </div>
          <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-white/40 bg-white/5 px-4 py-2 rounded-2xl border border-white/5 backdrop-blur-sm">
            <div className="flex gap-0.5">
               {element.electrons.slice(0, 4).map((_, i) => (
                 <span key={i} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: shellColors[i] }}></span>
               ))}
               {element.electrons.length > 4 && <span className="text-[8px] text-white/40 ml-1">+</span>}
            </div>
            Total Electrons: {element.number}
          </div>
        </div>

        {/* Status Indicator */}
        <div className="absolute bottom-8 right-8 flex items-center gap-3 px-4 py-2 bg-black/40 rounded-full border border-white/5">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </div>
          <span className="text-[9px] font-mono text-indigo-400/80 tracking-widest uppercase">
            ACTIVE_SHELL_TRACKING
          </span>
        </div>
      </div>
    </div>
  );
};

export default AtomVisualizer;
