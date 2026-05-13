import React from 'react';
import { SimulationProps } from '../../types/types';
import ProbabilityLab from '../../components/labs/math/ProbabilityLab';
import SimulationLayout from '../SimulationLayout';

const ProbabilitySim: React.FC<SimulationProps> = () => (
  <SimulationLayout className="overflow-hidden">
    <ProbabilityLab />
  </SimulationLayout>
);

export default ProbabilitySim;
