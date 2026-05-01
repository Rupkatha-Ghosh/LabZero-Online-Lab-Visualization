
import React from 'react';
import { ElementData } from '../../../types/types';
import { motion } from 'motion/react';

interface PeriodicTableProps {
  elements: ElementData[];
  onSelect: (element: ElementData) => void;
  selectedSymbol: string;
}

const PeriodicTable: React.FC<PeriodicTableProps> = ({ elements, onSelect, selectedSymbol }) => {
  const sortedElements = [...elements].sort((a, b) => a.number - b.number);

  return (
    <div className="overflow-x-auto pb-8 scrollbar-hide">
      <div className="grid gap-2 min-w-[1200px] p-4" style={{ gridTemplateColumns: 'repeat(18, minmax(0, 1fr))' }}>
        {Array.from({ length: 7 }).map((_, periodIdx) => (
          Array.from({ length: 18 }).map((_, groupIdx) => {
            const period = periodIdx + 1;
            const group = groupIdx + 1;
            const el = sortedElements.find(e => e.period === period && e.group === group);

            if (!el) return <div key={`${period}-${group}`} className="w-full aspect-square"></div>;

            return (
              <motion.button
                key={el.symbol}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSelect(el)}
                className={`
                  flex flex-col items-center justify-center rounded-xl transition-all duration-500 relative
                  ${selectedSymbol === el.symbol 
                    ? 'bg-primary border-primary shadow-[0_0_25px_rgba(var(--color-primary-rgb),0.4)] z-50 ring-2 ring-primary/50' 
                    : 'bg-white/[0.02] hover:bg-white/[0.05] border-white/5 hover:border-white/10'
                  }
                  border w-full aspect-square group
                `}
              >
                <span className={`absolute top-1 left-1.5 text-[7px] font-mono transition-colors ${selectedSymbol === el.symbol ? 'text-white/60' : 'text-slate-600'}`}>{el.number}</span>
                <span className={`text-base font-display font-bold tracking-tight transition-colors ${selectedSymbol === el.symbol ? 'text-white' : 'text-slate-300'}`}>{el.symbol}</span>
                <span className={`text-[6px] font-mono uppercase truncate w-full px-1 text-center mt-0.5 transition-colors ${selectedSymbol === el.symbol ? 'text-white/60' : 'text-slate-600'}`}>{el.name}</span>
                
                {selectedSymbol === el.symbol && (
                  <motion.div 
                    layoutId="activeDot"
                    className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-400 rounded-full shadow-[0_0_8px_#818cf8]"
                  />
                )}
              </motion.button>
            );
          })
        ))}

        {/* Lanthanides & Actinides separate block */}
        <div className="col-span-full h-10 flex items-center">
          <div className="h-px flex-1 bg-white/5"></div>
          <span className="px-4 text-[9px] font-mono text-slate-700 uppercase tracking-[0.3em]">Extended Series</span>
          <div className="h-px flex-1 bg-white/5"></div>
        </div>
        
        <div className="col-span-2"></div>
        {sortedElements.filter(e => e.number >= 57 && e.number <= 71).map(el => (
           <ElementButton key={el.symbol} el={el} onSelect={onSelect} selectedSymbol={selectedSymbol} />
        ))}
        <div className="col-span-1"></div>

        <div className="col-span-2"></div>
        {sortedElements.filter(e => e.number >= 89 && e.number <= 103).map(el => (
           <ElementButton key={el.symbol} el={el} onSelect={onSelect} selectedSymbol={selectedSymbol} />
        ))}
      </div>
    </div>
  );
};

const ElementButton: React.FC<{ el: ElementData, onSelect: (el: ElementData) => void, selectedSymbol: string }> = ({ el, onSelect, selectedSymbol }) => (
  <motion.button
    whileHover={{ scale: 1.05, y: -2 }}
    whileTap={{ scale: 0.95 }}
    onClick={() => onSelect(el)}
    className={`
      flex flex-col items-center justify-center rounded-xl transition-all duration-500 relative
      ${selectedSymbol === el.symbol 
        ? 'bg-primary border-primary shadow-[0_0_25px_rgba(var(--color-primary-rgb),0.4)] z-50 ring-2 ring-primary/50' 
        : 'bg-white/[0.02] hover:bg-white/[0.05] border-white/5 hover:border-white/10'
      }
      border w-full aspect-square group
    `}
  >
    <span className={`absolute top-1 left-1.5 text-[7px] font-mono transition-colors ${selectedSymbol === el.symbol ? 'text-white/60' : 'text-slate-600'}`}>{el.number}</span>
    <span className={`text-base font-display font-bold tracking-tight transition-colors ${selectedSymbol === el.symbol ? 'text-white' : 'text-slate-300'}`}>{el.symbol}</span>
  </motion.button>
);

export default PeriodicTable;
