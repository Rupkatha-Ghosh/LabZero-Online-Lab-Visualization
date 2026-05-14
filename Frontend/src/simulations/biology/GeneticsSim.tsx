import React from 'react';
import { SimulationProps } from '../../types/types';
import GeneticsVisualizer from '../../components/labs/biology/GeneticsLab';
import SimulationLayout from '../SimulationLayout';

const GeneticsSim: React.FC<SimulationProps> = ({ theme, language }) => (
  <SimulationLayout>
    <GeneticsVisualizer theme={theme} language={language} />
  </SimulationLayout>
);

export default GeneticsSim;
