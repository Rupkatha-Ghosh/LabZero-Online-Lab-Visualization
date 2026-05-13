import { SubjectId } from '../types/types';

export type ChallengeDifficulty = 'warmup' | 'core' | 'stretch';

export interface DailyChallenge {
  id: string;
  subjectId: SubjectId;
  subjectName: string;
  topic: string;
  skill: string;
  difficulty: ChallengeDifficulty;
  prompt: string;
  options: string[];
  answer: string;
  explanation: string;
  estimatedMinutes: number;
}

interface ChallengeSeed {
  topic: string;
  skill: string;
  difficulty: ChallengeDifficulty;
  fact: string;
  answer: string;
  distractors: string[];
  explanation: string;
}

const subjectNames: Record<SubjectId, string> = {
  [SubjectId.PHYSICS]: 'Physics',
  [SubjectId.CHEMISTRY]: 'Chemistry',
  [SubjectId.MATH]: 'Mathematics',
  [SubjectId.BIOLOGY]: 'Biology',
};

const challengePrompts = [
  'Identify the correct concept: {fact}',
  'Choose the best answer for this lab checkpoint: {fact}',
  'A quick diagnostic asks: {fact}',
  'Select the option that completes the idea: {fact}',
];

const physicsSeeds: ChallengeSeed[] = [
  { topic: 'Classical Mechanics', skill: 'Newtonian force', difficulty: 'warmup', fact: 'The SI unit of force is', answer: 'Newton', distractors: ['Joule', 'Watt', 'Pascal'], explanation: 'Force is measured in newtons, equivalent to kg m/s².' },
  { topic: 'Classical Mechanics', skill: 'Dynamics', difficulty: 'warmup', fact: 'Newton\'s second law is represented by', answer: 'F = ma', distractors: ['P = VI', 'V = IR', 'Q = mcΔT'], explanation: 'Net force equals mass multiplied by acceleration.' },
  { topic: 'Classical Mechanics', skill: 'Energy', difficulty: 'core', fact: 'Kinetic energy of a moving object equals', answer: '1/2 mv²', distractors: ['mgh', 'Fd cos theta', 'mv'], explanation: 'Kinetic energy depends on mass and the square of speed.' },
  { topic: 'Classical Mechanics', skill: 'Momentum', difficulty: 'core', fact: 'Linear momentum is calculated as', answer: 'mv', distractors: ['ma', 'm/v', 'F/t'], explanation: 'Momentum is the product of mass and velocity.' },
  { topic: 'Work and Energy', skill: 'Work', difficulty: 'core', fact: 'Work done by a constant force at angle theta is', answer: 'Fd cos theta', distractors: ['Fd sin theta', 'F/d', 'mgh'], explanation: 'Only the force component along displacement contributes to work.' },
  { topic: 'Gravitation', skill: 'Inverse square law', difficulty: 'core', fact: 'Newtonian gravitational force varies with distance as', answer: '1/r²', distractors: ['r²', 'r', '1/r'], explanation: 'Gravity follows an inverse-square dependence on separation.' },
  { topic: 'Electromagnetism', skill: 'Ohm law', difficulty: 'warmup', fact: 'Ohm\'s law is', answer: 'V = IR', distractors: ['F = ma', 'E = mc²', 'P = Fv'], explanation: 'Voltage equals current multiplied by resistance.' },
  { topic: 'Electromagnetism', skill: 'Electric current', difficulty: 'warmup', fact: 'The SI unit of electric current is', answer: 'Ampere', distractors: ['Volt', 'Ohm', 'Coulomb'], explanation: 'Current measures charge flow per second and is measured in amperes.' },
  { topic: 'Electromagnetism', skill: 'Capacitance', difficulty: 'core', fact: 'Capacitance is measured in', answer: 'Farad', distractors: ['Tesla', 'Henry', 'Weber'], explanation: 'A capacitor storing one coulomb per volt has one farad.' },
  { topic: 'Electromagnetism', skill: 'Magnetic field', difficulty: 'stretch', fact: 'The SI unit of magnetic flux density is', answer: 'Tesla', distractors: ['Weber', 'Coulomb', 'Volt'], explanation: 'Magnetic flux density B is measured in tesla.' },
  { topic: 'Wave Optics', skill: 'Wave speed', difficulty: 'core', fact: 'Wave speed is related to frequency and wavelength by', answer: 'v = f lambda', distractors: ['v = f/lambda', 'v = lambda/f', 'v = f + lambda'], explanation: 'A wave travels one wavelength per cycle, so speed is frequency times wavelength.' },
  { topic: 'Wave Optics', skill: 'Interference', difficulty: 'stretch', fact: 'Constructive interference occurs when path difference is', answer: 'n lambda', distractors: ['(n + 1/2) lambda', 'lambda/4', '2n + lambda'], explanation: 'Integral multiples of wavelength make waves arrive in phase.' },
  { topic: 'Wave Optics', skill: 'Polarization', difficulty: 'stretch', fact: 'Polarization proves light waves are', answer: 'Transverse', distractors: ['Longitudinal', 'Stationary', 'Mechanical only'], explanation: 'Only transverse waves can be polarized.' },
  { topic: 'Thermodynamics', skill: 'First law', difficulty: 'core', fact: 'The first law of thermodynamics expresses conservation of', answer: 'Energy', distractors: ['Charge', 'Momentum only', 'Mass only'], explanation: 'Heat and work change internal energy while total energy is conserved.' },
  { topic: 'Thermodynamics', skill: 'Temperature', difficulty: 'warmup', fact: 'Absolute temperature is measured in', answer: 'Kelvin', distractors: ['Celsius', 'Joule', 'Watt'], explanation: 'Kelvin is the SI base unit for thermodynamic temperature.' },
  { topic: 'Thermodynamics', skill: 'Entropy', difficulty: 'stretch', fact: 'For an isolated spontaneous process, entropy tends to', answer: 'Increase', distractors: ['Decrease always', 'Remain zero', 'Become negative always'], explanation: 'The second law states entropy of an isolated system does not decrease.' },
  { topic: 'Modern Physics', skill: 'Relativity', difficulty: 'core', fact: 'Mass-energy equivalence is written as', answer: 'E = mc²', distractors: ['F = ma', 'p = mv', 'V = IR'], explanation: 'Einstein related rest energy to mass through the speed of light squared.' },
  { topic: 'Modern Physics', skill: 'Photoelectric effect', difficulty: 'stretch', fact: 'Photoelectric emission depends primarily on light', answer: 'Frequency', distractors: ['Amplitude only', 'Speed in vacuum', 'Color name only'], explanation: 'Emission requires photons above the threshold frequency.' },
  { topic: 'Optics', skill: 'Reflection', difficulty: 'warmup', fact: 'The angle of reflection is equal to the angle of', answer: 'Incidence', distractors: ['Refraction', 'Diffraction', 'Dispersion'], explanation: 'The law of reflection pairs equal incident and reflected angles.' },
  { topic: 'Optics', skill: 'Refraction', difficulty: 'core', fact: 'Refraction at an interface follows', answer: 'Snell law', distractors: ['Hooke law', 'Ampere law', 'Kirchhoff law'], explanation: 'Snell law relates refractive indices and the sines of angles.' },
  { topic: 'Circuits', skill: 'Power', difficulty: 'core', fact: 'Electrical power in a resistor can be calculated by', answer: 'P = VI', distractors: ['P = V/I', 'P = I/R', 'P = qVt'], explanation: 'Power is the rate of electrical energy transfer, equal to voltage times current.' },
  { topic: 'Nuclear Physics', skill: 'Half life', difficulty: 'stretch', fact: 'Half-life is the time for radioactive nuclei to reduce to', answer: 'One half', distractors: ['Zero', 'One quarter always', 'Double'], explanation: 'After one half-life, half the original undecayed nuclei remain.' },
  { topic: 'Units', skill: 'Pressure', difficulty: 'warmup', fact: 'Pressure is measured in', answer: 'Pascal', distractors: ['Newton', 'Joule', 'Kelvin'], explanation: 'A pascal is one newton per square meter.' },
  { topic: 'Waves', skill: 'Frequency', difficulty: 'warmup', fact: 'Frequency is measured in', answer: 'Hertz', distractors: ['Meter', 'Second', 'Tesla'], explanation: 'Hertz means cycles per second.' },
  { topic: 'Heat Transfer', skill: 'Thermal processes', difficulty: 'core', fact: 'Heat transfer through direct molecular contact is', answer: 'Conduction', distractors: ['Convection', 'Radiation', 'Refraction'], explanation: 'Conduction transfers energy through collisions in matter.' },
];

