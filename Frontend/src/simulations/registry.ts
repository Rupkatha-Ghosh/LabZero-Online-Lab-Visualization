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
const RefractionSim = React.lazy(() => import('./physics/RefractionSim'));
// const RefractionSim=React.lazy(() => import('./physics'/RefractionSim) )

// Math
const PiApproximationSim = React.lazy(() => import('./math/PiApproximationSim'));
const VectorCalculusSim = React.lazy(() => import('./math/VectorCalculusSim'));
const ComplexNumbersSim = React.lazy(() => import('./math/ComplexNumbersSim'));
const PythagorasSim = React.lazy(() => import('./math/PythagorasSim'));
const TrigonometrySim = React.lazy(() => import('./math/TrigonometrySim'));
const CalculusSim = React.lazy(() => import('./math/CalculusSim'));
const LinearAlgebraSim = React.lazy(() => import('./math/LinearalgebraSim'));
const ProbabilitySim = React.lazy(() => import('./math/ProbabilitySim'));

// Biology
const PlantSim = React.lazy(() => import('./biology/PlantSim'));
const CellBiologySim = React.lazy(() => import('./biology/CellBiologySim'));
const MicrobiologySim = React.lazy(() => import('./biology/MicrobiologySim'));
const GeneticsSim = React.lazy(() => import('./biology/GeneticsSim'));

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
  "refraction": RefractionSim,
  "vector_calculus": VectorCalculusSim,
  "pi_approximation": PiApproximationSim,
  "pythagoras_theorem": PythagorasSim,
  "trigonometry": TrigonometrySim,
  "complex_numbers": ComplexNumbersSim,
  "linear_algebra": LinearAlgebraSim,
  "calculus": CalculusSim,
  "probability": ProbabilitySim,
  "microbiology": MicrobiologySim,
  "cell_biology": CellBiologySim,
  "plant_physiology": PlantSim,
  "genetics": GeneticsSim,
};
