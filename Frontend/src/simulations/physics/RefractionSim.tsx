import React from 'react';
import { SimulationProps } from '../../types/types';
import RefractionVisualizer from '../../components/labs/physics/RefractionVisualizer';
import SimulationLayout from '../SimulationLayout';

const RefractionSim: React.FC<SimulationProps> = () => (
  <SimulationLayout>
    <RefractionVisualizer />
  </SimulationLayout>
);

export default RefractionSim;