const chemistrySeeds: ChallengeSeed[] = [
  { topic: 'Atomic Structure', skill: 'Atomic number', difficulty: 'warmup', fact: 'Atomic number is the number of', answer: 'Protons', distractors: ['Neutrons', 'Nucleons', 'Valence shells'], explanation: 'The proton count defines an element.' },
  { topic: 'Atomic Structure', skill: 'Isotopes', difficulty: 'core', fact: 'Isotopes of an element differ in number of', answer: 'Neutrons', distractors: ['Protons', 'Electron shells only', 'Atomic number'], explanation: 'Isotopes share proton count but have different neutron counts.' },
  { topic: 'Atomic Structure', skill: 'Electron discovery', difficulty: 'warmup', fact: 'The electron was discovered by', answer: 'J. J. Thomson', distractors: ['Niels Bohr', 'Ernest Rutherford', 'Dmitri Mendeleev'], explanation: 'Thomson identified electrons using cathode ray experiments.' },
  { topic: 'Atomic Structure', skill: 'Quantum model', difficulty: 'stretch', fact: 'An orbital describes a region of high electron', answer: 'Probability', distractors: ['Certainty', 'Nuclear charge', 'Mass density'], explanation: 'Orbitals are probability distributions, not fixed tracks.' },
  { topic: 'Quantum Numbers', skill: 'Principal quantum number', difficulty: 'core', fact: 'The principal quantum number mainly describes electron', answer: 'Energy level', distractors: ['Spin direction', 'Orbital orientation', 'Nuclear mass'], explanation: 'n identifies the shell and broadly the energy level.' },
  { topic: 'Quantum Numbers', skill: 'Spin', difficulty: 'core', fact: 'Electron spin quantum number can be', answer: '+1/2 or -1/2', distractors: ['0 only', '+1 or -1', 'Any integer'], explanation: 'Electrons have two allowed spin states.' },
  { topic: 'Periodic Trends', skill: 'Atomic radius', difficulty: 'core', fact: 'Atomic radius generally decreases across a period because', answer: 'Nuclear charge increases', distractors: ['New shells are added', 'Neutrons disappear', 'Mass becomes zero'], explanation: 'Increasing effective nuclear charge pulls electrons closer.' },
  { topic: 'Periodic Trends', skill: 'Ionization energy', difficulty: 'core', fact: 'Ionization energy generally increases across a period due to', answer: 'Stronger nuclear attraction', distractors: ['Lower proton count', 'More shielding only', 'Larger atomic radius'], explanation: 'Electrons are held more tightly across a period.' },
  { topic: 'Periodic Trends', skill: 'Electronegativity', difficulty: 'warmup', fact: 'Electronegativity means the tendency to attract', answer: 'Shared electrons', distractors: ['Neutrons', 'Nuclei', 'Alpha particles'], explanation: 'Electronegativity describes attraction for bonding electrons.' },
  { topic: 'Chemical Bonding', skill: 'Ionic bonds', difficulty: 'warmup', fact: 'An ionic bond forms mainly by electron', answer: 'Transfer', distractors: ['Sharing', 'Delocalization', 'Diffraction'], explanation: 'Ionic bonding forms oppositely charged ions by transfer.' },
  { topic: 'Chemical Bonding', skill: 'Covalent bonds', difficulty: 'warmup', fact: 'A covalent bond forms mainly by electron', answer: 'Sharing', distractors: ['Transfer', 'Loss only', 'Nuclear fusion'], explanation: 'Covalent bonds involve shared electron pairs.' },
  { topic: 'Molecular Structure', skill: 'VSEPR', difficulty: 'core', fact: 'Methane has approximately this bond angle', answer: '109.5 degrees', distractors: ['90 degrees', '120 degrees', '180 degrees'], explanation: 'CH4 is tetrahedral with bond angles near 109.5 degrees.' },
  { topic: 'Molecular Structure', skill: 'Hybridization', difficulty: 'core', fact: 'The hybridization of carbon in methane is', answer: 'sp3', distractors: ['sp', 'sp2', 'dsp2'], explanation: 'Four sigma bonds around carbon correspond to sp3 hybridization.' },
  { topic: 'Molecular Structure', skill: 'Geometry', difficulty: 'stretch', fact: 'Carbon dioxide has molecular geometry', answer: 'Linear', distractors: ['Bent', 'Tetrahedral', 'Trigonal pyramidal'], explanation: 'Two electron domains around carbon make CO2 linear.' },
  { topic: 'Acids and Bases', skill: 'pH', difficulty: 'warmup', fact: 'A neutral solution at 25 C has pH', answer: '7', distractors: ['0', '1', '14'], explanation: 'Neutral water has equal hydrogen and hydroxide ion concentrations.' },
  { topic: 'Acids and Bases', skill: 'Acidity', difficulty: 'warmup', fact: 'A solution with pH less than 7 is', answer: 'Acidic', distractors: ['Basic', 'Neutral', 'Inert'], explanation: 'Lower pH indicates higher hydrogen ion activity.' },
  { topic: 'Redox', skill: 'Oxidation', difficulty: 'core', fact: 'Oxidation is loss of', answer: 'Electrons', distractors: ['Protons', 'Neutrons', 'Nuclei'], explanation: 'OIL RIG: oxidation is loss, reduction is gain.' },
  { topic: 'Redox', skill: 'Reduction', difficulty: 'core', fact: 'Reduction is gain of', answer: 'Electrons', distractors: ['Protons', 'Neutrons', 'Mass number'], explanation: 'Reduction lowers oxidation state by gaining electrons.' },
  { topic: 'Mole Concept', skill: 'Avogadro constant', difficulty: 'warmup', fact: 'One mole contains approximately', answer: '6.022 x 10^23 particles', distractors: ['3.14 x 10^8 particles', '9.8 particles', '1.6 x 10^-19 particles'], explanation: 'Avogadro constant counts entities in one mole.' },
  { topic: 'Chemical Kinetics', skill: 'Catalysis', difficulty: 'core', fact: 'A catalyst increases reaction rate by lowering', answer: 'Activation energy', distractors: ['Atomic number', 'Product mass', 'Temperature to zero'], explanation: 'Catalysts provide an alternate pathway with lower activation energy.' },
  { topic: 'Thermochemistry', skill: 'Exothermic process', difficulty: 'core', fact: 'An exothermic reaction releases', answer: 'Heat', distractors: ['Neutrons only', 'Vacuum', 'pH'], explanation: 'Exothermic reactions transfer thermal energy to surroundings.' },
  { topic: 'Organic Chemistry', skill: 'Carbon chemistry', difficulty: 'warmup', fact: 'Organic chemistry primarily studies compounds of', answer: 'Carbon', distractors: ['Helium', 'Neon', 'Argon'], explanation: 'Most organic compounds are carbon based.' },
  { topic: 'Solutions', skill: 'Solute', difficulty: 'warmup', fact: 'The substance dissolved in a solution is the', answer: 'Solute', distractors: ['Solvent', 'Catalyst', 'Buffer only'], explanation: 'The solute dissolves in the solvent.' },
  { topic: 'Periodic Table', skill: 'Groups', difficulty: 'warmup', fact: 'Vertical columns in the periodic table are called', answer: 'Groups', distractors: ['Periods', 'Blocks only', 'Isotopes'], explanation: 'Groups collect elements with similar valence electron patterns.' },
  { topic: 'Periodic Table', skill: 'Periods', difficulty: 'warmup', fact: 'Horizontal rows in the periodic table are called', answer: 'Periods', distractors: ['Groups', 'Families only', 'Ions'], explanation: 'Periods indicate principal energy levels being filled.' },
];

