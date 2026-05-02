import React from 'react';
import { SimulationProps } from '../../types/types';
import PythagorasLab from '../../components/labs/math/PythagorasLab';
import SimulationLayout from '../SimulationLayout';

const PythagorasSim: React.FC<SimulationProps> = () => (
  <SimulationLayout className="overflow-hidden">
    <PythagorasLab />
  </SimulationLayout>
);

export default PythagorasSim;
