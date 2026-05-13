import React, { useState, useRef, useEffect } from 'react';
import { Activity, Zap, MoveHorizontal, Info } from 'lucide-react';

const ElectromagnetismLab: React.FC = () => {
  // --- State ---
  const [magnetX, setMagnetX] = useState<number>(0); // -150 to 150
  const [velocity, setVelocity] = useState<number>(0);
  const [inducedEMF, setInducedEMF] = useState<number>(0);
  const [voltageHistory, setVoltageHistory] = useState<number[]>(new Array(50).fill(0));
  const [numCoils, setNumCoils] = useState<number>(3);
  
  const lastX = useRef<number>(0);
  const lastTime = useRef<number>(Date.now());

  // --- Simulation Logic ---
  useEffect(() => {
    const updatePhysics = () => {
      const now = Date.now();
      const dt = (now - lastTime.current) / 1000;
      
      if (dt > 0) {
        // Calculate instantaneous velocity
        const v = (magnetX - lastX.current) / dt;
        setVelocity(v);

        /**
         * Faraday's Law: ε = -N * (dΦ/dt)
         * We simulate flux Φ based on magnet proximity to coil center (x=0)
         * Flux is highest at center, so dΦ/dt is highest just before/after center.
         */
        const proximityFactor = Math.exp(-Math.pow(magnetX / 40, 2));
        const fluxGradient = -(magnetX / 20) * proximityFactor; 
        const rawEMF = numCoils * v * fluxGradient * 0.05;

        setInducedEMF(rawEMF);
        
        // Update Graph History
        setVoltageHistory(prev => [...prev.slice(1), rawEMF]);
        
        lastX.current = magnetX;
        lastTime.current = now;
      }
    };

    const frame = requestAnimationFrame(updatePhysics);
    return () => cancelAnimationFrame(frame);
  }, [magnetX, numCoils]);

  // SVG Mapping
  const centerX = 200;
  const centerY = 150;

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto p-6 font-sans bg-slate-50 border border-slate-200 rounded-2xl shadow-sm select-none">
      
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-800 m-0">Electromagnetic Induction Lab</h2>
        <p className="text-sm text-slate-500 mt-1">Move the magnet through the coil to generate electricity (Faraday's Law)</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Visual Workspace (2 Columns) */}
        <div className="lg:col-span-2 bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center relative overflow-hidden">
          
          <div className="w-full flex justify-between items-center px-2 pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Zap size={14} className="text-amber-500" /> Physical Viewport
            </span>
            <span className="text-xs font-mono font-bold text-slate-600">
              Coils: {numCoils} | v: {Math.abs(velocity).toFixed(0)} px/s
            </span>
          </div>

          <svg viewBox="0 0 400 300" className="w-full h-auto bg-slate-50/50 my-4 rounded-lg cursor-grab active:cursor-grabbing">
            {/* Magnetic Field Lines (Static/Dynamic) */}
            <g opacity={Math.abs(inducedEMF) > 0.1 ? 0.4 : 0.2}>
              {[-30, -15, 0, 15, 30].map(angle => (
                <ellipse 
                  key={angle}
                  cx={centerX + magnetX} cy={centerY} rx="60" ry="25"
                  fill="none" stroke="#3b82f6" strokeWidth="1"
                  transform={`rotate(${angle} ${centerX + magnetX} ${centerY})`}
                />
              ))}
            </g>

            {/* The Coil (Solenoid) */}
            <g stroke="#b45309" fill="none" strokeWidth="4" strokeLinecap="round">
              {[...Array(numCoils)].map((_, i) => (
                <path 
                  key={i} 
                  d={`M ${centerX - 20} ${centerY - 40 + i * 20} Q ${centerX + 40} ${centerY - 30 + i * 20} ${centerX - 20} ${centerY - 20 + i * 20}`} 
                  opacity={0.8}
                />
              ))}
            </g>

            {/* Induced Current Arrows (Lenz's Law visualization) */}
            {Math.abs(inducedEMF) > 0.5 && (
              <g className={inducedEMF > 0 ? "animate-pulse" : ""}>
                <path 
                  d={inducedEMF > 0 ? "M 170 110 L 170 190" : "M 170 190 L 170 110"} 
                  stroke="#ef4444" strokeWidth="3" markerEnd="url(#arrowhead)" 
                />
              </g>
            )}

            {/* The Bar Magnet */}
            <g transform={`translate(${magnetX}, 0)`}>
              {/* North Pole */}
              <rect x={centerX - 80} y={centerY - 15} width="40" height="30" fill="#ef4444" rx="2" />
              <text x={centerX - 65} y={centerY + 5} fill="white" fontSize="12" fontWeight="bold">N</text>
              {/* South Pole */}
              <rect x={centerX - 40} y={centerY - 15} width="40" height="30" fill="#3b82f6" rx="2" />
              <text x={centerX - 25} y={centerY + 5} fill="white" fontSize="12" fontWeight="bold">S</text>
            </g>

            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#ef4444" />
              </marker>
            </defs>
          </svg>

          {/* Magnet Slider Control */}
          <div className="w-full px-8 pb-4">
            <label className="flex items-center justify-center gap-2 text-xs font-bold text-slate-500 mb-2">
              <MoveHorizontal size={14} /> Slide Magnet to Induce Current
            </label>
            <input 
              type="range" min="-180" max="180" value={magnetX}
              onChange={(e) => setMagnetX(parseInt(e.target.value))}
              className="w-full accent-slate-700"
            />
          </div>
        </div>

        {/* Sidebar Controls & Graph */}
        <div className="flex flex-col gap-4">
          {/* Voltmeter Display */}
          <div className="bg-slate-900 p-5 rounded-xl border border-slate-700 shadow-lg text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Galvanometer (EMF)</span>
            <div className={`text-3xl font-mono font-bold transition-colors ${Math.abs(inducedEMF) > 0.1 ? 'text-amber-400' : 'text-slate-500'}`}>
              {inducedEMF.toFixed(2)}V
            </div>
          </div>

          {/* Settings */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-2 uppercase">Coil Density (N)</label>
              <div className="flex gap-2">
                {[2, 3, 5].map(n => (
                  <button 
                    key={n} onClick={() => setNumCoils(n)}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${numCoils === n ? 'bg-slate-800 text-white border-slate-800' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
                  >
                    {n} Turns
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Real-time Graph - FIXED VERSION */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 h-full flex flex-col min-h-[180px]">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Activity size={14} /> Voltage Waveform
            </span>
            
            {/* The container now has a relative position and overflow hidden */}
            <div className="flex-1 flex items-center gap-0.5 border-l border-b border-slate-100 relative overflow-hidden bg-slate-50/30">
              
              {/* Zero-line reference */}
              <div className="absolute w-full h-[1px] bg-slate-200 top-1/2 left-0 z-0"></div>

              {voltageHistory.map((v, i) => {
                // 1. Clamp the value so it never exceeds 100% (or 0.9 for safety)
                const clampedV = Math.max(-0.9, Math.min(0.9, v));
                
                return (
                  <div 
                    key={i}
                    className="flex-1 bg-amber-500 transition-all duration-75 relative z-10"
                    style={{ 
                      // 2. We use 45% as max height so it fits in one half of the box
                      height: `${Math.abs(clampedV) * 45}%`,
                      opacity: 0.3 + (Math.abs(clampedV) * 0.7),
                      // 3. Positioning based on positive/negative voltage
                      marginBottom: v < 0 ? '0' : '50%',
                      marginTop: v >= 0 ? '0' : '50%',
                      transformOrigin: v >= 0 ? 'bottom' : 'top',
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Theory Card */}
      <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex gap-3">
        <Info className="text-blue-500 shrink-0 mt-1" size={18} />
        <div className="text-xs text-blue-800 leading-relaxed">
          <p className="font-bold uppercase mb-1">Faraday's Law in Action:</p>
          The induced voltage is proportional to the <b>speed</b> of the magnet and the <b>number of turns</b> in the coil. Notice that the voltage flips sign depending on whether the magnet is entering or leaving the coil (Lenz's Law).
        </div>
      </div>
    </div>
  );
};

export default ElectromagnetismLab;