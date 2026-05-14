import React from 'react';
import { SimulationProps } from '../../types/types';
import ProbabilityLab from '../../components/labs/math/ProbabilityLab';
import SimulationLayout from '../SimulationLayout';

const ProbabilitySim: React.FC<SimulationProps> = ({ theme, language }) => (
  <SimulationLayout className="overflow-hidden">
    <ProbabilityLab theme={theme} language={language} />
  </SimulationLayout>
);

export default ProbabilitySim;
