import React from 'react';
import { SimulationProps } from '../../types/types';
import TrigonometryLab from '../../components/labs/math/TrigonometryLab';
import SimulationLayout from '../SimulationLayout';

const TrigonometrySim: React.FC<SimulationProps> = () => (
  <SimulationLayout className="overflow-hidden">
    <TrigonometryLab />
  </SimulationLayout>
);

export default TrigonometrySim;
