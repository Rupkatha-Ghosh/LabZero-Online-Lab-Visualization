import React, { useState, useEffect } from 'react';
import { ElementData } from '../../../types/types';

interface ElementComparisonProps {
  elements: ElementData[];
}

const ElementComparison: React.FC<ElementComparisonProps> = ({ elements }) => {
  const [el1, setEl1] = useState<ElementData>(elements[0]);
  const [el2, setEl2] = useState<ElementData>(elements[2] || elements[0]);

  useEffect(() => {
    if (elements.length > 0) {
      setEl1(prev => elements.find(e => e.number === prev?.number) || elements[0]);
      setEl2(prev => elements.find(e => e.number === prev?.number) || elements[2] || elements[0]);
    }
  }, [elements]);

  const properties = [
    { key: 'radius', label: 'Atomic Radius', unit: 'pm', color: 'bg-blue-500' },
    { key: 'ionization', label: 'Ionization Energy', unit: 'kJ/mol', color: 'bg-red-500' },
    { key: 'electronegativity', label: 'Electronegativity', unit: 'χ', color: 'bg-emerald-500' },
    { key: 'mass', label: 'Atomic Mass', unit: 'u', color: 'bg-indigo-500' },
  ];

  const renderBar = (val1: number, val2: number, propKey: string, color: string) => {
    const maxVal = Math.max(val1, val2, 1);
    const p1 = (val1 / maxVal) * 100;
    const p2 = (val2 / maxVal) * 100;

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden">
            <div className={`h-full ${color} transition-all duration-700`} style={{ width: `${p1}%` }} />
          </div>
          <div className="w-24 text-right text-xs font-bold">{val1}</div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden">
            <div className={`h-full ${color} opacity-60 transition-all duration-700`} style={{ width: `${p2}%` }} />
          </div>
          <div className="w-24 text-right text-xs font-bold">{val2}</div>
        </div>
      </div>
    );
  };

  if (!elements || elements.length === 0) return null;

  return (
    <div className="glass-card p-8 rounded-[40px] border border-white/10">
      <h3 className="text-xs font-black text-white/20 uppercase tracking-[0.2em] mb-8">Element Comparison Lab</h3>
      
      <div className="grid grid-cols-2 gap-12 mb-12">
        <div className="space-y-4">
          <label className="text-[10px] font-bold text-white/40 uppercase">Element Alpha</label>
          <select 
            value={el1?.number} 
            onChange={(e) => setEl1(elements.find(el => el.number === Number(e.target.value))!)}
            className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 text-xl font-black focus:outline-none focus:border-indigo-500"
          >
            {elements.map(e => <option key={e.number} value={e.number}>{e.name} ({e.symbol})</option>)}
          </select>
        </div>
        <div className="space-y-4">
          <label className="text-[10px] font-bold text-white/40 uppercase">Element Beta</label>
          <select 
            value={el2?.number} 
            onChange={(e) => setEl2(elements.find(el => el.number === Number(e.target.value))!)}
            className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 text-xl font-black focus:outline-none focus:border-indigo-500"
          >
            {elements.map(e => <option key={e.number} value={e.number}>{e.name} ({e.symbol})</option>)}
          </select>
        </div>
      </div>

      {el1 && el2 && (
        <>
          <div className="space-y-10">
            {properties.map(prop => (
              <div key={prop.key} className="p-6 bg-white/5 rounded-3xl border border-white/5">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="font-black text-sm uppercase tracking-wider">{prop.label}</h4>
                  <span className="text-[10px] font-bold text-white/40">{prop.unit}</span>
                </div>
                {renderBar((el1 as any)[prop.key] || 0, (el2 as any)[prop.key] || 0, prop.key, prop.color)}
              </div>
            ))}
          </div>

          {/* Visual Radius Comparison */}
          <div className="mt-12 p-8 border-t border-white/5 flex items-center justify-around">
            <div className="flex flex-col items-center gap-4">
              <div 
                className="rounded-full bg-indigo-500/20 border-2 border-indigo-500/50 flex items-center justify-center transition-all duration-500"
                style={{ width: (el1.radius || 0) * 0.8, height: (el1.radius || 0) * 0.8 }}
              >
                <span className="font-black text-xs">{el1.symbol}</span>
              </div>
              <span className="text-[10px] font-bold text-white/40 uppercase">Alpha Size</span>
            </div>
            <div className="flex flex-col items-center gap-4">
              <div 
                className="rounded-full bg-purple-500/20 border-2 border-purple-500/50 flex items-center justify-center transition-all duration-500"
                style={{ width: (el2.radius || 0) * 0.8, height: (el2.radius || 0) * 0.8 }}
              >
                <span className="font-black text-xs">{el2.symbol}</span>
              </div>
              <span className="text-[10px] font-bold text-white/40 uppercase">Beta Size</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ElementComparison;
