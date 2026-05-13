import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCw, Info, Magnet, Sparkles, RefreshCw } from 'lucide-react';

const ComplexNumbersLab: React.FC = () => {
  const [point, setPoint] = useState({ x: 1, y: 0.5 });
  const [showUnitCircle, setShowUnitCircle] = useState(true);
  const [isError, setIsError] = useState(false);
  const isDragging = useRef(false);
  const svgRef = useRef<SVGSVGElement>(null);

  // Trigger visual error
  const triggerError = () => {
    setIsError(true);
    setTimeout(() => setIsError(false), 800);
  };

  // Rotate point by 90 degrees (Multiply by i)
  const rotate90 = () => {
    if (Math.abs(point.x) < 0.05 && Math.abs(point.y) < 0.05) {
      triggerError();
      return;
    }
    // Mathematically: (x + yi) * i = -y + xi
    setPoint(prev => ({ x: -prev.y, y: prev.x }));
  };

  // Convert logical coordinates to standard SVG dimensions
  const scale = 120;
  const origin = 250;
  const toDisplayX = (x: number) => origin + x * scale;
  const toDisplayY = (y: number) => origin - y * scale; // SVG Y is inverted

  // Handle absolute direct dragging inside SVG space
  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    updatePointFromEvent(e);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    updatePointFromEvent(e);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDragging.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch (_) {}
  };

  const updatePointFromEvent = (e: React.PointerEvent) => {
    if (!svgRef.current) return;
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const cursorPt = pt.matrixTransform(svg.getScreenCTM()?.inverse());

    // Constrain inside our standard axes (-1.6 to 1.6 bounds)
    const rawX = (cursorPt.x - origin) / scale;
    const rawY = (origin - cursorPt.y) / scale;
    
    // Clamp values smoothly
    const clampedX = Math.max(-1.6, Math.min(1.6, rawX));
    const clampedY = Math.max(-1.6, Math.min(1.6, rawY));

    setPoint({ x: clampedX, y: clampedY });
  };

  // Math conversions for Polar display
  const radius = Math.sqrt(point.x * point.x + point.y * point.y);
  let angleRad = Math.atan2(point.y, point.x);
  if (angleRad < 0) angleRad += 2 * Math.PI;
  const angleDeg = (angleRad * 180) / Math.PI;

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto p-4 lg:p-8 font-sans select-none">
      
      {/* Visual Workspace */}
      <div 
        className={`w-full bg-[var(--bg-panel,bg-slate-900)] backdrop-blur-xl border border-[var(--border-glass,border-slate-800)] p-6 rounded-[32px] flex flex-col justify-center items-center relative overflow-hidden transition-all duration-300 shadow-xl ${
          isError ? 'bg-rose-500/10 border-rose-500/40 ring-4 ring-rose-500/20' : ''
        }`}
      >
        <AnimatePresence>
          {isError && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-6 left-0 right-0 flex items-center justify-center z-50 pointer-events-none"
            >
               <div className="bg-rose-600 text-white px-5 py-2.5 rounded-xl font-mono text-xs uppercase tracking-wider font-bold shadow-lg">
                 ⚠️ Origin Proximity: Vector amplitude too small to scale
               </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Grid Background background */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="w-full h-full bg-[linear-gradient(var(--border-glass,gray)_1px,transparent_1px),linear-gradient(90deg,var(--border-glass,gray)_1px,transparent_1px)] bg-[size:25px_25px]" />
        </div>

        {/* Scalable Vector Graphics Workspace */}
        <svg 
          ref={svgRef}
          viewBox="0 0 500 500" 
          className="w-full max-w-[420px] h-auto relative z-10 touch-none cursor-crosshair"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          {/* Unit Circle (r=1) */}
          {showUnitCircle && (
            <circle 
              cx={origin} 
              cy={origin} 
              r={scale} 
              fill="none" 
              stroke="var(--color-primary, #3b82f6)" 
              strokeWidth="1.5" 
              strokeDasharray="6 6" 
              opacity="0.25" 
            />
          )}

          {/* Axes */}
          <line x1="40" y1={origin} x2="460" y2={origin} stroke="var(--text-muted, gray)" strokeWidth="1" opacity="0.3" />
          <line x1={origin} y1="40" x2={origin} y2="460" stroke="var(--text-muted, gray)" strokeWidth="1" opacity="0.3" />

          {/* Point Vector (Hypotenuse line) */}
          <motion.line
            x1={origin}
            y1={origin}
            animate={{ x2: toDisplayX(point.x), y2: toDisplayY(point.y) }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            stroke="var(--color-primary, #3b82f6)"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Vector Terminal Node */}
          <motion.circle
            animate={{ cx: toDisplayX(point.x), cy: toDisplayY(point.y) }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            r="10"
            fill="var(--color-primary, #3b82f6)"
            className="cursor-grab active:cursor-grabbing hover:scale-110 transition-transform origin-center stroke-white stroke-2"
          />
          
          {/* Core Graphic Labels */}
          <text x="465" y="246" fill="var(--text-muted, gray)" fontSize="11" className="font-mono font-bold opacity-75">Re</text>
          <text x="258" y="35" fill="var(--text-muted, gray)" fontSize="11" className="font-mono font-bold opacity-75">Im</text>
        </svg>

        {/* Action Controls */}
        <div className="mt-6 flex flex-wrap gap-3 justify-center z-20">
          <button 
            onClick={rotate90}
            className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-mono uppercase tracking-wider font-bold hover:bg-blue-500 transition-all flex items-center gap-2 shadow-md active:scale-95"
          >
            <RotateCw size={14} /> Multiply by i (90°)
          </button>
          <button 
            onClick={() => setPoint({ x: 1, y: 0 })}
            className="px-5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono uppercase tracking-wider font-bold hover:bg-slate-700 transition-all flex items-center gap-2 active:scale-95"
          >
            <RefreshCw size={13} /> Reset
          </button>
        </div>
      </div>

      {/* Info Output Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
        
        {/* State Display Metrics */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-md flex flex-col justify-between">
          <div>
            <div className="text-blue-500 font-mono text-[11px] uppercase tracking-wider mb-2 flex items-center gap-1.5 font-bold">
              <Magnet size={13} /> Cartesian Form
            </div>
            <div className="text-2xl font-bold text-white tracking-tight font-mono">
              {point.x >= 0 ? '' : '-'}{Math.abs(point.x).toFixed(2)} 
              {point.y >= 0 ? ' + ' : ' - '}
              {Math.abs(point.y).toFixed(2)}
              <span className="text-blue-400 italic">i</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-800/60 flex justify-between text-xs text-slate-400 font-mono">
            <span>r = {radius.toFixed(2)}</span>
            <span>θ = {angleDeg.toFixed(0)}°</span>
          </div>
        </div>

        {/* Educational Snapshot */}
        <div className="p-6 rounded-2xl bg-blue-950/30 border border-blue-900/40 space-y-2.5 flex flex-col justify-between">
          <div>
            <h3 className="text-white font-bold text-sm flex items-center gap-2">
              <Sparkles size={16} className="text-blue-400" />
              Rotational Operators
            </h3>
            <p className="text-slate-400 text-xs font-normal leading-relaxed">
              Multiplying any vector by <span className="text-blue-300 font-mono font-bold">i</span> produces an anti-clockwise 90° rotational output along the Argand plane without altering spatial magnitude.
            </p>
          </div>
        </div>

        {/* Auxiliary Visual Toggles */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="text-slate-400 font-mono text-[11px] uppercase tracking-wider font-bold flex items-center gap-1.5">
              <Info size={13} /> Reference Map
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              The Unit Circle trace boundary visualizes absolute normalized vectors where <span className="font-mono text-white">|z| = 1</span>.
            </p>
          </div>
          <button 
            onClick={() => setShowUnitCircle(!showUnitCircle)}
            className="w-full mt-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono uppercase tracking-wider text-slate-300 hover:text-white transition-all font-bold"
          >
            {showUnitCircle ? 'Hide' : 'Show'} Circle Trace
          </button>
        </div>

      </div>
    </div>
  );
};

export default ComplexNumbersLab;