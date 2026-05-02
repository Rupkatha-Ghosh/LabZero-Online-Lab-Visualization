import React from 'react';
import { SimulationProps } from '../../types/types';
import WaveOpticsVisualizer from '../../components/labs/physics/WaveOpticsVisualizer';
import SimulationLayout from '../SimulationLayout';

const WaveOpticsSim: React.FC<SimulationProps> = () => (
  <SimulationLayout>
    <WaveOpticsVisualizer />
  </SimulationLayout>
);

export default WaveOpticsSim;
