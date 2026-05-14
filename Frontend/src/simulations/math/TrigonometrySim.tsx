import React from 'react';
import { SimulationProps } from '../../types/types';
import TrigonometryLab from '../../components/labs/math/TrigonometryLab';
import SimulationLayout from '../SimulationLayout';

const TrigonometrySim: React.FC<SimulationProps> = ({ theme, language }) => (
  <SimulationLayout className="overflow-hidden">
    <TrigonometryLab theme={theme} language={language} />
  </SimulationLayout>
);

export default TrigonometrySim;
