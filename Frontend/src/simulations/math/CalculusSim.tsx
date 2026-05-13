import React from 'react';
import { SimulationProps } from '../../types/types';
import CalculusLab from '../../components/labs/math/CalculusLab';
import SimulationLayout from '../SimulationLayout';

const CalculusSim: React.FC<SimulationProps> = () => (
  <SimulationLayout className="overflow-hidden">
    <CalculusLab />
  </SimulationLayout>
);

export default CalculusSim;
