import React from 'react';
import { SimulationProps } from '../../types/types';
import PlantVisualizer from '../../components/labs/biology/PlantLab';
import SimulationLayout from '../SimulationLayout';

const PlantSim: React.FC<SimulationProps> = () => (
  <SimulationLayout>
    <PlantVisualizer />
  </SimulationLayout>
);

export default PlantSim;
