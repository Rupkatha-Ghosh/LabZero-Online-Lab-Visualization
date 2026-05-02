import React from 'react';
import { SimulationProps } from '../../types/types';
import HistoricalModels from '../../components/labs/chemistry/HistoricalModels';
import SimulationLayout from '../SimulationLayout';

const HistoricalModelsSim: React.FC<SimulationProps> = () => (
  <SimulationLayout>
    <HistoricalModels />
  </SimulationLayout>
);

export default HistoricalModelsSim;
