import React from 'react';
import { SimulationProps } from '../../types/types';
import CalculusLab from '../../components/labs/math/CalculusLab';
import SimulationLayout from '../SimulationLayout';

const CalculusSim: React.FC<SimulationProps> = ({ theme, language }) => (
  <SimulationLayout className="overflow-hidden">
    <CalculusLab theme={theme} language={language} />
  </SimulationLayout>
);

export default CalculusSim;
