import React from 'react';
import { SimulationProps } from '../../types/types';
import PiApproximation from '../../components/labs/math/PiVisualizationLab';
import SimulationLayout from '../SimulationLayout';

const PiApproximationSim: React.FC<SimulationProps> = () => (
  <SimulationLayout>
    <PiApproximation />
  </SimulationLayout>
);

export default PiApproximationSim;
