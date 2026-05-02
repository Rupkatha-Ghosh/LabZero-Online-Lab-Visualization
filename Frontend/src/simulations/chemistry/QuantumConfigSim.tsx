import React from 'react';
import { SimulationProps } from '../../types/types';
import PeriodicTable from '../../components/labs/chemistry/PeriodicTable';
import QuantumConfigLab from '../../components/labs/chemistry/QuantumConfigLab';
import AufbauChart from '../../components/labs/chemistry/AufbauChart';
import SimulationLayout from '../SimulationLayout';

const QuantumConfigSim: React.FC<SimulationProps> = ({ 
  elements, 
  selectedElement, 
  onSelectElement 
}) => {
  if (!selectedElement) return <div className="p-10 text-center text-white">Initialising Quantum Data...</div>;

  return (
    <SimulationLayout isDashboard className="flex flex-col">
      <div className="flex-1 overflow-y-auto bg-black/40 border-b border-white/5">
        <PeriodicTable
          elements={elements}
          onSelect={onSelectElement || (() => {})}
          selectedSymbol={selectedElement.symbol}
        />
      </div>

      <div className="flex-[2] p-8 grid xl:grid-cols-4 gap-8 min-h-0 overflow-y-auto">
        <div className="xl:col-span-3">
          <QuantumConfigLab element={selectedElement} />
        </div>
        <div className="h-full min-h-[400px]">
          <AufbauChart atomicNumber={selectedElement.number} />
        </div>
      </div>
    </SimulationLayout>
  );
};

export default QuantumConfigSim;
