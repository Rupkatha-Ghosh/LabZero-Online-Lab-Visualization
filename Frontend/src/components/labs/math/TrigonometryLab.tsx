import React, { useState } from 'react';
import { SimulationProps } from '../../../types/types';

const TrigonometrySimulation: React.FC<Partial<SimulationProps>> = ({ theme = 'light' }) => {
  const isDark = theme === 'dark';
  // --- State ---
  const [angleDeg, setAngleDeg] = useState<number>(30);
  const [showSinGraph, setShowSinGraph] = useState<boolean>(true);
  const [showCosGraph, setShowCosGraph] = useState<boolean>(true);
  const [showTanGraph, setShowTanGraph] = useState<boolean>(false);

  // --- Mathematical Conversions & Values ---
  const angleRad = (angleDeg * Math.PI) / 180;
  
  // Core trig values
  const sinVal = Math.sin(angleRad);
  const cosVal = Math.cos(angleRad);
  
  // Handle potentially undefined/infinite values at asymptotes
  const isTanUndefined = angleDeg === 90 || angleDeg === 270;
  const tanVal = isTanUndefined ? Infinity : Math.tan(angleRad);
  
  const isSecUndefined = angleDeg === 90 || angleDeg === 270;
  const secVal = isSecUndefined ? Infinity : 1 / cosVal;
  
  const isCscUndefined = angleDeg === 0 || angleDeg === 180 || angleDeg === 360;
  const cscVal = isCscUndefined ? Infinity : 1 / sinVal;
  
  const isCotUndefined = angleDeg === 0 || angleDeg === 180 || angleDeg === 360;
  const cotVal = isCotUndefined ? Infinity : 1 / tanVal;

  // --- SVG Scaling Configuration ---
  const circleRadius = 120;
  const circleCenter = 150; // Viewbox 300x300
  
  // Point coordinates on the SVG unit circle (Y is inverted in SVG graphics)
  const pointX = circleCenter + cosVal * circleRadius;
  const pointY = circleCenter - sinVal * circleRadius;

  // Common preset angles
  const presets = [0, 30, 45, 60, 90, 120, 135, 180, 270, 360];

  // Helper to generate SVG path for wave graphs (0 to 360 degrees)
  const generateWavePath = (type: 'sin' | 'cos' | 'tan') => {
    const points: string[] = [];
    const graphWidth = 600;
    const graphHeight = 100; // Amplitude scaling
    const centerY = 60; // Center baseline

    for (let deg = 0; deg <= 360; deg += 2) {
      const rad = (deg * Math.PI) / 180;
      const x = (deg / 360) * graphWidth;
      let y = centerY;

      if (type === 'sin') {
        y = centerY - Math.sin(rad) * (graphHeight / 2);
      } else if (type === 'cos') {
        y = centerY - Math.cos(rad) * (graphHeight / 2);
      } else if (type === 'tan') {
        const t = Math.tan(rad);
        // Clip values to prevent vertical asymptote lines stretching infinitely
        if (Math.abs(t) > 4) continue; 
        y = centerY - t * 15; // Scaled down for viewability
      }
      points.push(`${x},${y}`);
    }
    return points.join(' L ');
  };

  // Helper to format values safely for display
  const formatVal = (val: number, isUndefined: boolean) => {
    if (isUndefined || Math.abs(val) > 1000) return 'Undefined';
    return val.toFixed(3);
  };

  return (
    <div className={`flex flex-col gap-6 w-full max-w-4xl mx-auto p-6 font-sans border rounded-2xl shadow-sm select-none transition-colors duration-500 ${
      isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
    }`}>
      
      {/* Header */}
      <div className="text-center">
        <h2 className={`text-2xl font-bold margin-0 ${isDark ? 'text-white' : 'text-slate-800'}`}>Unit Circle & Trigonometric Waves</h2>
        <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Explore the dynamic linkage between circular motion and periodic functions</p>
      </div>

      {/* Primary Layout: Circle + Metrics Viewport */}
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 items-center p-6 rounded-xl border shadow-sm transition-colors duration-500 ${
        isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        
        {/* Interactive Unit Circle Workspace */}
        <div className="flex flex-col items-center relative">
          <span className={`text-xs font-semibold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Unit Circle Projection</span>
          <svg viewBox="0 0 300 300" className={`w-full max-w-[280px] h-auto border rounded-lg transition-colors duration-500 ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50/50 border-slate-100'
          }`}>
            {/* Grid & Axes */}
            <line x1="150" y1="10" x2="150" y2="290" stroke={isDark ? '#334155' : '#cbd5e1'} strokeWidth="1.5" />
            <line x1="10" y1="150" x2="290" y2="150" stroke={isDark ? '#334155' : '#cbd5e1'} strokeWidth="1.5" />
            
            {/* Main Circle */}
            <circle cx={circleCenter} cy={circleCenter} r={circleRadius} fill="none" stroke={isDark ? '#475569' : '#94a3b8'} strokeWidth="2" />
            
            {/* Angle Arc Indicator */}
            {angleDeg > 0 && (
              <path
                d={`M ${circleCenter + 25} ${circleCenter} A 25 25 0 ${angleDeg > 180 ? 1 : 0} 0 ${
                  circleCenter + Math.cos(angleRad) * 25
                } ${circleCenter - Math.sin(angleRad) * 25}`}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2.5"
              />
            )}

            {/* Cosine Vector (Horizontal Component) */}
            <line
              x1={circleCenter}
              y1={circleCenter}
              x2={pointX}
              y2={circleCenter}
              stroke="#0284c7" // Blue
              strokeWidth="3.5"
              strokeLinecap="round"
            />

            {/* Sine Vector (Vertical Component) */}
            <line
              x1={pointX}
              y1={circleCenter}
              x2={pointX}
              y2={pointY}
              stroke="#dc2626" // Red
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeDasharray={angleDeg % 90 === 0 ? 'none' : '4 2'}
            />

            {/* Hypotenuse Vector (Radius = 1) */}
            <line
              x1={circleCenter}
              y1={circleCenter}
              x2={pointX}
              y2={pointY}
              stroke={isDark ? '#f8fafc' : '#334155'}
              strokeWidth="2.5"
            />

            {/* Terminal Drag Node */}
            <circle
              cx={pointX}
              cy={pointY}
              r="6"
              className="fill-slate-800 stroke-white stroke-2"
            />

            {/* Axis Labels */}
            <text x="280" y="145" fontSize="10" fill={isDark ? '#94a3b8' : '#64748b'} fontWeight="bold">X</text>
            <text x="155" y="20" fontSize="10" fill={isDark ? '#94a3b8' : '#64748b'} fontWeight="bold">Y</text>
          </svg>
          
          {/* Color Legend */}
          <div className={`flex gap-4 mt-3 text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block"></span> Sine (y)</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-sky-600 inline-block"></span> Cosine (x)</span>
          </div>
        </div>

        {/* Real-Time Mathematical Metrics Panel */}
        <div className="flex flex-col gap-4">
          <div className={`p-4 rounded-xl border transition-colors duration-500 ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className={`text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Input Parameters</div>
            
            {/* Angle Slider Controls */}
            <div className="flex items-center justify-between mb-1">
              <span className={`text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Angle (θ)</span>
              <span className={`text-sm font-mono font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{angleDeg}° / {angleRad.toFixed(2)} rad</span>
            </div>
            <input
              type="range"
              min="0"
              max="360"
              value={angleDeg}
              onChange={(e) => setAngleDeg(Number(e.target.value))}
              className={`w-full cursor-pointer ${isDark ? 'accent-sky-500' : 'accent-slate-800'}`}
            />
            
            {/* Common Angle Presets */}
            <div className="flex flex-wrap gap-1 mt-3 justify-start">
              {presets.map((preset) => (
                <button
                  key={preset}
                  onClick={() => setAngleDeg(preset)}
                  className={`px-2 py-1 text-[11px] font-mono rounded transition-colors border ${
                    angleDeg === preset
                      ? isDark ? 'bg-sky-500 text-white font-bold border-sky-500' : 'bg-indigo-600 text-white font-bold border-indigo-600'
                      : isDark ? 'bg-slate-800 text-slate-400 hover:bg-slate-700 border-slate-700' : 'bg-white text-slate-800 hover:bg-slate-200 border-slate-300'
                  }`}
                >
                  {preset}°
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Trigonometric Outputs Grid */}
          <div className="grid grid-cols-2 gap-2">
            <div className={`${isDark ? 'bg-red-500/10 border-red-500/20' : 'bg-red-50 border-red-100'} p-2.5 rounded-lg flex justify-between items-center`}>
              <span className={`text-xs font-semibold ${isDark ? 'text-red-400' : 'text-red-800'}`}>sin(θ)</span>
              <span className={`font-mono text-sm font-bold ${isDark ? 'text-red-300' : 'text-red-900'}`}>{formatVal(sinVal, false)}</span>
            </div>
            <div className={`${isDark ? 'bg-sky-500/10 border-sky-500/20' : 'bg-sky-50 border-sky-100'} p-2.5 rounded-lg flex justify-between items-center`}>
              <span className={`text-xs font-semibold ${isDark ? 'text-sky-400' : 'text-sky-800'}`}>cos(θ)</span>
              <span className={`font-mono text-sm font-bold ${isDark ? 'text-sky-300' : 'text-sky-900'}`}>{formatVal(cosVal, false)}</span>
            </div>
            <div className={`${isDark ? 'bg-amber-500/10 border-amber-500/20' : 'bg-amber-50 border-amber-100'} p-2.5 rounded-lg flex justify-between items-center`}>
              <span className={`text-xs font-semibold ${isDark ? 'text-amber-400' : 'text-amber-800'}`}>tan(θ)</span>
              <span className={`font-mono text-sm font-bold ${isDark ? 'text-amber-300' : 'text-amber-900'}`}>{formatVal(tanVal, isTanUndefined)}</span>
            </div>
            <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'} p-2.5 rounded-lg flex justify-between items-center`}>
              <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>sec(θ)</span>
              <span className={`font-mono text-sm font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{formatVal(secVal, isSecUndefined)}</span>
            </div>
            <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'} p-2.5 rounded-lg flex justify-between items-center`}>
              <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>csc(θ)</span>
              <span className={`font-mono text-sm font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{formatVal(cscVal, isCscUndefined)}</span>
            </div>
            <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'} p-2.5 rounded-lg flex justify-between items-center`}>
              <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>cot(θ)</span>
              <span className={`font-mono text-sm font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{formatVal(cotVal, isCotUndefined)}</span>
            </div>
          </div>

          {/* Graph View Visibility Checkboxes */}
          <div className={`flex gap-4 pt-1 justify-center text-xs border-t transition-colors duration-500 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
            <label className={`flex items-center gap-1.5 cursor-pointer font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              <input type="checkbox" checked={showSinGraph} onChange={(e) => setShowSinGraph(e.target.checked)} className="accent-red-600" />
              Show Sine Wave
            </label>
            <label className={`flex items-center gap-1.5 cursor-pointer font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              <input type="checkbox" checked={showCosGraph} onChange={(e) => setShowCosGraph(e.target.checked)} className="accent-sky-600" />
              Show Cosine Wave
            </label>
            <label className={`flex items-center gap-1.5 cursor-pointer font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              <input type="checkbox" checked={showTanGraph} onChange={(e) => setShowTanGraph(e.target.checked)} className="accent-amber-600" />
              Show Tangent Wave
            </label>
          </div>
        </div>
      </div>

      {/* Stacked Continuous Function Graphs */}
      <div className="flex flex-col gap-4">
        
        {/* Sine Wave Viewport */}
        {showSinGraph && (
          <div className={`p-4 rounded-xl border shadow-sm relative transition-colors duration-500 ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex justify-between items-center mb-2">
              <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-red-400' : 'text-red-700'}`}>Sine Function Graph: y = sin(θ)</span>
              <span className="text-xs font-mono text-slate-400">0° to 360°</span>
            </div>
            <svg viewBox="0 0 600 120" className={`w-full h-auto rounded border transition-colors duration-500 ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50/30 border-slate-100'
            }`}>
              {/* Central Axis baseline */}
              <line x1="0" y1="60" x2="600" y2="60" stroke={isDark ? '#334155' : '#cbd5e1'} strokeDasharray="4 4" />
              {/* Wave Trace Path */}
              <path d={`M ${generateWavePath('sin')}`} fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" />
              {/* Moving Point linked to State */}
              <circle
                cx={(angleDeg / 360) * 600}
                cy={60 - sinVal * 50}
                r="5"
                className="fill-red-600 stroke-white stroke-2"
              />
            </svg>
          </div>
        )}

        {/* Cosine Wave Viewport */}
        {showCosGraph && (
          <div className={`p-4 rounded-xl border shadow-sm relative transition-colors duration-500 ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex justify-between items-center mb-2">
              <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-sky-400' : 'text-sky-700'}`}>Cosine Function Graph: y = cos(θ)</span>
              <span className="text-xs font-mono text-slate-400">0° to 360°</span>
            </div>
            <svg viewBox="0 0 600 120" className={`w-full h-auto rounded border transition-colors duration-500 ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50/30 border-slate-100'
            }`}>
              {/* Central Axis baseline */}
              <line x1="0" y1="60" x2="600" y2="60" stroke={isDark ? '#334155' : '#cbd5e1'} strokeDasharray="4 4" />
              {/* Wave Trace Path */}
              <path d={`M ${generateWavePath('cos')}`} fill="none" stroke="#0284c7" strokeWidth="2.5" strokeLinecap="round" />
              {/* Moving Point linked to State */}
              <circle
                cx={(angleDeg / 360) * 600}
                cy={60 - cosVal * 50}
                r="5"
                className="fill-sky-600 stroke-white stroke-2"
              />
            </svg>
          </div>
        )}

        {/* Tangent Wave Viewport */}
        {showTanGraph && (
          <div className={`p-4 rounded-xl border shadow-sm relative transition-colors duration-500 ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex justify-between items-center mb-2">
              <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>Tangent Function Graph: y = tan(θ)</span>
              <span className="text-xs font-mono text-slate-400">Asymptotes at 90° and 270°</span>
            </div>
            <svg viewBox="0 0 600 120" className={`w-full h-auto rounded border overflow-hidden transition-colors duration-500 ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50/30 border-slate-100'
            }`}>
              {/* Central Axis baseline */}
              <line x1="0" y1="60" x2="600" y2="60" stroke={isDark ? '#334155' : '#cbd5e1'} strokeDasharray="4 4" />
              {/* Asymptote Guides */}
              <line x1={(90 / 360) * 600} y1="0" x2={(90 / 360) * 600} y2="120" stroke="#f87171" strokeDasharray="2 2" strokeWidth="1" />
              <line x1={(270 / 360) * 600} y1="0" x2={(270 / 360) * 600} y2="120" stroke="#f87171" strokeDasharray="2 2" strokeWidth="1" />
              {/* Wave Trace Path */}
              <path d={`M ${generateWavePath('tan')}`} fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" />
              {/* Moving Point linked to State */}
              {!isTanUndefined && (
                <circle
                  cx={(angleDeg / 360) * 600}
                  cy={Math.max(-10, Math.min(130, 60 - tanVal * 15))}
                  r="5"
                  className="fill-amber-600 stroke-white stroke-2"
                />
              )}
            </svg>
          </div>
        )}

      </div>
    </div>
  );
};

export default TrigonometrySimulation;