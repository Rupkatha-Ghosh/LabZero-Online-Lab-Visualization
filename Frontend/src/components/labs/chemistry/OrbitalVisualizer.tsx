
import React, { useState, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { Vector3 } from '../../../types/types';

type ShellType = 's' | 'p' | 'd' | 'f';

interface Lobe {
  pos: Vector3;
  size: number;
  color: string;
  opacity: number;
  isRing?: boolean;
  phase?: number;
  id: string;
}

const OrbitalVisualizer: React.FC = () => {
  const [shell, setShell] = useState<ShellType>('s');
  const [ml, setMl] = useState<number>(0);
  const [rotation, setRotation] = useState({ x: 0.5, y: 0.6 });
  const svgRef = useRef<SVGSVGElement | null>(null);
  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  const shellData = {
    s: { name: 'Sharp', l: 0, mlRange: [0], color: '#ef4444', nodes: 0, desc: 'Spherically symmetric probability cloud.' },
    p: { name: 'Principal', l: 1, mlRange: [-1, 0, 1], color: '#fbbf24', nodes: 1, desc: 'Dumbbell-shaped lobes oriented along axes.' },
    d: { name: 'Diffuse', l: 2, mlRange: [-2, -1, 0, 1, 2], color: '#38bdf8', nodes: 2, desc: 'Cloverleaf patterns or toroidal rings.' },
    f: { name: 'Fundamental', l: 3, mlRange: [-3, -2, -1, 0, 1, 2, 3], color: '#4ade80', nodes: 3, desc: 'Complex 8-lobed quantum architectures.' }
  };

  const generateLobes = (): Lobe[] => {
    const lobes: Lobe[] = [];
    const color = shellData[shell].color;
    const dist = 55;

    if (shell === 's') {
      lobes.push({ id: 's1', pos: { x: 0, y: 0, z: 0 }, size: 80, color, opacity: 0.35, phase: 0 });
    } else if (shell === 'p') {
      const axis = ml === 0 ? 'z' : (ml === 1 ? 'x' : 'y');
      lobes.push({ id: 'p1', pos: { x: axis === 'x' ? dist : 0, y: axis === 'y' ? dist : 0, z: axis === 'z' ? dist : 0 }, size: 50, color, opacity: 0.6, phase: 0 });
      lobes.push({ id: 'p2', pos: { x: axis === 'x' ? -dist : 0, y: axis === 'y' ? -dist : 0, z: axis === 'z' ? -dist : 0 }, size: 50, color, opacity: 0.6, phase: Math.PI });
    } else if (shell === 'd') {
      if (ml === 0) { // dz2
        lobes.push({ id: 'dz1', pos: { x: 0, y: 0, z: 65 }, size: 45, color, opacity: 0.6, phase: 0 });
        lobes.push({ id: 'dz2', pos: { x: 0, y: 0, z: -65 }, size: 45, color, opacity: 0.6, phase: 0 });
        lobes.push({ id: 'dz-ring', pos: { x: 0, y: 0, z: 0 }, size: 45, color, opacity: 0.25, isRing: true, phase: Math.PI / 2 });
      } else {
        const d = 48;
        const configs: Record<number, Vector3[]> = {
          [-2]: [{x:d, y:d, z:0}, {x:-d, y:-d, z:0}, {x:d, y:-d, z:0}, {x:-d, y:d, z:0}], // dxy
          [-1]: [{x:0, y:d, z:d}, {x:0, y:-d, z:-d}, {x:0, y:d, z:-d}, {x:0, y:-d, z:d}], // dyz
          [1]: [{x:d, y:0, z:d}, {x:-d, y:0, z:-d}, {x:d, y:0, z:-d}, {x:-d, y:0, z:d}],  // dxz
          [2]: [{x:55, y:0, z:0}, {x:-55, y:0, z:0}, {x:0, y:55, z:0}, {x:0, y:-55, z:0}], // dx2-y2
        };
        (configs[ml] || []).forEach((p, idx) => lobes.push({ id: `d-${ml}-${idx}`, pos: p, size: 40, color, opacity: 0.6, phase: idx % 2 === 0 ? 0 : Math.PI }));
      }
    } else if (shell === 'f') {
      if (ml === 0) {
        lobes.push({ id: 'f0-1', pos: { x: 0, y: 0, z: 70 }, size: 38, color, opacity: 0.6, phase: 0 });
        lobes.push({ id: 'f0-2', pos: { x: 0, y: 0, z: -70 }, size: 38, color, opacity: 0.6, phase: 0 });
        lobes.push({ id: 'f0-r1', pos: { x: 0, y: 0, z: 28 }, size: 38, color, opacity: 0.3, isRing: true, phase: Math.PI / 4 });
        lobes.push({ id: 'f0-r2', pos: { x: 0, y: 0, z: -28 }, size: 38, color, opacity: 0.3, isRing: true, phase: -Math.PI / 4 });
      } else {
        const d = 50;
        for (let i = 0; i < 8; i++) {
          lobes.push({
            id: `f-${ml}-${i}`,
            pos: {
              x: (i & 1 ? d : -d) * Math.cos(ml * 0.4),
              y: (i & 2 ? d : -d) * Math.sin(ml * 0.4 + Math.PI/4),
              z: (i & 4 ? d : -d)
            },
            size: 32, color, opacity: 0.6, phase: i % 2 === 0 ? 0 : Math.PI
          });
        }
      }
    }
    return lobes;
  };

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 800;
    const height = 550;
    const centerX = width / 2;
    const centerY = height / 2;
    const scale = 3.0;

    const g = svg.append("g").attr("transform", `translate(${centerX}, ${centerY})`);
    const defs = svg.append("defs");

    // Pro-Level Quantum Glow
    const filter = defs.append("filter").attr("id", "orbitalGlow");
    filter.append("feGaussianBlur").attr("stdDeviation", "6").attr("result", "blur");
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "blur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    const project = (v: Vector3): Vector3 => {
      const cosY = Math.cos(rotation.y);
      const sinY = Math.sin(rotation.y);
      let x = v.x * cosY - v.z * sinY;
      let z = v.x * sinY + v.z * cosY;
      const cosX = Math.cos(rotation.x);
      const sinX = Math.sin(rotation.x);
      let y = v.y * cosX - z * sinX;
      z = v.y * sinX + z * cosX;
      return { x: x * scale, y: y * scale, z };
    };

    // Reference Grid / Axes
    const axisLen = 220;
    const axes = [
      { p: { x: axisLen, y: 0, z: 0 }, label: 'x', color: '#334155' },
      { p: { x: 0, y: axisLen, z: 0 }, label: 'y', color: '#334155' },
      { p: { x: 0, y: 0, z: axisLen }, label: 'z', color: '#64748b' }
    ];

    axes.forEach(a => {
      const end = project(a.p);
      const start = project({ x: -a.p.x, y: -a.p.y, z: -a.p.z });
      
      g.append("line")
        .attr("x1", start.x).attr("y1", start.y)
        .attr("x2", end.x).attr("y2", end.y)
        .attr("stroke", a.color)
        .attr("stroke-width", a.label === 'z' ? 2 : 1)
        .attr("stroke-opacity", 0.3);

      g.append("text")
        .attr("x", end.x + (end.x > 0 ? 8 : -8))
        .attr("y", end.y + (end.y > 0 ? 8 : -8))
        .attr("fill", a.color)
        .attr("font-size", "10px")
        .attr("font-weight", "900")
        .attr("text-anchor", "middle")
        .text(a.label.toUpperCase());
    });

    const lobes = generateLobes().map(l => ({ ...l, proj: project(l.pos) }));
    lobes.sort((a, b) => a.proj.z - b.proj.z);

    lobes.forEach((l, i) => {
      const gradId = `orbitalGrad-${l.id}`;
      const grad = defs.append("radialGradient")
        .attr("id", gradId)
        .attr("cx", "35%").attr("cy", "35%").attr("r", "65%");
      grad.append("stop").attr("offset", "0%").attr("stop-color", "#ffffff").attr("stop-opacity", 0.95);
      grad.append("stop").attr("offset", "100%").attr("stop-color", l.color);

      if (l.isRing) {
        const ring = g.append("ellipse")
          .attr("cx", l.proj.x)
          .attr("cy", l.proj.y)
          .attr("rx", 85)
          .attr("ry", 25)
          .attr("fill", "none")
          .attr("stroke", l.color)
          .attr("stroke-width", 15)
          .attr("stroke-opacity", l.opacity)
          .attr("transform", `rotate(${rotation.y * 18})`)
          .style("filter", "url(#orbitalGlow)");

        d3.timer((elapsed) => {
          const t = elapsed * 0.002 + (l.phase || 0);
          const pulse = 1 + Math.sin(t) * 0.12;
          ring.attr("rx", 85 * pulse).attr("ry", 25 * pulse).attr("stroke-width", 15 * pulse);
        });
      } else {
        const circle = g.append("circle")
          .attr("cx", l.proj.x)
          .attr("cy", l.proj.y)
          .attr("r", l.size)
          .attr("fill", `url(#${gradId})`)
          .attr("fill-opacity", l.opacity)
          .style("filter", "url(#orbitalGlow)");

        // Fluid Breathing Animation
        d3.timer((elapsed) => {
          const t = elapsed * 0.0025 + (l.phase || 0);
          const pulse = 1 + Math.sin(t) * 0.1;
          circle.attr("r", l.size * pulse);
        });
      }
    });

  }, [shell, ml, rotation]);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;
    setRotation(prev => ({ 
      x: prev.x + dy * 0.006, 
      y: prev.y + dx * 0.006 
    }));
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => isDragging.current = false;

  const currentData = shellData[shell];

  return (
    <div className="glass-panel p-10 rounded-[48px] border border-white/5 h-full flex flex-col min-h-[900px] shadow-2xl relative overflow-hidden bg-slate-950/20">
      {/* Background Decorative Text */}
      <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none font-black text-[12rem] leading-none uppercase select-none -translate-y-12">
        {shell}
      </div>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start mb-12 z-10 gap-8">
        <div>
          <h4 className="text-[11px] font-black text-white/30 uppercase tracking-[0.5em] mb-3">Quantum Orbital Physics</h4>
          <h2 className="text-6xl font-black text-white tracking-tighter mb-2">
            {currentData.name} <span className="text-indigo-500">(l={currentData.l})</span>
          </h2>
          <div className="flex items-center gap-6">
            <span className="text-xs font-black text-indigo-400 uppercase tracking-widest">Angular Nodes: {currentData.nodes}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-white/10"></span>
            <span className="text-xs font-bold text-white/40 italic">{currentData.desc}</span>
          </div>
        </div>

        <div className="bg-slate-900/80 p-6 rounded-[32px] border border-white/10 shadow-2xl backdrop-blur-3xl min-w-[240px]">
           <div className="flex items-center justify-between gap-8">
              <div>
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Magnetic State</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-white tracking-tighter">mₗ = {ml}</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 flex items-center justify-center border border-indigo-500/30">
                 <i className="fas fa-magnet text-indigo-400 text-xl"></i>
              </div>
           </div>
        </div>
      </div>

      {/* Main Simulation Viewport */}
      <div 
        className="flex-1 relative glass-panel rounded-[40px] bg-[#020617] border-white/5 overflow-hidden cursor-move mb-12 shadow-inner group"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.06)_0%,transparent_85%)] pointer-events-none"></div>
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
        
        <svg ref={svgRef} className="w-full h-full" viewBox="0 0 800 550" />
        
        {/* Simulation Feedback Overlays */}
        <div className="absolute bottom-10 left-10 flex items-center gap-6 p-6 bg-black/60 rounded-[32px] border border-white/10 backdrop-blur-3xl shadow-2xl animate-in slide-in-from-left-4">
           <div className="relative flex h-4 w-4">
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
             <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
           </div>
           <span className="text-[11px] font-mono text-white/40 uppercase tracking-[0.3em] font-black">Real-time Wavefunction Mapping</span>
        </div>

        <div className="absolute top-10 right-10 flex flex-col items-end gap-3 opacity-20 pointer-events-none font-mono">
           <div className="text-[9px] text-white tracking-[0.4em] uppercase bg-white/5 px-4 py-2 rounded-full border border-white/5">SYSTEM_Z_AXIS::STABLE</div>
           <div className="text-[9px] text-white tracking-[0.4em] uppercase bg-white/5 px-4 py-2 rounded-full border border-white/5">PHI_ROT::{rotation.y.toFixed(3)}</div>
        </div>
      </div>

      {/* Control Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h5 className="text-[11px] font-black text-white/30 uppercase tracking-[0.4em]">Subshell Selection (L)</h5>
            <span className="text-[10px] font-mono text-indigo-500/60">ANGULAR_MOMENTUM</span>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {(Object.keys(shellData) as ShellType[]).map((s) => (
              <button
                key={s}
                onClick={() => { setShell(s); setMl(0); }}
                className={`group py-6 rounded-[24px] text-xl font-black uppercase transition-all border-2 ${
                  shell === s 
                  ? 'bg-white text-slate-950 border-white shadow-[0_0_40px_rgba(255,255,255,0.3)] scale-[1.03]' 
                  : 'bg-white/5 border-white/5 text-white/30 hover:bg-white/10 hover:text-white/60 hover:border-white/20'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
             <h5 className="text-[11px] font-black text-white/30 uppercase tracking-[0.4em]">Magnetic Orientation (Ml)</h5>
             <span className="text-[10px] font-mono text-indigo-500/60">Z_AXIS_PROJECTION</span>
          </div>
          <div className="flex flex-wrap gap-4">
            {currentData.mlRange.map((m) => (
              <button
                key={m}
                onClick={() => setMl(m)}
                className={`w-16 h-16 rounded-[24px] text-lg font-black transition-all border-2 flex items-center justify-center ${
                  ml === m 
                  ? 'bg-indigo-600 border-indigo-400 text-white shadow-2xl shadow-indigo-600/40 scale-[1.08]' 
                  : 'bg-white/5 border-white/5 text-white/30 hover:border-white/20 hover:text-white/70'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Insight Card */}
      <div className="mt-12 p-8 bg-slate-900/40 rounded-[40px] border border-white/5 flex gap-8 items-center group hover:bg-white/5 transition-all">
         <div className="w-16 h-16 rounded-[24px] bg-indigo-600/20 flex items-center justify-center text-indigo-400 shadow-xl group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all">
           <i className="fas fa-chart-line text-2xl"></i>
         </div>
         <p className="text-xs text-white/40 leading-relaxed font-bold uppercase tracking-widest max-w-3xl">
           These visual states represent <span className="text-white">90% probability regions</span>. The <span className="text-indigo-400 font-black">Z-Axis</span> is the primary quantization axis for magnetic moments, defining how these orbitals align in external fields.
         </p>
      </div>
    </div>
  );
};

export default OrbitalVisualizer;
