
import React, { useState, useEffect, useRef } from 'react';
import { ElementData } from '../../../types/types';

interface QuantumTransitionLabProps {
  element: ElementData;
}

const QuantumTransitionLab: React.FC<QuantumTransitionLabProps> = ({ element }) => {
  const [isExcited, setIsExcited] = useState(false);
  const [emittedPhoton, setEmittedPhoton] = useState<{ color: string; id: number } | null>(null);
  const [spectralLines, setSpectralLines] = useState<string[]>([]);
  const timeoutRef = useRef<number | null>(null);

  const colors = ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#8b00ff'];

  const triggerExcitation = () => {
    if (isExcited) return;
    setIsExcited(true);
    
    // Simulate fall back after random delay
    const delay = 1000 + Math.random() * 2000;
    timeoutRef.current = window.setTimeout(() => {
      setIsExcited(false);
      const color = colors[Math.floor(Math.random() * colors.length)];
      setEmittedPhoton({ color, id: Date.now() });
      setSpectralLines(prev => [color, ...prev].slice(0, 12));
    }, delay);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div className="glass-panel rounded-[40px] p-10 border border-white/10 relative overflow-hidden bg-slate-950/40">
      <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
        <i className="fas fa-bolt text-9xl text-yellow-400"></i>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        <div className="flex-1 space-y-8">
          <div>
            <h3 className="text-3xl font-black text-white mb-2">Quantum Transition Lab</h3>
            <p className="text-sm text-white/40 max-w-md">Simulate photon absorption and emission. When electrons gain energy, they jump to higher states (Excitation), then release light as they fall back (Emission).</p>
          </div>

          <div className="relative h-64 w-full bg-slate-900/60 rounded-3xl border border-white/5 flex items-center justify-center overflow-hidden">
            {/* Simple Energy Level Diagram */}
            <div className="w-3/4 space-y-8">
              {[3, 2, 1].map(n => (
                <div key={n} className="relative h-px bg-white/10 w-full">
                  <span className="absolute -left-8 -top-2 text-[10px] font-mono text-white/20">n={n}</span>
                  {n === 1 && !isExcited && (
                    <div className="absolute left-1/2 -top-2 w-4 h-4 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.8)] transition-all duration-700"></div>
                  )}
                  {n === 3 && isExcited && (
                    <div className="absolute left-1/2 -top-2 w-4 h-4 bg-yellow-400 rounded-full shadow-[0_0_15px_rgba(250,204,21,0.8)] transition-all duration-700 animate-pulse"></div>
                  )}
                </div>
              ))}
            </div>

            {/* Photon Animation */}
            {emittedPhoton && (
              <div 
                key={emittedPhoton.id}
                className="absolute left-1/2 top-1/2 w-4 h-4 rounded-full blur-sm animate-ping"
                style={{ backgroundColor: emittedPhoton.color, animation: 'photon-fly 1.5s ease-out forwards' }}
              ></div>
            )}
            
            <style>{`
              @keyframes photon-fly {
                0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                100% { transform: translate(300%, -200%) scale(0.5); opacity: 0; }
              }
            `}</style>
          </div>

          <button 
            onClick={triggerExcitation}
            disabled={isExcited}
            className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3 border ${
              isExcited 
              ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500/50' 
              : 'bg-indigo-600 hover:bg-indigo-500 border-indigo-400 text-white shadow-xl shadow-indigo-600/20'
            }`}
          >
            <i className={`fas ${isExcited ? 'fa-spinner fa-spin' : 'fa-bolt'}`}></i>
            {isExcited ? 'Atom Excited...' : 'Inject Photon (Energy)'}
          </button>
        </div>

        <div className="w-full lg:w-80 space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-white/5 h-full">
            <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-6">Emission Spectrum</h4>
            <div className="h-48 w-full bg-black rounded-xl border border-white/10 relative overflow-hidden flex items-end p-2 gap-1">
              {/* Rainbow Background */}
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-green-500 to-purple-500 opacity-5"></div>
              
              {spectralLines.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[9px] text-white/10 uppercase font-bold">No Data Recorded</span>
                </div>
              )}
              
              {spectralLines.map((color, i) => (
                <div 
                  key={i} 
                  className="flex-1 h-full rounded-full animate-in fade-in slide-in-from-bottom-2"
                  style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}` }}
                ></div>
              ))}
            </div>
            <p className="text-[9px] text-white/30 mt-4 leading-relaxed italic">
              Every element has a unique "Spectral Fingerprint" based on its electronic transitions. Scientists use this to identify elements in stars.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuantumTransitionLab;
