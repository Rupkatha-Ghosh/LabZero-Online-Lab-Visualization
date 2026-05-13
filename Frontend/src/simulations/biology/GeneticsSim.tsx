import React from 'react';
import { SimulationProps } from '../../types/types';
import GeneticsVisualizer from '../../components/labs/biology/GeneticsLab';
import SimulationLayout from '../SimulationLayout';

const GeneticsSim: React.FC<SimulationProps> = () => (
  <SimulationLayout>
    <GeneticsVisualizer />
  </SimulationLayout>
);

export default GeneticsSim;
