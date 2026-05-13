import React, { useState, useEffect, useRef } from 'react';
import { RefractionPreset, RefractionProps } from '../../../types/types';

const RefractionSimulator: React.FC<RefractionProps> = ({ 
  initialN1 = 1.0, 
  initialN2 = 1.5, 
  initialAngle = 30 
}) => {
  // --- State Management ---
  const [n1, setN1] = useState<number>(initialN1); // Medium 1 (Top)
  const [n2, setN2] = useState<number>(initialN2); // Medium 2 (Bottom)
  const [incidentAngle, setIncidentAngle] = useState<number>(initialAngle); // Angle in degrees
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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
  // Convert degrees to radians
  const rad = (deg: number) => (deg * Math.PI) / 180;
  // Convert radians to degrees
  const deg = (rad: number) => (rad * 180) / Math.PI;

  const theta1Rad = rad(incidentAngle);
  
  // Calculate Critical Angle if traveling from Denser to Rarer medium
  let criticalAngle: number | null = null;
  if (n1 > n2) {
    criticalAngle = deg(Math.asin(n2 / n1));
  }

  // Determine if Total Internal Reflection (TIR) occurs
  const isTIR = criticalAngle !== null && incidentAngle >= criticalAngle;

  // Calculate angle of refraction using Snell's Law: n1 * sin(θ1) = n2 * sin(θ2)
  let refractedAngleRad = 0;
  let refractedAngleDeg = 0;
  if (!isTIR) {
    const sinTheta2 = (n1 / n2) * Math.sin(theta1Rad);
    refractedAngleRad = Math.asin(sinTheta2);
    refractedAngleDeg = deg(refractedAngleRad);
  }

  // Calculate relative speed of light in both media (c = 3x10^8 m/s)
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

    // 1. Clear Canvas
    ctx.clearRect(0, 0, width, height);

    // 2. Draw Medium 1 (Top Half)
    ctx.fillStyle = n1 > 1.2 ? '#f0f4f8' : '#ffffff';
    ctx.fillRect(0, 0, width, cy);
    ctx.fillStyle = '#333333';
    ctx.font = '14px sans-serif';
    ctx.fillText(`Medium 1 (n₁ = ${n1.toFixed(2)})`, 20, 30);

    // 3. Draw Medium 2 (Bottom Half)
    // Darker blue tint based on optical density
    const densityTint = Math.min(255, Math.floor(240 - (n2 - 1) * 60));
    ctx.fillStyle = `rgb(${densityTint}, 225, 255)`;
    ctx.fillRect(0, cy, width, cy);
    ctx.fillStyle = '#333333';
    ctx.fillText(`Medium 2 (n₂ = ${n2.toFixed(2)})`, 20, cy + 30);

    // 4. Draw Interface Boundary
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(width, cy);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 5. Draw Normal Line (Dashed)
    ctx.beginPath();
    ctx.setLineDash([6, 6]);
    ctx.moveTo(cx, 40);
    ctx.lineTo(cx, height - 40);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.setLineDash([]); // Reset line dash

    // 6. Draw Incident Ray (Coming from top-left quadrant)
    const startX = cx - rayLength * Math.sin(theta1Rad);
    const startY = cy - rayLength * Math.cos(theta1Rad);

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(cx, cy);
    ctx.strokeStyle = '#ef4444'; // Bright Laser Red
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw Incident Angle Arc
    if (incidentAngle > 3) {
      ctx.beginPath();
      ctx.arc(cx, cy, 40, -Math.PI / 2 - theta1Rad, -Math.PI / 2);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = '#ef4444';
      ctx.font = '12px sans-serif';
      ctx.fillText(`i = ${Math.round(incidentAngle)}°`, cx - 50, cy - 50);
    }

    // 7. Draw Refracted or Reflected Ray
    if (isTIR) {
      // Total Internal Reflection: Ray reflects back into top-right quadrant
      const endX = cx + rayLength * Math.sin(theta1Rad);
      const endY = cy - rayLength * Math.cos(theta1Rad);

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = '#eab308'; // Warning Yellow/Orange for TIR
      ctx.lineWidth = 3;
      ctx.stroke();

      // Label Reflection
      ctx.fillStyle = '#eab308';
      ctx.fillText(`r = ${Math.round(incidentAngle)}°`, cx + 35, cy - 50);
    } else {
      // Standard Refraction: Ray passes into bottom-right quadrant
      const endX = cx + rayLength * Math.sin(refractedAngleRad);
      const endY = cy + rayLength * Math.cos(refractedAngleRad);

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Draw Refracted Angle Arc
      if (refractedAngleDeg > 3) {
        ctx.beginPath();
        ctx.arc(cx, cy, 50, Math.PI / 2, Math.PI / 2 - refractedAngleRad, true);
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fillStyle = '#ef4444';
        ctx.fillText(`r = ${Math.round(refractedAngleDeg)}°`, cx + 25, cy + 65);
      }
    }

    // Draw origin point
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#000000';
    ctx.fill();

  }, [n1, n2, incidentAngle, theta1Rad, refractedAngleRad, isTIR, refractedAngleDeg]);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h2 style={{ textAlign: 'center', color: '#1e293b', marginBottom: '5px' }}>
      </h2>
      <p style={{ textAlign: 'center', color: '#64748b', fontSize: '14px', marginTop: 0 }}>
       
      </p>

      {/* Canvas Display Viewport */}
      <div style={{ position: 'relative', border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#fff' }}>
        <canvas 
          ref={canvasRef} 
          width={760} 
          height={400} 
          style={{ display: 'block', width: '100%', height: 'auto' }}
        />
        
        {/* TIR Alert Badge */}
        {isTIR && (
          <div style={{ position: 'absolute', top: '15px', right: '15px', background: '#fef08a', color: '#854d0e', padding: '6px 12px', borderRadius: '6px', fontWeight: 'bold', fontSize: '14px', border: '1px solid #facc15' }}>
            ⚠️ Total Internal Reflection (TIR)
          </div>
        )}
      </div>

      {/* Preset Controls */}
      <div style={{ marginTop: '15px', display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
        {presets.map((preset, idx) => (
          <button
            key={idx}
            onClick={() => handlePreset(preset)}
            style={{ padding: '8px 12px', fontSize: '13px', cursor: 'pointer', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#334155', transition: 'all 0.2s' }}
          >
            {preset.name}
          </button>
        ))}
      </div>

      {/* Parameters & Controls Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginTop: '20px', padding: '15px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        {/* Angle Slider */}
        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#334155', marginBottom: '5px' }}>
            Angle of Incidence (i): {incidentAngle}°
          </label>
          <input
            type="range"
            min={0}
            max={89}
            value={incidentAngle}
            onChange={(e) => setIncidentAngle(Number(e.target.value))}
            style={{ width: '100%', cursor: 'pointer' }}
          />
        </div>

        {/* Medium 1 Slider */}
        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#334155', marginBottom: '5px' }}>
            Medium 1 Index (n₁): {n1.toFixed(2)}
          </label>
          <input
            type="range"
            min={1.0}
            max={2.5}
            step={0.01}
            value={n1}
            onChange={(e) => setN1(Number(e.target.value))}
            style={{ width: '100%', cursor: 'pointer' }}
          />
          <span style={{ fontSize: '11px', color: '#64748b' }}>Speed: {speed1}c</span>
        </div>

        {/* Medium 2 Slider */}
        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#334155', marginBottom: '5px' }}>
            Medium 2 Index (n₂): {n2.toFixed(2)}
          </label>
          <input
            type="range"
            min={1.0}
            max={2.5}
            step={0.01}
            value={n2}
            onChange={(e) => setN2(Number(e.target.value))}
            style={{ width: '100%', cursor: 'pointer' }}
          />
          <span style={{ fontSize: '11px', color: '#64748b' }}>Speed: {speed2}c</span>
        </div>
      </div>

      {/* Real-Time Metrics Output */}
      <div style={{ marginTop: '15px', padding: '12px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px', color: '#1e3a8a', fontSize: '14px', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <strong>Condition:</strong> {n1 === n2 ? 'No Bending' : n1 < n2 ? 'Bends Towards Normal' : 'Bends Away From Normal'}
        </div>
        <div>
          <strong>Angle of Refraction (r):</strong> {isTIR ? 'N/A (Reflected)' : `${refractedAngleDeg.toFixed(1)}°`}
        </div>
        {criticalAngle !== null && (
          <div>
            <strong>Critical Angle (i_c):</strong> {criticalAngle.toFixed(1)}°
          </div>
        )}
      </div>
    </div>
  );
};

export default RefractionSimulator;