import React from 'react';
import { SimulationProps } from '../../types/types';
import VectorCalculusLab from '../../components/labs/math/VectorCalculusLab';
import SimulationLayout from '../SimulationLayout';

const VectorCalculusSim: React.FC<SimulationProps> = () => (
  <SimulationLayout>
    <VectorCalculusLab />
  </SimulationLayout>
);

export default VectorCalculusSim;
