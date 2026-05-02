import React from 'react';
import { SimulationProps } from '../types/types';

// Lazy load the simulations to keep the initial project size small
const MolecularStructureSim = React.lazy(() => import('./chemistry/MolecularStructureSim'));
const PeriodicTrendsSim = React.lazy(() => import('./chemistry/PeriodicTrendsSim'));
const QuantumNumbersSim = React.lazy(() => import('./chemistry/QuantumNumbersSim'));
const AtomicStructureSim = React.lazy(() => import('./chemistry/AtomicStructureSim'));
const QuantumConfigSim = React.lazy(() => import('./chemistry/QuantumConfigSim'));
const HistoricalModelsSim = React.lazy(() => import('./chemistry/HistoricalModelsSim'));
const AdvancedLabSim = React.lazy(() => import('./chemistry/AdvancedLabSim'));

// Physics
const MechanicsSim = React.lazy(() => import('./physics/MechanicsSim'));
const ElectromagnetismSim = React.lazy(() => import('./physics/ElectromagnetismSim'));
const WaveOpticsSim = React.lazy(() => import('./physics/WaveOpticsSim'));
const ThermodynamicsSim = React.lazy(() => import('./physics/ThermodynamicsSim'));

// Math
const PiApproximationSim = React.lazy(() => import('./math/PiApproximationSim'));
const VectorCalculusSim = React.lazy(() => import('./math/VectorCalculusSim'));
const ComplexNumbersSim = React.lazy(() => import('./math/ComplexNumbersSim'));
const PythagorasSim = React.lazy(() => import('./math/PythagorasSim'));

// Biology
const CellBiologySim = React.lazy(() => import('./biology/CellBiologySim'));
const MicrobiologySim = React.lazy(() => import('./biology/MicrobiologySim'));

export const SIMULATION_REGISTRY: Record<string, React.LazyExoticComponent<React.FC<SimulationProps>>> = {
  "atomic_structure": AtomicStructureSim,
  "molecular_structure": MolecularStructureSim,
  "periodic_trends": PeriodicTrendsSim,
  "quantum_config": QuantumConfigSim,
  "quantum_numbers": QuantumNumbersSim,
  "historical_models": HistoricalModelsSim,
  "advanced_lab": AdvancedLabSim,
  "mechanics": MechanicsSim,
  "electromagnetism": ElectromagnetismSim,
  "wave_optics": WaveOpticsSim,
  "thermodynamics": ThermodynamicsSim,
  "vector_calculus": VectorCalculusSim,
  "pi_approximation": PiApproximationSim,
  "pythagoras_theorem": PythagorasSim,
  "complex_numbers": ComplexNumbersSim,
  "microbiology": MicrobiologySim,
  "cell_biology": CellBiologySim,
};