const mathSeeds: ChallengeSeed[] = [
  { topic: 'Calculus', skill: 'Derivative', difficulty: 'warmup', fact: 'The derivative of x^2 is', answer: '2x', distractors: ['x', 'x^2', '1'], explanation: 'Power rule: d/dx x^n = nx^(n-1).' },
  { topic: 'Calculus', skill: 'Derivative', difficulty: 'core', fact: 'The derivative of sin x is', answer: 'cos x', distractors: ['-cos x', '-sin x', 'tan x'], explanation: 'The sine function differentiates to cosine.' },
  { topic: 'Calculus', skill: 'Derivative', difficulty: 'core', fact: 'The derivative of ln x is', answer: '1/x', distractors: ['x', 'ln x', 'e^x'], explanation: 'Natural log has derivative reciprocal x for x > 0.' },
  { topic: 'Calculus', skill: 'Integral', difficulty: 'warmup', fact: 'The integral of 1 dx is', answer: 'x + C', distractors: ['1 + C', '0', 'x^2 + C'], explanation: 'A constant antiderivative of 1 is x plus a constant.' },
  { topic: 'Calculus', skill: 'Integral', difficulty: 'core', fact: 'The integral of cos x dx is', answer: 'sin x + C', distractors: ['-sin x + C', 'cos x + C', '-cos x + C'], explanation: 'Since derivative of sin x is cos x.' },
  { topic: 'Calculus', skill: 'Limit', difficulty: 'stretch', fact: 'The limit of sin x / x as x approaches 0 is', answer: '1', distractors: ['0', 'Infinity', '-1'], explanation: 'This fundamental trigonometric limit equals 1.' },
  { topic: 'Trigonometry', skill: 'Identity', difficulty: 'warmup', fact: 'sin^2 theta + cos^2 theta equals', answer: '1', distractors: ['0', '2', 'theta'], explanation: 'This is the core Pythagorean identity.' },
  { topic: 'Trigonometry', skill: 'Angle value', difficulty: 'warmup', fact: 'tan 45 degrees equals', answer: '1', distractors: ['0', '-1', 'Undefined'], explanation: 'At 45 degrees, opposite and adjacent sides are equal.' },
  { topic: 'Trigonometry', skill: 'Double angle', difficulty: 'core', fact: 'cos^2 x - sin^2 x equals', answer: 'cos 2x', distractors: ['sin 2x', '1', 'tan 2x'], explanation: 'This is a standard double-angle identity.' },
  { topic: 'Linear Algebra', skill: 'Matrix determinant', difficulty: 'core', fact: 'The determinant of a 2x2 matrix [[a,b],[c,d]] is', answer: 'ad - bc', distractors: ['ab - cd', 'ac - bd', 'a + d'], explanation: 'For order two, determinant is product of main diagonal minus other diagonal.' },
  { topic: 'Linear Algebra', skill: 'Invertibility', difficulty: 'core', fact: 'A square matrix has an inverse when its determinant is', answer: 'Nonzero', distractors: ['Zero', 'Negative only', 'One only'], explanation: 'A zero determinant means the matrix is singular.' },
  { topic: 'Linear Algebra', skill: 'Eigenvalues', difficulty: 'stretch', fact: 'Eigenvalues of A are found by solving', answer: 'det(A - lambda I) = 0', distractors: ['A + I = 0', 'det(A) = 1 only', 'Ax = 1'], explanation: 'The characteristic equation gives eigenvalues.' },
  { topic: 'Vector Algebra', skill: 'Magnitude', difficulty: 'warmup', fact: 'The magnitude of vector (x, y) is', answer: 'sqrt(x^2 + y^2)', distractors: ['x + y', 'xy', 'x^2 - y^2'], explanation: 'Vector length follows the Pythagorean theorem.' },
  { topic: 'Vector Algebra', skill: 'Dot product', difficulty: 'core', fact: 'The dot product of perpendicular vectors is', answer: '0', distractors: ['1', '-1', 'Infinity'], explanation: 'A dot product includes cos 90 degrees, which is zero.' },
  { topic: 'Vector Algebra', skill: 'Cross product', difficulty: 'stretch', fact: 'A cross product vector is perpendicular to', answer: 'Both input vectors', distractors: ['Only the first vector', 'Only the second vector', 'Neither vector'], explanation: 'The cross product normal is orthogonal to the plane of both vectors.' },
  { topic: 'Probability', skill: 'Range', difficulty: 'warmup', fact: 'The maximum possible probability is', answer: '1', distractors: ['0', '2', 'Infinity'], explanation: 'Probabilities range from 0 to 1 inclusive.' },
  { topic: 'Probability', skill: 'Complement', difficulty: 'core', fact: 'P(not A) equals', answer: '1 - P(A)', distractors: ['P(A) - 1', 'P(A)/2', '2P(A)'], explanation: 'An event and its complement exhaust the sample space.' },
  { topic: 'Probability', skill: 'Independent events', difficulty: 'core', fact: 'For independent events, P(A and B) equals', answer: 'P(A)P(B)', distractors: ['P(A)+P(B)', 'P(A)-P(B)', 'P(A)/P(B)'], explanation: 'Independent event probabilities multiply.' },
  { topic: 'Algebra', skill: 'Quadratic formula', difficulty: 'core', fact: 'The roots of ax^2 + bx + c = 0 are', answer: '(-b +- sqrt(b^2 - 4ac)) / 2a', distractors: ['b/a', 'c/a', 'sqrt(b^2 + 4ac)'], explanation: 'The quadratic formula solves any quadratic with a not equal to zero.' },
  { topic: 'Algebra', skill: 'Logarithms', difficulty: 'core', fact: 'log(ab) equals', answer: 'log a + log b', distractors: ['log a - log b', 'ab', 'a + b'], explanation: 'Logs convert multiplication into addition.' },
  { topic: 'Functions', skill: 'Even functions', difficulty: 'warmup', fact: 'An example of an even function is', answer: 'x^2', distractors: ['x', 'sin x', 'tan x'], explanation: 'x^2 satisfies f(-x) = f(x).' },
  { topic: 'Functions', skill: 'Domain', difficulty: 'warmup', fact: 'The real domain of sqrt(x) is', answer: 'x >= 0', distractors: ['x < 0', 'All real x', 'x = 0 only'], explanation: 'Square roots of negative real numbers are not real.' },
  { topic: 'Coordinate Geometry', skill: 'Slope', difficulty: 'warmup', fact: 'A horizontal line has slope', answer: '0', distractors: ['Undefined', '1', '-1'], explanation: 'Horizontal lines have no vertical change.' },
  { topic: 'Coordinate Geometry', skill: 'Slope', difficulty: 'core', fact: 'A vertical line has slope', answer: 'Undefined', distractors: ['0', '1', '-1'], explanation: 'Vertical lines have zero horizontal change, so slope is undefined.' },
  { topic: 'Pi Approximation', skill: 'Constants', difficulty: 'warmup', fact: 'Pi is approximately', answer: '3.14', distractors: ['2.71', '1.61', '9.8'], explanation: 'Pi is the circle circumference-to-diameter ratio.' },
];

