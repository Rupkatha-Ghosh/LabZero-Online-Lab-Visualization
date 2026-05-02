import React from 'react';
import { SimulationProps } from '../../types/types';
import TrendsVisualizer from '../../components/labs/chemistry/TrendsVisualizer';
import ElementComparison from '../../components/labs/chemistry/ElementComparison';
import SimulationLayout from '../SimulationLayout';

const PeriodicTrendsSim: React.FC<SimulationProps> = ({ elements }) => (
  <SimulationLayout>
    <TrendsVisualizer elements={elements} />
    <ElementComparison elements={elements} />
  </SimulationLayout>
);

export default PeriodicTrendsSim;
