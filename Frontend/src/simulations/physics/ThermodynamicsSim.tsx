import React from 'react';
import { SimulationProps } from '../../types/types';
import ThermodynamicsVisualizer from '../../components/labs/physics/ThermodynamicsVisualizer';
import SimulationLayout from '../SimulationLayout';

const ThermodynamicsSim: React.FC<SimulationProps> = () => (
  <SimulationLayout>
    <ThermodynamicsVisualizer />
  </SimulationLayout>
);

export default ThermodynamicsSim;