const biologySeeds: ChallengeSeed[] = [
  { topic: 'Cell Biology', skill: 'Cell theory', difficulty: 'warmup', fact: 'The basic unit of life is the', answer: 'Cell', distractors: ['Atom', 'Organ', 'Tissue only'], explanation: 'Cells are the smallest living units.' },
  { topic: 'Cell Biology', skill: 'Mitochondria', difficulty: 'warmup', fact: 'The powerhouse of the cell is the', answer: 'Mitochondrion', distractors: ['Nucleus', 'Ribosome', 'Golgi body'], explanation: 'Mitochondria produce much of the cell ATP.' },
  { topic: 'Cell Biology', skill: 'Ribosomes', difficulty: 'warmup', fact: 'Protein synthesis occurs at the', answer: 'Ribosome', distractors: ['Lysosome', 'Vacuole', 'Cell wall'], explanation: 'Ribosomes translate mRNA into proteins.' },
  { topic: 'Cell Biology', skill: 'Nucleus', difficulty: 'warmup', fact: 'In eukaryotes, DNA is mainly located in the', answer: 'Nucleus', distractors: ['Cell wall', 'Golgi body', 'Plasma membrane'], explanation: 'The nucleus stores most eukaryotic genetic material.' },
  { topic: 'Plant Physiology', skill: 'Photosynthesis', difficulty: 'warmup', fact: 'Photosynthesis occurs in the', answer: 'Chloroplast', distractors: ['Mitochondrion', 'Nucleus', 'Ribosome'], explanation: 'Chloroplasts contain chlorophyll and photosynthetic machinery.' },
  { topic: 'Plant Physiology', skill: 'Photosynthesis', difficulty: 'core', fact: 'Photosynthesis uses carbon dioxide and water to produce', answer: 'Glucose and oxygen', distractors: ['ATP and nitrogen', 'Protein and urea', 'DNA and RNA'], explanation: 'Light energy drives synthesis of glucose with oxygen released.' },
  { topic: 'Plant Physiology', skill: 'Cell wall', difficulty: 'warmup', fact: 'Plant cell walls are mainly made of', answer: 'Cellulose', distractors: ['Chitin', 'Keratin', 'Glycogen'], explanation: 'Cellulose gives plant cell walls rigidity.' },
  { topic: 'Genetics', skill: 'DNA', difficulty: 'warmup', fact: 'DNA stands for', answer: 'Deoxyribonucleic acid', distractors: ['Ribonucleic acid', 'Dynamic nuclear acid', 'Double nitrogen acid'], explanation: 'DNA is deoxyribonucleic acid.' },
  { topic: 'Genetics', skill: 'Genes', difficulty: 'warmup', fact: 'The basic unit of heredity is a', answer: 'Gene', distractors: ['Protein', 'Lipid', 'Ribosome'], explanation: 'Genes carry hereditary instructions.' },
  { topic: 'Genetics', skill: 'Chromosomes', difficulty: 'warmup', fact: 'Humans usually have this many chromosomes in body cells', answer: '46', distractors: ['23', '44', '48'], explanation: 'Human somatic cells usually have 23 pairs, or 46 chromosomes.' },
  { topic: 'Genetics', skill: 'Mendel', difficulty: 'core', fact: 'Mendel is famous for experiments on', answer: 'Pea plants', distractors: ['Fruit flies', 'Bacteria only', 'Ferns only'], explanation: 'Mendel studied inheritance patterns using pea plants.' },
  { topic: 'Evolution', skill: 'Natural selection', difficulty: 'warmup', fact: 'The theory of natural selection is associated with', answer: 'Charles Darwin', distractors: ['Isaac Newton', 'Niels Bohr', 'J. J. Thomson'], explanation: 'Darwin described evolution through natural selection.' },
  { topic: 'Evolution', skill: 'Adaptation', difficulty: 'core', fact: 'An adaptation is a trait that improves', answer: 'Survival or reproduction', distractors: ['Atomic number', 'Boiling point only', 'pH only'], explanation: 'Adaptive traits increase fitness in an environment.' },
  { topic: 'Human Physiology', skill: 'Circulation', difficulty: 'warmup', fact: 'The heart primarily pumps', answer: 'Blood', distractors: ['Air', 'Bile', 'Urine'], explanation: 'The heart drives blood circulation.' },
  { topic: 'Human Physiology', skill: 'Respiration', difficulty: 'warmup', fact: 'The lungs are mainly responsible for', answer: 'Gas exchange', distractors: ['Protein synthesis', 'Blood filtration', 'Hormone storage'], explanation: 'Lungs exchange oxygen and carbon dioxide.' },
  { topic: 'Human Physiology', skill: 'Excretion', difficulty: 'warmup', fact: 'Kidneys primarily', answer: 'Filter blood', distractors: ['Pump blood', 'Digest protein', 'Make bile'], explanation: 'Kidneys remove wastes and regulate water and salts.' },
  { topic: 'Human Physiology', skill: 'Digestion', difficulty: 'warmup', fact: 'Digestion begins in the', answer: 'Mouth', distractors: ['Large intestine', 'Kidney', 'Lung'], explanation: 'Mechanical digestion and salivary enzymes begin in the mouth.' },
  { topic: 'Biochemistry', skill: 'Enzymes', difficulty: 'core', fact: 'Most enzymes are', answer: 'Proteins', distractors: ['Fats', 'Minerals', 'Water molecules'], explanation: 'Most biological catalysts are proteins, though some RNA enzymes exist.' },
  { topic: 'Biochemistry', skill: 'Protein structure', difficulty: 'core', fact: 'Proteins are built from', answer: 'Amino acids', distractors: ['Nucleotides', 'Fatty acids only', 'Monosaccharides only'], explanation: 'Amino acids link by peptide bonds to form proteins.' },
  { topic: 'Immunity', skill: 'Defense', difficulty: 'core', fact: 'The immune system protects the body from', answer: 'Disease-causing agents', distractors: ['Gravity', 'Light only', 'Sound waves'], explanation: 'Immunity identifies and combats pathogens.' },
  { topic: 'Microbiology', skill: 'Bacteria', difficulty: 'core', fact: 'Bacteria are generally', answer: 'Prokaryotic', distractors: ['Eukaryotic only', 'Acellular', 'Multicellular animals'], explanation: 'Bacteria lack a membrane-bound nucleus.' },
  { topic: 'Microbiology', skill: 'Viruses', difficulty: 'stretch', fact: 'Viruses require host cells because they cannot independently', answer: 'Reproduce', distractors: ['Crystallize', 'Reflect light', 'Change shape'], explanation: 'Viruses depend on host machinery for replication.' },
  { topic: 'Respiration', skill: 'ATP', difficulty: 'core', fact: 'Cellular respiration produces usable energy mainly as', answer: 'ATP', distractors: ['DNA', 'Starch', 'Cellulose'], explanation: 'ATP is the main cellular energy currency.' },
  { topic: 'Blood', skill: 'Blood groups', difficulty: 'core', fact: 'The common universal red blood cell donor group is', answer: 'O negative', distractors: ['AB positive', 'A positive', 'B negative'], explanation: 'O negative red cells lack A, B, and Rh antigens.' },
  { topic: 'Nervous System', skill: 'Neurons', difficulty: 'warmup', fact: 'Neurons specialize in transmitting', answer: 'Signals', distractors: ['Bile', 'Bone matrix', 'Starch'], explanation: 'Neurons conduct electrical and chemical signals.' },
];

