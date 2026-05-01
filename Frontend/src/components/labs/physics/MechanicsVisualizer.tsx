import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Pause } from 'lucide-react';

const MechanicsVisualizer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Physics State
  const [angle, setAngle] = useState(45);
  const [velocity, setVelocity] = useState(25);
  const [gravity, setGravity] = useState(9.8);
  const [mass, setMass] = useState(10);

  // Simulation State
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const animationRef = useRef<number>(0);

  // Reset simulation when parameters change
  useEffect(() => {
    resetSim();
  }, [angle, velocity, gravity, mass]);

  const resetSim = () => {
    setIsRunning(false);
    setTime(0);
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    drawFrame(0);
  };

  const toggleSim = () => {
    setIsRunning(!isRunning);
  };

  // Main Physics Engine & Renderer
  const drawFrame = (t: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Convert angle to radians
    const theta = (angle * Math.PI) / 180;

    // Scale for canvas (pixels per meter)
    const scale = 5;
    const groundY = canvas.height - 40;
    const originX = 40;

    // Kinematic Equations
    const currentX = velocity * Math.cos(theta) * t;
    const currentY = (velocity * Math.sin(theta) * t) - (0.5 * gravity * t * t);

    // Stop at ground
    if (currentY < 0 && t > 0) {
      setIsRunning(false);
      return;
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid and ground
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 50) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke();
    }
    ctx.fillStyle = 'rgba(99, 102, 241, 0.2)'; // indigo-500/20
    ctx.fillRect(0, groundY, canvas.width, 40);

    // Draw Projectile
    const drawX = originX + (currentX * scale);
    const drawY = groundY - (currentY * scale);

    ctx.beginPath();
    ctx.arc(drawX, drawY, 8 + (mass * 0.2), 0, Math.PI * 2);
    ctx.fillStyle = '#818cf8'; // indigo-400
    ctx.fill();
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#818cf8';

    // Draw Velocity Vector
    const vx = velocity * Math.cos(theta);
    const vy = velocity * Math.sin(theta) - (gravity * t);

    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.moveTo(drawX, drawY);
    ctx.lineTo(drawX + (vx * 2), drawY - (vy * 2)); // scale vector for visibility
    ctx.strokeStyle = '#34d399'; // emerald-400
    ctx.lineWidth = 2;
    ctx.stroke();

    // Data Readout on Canvas
    ctx.fillStyle = 'white';
    ctx.font = '12px monospace';
    ctx.fillText(`Height: ${Math.max(0, currentY).toFixed(1)}m`, 20, 30);
    ctx.fillText(`Range: ${currentX.toFixed(1)}m`, 20, 50);
    ctx.fillText(`Time: ${t.toFixed(2)}s`, 20, 70);
  };

  // Animation Loop
  useEffect(() => {
    if (isRunning) {
      const loop = () => {
        setTime((prev) => {
          const newTime = prev + 0.03; // simulation speed
          drawFrame(newTime);
          return newTime;
        });
        animationRef.current = requestAnimationFrame(loop);
      };
      animationRef.current = requestAnimationFrame(loop);
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isRunning]);

  return (
    <div className="w-full h-full flex flex-col gap-6 text-white">
      {/* Canvas Container */}
      <div className="flex-1 bg-black/40 rounded-3xl border border-white/10 overflow-hidden relative">
        <canvas
          ref={canvasRef}
          width={1000}
          height={400}
          className="w-full h-full object-contain"
        />
      </div>

      {/* Control Panel */}
      <div className="bg-white/5 p-6 rounded-3xl border border-white/10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* Sliders */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest flex justify-between">
            <span>Angle</span> <span className="text-indigo-400">{angle}°</span>
          </label>
          <input type="range" min="0" max="90" value={angle} onChange={(e) => setAngle(Number(e.target.value))} className="accent-indigo-500" />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest flex justify-between">
            <span>Velocity</span> <span className="text-indigo-400">{velocity} m/s</span>
          </label>
          <input type="range" min="5" max="50" value={velocity} onChange={(e) => setVelocity(Number(e.target.value))} className="accent-indigo-500" />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest flex justify-between">
            <span>Gravity</span> <span className="text-indigo-400">{gravity} m/s²</span>
          </label>
          <input type="range" min="1" max="25" step="0.1" value={gravity} onChange={(e) => setGravity(Number(e.target.value))} className="accent-indigo-500" />
        </div>

        {/* Buttons */}
        <div className="flex items-end gap-3">
          <button
            onClick={toggleSim}
            className="flex-1 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition-colors flex items-center justify-center gap-2 text-sm font-bold tracking-wider"
          >
            {isRunning ? <Pause size={16} /> : <Play size={16} />}
            {isRunning ? 'PAUSE' : 'LAUNCH'}
          </button>
          <button
            onClick={resetSim}
            className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-slate-300"
          >
            <RotateCcw size={16} />
          </button>
        </div>

      </div>
    </div>
  );
};

export default MechanicsVisualizer;