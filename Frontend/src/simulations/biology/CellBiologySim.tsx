import React from 'react';
import { SimulationProps } from '../../types/types';
import CellVisualizer from '../../components/labs/biology/CellBiologyLab';
import SimulationLayout from '../SimulationLayout';

const CellBiologySim: React.FC<SimulationProps> = () => (
  <SimulationLayout>
    <CellVisualizer />
  </SimulationLayout>
);

export default CellBiologySim;