const seedMap: Record<SubjectId, ChallengeSeed[]> = {
  [SubjectId.PHYSICS]: physicsSeeds,
  [SubjectId.CHEMISTRY]: chemistrySeeds,
  [SubjectId.MATH]: mathSeeds,
  [SubjectId.BIOLOGY]: biologySeeds,
};

const hashString = (input: string): number => {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) >>> 0;
  }
  return hash;
};

const rotate = <T,>(items: T[], offset: number): T[] => {
  const normalized = offset % items.length;
  return [...items.slice(normalized), ...items.slice(0, normalized)];
};

const buildChallenge = (subjectId: SubjectId, seed: ChallengeSeed, seedIndex: number, variantIndex: number): DailyChallenge => {
  const promptTemplate = challengePrompts[variantIndex % challengePrompts.length];
  const options = rotate([seed.answer, ...seed.distractors], seedIndex + variantIndex);

  return {
    id: `${subjectId}-${seedIndex + 1}-${variantIndex + 1}`,
    subjectId,
    subjectName: subjectNames[subjectId],
    topic: seed.topic,
    skill: seed.skill,
    difficulty: seed.difficulty,
    prompt: promptTemplate.replace('{fact}', seed.fact),
    options,
    answer: seed.answer,
    explanation: seed.explanation,
    estimatedMinutes: seed.difficulty === 'warmup' ? 2 : seed.difficulty === 'core' ? 4 : 6,
  };
};

export const DAILY_CHALLENGE_BANK: Record<SubjectId, DailyChallenge[]> = Object.values(SubjectId).reduce((bank, subjectId) => {
  bank[subjectId] = seedMap[subjectId].flatMap((seed, seedIndex) =>
    challengePrompts.map((_, variantIndex) => buildChallenge(subjectId, seed, seedIndex, variantIndex))
  );
  return bank;
}, {} as Record<SubjectId, DailyChallenge[]>);

export const getChallengeBankSize = (subjectId: SubjectId): number => DAILY_CHALLENGE_BANK[subjectId]?.length || 0;

export const getDailyChallenges = (subjectId: SubjectId, date = new Date(), count = 5): DailyChallenge[] => {
  const bank = DAILY_CHALLENGE_BANK[subjectId] || [];
  if (!bank.length) return [];

  const dayKey = date.toISOString().slice(0, 10);
  const start = hashString(`${subjectId}-${dayKey}`) % bank.length;

  return Array.from({ length: Math.min(count, bank.length) }, (_, index) => bank[(start + index * 17) % bank.length]);
};
