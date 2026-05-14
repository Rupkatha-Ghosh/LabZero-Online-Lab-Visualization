import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, Plus, Minus } from 'lucide-react';
import { SimulationProps } from '../../../types/types';

interface Charge {
  x: number;
  y: number;
  q: number; // positive or negative
}

const ElectromagnetismVisualizer: React.FC<Partial<SimulationProps>> = ({ theme = 'light' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [charges, setCharges] = useState<Charge[]>([
    { x: 300, y: 250, q: 1 },
    { x: 700, y: 250, q: -1 }
  ]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear with theme-aware background
    ctx.fillStyle = theme === 'dark' ? '#0f172a' : '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw field lines
    for (let i = 0; i < canvas.width; i += 20) {
      for (let j = 0; j < canvas.height; j += 20) {
        let ex = 0;
        let ey = 0;

        charges.forEach(c => {
          const dx = i - c.x;
          const dy = j - c.y;
          const distSq = dx * dx + dy * dy;
          const dist = Math.sqrt(distSq);
          if (dist < 10) return;
          
          const e = c.q / distSq;
          ex += e * (dx / dist);
          ey += e * (dy / dist);
        });

        const mag = Math.sqrt(ex * ex + ey * ey);
        if (mag > 0.001) {
          ctx.beginPath();
          // Use more vibrant color for dark mode lines
          ctx.strokeStyle = theme === 'dark' 
            ? `rgba(129, 140, 248, ${Math.min(mag * 500, 0.7)})`
            : `rgba(99, 102, 241, ${Math.min(mag * 500, 0.5)})`;
          ctx.moveTo(i, j);
          ctx.lineTo(i + (ex / mag) * 10, j + (ey / mag) * 10);
          ctx.stroke();
        }
      }
    }

    // Draw charges
    charges.forEach(c => {
      ctx.beginPath();
      ctx.arc(c.x, c.y, 15, 0, Math.PI * 2);
      ctx.fillStyle = c.q > 0 ? '#f43f5e' : '#3b82f6';
      ctx.fill();
      
      // Add + or - symbols
      ctx.fillStyle = 'white';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(c.q > 0 ? '+' : '−', c.x, c.y);
    });
  }, [charges, theme]);

  return (
    <div className={`w-full h-full flex flex-col gap-4 p-4 rounded-3xl transition-colors duration-500 ${
      theme === 'dark' ? 'bg-slate-900 border border-slate-800' : 'bg-slate-50 border border-slate-200'
    }`}>
      <div className={`flex-1 rounded-2xl border relative overflow-hidden ${
        theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <canvas ref={canvasRef} width={1000} height={500} className="w-full h-full" />
      </div>
      <div className={`flex gap-4 p-4 rounded-2xl ${theme === 'dark' ? 'bg-slate-950/50' : 'bg-white/50'}`}>
        <button 
          onClick={() => setCharges([...charges, { x: 500, y: 250, q: 1 }])} 
          className={`text-xs uppercase flex items-center gap-2 font-bold ${theme === 'dark' ? 'text-white hover:text-rose-400' : 'text-slate-700 hover:text-rose-500'}`}
        >
          <Plus size={16}/> Add Positive
        </button>
        <button 
          onClick={() => setCharges([...charges, { x: 500, y: 250, q: -1 }])} 
          className={`text-xs uppercase flex items-center gap-2 font-bold ${theme === 'dark' ? 'text-white hover:text-blue-400' : 'text-slate-700 hover:text-blue-500'}`}
        >
          <Minus size={16}/> Add Negative
        </button>
        <button 
          onClick={() => setCharges([])} 
          className="text-slate-400 text-xs uppercase flex items-center gap-2 hover:text-slate-200 ml-auto"
        >
          <RefreshCw size={16}/> Clear Field
        </button>
      </div>
    </div>
  );
};

export default ElectromagnetismVisualizer;