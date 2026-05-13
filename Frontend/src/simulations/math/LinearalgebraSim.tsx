import React from 'react';
import { SimulationProps } from '../../types/types';
import LinearAlgebraLab from '../../components/labs/math/LinearAlgebraLab';
import SimulationLayout from '../SimulationLayout';

const LinearAlgebraSim: React.FC<SimulationProps> = () => (
  <SimulationLayout className="overflow-hidden">
    <LinearAlgebraLab />
  </SimulationLayout>
);

export default LinearAlgebraSim;
