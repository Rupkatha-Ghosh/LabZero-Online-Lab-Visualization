import React from 'react';
import { SimulationProps } from '../../types/types';
import RealExperimentLab from '../../components/labs/chemistry/RealExperimentLab';
import SimulationLayout from '../SimulationLayout';

const AdvancedLabSim: React.FC<SimulationProps> = () => (
  <SimulationLayout>
    <RealExperimentLab />
  </SimulationLayout>
);

export default AdvancedLabSim;
