import React from 'react';
import { SimulationProps } from '../../types/types';
import MicrobiologyLab from '../../components/labs/biology/MicrobiologyLab';
import SimulationLayout from '../SimulationLayout';

const MicrobiologySim: React.FC<SimulationProps> = () => (
  <SimulationLayout>
    <MicrobiologyLab />
  </SimulationLayout>
);

export default MicrobiologySim;
