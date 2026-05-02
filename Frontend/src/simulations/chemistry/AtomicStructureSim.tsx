import React from 'react';
import { SimulationProps } from '../../types/types';
import AtomVisualizer from '../../components/labs/chemistry/AtomicVisualizer';
import PeriodicTable from '../../components/labs/chemistry/PeriodicTable';
import SimulationLayout from '../SimulationLayout';

const AtomicStructureSim: React.FC<SimulationProps> = ({ 
  elements, 
  selectedElement, 
  onSelectElement,
  controls
}) => {
  if (!selectedElement) return <div className="p-10 text-center text-white font-mono animate-pulse uppercase tracking-widest">Initialising Atomic Core...</div>;

  return (
    <SimulationLayout isDashboard className="flex flex-col">
      <div className="flex-[3] relative min-h-[300px]">
        <AtomVisualizer
          element={selectedElement}
          rotation={controls.rotation}
          zoom={controls.zoom}
        />
      </div>
      <div className="flex-[2] border-t border-white/5 overflow-y-auto bg-black/40">
        <PeriodicTable
          elements={elements}
          onSelect={onSelectElement || (() => {})}
          selectedSymbol={selectedElement.symbol}
        />
      </div>
    </SimulationLayout>
  );
};

export default AtomicStructureSim;
