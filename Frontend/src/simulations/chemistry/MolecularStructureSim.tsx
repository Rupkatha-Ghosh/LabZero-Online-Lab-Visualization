import React from 'react';
import { SimulationProps } from '../../types/types';
import BondingLab from '../../components/labs/chemistry/BondingLab';
import GeometryLab from '../../components/labs/chemistry/GeometryLab';
import SimulationLayout from '../SimulationLayout';

const MolecularStructureSim: React.FC<SimulationProps> = ({
  elements,
  molecules,
  controls
}) => {
  return (
    <SimulationLayout>
      <BondingLab elements={elements} />
      <GeometryLab
        rotation={controls.rotation}
        zoom={controls.zoom}
        molecules={molecules}
      />
    </SimulationLayout>
  );
};

export default MolecularStructureSim;
