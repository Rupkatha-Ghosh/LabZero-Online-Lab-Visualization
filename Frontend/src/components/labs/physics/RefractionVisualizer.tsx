import React, { useState, useEffect, useRef } from 'react';
import { RefractionPreset, RefractionProps } from '../../../types/types';

const RefractionSimulator: React.FC<RefractionProps> = ({ 
  initialN1 = 1.0, 
  initialN2 = 1.5, 
  initialAngle = 30,
  theme = 'light'
}) => {
  // --- State Management ---
  const [n1, setN1] = useState<number>(initialN1); // Medium 1 (Top)
  const [n2, setN2] = useState<number>(initialN2); // Medium 2 (Bottom)
  const [incidentAngle, setIncidentAngle] = useState<number>(initialAngle); // Angle in degrees
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const isDark = theme === 'dark';

  // Quick presets for common textbook scenarios
  const presets: RefractionPreset[] = [
    { name: 'Air → Glass (Rarer to Denser)', n1: 1.0, n2: 1.5, angle: 45 },
    { name: 'Water → Air (Denser to Rarer)', n1: 1.33, n2: 1.0, angle: 35 },
    { name: 'Glass → Water', n1: 1.5, n2: 1.33, angle: 40 },
  ];

  // Apply a selected preset
  const handlePreset = (preset: RefractionPreset) => {
    setN1(preset.n1);
    setN2(preset.n2);
    setIncidentAngle(preset.angle);
  };

  // --- Physics Calculations ---
  const rad = (deg: number) => (deg * Math.PI) / 180;
  const deg = (rad: number) => (rad * 180) / Math.PI;

  const theta1Rad = rad(incidentAngle);
  
  let criticalAngle: number | null = null;
  if (n1 > n2) {
    criticalAngle = deg(Math.asin(n2 / n1));
  }

  const isTIR = criticalAngle !== null && incidentAngle >= criticalAngle;

  let refractedAngleRad = 0;
  let refractedAngleDeg = 0;
  if (!isTIR) {
    const sinTheta2 = (n1 / n2) * Math.sin(theta1Rad);
    refractedAngleRad = Math.asin(sinTheta2);
    refractedAngleDeg = deg(refractedAngleRad);
  }

  const speed1 = (1 / n1).toFixed(2);
  const speed2 = (1 / n2).toFixed(2);

  // --- Canvas Rendering Loop ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const cx = width / 2;
    const cy = height / 2;
    const rayLength = Math.min(width, height) * 0.42;

    const textColor = isDark ? '#f1f5f9' : '#333333';
    const borderColor = isDark ? '#334155' : '#94a3b8';
    const normalColor = isDark ? '#94a3b8' : '#64748b';
    const medium1Color = isDark 
      ? (n1 > 1.2 ? '#1e293b' : '#0f172a') 
      : (n1 > 1.2 ? '#f0f4f8' : '#ffffff');

    // 1. Clear Canvas
    ctx.clearRect(0, 0, width, height);

    // 2. Draw Medium 1 (Top Half)
    ctx.fillStyle = medium1Color;
    ctx.fillRect(0, 0, width, cy);
    ctx.fillStyle = textColor;
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(`Medium 1 (n₁ = ${n1.toFixed(2)})`, 20, 30);

    // 3. Draw Medium 2 (Bottom Half)
    const baseDensity = isDark ? 40 : 240;
    const densityStep = isDark ? 20 : -60;
    const densityTint = Math.min(255, Math.floor(baseDensity + (n2 - 1) * densityStep));
    
    ctx.fillStyle = isDark 
      ? `rgb(15, ${Math.floor(densityTint/2)}, ${densityTint})`
      : `rgb(${densityTint}, 225, 255)`;
    ctx.fillRect(0, cy, width, cy);
    ctx.fillStyle = textColor;
    ctx.fillText(`Medium 2 (n₂ = ${n2.toFixed(2)})`, 20, cy + 30);

    // 4. Draw Interface Boundary
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(width, cy);
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    // 5. Draw Normal Line (Dashed)
    ctx.beginPath();
    ctx.setLineDash([6, 6]);
    ctx.moveTo(cx, 40);
    ctx.lineTo(cx, height - 40);
    ctx.strokeStyle = normalColor;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.setLineDash([]); 

    // 6. Draw Incident Ray
    const startX = cx - rayLength * Math.sin(theta1Rad);
    const startY = cy - rayLength * Math.cos(theta1Rad);

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(cx, cy);
    ctx.strokeStyle = '#f43f5e'; // Rose-500
    ctx.lineWidth = 3;
    ctx.stroke();

    if (incidentAngle > 3) {
      ctx.beginPath();
      ctx.arc(cx, cy, 40, -Math.PI / 2 - theta1Rad, -Math.PI / 2);
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = '#f43f5e';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(`i = ${Math.round(incidentAngle)}°`, cx - 55, cy - 50);
    }

    // 7. Draw Refracted or Reflected Ray
    if (isTIR) {
      const endX = cx + rayLength * Math.sin(theta1Rad);
      const endY = cy - rayLength * Math.cos(theta1Rad);

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = '#fbbf24'; // Amber-400
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = '#fbbf24';
      ctx.fillText(`r = ${Math.round(incidentAngle)}°`, cx + 35, cy - 50);
    } else {
      const endX = cx + rayLength * Math.sin(refractedAngleRad);
      const endY = cy + rayLength * Math.cos(refractedAngleRad);

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = isDark ? '#f43f5e' : '#ef4444';
      ctx.lineWidth = 3;
      ctx.stroke();

      if (refractedAngleDeg > 3) {
        ctx.beginPath();
        ctx.arc(cx, cy, 50, Math.PI / 2, Math.PI / 2 - refractedAngleRad, true);
        ctx.strokeStyle = isDark ? '#f43f5e' : '#ef4444';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fillStyle = isDark ? '#f43f5e' : '#ef4444';
        ctx.fillText(`r = ${Math.round(refractedAngleDeg)}°`, cx + 25, cy + 65);
      }
    }

    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.fillStyle = isDark ? '#ffffff' : '#000000';
    ctx.fill();

  }, [n1, n2, incidentAngle, theta1Rad, refractedAngleRad, isTIR, refractedAngleDeg, isDark]);

  return (
    <div className={`w-full max-w-4xl mx-auto p-6 transition-colors duration-500 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
      {/* Canvas Display Viewport */}
      <div className={`relative border rounded-2xl overflow-hidden shadow-2xl transition-colors duration-500 ${
        isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <canvas 
          ref={canvasRef} 
          width={760} 
          height={400} 
          className="block w-full h-auto"
        />
        
        {/* TIR Alert Badge */}
        {isTIR && (
          <div className={`absolute top-4 right-4 px-3 py-1.5 rounded-lg font-bold text-xs uppercase tracking-wider border animate-pulse ${
            isDark ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-amber-100 text-amber-800 border-amber-200'
          }`}>
            ⚠️ Total Internal Reflection
          </div>
        )}
      </div>

      {/* Preset Controls */}
      <div className="mt-6 flex gap-2 justify-center flex-wrap">
        {presets.map((preset, idx) => {
          const isActive = n1 === preset.n1 && n2 === preset.n2 && incidentAngle === preset.angle;
          return (
            <button
              key={idx}
              onClick={() => handlePreset(preset)}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-xl border transition-all ${
                isActive
                  ? 'bg-primary text-white border-primary shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.4)]'
                  : isDark 
                    ? 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white' 
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {preset.name}
            </button>
          );
        })}
      </div>

      {/* Parameters & Controls Grid */}
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 p-6 rounded-2xl border transition-colors duration-500 ${
        isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'
      }`}>
        {/* Angle Slider */}
        <div className="space-y-3">
          <label className={`block text-xs font-bold uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Angle of Incidence: <span className="text-rose-500">{incidentAngle}°</span>
          </label>
          <input
            type="range"
            min={0}
            max={89}
            value={incidentAngle}
            onChange={(e) => setIncidentAngle(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-500 dark:bg-slate-700"
          />
        </div>

        {/* Medium 1 Slider */}
        <div className="space-y-3">
          <label className={`block text-xs font-bold uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Index n₁: <span className="text-indigo-500">{n1.toFixed(2)}</span>
          </label>
          <input
            type="range"
            min={1.0}
            max={2.5}
            step={0.01}
            value={n1}
            onChange={(e) => setN1(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-500 dark:bg-slate-700"
          />
          <div className="text-[10px] font-mono opacity-60">Light Speed: {speed1}c</div>
        </div>

        {/* Medium 2 Slider */}
        <div className="space-y-3">
          <label className={`block text-xs font-bold uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Index n₂: <span className="text-blue-500">{n2.toFixed(2)}</span>
          </label>
          <input
            type="range"
            min={1.0}
            max={2.5}
            step={0.01}
            value={n2}
            onChange={(e) => setN2(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500 dark:bg-slate-700"
          />
          <div className="text-[10px] font-mono opacity-60">Light Speed: {speed2}c</div>
        </div>
      </div>

      {/* Real-Time Metrics Output */}
      <div className={`mt-6 p-4 rounded-xl border flex flex-wrap justify-around gap-4 text-xs font-bold uppercase tracking-widest transition-colors duration-500 ${
        isDark ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300' : 'bg-indigo-50 border-indigo-100 text-indigo-700'
      }`}>
        <div className="flex items-center gap-2">
          <span className="opacity-60">Mode:</span>
          <span className={n1 === n2 ? '' : 'text-amber-500'}>
            {n1 === n2 ? 'Linear' : n1 < n2 ? 'Convergent' : 'Divergent'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="opacity-60">Refraction (r):</span>
          <span>{isTIR ? 'REFL' : `${refractedAngleDeg.toFixed(1)}°`}</span>
        </div>
        {criticalAngle !== null && (
          <div className="flex items-center gap-2">
            <span className="opacity-60">Critical (i_c):</span>
            <span className="text-amber-500">{criticalAngle.toFixed(1)}°</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default RefractionSimulator;