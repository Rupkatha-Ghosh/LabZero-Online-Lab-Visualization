import React from 'react';
import { SimulationProps } from '../../types/types';
import ComplexNumbersLab from '../../components/labs/math/ComplexNumbersLab';
import SimulationLayout from '../SimulationLayout';

const ComplexNumbersSim: React.FC<SimulationProps> = () => (
  <SimulationLayout className="overflow-hidden">
    <ComplexNumbersLab />
  </SimulationLayout>
);

export default ComplexNumbersSim;
