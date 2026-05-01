
import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Vector3 } from '../../../types/types';

interface Lobe {
  pos: Vector3;
  size: number;
  color: string;
  opacity: number;
  id: string;
  phase?: number;
}

const QuantumNumbersLab: React.FC = () => {
  const [n, setN] = useState(1);
  const [l, setL] = useState(0);
  const [ml, setMl] = useState(0);
  const [rotation, setRotation] = useState({ x: 0.5, y: 0.6 });
  const svgRef = useRef<SVGSVGElement | null>(null);
  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  const isValid = { n: n > 0, l: l < n, ml: Math.abs(ml) <= l };
  const overallValid = isValid.n && isValid.l && isValid.ml;

  useEffect(() => {
    if (!svgRef.current || !overallValid) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 800, height = 550;
    const centerX = width / 2, centerY = height / 2;
    const g = svg.append("g").attr("transform", `translate(${centerX}, ${centerY})`);
    const defs = svg.append("defs");

    const project = (v: Vector3): Vector3 => {
      const cosY = Math.cos(rotation.y), sinY = Math.sin(rotation.y);
      let x = v.x * cosY - v.z * sinY, z = v.x * sinY + v.z * cosY;
      const cosX = Math.cos(rotation.x), sinX = Math.sin(rotation.x);
      let y = v.y * cosX - z * sinX;
      z = v.y * sinX + z * cosX;
      return { x: x * 150, y: y * 150, z };
    };

    const lobes: Lobe[] = [];
    const color = l === 0 ? '#3b82f6' : l === 1 ? '#ef4444' : '#10b981';

    // Shapes logic matching user request patterns
    if (l === 0) { // s-orbital: sphere
       lobes.push({ id: 's', pos: {x:0,y:0,z:0}, size: 120, color, opacity: 0.4 });
    } else if (l === 1) { // p-orbital: dumbbell
       const d = 0.8;
       const axis = ml === 0 ? 'y' : (ml === 1 ? 'x' : 'z');
       lobes.push({ id: 'p1', pos: {x: axis==='x'?d:0, y: axis==='y'?d:0, z: axis==='z'?d:0}, size: 65, color, opacity: 0.6, phase: 0 });
       lobes.push({ id: 'p2', pos: {x: axis==='x'?-d:0, y: axis==='y'?-d:0, z: axis==='z'?-d:0}, size: 65, color, opacity: 0.6, phase: Math.PI });
    } else if (l === 2) { // d-orbital: cloverleaf
       const d = 0.7;
       const configs: Record<number, Vector3[]> = {
         [0]: [{x:0,y:d,z:0}, {x:0,y:-d,z:0}, {x:d,y:0,z:0}, {x:-d,y:0,z:0}], // Simplifying for preview
         [1]: [{x:d,y:d,z:0}, {x:-d,y:-d,z:0}, {x:d,y:-d,z:0}, {x:-d,y:d,z:0}],
         [2]: [{x:0,y:d,z:d}, {x:0,y:-d,z:-d}, {x:0,y:d,z:-d}, {x:0,y:-d,z:d}],
         [-1]: [{x:d,y:0,z:d}, {x:-d,y:0,z:-d}, {x:d,y:0,z:-d}, {x:-d,y:0,z:d}],
         [-2]: [{x:d,y:d,z:d}, {x:-d,y:-d,z:-d}, {x:d,y:-d,z:d}, {x:-d,y:d,z:-d}],
       };
       (configs[ml] || configs[0]).forEach((p, idx) => lobes.push({ id: `d${idx}`, pos: p, size: 50, color, opacity: 0.6, phase: (idx%2)*Math.PI }));
    }

    const projected = lobes.map(lb => ({ ...lb, proj: project(lb.pos) })).sort((a,b) => a.proj.z - b.proj.z);

    projected.forEach(lb => {
      const grad = defs.append("radialGradient").attr("id", `g-${lb.id}`).attr("cx", "30%").attr("cy", "30%");
      grad.append("stop").attr("offset", "0%").attr("stop-color", "white").attr("stop-opacity", 0.9);
      grad.append("stop").attr("offset", "100%").attr("stop-color", lb.color);
      
      const circ = g.append("circle").attr("cx", lb.proj.x).attr("cy", lb.proj.y).attr("r", lb.size).attr("fill", `url(#g-${lb.id})`).attr("fill-opacity", lb.opacity);
      d3.timer((elapsed) => {
        const t = elapsed * 0.002 + (lb.phase || 0);
        circ.attr("r", lb.size * (1 + Math.sin(t) * 0.05));
      });
    });

  }, [n, l, ml, rotation, overallValid]);

  const handleDrag = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    setRotation(prev => ({ x: prev.x + (e.clientY - lastMousePos.current.y) * 0.006, y: prev.y + (e.clientX - lastMousePos.current.x) * 0.006 }));
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  return (
    <div className="glass-panel p-10 rounded-[48px] border border-white/10 shadow-2xl relative overflow-hidden bg-slate-950/20">
      <div className="flex flex-col lg:flex-row gap-10">
        <div className="lg:col-span-4 space-y-8">
          <h2 className="text-3xl font-black text-white">Quantum Address</h2>
          <InputGroup label="n" val={n} set={setN} min={1} max={5} />
          <InputGroup label="l" val={l} set={setL} min={0} max={n-1} />
          <InputGroup label="ml" val={ml} set={setMl} min={-l} max={l} />
        </div>
        <div 
          className="flex-1 h-[550px] bg-slate-950 rounded-[40px] cursor-move relative"
          onMouseDown={e => { isDragging.current = true; lastMousePos.current = { x: e.clientX, y: e.clientY }; }}
          onMouseMove={handleDrag}
          onMouseUp={() => isDragging.current = false}
        >
          <svg ref={svgRef} className="w-full h-full" viewBox="0 0 800 550" />
          <div className="absolute top-8 left-8 p-6 bg-black/40 rounded-3xl border border-white/5 font-black text-2xl uppercase italic">
             {n}{['s','p','d','f'][l]} Subshell
          </div>
        </div>
      </div>
    </div>
  );
};

const InputGroup = ({ label, val, set, min, max }: any) => (
  <div className="space-y-3">
    <div className="flex justify-between"><span className="text-xs font-black text-white/40 uppercase">{label}</span><span className="text-2xl font-black text-white">{val}</span></div>
    <input type="range" min={min} max={max} value={val} onChange={e => set(+e.target.value)} className="w-full h-1.5 bg-white/10 rounded-lg accent-indigo-500" />
  </div>
);

export default QuantumNumbersLab;
