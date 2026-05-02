import React from 'react';
import { SimulationProps } from '../../types/types';
import QuantumNumbersLab from '../../components/labs/chemistry/QuantumNumbersLab';
import SimulationLayout from '../SimulationLayout';

const QuantumNumbersSim: React.FC<SimulationProps> = () => (
  <SimulationLayout>
    <QuantumNumbersLab />
  </SimulationLayout>
);

export default QuantumNumbersSim;
