import React from 'react';
import { SimulationProps } from '../../types/types';
import LinearAlgebraLab from '../../components/labs/math/LinearAlgebraLab';
import SimulationLayout from '../SimulationLayout';

const LinearAlgebraSim: React.FC<SimulationProps> = ({ theme, language }) => (
  <SimulationLayout className="overflow-hidden">
    <LinearAlgebraLab theme={theme} language={language} />
  </SimulationLayout>
);

export default LinearAlgebraSim;
