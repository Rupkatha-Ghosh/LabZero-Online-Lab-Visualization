import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { ElementData } from '../../../types/types';

interface BondingLabProps {
  elements: ElementData[];
}

const BondingLab: React.FC<BondingLabProps> = ({ elements }) => {
  const [elA, setElA] = useState<ElementData | null>(null);
  const [elB, setElB] = useState<ElementData | null>(null);
  const [status, setStatus] = useState<'IDLE' | 'BONDED'>('IDLE');
  const [bondType, setBondType] = useState<'Ionic' | 'Covalent' | 'Polar Covalent' | null>(null);

  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (elements.length > 0) {
      setElA(prev => elements.find(e => e.number === prev?.number) || elements.find(e => e.symbol === 'Na') || elements[10]);
      setElB(prev => elements.find(e => e.number === prev?.number) || elements.find(e => e.symbol === 'Cl') || elements[16] || elements[1]);
    }
  }, [elements]);

  const electronegativityDiff = elA && elB ? Math.abs(elA.electronegativity - elB.electronegativity) : 0;

  const determineBondType = () => {
    if (electronegativityDiff >= 1.7) return 'Ionic';
    if (electronegativityDiff > 0.4) return 'Polar Covalent';
    return 'Covalent';
  };

  useEffect(() => {
    if (!svgRef.current || !elA || !elB) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const type = determineBondType();

    const defs = svg.append("defs");

    // Gradients
    const gradA = defs.append("radialGradient").attr("id", "gradA");
    gradA.append("stop").attr("offset", "0%").attr("stop-color", "#818cf8");
    gradA.append("stop").attr("offset", "100%").attr("stop-color", "#4f46e5");

    const gradB = defs.append("radialGradient").attr("id", "gradB");
    gradB.append("stop").attr("offset", "0%").attr("stop-color", "#c084fc");
    gradB.append("stop").attr("offset", "100%").attr("stop-color", "#9333ea");

    const glow = defs.append("filter").attr("id", "bondGlow");
    glow.append("feGaussianBlur").attr("stdDeviation", "3").attr("result", "blur");
    const feMerge = glow.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "blur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    const g = svg.append("g");

    // Atom A
    const atomA = g.append("g")
      .attr("class", "atom-group")
      .attr("transform", `translate(250, 200)`)
      .style("cursor", status === 'IDLE' ? "grab" : "default");

    atomA.append("circle")
      .attr("r", 45)
      .attr("fill", "url(#gradA)")
      .attr("stroke", "rgba(255,255,255,0.2)")
      .attr("stroke-width", 2);

    atomA.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", ".3em")
      .attr("fill", "white")
      .attr("font-size", "18px")
      .attr("font-weight", "900")
      .text(elA.symbol);

    // Atom B
    const atomB = g.append("g")
      .attr("class", "atom-group")
      .attr("transform", `translate(550, 200)`)
      .style("cursor", status === 'IDLE' ? "grab" : "default");

    atomB.append("circle")
      .attr("r", 45)
      .attr("fill", "url(#gradB)")
      .attr("stroke", "rgba(255,255,255,0.2)")
      .attr("stroke-width", 2);

    atomB.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", ".3em")
      .attr("fill", "white")
      .attr("font-size", "18px")
      .attr("font-weight", "900")
      .text(elB.symbol);

    // Bonding visual triggers
    if (status === 'IDLE') {
      const drag = d3.drag<SVGGElement, unknown>()
        .on("drag", function (event) {
          d3.select(this).attr("transform", `translate(${event.x}, ${event.y})`);

          const transformA = d3.select(atomA.node()).attr("transform");
          const transformB = d3.select(atomB.node()).attr("transform");
          const matchA = transformA?.match(/translate\(([^,]+),([^)]+)\)/);
          const matchB = transformB?.match(/translate\(([^,]+),([^)]+)\)/);

          if (matchA && matchB) {
            const xA = parseFloat(matchA[1]), xB = parseFloat(matchB[1]);
            const yA = parseFloat(matchA[2]), yB = parseFloat(matchB[2]);
            const distance = Math.sqrt((xA - xB) ** 2 + (yA - yB) ** 2);

            if (distance < 110) {
              setStatus('BONDED');
              setBondType(type);

              // Snap together
              atomA.transition().duration(500).attr("transform", `translate(340, 200)`);
              atomB.transition().duration(500).attr("transform", `translate(460, 200)`);

              triggerBondAnimation(g, type, 340, 460, 200);
            }
          }
        });

      atomA.call(drag as any);
      atomB.call(drag as any);
    } else {
      // Re-render bonded state
      atomA.attr("transform", `translate(340, 200)`);
      atomB.attr("transform", `translate(460, 200)`);
      triggerBondAnimation(g, type, 340, 460, 200);
    }

  }, [elA, elB, status]);

  const triggerBondAnimation = (g: d3.Selection<SVGGElement, any, any, any>, type: string, x1: number, x2: number, y: number) => {
    if (type === 'Ionic') {
      // Electron Transfer Animation
      const electron = g.append("circle")
        .attr("r", 5)
        .attr("fill", "#fbbf24")
        .attr("cx", x1)
        .attr("cy", y)
        .style("filter", "url(#bondGlow)");

      electron.transition()
        .duration(1000)
        .attr("cx", x2)
        .on("end", () => {
          electron.remove();
          // Show charges
          g.append("text").attr("x", x1 - 50).attr("y", y - 50).attr("fill", "#818cf8").attr("font-weight", "bold").text("+").attr("font-size", "24px");
          g.append("text").attr("x", x2 + 50).attr("y", y - 50).attr("fill", "#c084fc").attr("font-weight", "bold").text("-").attr("font-size", "24px");
        });
    } else {
      // Covalent Sharing Animation
      const orbit = g.append("ellipse")
        .attr("cx", (x1 + x2) / 2)
        .attr("cy", y)
        .attr("rx", 70)
        .attr("ry", 40)
        .attr("fill", "none")
        .attr("stroke", "rgba(99, 102, 241, 0.3)")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,5")
        .style("opacity", 0);

      orbit.transition().duration(800).style("opacity", 1);

      const e1 = g.append("circle").attr("r", 4).attr("fill", "#fbbf24").style("filter", "url(#bondGlow)");
      const e2 = g.append("circle").attr("r", 4).attr("fill", "#fbbf24").style("filter", "url(#bondGlow)");

      d3.timer((elapsed) => {
        if (status !== 'BONDED') return true;
        const angle = elapsed * 0.005;
        const centerX = (x1 + x2) / 2;
        e1.attr("cx", centerX + 70 * Math.cos(angle)).attr("cy", y + 40 * Math.sin(angle));
        e2.attr("cx", centerX + 70 * Math.cos(angle + Math.PI)).attr("cy", y + 40 * Math.sin(angle + Math.PI));
      });
    }
  };

  const reset = () => {
    setStatus('IDLE');
    setBondType(null);
  };

  if (!elements || elements.length === 0 || !elA || !elB) return null;

  return (
    <div className="flex flex-col gap-8">
      <div className="glass-panel rounded-[32px] p-10 border border-white/10 relative overflow-hidden">
        {/* Background Atmosphere */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-10">
          <div className="space-y-1">
            <h3 className="text-3xl font-black text-white tracking-tight">Interaction Laboratory</h3>
            <p className="text-sm text-white/40 font-medium">Explore the electrostatic force between valence shells.</p>
          </div>

          <div className="flex items-center gap-4 bg-slate-900/50 p-2 rounded-2xl border border-white/5">
            <div className="flex flex-col items-end px-3">
              <span className="text-[10px] font-black text-indigo-400 uppercase">Selected Pair</span>
              <span className="text-xs font-bold text-white/80">{elA.symbol} + {elB.symbol}</span>
            </div>
            <div className="w-px h-8 bg-white/10"></div>
            <button
              onClick={reset}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
            >
              Reset Environment
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Simulation View */}
          <div className="lg:col-span-8 relative aspect-video bg-slate-950/40 rounded-[24px] border border-white/5 overflow-hidden group shadow-inner">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.05)_0%,transparent_70%)] pointer-events-none"></div>

            {status === 'IDLE' && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none text-center">
                <div className="w-16 h-16 border-2 border-white/10 border-dashed rounded-full mx-auto mb-4 animate-[spin_10s_linear_infinite]"></div>
                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Drag atoms together</p>
              </div>
            )}

            <svg ref={svgRef} className="w-full h-full" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid meet" />
          </div>

          {/* Real-time Telemetry */}
          <div className="lg:col-span-4 space-y-6">
            <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-6">
              <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest">Bonding Telemetry</h4>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-white/60">Electronegativity Diff</span>
                  <span className="text-sm font-mono font-bold text-indigo-400">Δχ = {electronegativityDiff.toFixed(2)}</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 via-yellow-500 to-red-500 transition-all duration-700"
                    style={{ width: `${Math.min(100, (electronegativityDiff / 3.3) * 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[9px] font-bold text-white/20 uppercase tracking-tighter">
                  <span>Covalent (0.0)</span>
                  <span>Polar (0.5)</span>
                  <span>Ionic (1.7+)</span>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-white/60">Atom A: {elA.name}</span>
                  <select
                    value={elA.number}
                    onChange={e => { setStatus('IDLE'); setElA(elements.find(x => x.number === +e.target.value)!); }}
                    className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[10px] font-bold text-white focus:outline-none"
                  >
                    {elements.map(e => (
                      <option key={e.number} value={e.number} className="bg-slate-900 text-white">
                        {e.symbol}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs text-white/60">Atom B: {elB.name}</span>
                  <select
                    value={elB.number}
                    onChange={e => { setStatus('IDLE'); setElB(elements.find(x => x.number === +e.target.value)!); }}
                    className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[10px] font-bold text-white focus:outline-none"
                  >
                    {elements.map(e => (
                      <option key={e.number} value={e.number} className="bg-slate-900 text-white">
                        {e.symbol}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
              {status === 'BONDED' && (
                <div className="glass-panel p-6 rounded-3xl border border-indigo-500/30 bg-indigo-600/5 animate-in slide-in-from-right-4 duration-500">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                      <i className="fas fa-link text-indigo-400 text-xs"></i>
                    </div>
                    <h5 className="font-black text-sm uppercase text-white">{bondType} Bond</h5>
                  </div>
                  <p className="text-xs text-white/50 leading-relaxed italic">
                    {bondType === 'Ionic'
                      ? `Electrostatic attraction between ${elA.symbol}⁺ and ${elB.symbol}⁻ formed after a complete electron transfer.`
                      : `Stable overlap of atomic orbitals where ${elA.symbol} and ${elB.symbol} achieve octet stability through sharing.`}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      );
};

export default BondingLab;
