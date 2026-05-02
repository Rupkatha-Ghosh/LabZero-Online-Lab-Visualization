import React from 'react';
import { SimulationProps } from '../../types/types';
import MechanicsVisualizer from '../../components/labs/physics/MechanicsVisualizer';
import SimulationLayout from '../SimulationLayout';

const MechanicsSim: React.FC<SimulationProps> = () => (
  <SimulationLayout>
    <MechanicsVisualizer />
  </SimulationLayout>
);

export default MechanicsSim;
