import React from 'react';
import { SimulationProps } from '../../types/types';
import PlantVisualizer from '../../components/labs/biology/PlantLab';
import SimulationLayout from '../SimulationLayout';

const PlantSim: React.FC<SimulationProps> = ({ theme, language }) => (
  <SimulationLayout>
    <PlantVisualizer theme={theme} language={language} />
  </SimulationLayout>
);

export default PlantSim;
