
export interface ElementData {
  number: number;
  symbol: string;
  name: string;
  mass: number;
  category: string;
  electrons: number[];
  summary: string;
  discovery: string;
  color: string;
  config?: string;
  radius: number;
  ionization: number;
  electronegativity: number;
  period: number;
  group: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export enum SubjectId {
  CHEMISTRY = 'chemistry',
  PHYSICS = 'physics',
  MATH = 'math',
  BIOLOGY = 'biology',
}

export enum TopicId {
  ATOMIC_STRUCTURE = 'atomic_structure',
  MOLECULAR_STRUCTURE = 'molecular_structure',
  QUANTUM_NUMBERS = 'quantum_numbers',
  PERIODIC_TRENDS = 'periodic_trends',
  HISTORICAL_MODELS = 'historical_models',
  QUANTUM_CONFIG = 'quantum_config',
  // Placeholders for other subjects
  MECHANICS = 'mechanics',
  ELECTROMAGNETISM='Electromagnetism',
  
  VECTOR_CALCULUS="VECTOR_CALCULUS",
  PI_APPROXIMATION="PI_APPROXIMATION",
  COMPLEX_NUMBERS="COMPLEX_NUMBERS",
  PYTHAGORAS_THEOREM="PYTHAGORAS_THEOREM",

  MICROBIOLOGY="MICROBIOLOGY",
  CELL_BIOLOGY="CELL_BIOLOGY",
  REAL_EXPERIMENT="REAL_EXPERIMENT",
  
  // New Chapters
  WAVE_OPTICS = "WAVE_OPTICS",
  THERMODYNAMICS = "THERMODYNAMICS",
  KINETIC_THEORY = "KINETIC_THEORY",
  NUCLEAR_PHYSICS = "NUCLEAR_PHYSICS",
  REFRACTION = "REFRACTION",
  
  CALCULUS = "CALCULUS",
  PROBABILITY = "PROBABILITY",
  TRIGONOMETRY = "TRIGONOMETRY",
  LINEAR_ALGEBRA = "LINEAR_ALGEBRA",
  
  GENETICS = "GENETICS",
  EVOLUTION = "EVOLUTION",
  PLANT_PHYSIOLOGY = "PLANT_PHYSIOLOGY",
  HUMAN_REPRODUCTION = "HUMAN_REPRODUCTION",
}

export interface Topic {
  id: TopicId;
  slug: string;
  name: string;
  description: string;
  theory: string;
  simulation_id?: string;
  targetClass?: string[];
  subject?: number;
  order?: number;
}

export interface Subject {
  id: SubjectId;
  slug: string;
  name: string;
  description?: string;
  image_url?: string;
  icon: string;
  color: string;
  theme?: string;
  iconColor?: string;
  topics: Topic[];
  targetClass?: string[];
  order?: number;
  model_url?: string;
}

export enum ViewState {
  LANDING = 'landing',
  CLASS_SUBJECTS = 'CLASS_SUBJECTS', 
  SUBJECT = 'subject',
  TOPIC = 'topic',
  MEETING = 'meeting',
  DASHBOARD = 'dashboard',
  ADMIN = 'admin',
}

export enum TopicView {
  THEORY = 'theory',
  VISUALIZATION = 'visualization',
  CLASSROOM = 'classroom',
}

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface Molecule {
  formula: string;
  name: string;
  centralAtom: string;
  central_atom?: string;
  atoms: { symbol: string; pos: Vector3 }[];
  lonePairs: Vector3[];
  lone_pairs?: any[];
  realAngle: string;
  modelAngle: string;
  real_angle?: string;
  model_angle?: string;
}

export interface Resource {
  id: string;
  topicId: string;
  name: string;
  type: string;
  content: string; // base64 or text
  timestamp: number;
}

export interface DiscussionPost {
  id: string;
  topicId: string;
  author: string;
  content: string;
  timestamp: number;
  type: 'announcement' | 'problem';
}

export interface DiscussionComment {
  id: string;
  postId: string;
  author: string;
  content: string;
  timestamp: number;
}

export type UserRole = 'student' | 'teacher' | 'institute';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  is_staff?: boolean;
  is_superuser?: boolean;
}

export interface GlossaryTerm {
  id: string;
  term: string;
  definition: string;
  subject: SubjectId;
}

// --- SIMULATION ENGINE TYPES ---
export interface SimulationProps {
  elements: ElementData[];
  molecules: Molecule[];
  selectedElement?: ElementData;
  onSelectElement?: (element: ElementData) => void;
  theme: 'dark' | 'light';
  controls: {
    rotation: { dx: number, dy: number };
    zoom: number;
  };
  language: string;
}

// --- REFRACTION SIMULATION TYPES ---
export interface RefractionPreset {
  name: string;
  n1: number;
  n2: number;
  angle: number;
}

export interface RefractionProps extends Partial<SimulationProps> {
  initialN1?: number;
  initialN2?: number;
  initialAngle?: number;
}
