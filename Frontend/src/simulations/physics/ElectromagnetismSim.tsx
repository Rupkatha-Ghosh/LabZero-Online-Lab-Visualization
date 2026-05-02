import React from 'react';
import { SimulationProps } from '../../types/types';
import ElectromagnetismVisualizer from '../../components/labs/physics/ElectromagnetismVisualizer';
import SimulationLayout from '../SimulationLayout';

const ElectromagnetismSim: React.FC<SimulationProps> = () => (
  <SimulationLayout>
    <ElectromagnetismVisualizer />
  </SimulationLayout>
);

export default ElectromagnetismSim;
