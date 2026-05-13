import { SubjectId } from '../types/types';

export type ChallengeDifficulty = 'warmup' | 'core' | 'stretch';
export type CurriculumClass = 'Class 9' | 'Class 10' | 'Class 11' | 'Class 12';

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
  targetClass: CurriculumClass[];
}

interface ChallengeSeed {
  topic: string;
  skill: string;
  difficulty: ChallengeDifficulty;
  fact: string;
  answer: string;
  distractors: string[];
  explanation: string;
  targetClass?: CurriculumClass[];
}

const ALL_CLASSES: CurriculumClass[] = ['Class 9', 'Class 10', 'Class 11', 'Class 12'];

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
  { topic: 'Refraction of Light', skill: 'Basic definition', difficulty: 'warmup', fact: 'Refraction is the bending of light when it passes between media because its speed changes', answer: 'Speed', distractors: ['Color only', 'Mass', 'Charge'], explanation: 'Light bends at a boundary because its speed changes in different optical media.' },
  { topic: 'Refraction of Light', skill: 'Snell law', difficulty: 'core', fact: 'Snell law relates refractive index to the sine of the angle of', answer: 'Incidence and refraction', distractors: ['Reflection only', 'Dispersion only', 'Diffraction only'], explanation: 'Snell law connects n1 sin i and n2 sin r for two transparent media.' },
  { topic: 'Refraction of Light', skill: 'Optical density', difficulty: 'warmup', fact: 'When light enters an optically denser medium from a rarer medium, it bends', answer: 'Towards the normal', distractors: ['Away from the normal', 'Along the boundary', 'Back to the source'], explanation: 'Light slows down in a denser medium and bends towards the normal.' },
  { topic: 'Refraction of Light', skill: 'Rarer medium', difficulty: 'warmup', fact: 'When light goes from a denser medium to a rarer medium, it bends', answer: 'Away from the normal', distractors: ['Towards the normal', 'Exactly along the normal always', 'Into a circle'], explanation: 'Light speeds up in a rarer medium and bends away from the normal.' },
  { topic: 'Refraction of Light', skill: 'Refractive index', difficulty: 'core', fact: 'Absolute refractive index is calculated as', answer: 'n = c / v', distractors: ['n = v / c', 'n = cv', 'n = c + v'], explanation: 'It compares light speed in vacuum with light speed in the medium.' },
  { topic: 'Refraction of Light', skill: 'Total internal reflection', difficulty: 'core', fact: 'Total internal reflection requires light to travel from denser to rarer medium and angle of incidence to exceed the', answer: 'Critical angle', distractors: ['Reflected angle', 'Dispersive angle', 'Right angle always'], explanation: 'Both conditions are required for total internal reflection.' },
  { topic: 'Refraction of Light', skill: 'Critical angle', difficulty: 'stretch', fact: 'At the critical angle, the angle of refraction is', answer: '90 degrees', distractors: ['0 degrees', '45 degrees', '180 degrees'], explanation: 'The refracted ray grazes the boundary at the critical angle.' },
  { topic: 'Refraction of Light', skill: 'Apparent depth', difficulty: 'core', fact: 'An object under water appears raised because of', answer: 'Refraction', distractors: ['Magnetism', 'Conduction', 'Evaporation'], explanation: 'Refraction changes the apparent position of underwater objects.' },
  { topic: 'Refraction of Light', skill: 'Optical fibre', difficulty: 'core', fact: 'Optical fibres guide light mainly by repeated', answer: 'Total internal reflection', distractors: ['Diffuse reflection', 'Conduction', 'Scattering only'], explanation: 'Light remains trapped inside the fibre by total internal reflection.' },
  { topic: 'Refraction of Light', skill: 'Normal incidence', difficulty: 'stretch', fact: 'A ray entering another medium along the normal bends by', answer: '0 degrees', distractors: ['30 degrees', '60 degrees', '90 degrees'], explanation: 'At normal incidence the direction does not change, though speed may change.' },
  { topic: 'Classical Mechanics', skill: 'Newtonian force', difficulty: 'warmup', fact: 'The SI unit of force is', answer: 'Newton', distractors: ['Joule', 'Watt', 'Pascal'], explanation: 'Force is measured in newtons, equivalent to kg m/s^2.' },
  { topic: 'Classical Mechanics', skill: 'Dynamics', difficulty: 'warmup', fact: 'Newton\'s second law is represented by', answer: 'F = ma', distractors: ['P = VI', 'V = IR', 'Q = mc delta T'], explanation: 'Net force equals mass multiplied by acceleration.' },
  { topic: 'Classical Mechanics', skill: 'Inertia', difficulty: 'warmup', fact: 'Newton\'s first law is also called the law of', answer: 'Inertia', distractors: ['Heating', 'Refraction', 'Charge'], explanation: 'Objects resist changes in their state of motion because of inertia.' },
  { topic: 'Classical Mechanics', skill: 'Energy', difficulty: 'core', fact: 'Kinetic energy of a moving object equals', answer: '1/2 mv^2', distractors: ['mgh', 'Fd cos theta', 'mv'], explanation: 'Kinetic energy depends on mass and the square of speed.' },
  { topic: 'Classical Mechanics', skill: 'Momentum', difficulty: 'core', fact: 'Linear momentum is calculated as', answer: 'mv', distractors: ['ma', 'm/v', 'F/t'], explanation: 'Momentum is the product of mass and velocity.' },
  { topic: 'Classical Mechanics', skill: 'Work', difficulty: 'core', fact: 'Work done by a constant force at angle theta is', answer: 'Fd cos theta', distractors: ['Fd sin theta', 'F/d', 'mgh'], explanation: 'Only the force component along displacement contributes to work.' },
  { topic: 'Classical Mechanics', skill: 'Potential energy', difficulty: 'core', fact: 'Gravitational potential energy near Earth is', answer: 'mgh', distractors: ['1/2 mv^2', 'ma', 'VIR'], explanation: 'Potential energy depends on mass, gravitational field strength, and height.' },
  { topic: 'Classical Mechanics', skill: 'Impulse', difficulty: 'stretch', fact: 'Impulse equals change in', answer: 'Momentum', distractors: ['Temperature', 'Resistance', 'Refractive index'], explanation: 'Impulse is force acting over time and equals change in momentum.' },
  { topic: 'Classical Mechanics', skill: 'Acceleration', difficulty: 'warmup', fact: 'Acceleration is the rate of change of', answer: 'Velocity', distractors: ['Mass', 'Area', 'Charge'], explanation: 'Acceleration measures how quickly velocity changes with time.' },
  { topic: 'Classical Mechanics', skill: 'Conservation', difficulty: 'stretch', fact: 'In absence of external force, total linear momentum remains', answer: 'Conserved', distractors: ['Zero always', 'Increasing always', 'Negative always'], explanation: 'Momentum of an isolated system is conserved.' },
  { topic: 'Thermodynamics', skill: 'Temperature', difficulty: 'warmup', fact: 'Absolute temperature is measured in', answer: 'Kelvin', distractors: ['Celsius', 'Joule', 'Watt'], explanation: 'Kelvin is the SI base unit for thermodynamic temperature.' },
  { topic: 'Thermodynamics', skill: 'First law', difficulty: 'core', fact: 'The first law of thermodynamics expresses conservation of', answer: 'Energy', distractors: ['Charge', 'Momentum only', 'Mass only'], explanation: 'Heat and work change internal energy while total energy is conserved.' },
  { topic: 'Thermodynamics', skill: 'Internal energy', difficulty: 'core', fact: 'For a system, heat supplied can change internal energy and do', answer: 'Work', distractors: ['Refraction', 'Current only', 'Magnetic flux only'], explanation: 'The first law links heat, work, and change in internal energy.' },
  { topic: 'Thermodynamics', skill: 'Zeroth law', difficulty: 'warmup', fact: 'The zeroth law helps define', answer: 'Temperature', distractors: ['Resistance', 'Momentum', 'Wavelength'], explanation: 'Thermal equilibrium gives a consistent basis for measuring temperature.' },
  { topic: 'Thermodynamics', skill: 'Entropy', difficulty: 'stretch', fact: 'For an isolated spontaneous process, entropy tends to', answer: 'Increase', distractors: ['Decrease always', 'Remain zero', 'Become negative always'], explanation: 'The second law states entropy of an isolated system does not decrease.' },
  { topic: 'Thermodynamics', skill: 'Heat engine', difficulty: 'core', fact: 'A heat engine converts heat into', answer: 'Work', distractors: ['Charge', 'Mass defect', 'Refraction'], explanation: 'Heat engines produce mechanical work from thermal energy.' },
  { topic: 'Thermodynamics', skill: 'Efficiency', difficulty: 'core', fact: 'Efficiency of a heat engine is useful work output divided by heat', answer: 'Input', distractors: ['Reflected', 'Absorbed by ice only', 'Lost to vacuum only'], explanation: 'Efficiency compares useful output with supplied heat energy.' },
  { topic: 'Thermodynamics', skill: 'Specific heat', difficulty: 'core', fact: 'Heat required to raise temperature is given by', answer: 'Q = mc delta T', distractors: ['F = ma', 'V = IR', 'p = mv'], explanation: 'For simple heating, heat depends on mass, specific heat, and temperature change.' },
  { topic: 'Thermodynamics', skill: 'Conduction', difficulty: 'warmup', fact: 'Heat transfer through direct molecular contact is', answer: 'Conduction', distractors: ['Convection', 'Radiation', 'Refraction'], explanation: 'Conduction transfers energy through collisions within matter.' },
  { topic: 'Thermodynamics', skill: 'Carnot engine', difficulty: 'stretch', fact: 'A Carnot engine is an ideal engine operating reversibly between two', answer: 'Reservoirs', distractors: ['Charges', 'Lenses', 'Magnets only'], explanation: 'The Carnot cycle sets the ideal efficiency limit between hot and cold reservoirs.' },
  { topic: 'Electromagnetism', skill: 'Ohm law', difficulty: 'warmup', fact: 'Ohm\'s law is', answer: 'V = IR', distractors: ['F = ma', 'E = mc^2', 'P = Fv'], explanation: 'Voltage equals current multiplied by resistance.' },
  { topic: 'Electromagnetism', skill: 'Electric current', difficulty: 'warmup', fact: 'The SI unit of electric current is', answer: 'Ampere', distractors: ['Volt', 'Ohm', 'Coulomb'], explanation: 'Current measures charge flow per second and is measured in amperes.' },
  { topic: 'Electromagnetism', skill: 'Charge', difficulty: 'warmup', fact: 'The SI unit of electric charge is', answer: 'Coulomb', distractors: ['Tesla', 'Watt', 'Kelvin'], explanation: 'Electric charge is measured in coulombs.' },
  { topic: 'Electromagnetism', skill: 'Resistance', difficulty: 'core', fact: 'Electrical resistance is measured in', answer: 'Ohm', distractors: ['Volt', 'Ampere', 'Farad'], explanation: 'Resistance opposes current and is measured in ohms.' },
  { topic: 'Electromagnetism', skill: 'Capacitance', difficulty: 'core', fact: 'Capacitance is measured in', answer: 'Farad', distractors: ['Tesla', 'Henry', 'Weber'], explanation: 'A capacitor storing one coulomb per volt has one farad.' },
  { topic: 'Electromagnetism', skill: 'Magnetic field', difficulty: 'stretch', fact: 'The SI unit of magnetic flux density is', answer: 'Tesla', distractors: ['Weber', 'Coulomb', 'Volt'], explanation: 'Magnetic flux density B is measured in tesla.' },
  { topic: 'Electromagnetism', skill: 'Electric power', difficulty: 'core', fact: 'Electrical power in a resistor can be calculated by', answer: 'P = VI', distractors: ['P = V/I', 'P = I/R', 'P = qVt'], explanation: 'Power is the rate of electrical energy transfer, equal to voltage times current.' },
  { topic: 'Electromagnetism', skill: 'Faraday law', difficulty: 'stretch', fact: 'Changing magnetic flux through a circuit induces', answer: 'EMF', distractors: ['Mass', 'Temperature only', 'Refraction'], explanation: 'Faraday law states that changing flux induces an electromotive force.' },
  { topic: 'Electromagnetism', skill: 'Lenz law', difficulty: 'stretch', fact: 'Induced current flows in a direction that opposes the change in', answer: 'Magnetic flux', distractors: ['Mass', 'Temperature', 'Refractive index'], explanation: 'Lenz law gives the direction of induced current.' },
  { topic: 'Electromagnetism', skill: 'Lorentz force', difficulty: 'stretch', fact: 'A moving charge in a magnetic field experiences the', answer: 'Lorentz force', distractors: ['Buoyant force', 'Normal reaction only', 'Friction only'], explanation: 'Magnetic fields exert force on moving charges.' },
  { topic: 'Wave Optics', skill: 'Wave speed', difficulty: 'core', fact: 'Wave speed is related to frequency and wavelength by', answer: 'v = f lambda', distractors: ['v = f/lambda', 'v = lambda/f', 'v = f + lambda'], explanation: 'A wave travels one wavelength per cycle, so speed is frequency times wavelength.' },
  { topic: 'Wave Optics', skill: 'Interference', difficulty: 'stretch', fact: 'Constructive interference occurs when path difference is', answer: 'n lambda', distractors: ['(n + 1/2) lambda', 'lambda/4', '2n + lambda'], explanation: 'Integral multiples of wavelength make waves arrive in phase.' },
  { topic: 'Wave Optics', skill: 'Destructive interference', difficulty: 'stretch', fact: 'Destructive interference occurs when path difference is', answer: '(n + 1/2) lambda', distractors: ['n lambda', '0 always', '2n lambda only'], explanation: 'Half-integral wavelength differences make waves arrive out of phase.' },
  { topic: 'Wave Optics', skill: 'Polarization', difficulty: 'stretch', fact: 'Polarization proves light waves are', answer: 'Transverse', distractors: ['Longitudinal', 'Stationary', 'Mechanical only'], explanation: 'Only transverse waves can be polarized.' },
  { topic: 'Wave Optics', skill: 'Coherence', difficulty: 'core', fact: 'Sustained interference requires sources with constant phase difference called', answer: 'Coherent sources', distractors: ['Hot sources', 'Dense sources', 'Charged sources'], explanation: 'Coherent sources maintain a fixed phase relationship.' },
  { topic: 'Wave Optics', skill: 'Diffraction', difficulty: 'core', fact: 'Bending of light around edges or through narrow openings is called', answer: 'Diffraction', distractors: ['Conduction', 'Induction', 'Evaporation'], explanation: 'Diffraction is a wave effect seen when light meets apertures or obstacles.' },
  { topic: 'Wave Optics', skill: 'Young experiment', difficulty: 'core', fact: 'Young\'s double-slit experiment demonstrates light', answer: 'Interference', distractors: ['Electrolysis', 'Convection', 'Magnetization only'], explanation: 'The bright and dark fringes are produced by interference.' },
  { topic: 'Wave Optics', skill: 'Fringe width', difficulty: 'stretch', fact: 'In double-slit interference, fringe width increases when wavelength', answer: 'Increases', distractors: ['Decreases only', 'Becomes zero', 'Has no effect'], explanation: 'Fringe width is directly proportional to wavelength.' },
  { topic: 'Wave Optics', skill: 'Brewster law', difficulty: 'stretch', fact: 'Brewster law is related to', answer: 'Polarization by reflection', distractors: ['Heating by conduction', 'Nuclear decay', 'Ohmic resistance'], explanation: 'At Brewster angle, reflected light is completely plane polarized.' },
  { topic: 'Wave Optics', skill: 'Wave nature', difficulty: 'warmup', fact: 'Interference and diffraction support the wave nature of', answer: 'Light', distractors: ['Static charge only', 'Mass only', 'Sound in vacuum'], explanation: 'These phenomena are explained by treating light as a wave.' },
];

const chemistrySeeds: ChallengeSeed[] = [
  { topic: 'Atomic Structure', skill: 'Atomic number', difficulty: 'warmup', fact: 'Atomic number is the number of', answer: 'Protons', distractors: ['Neutrons', 'Nucleons', 'Valence shells'], explanation: 'The proton count defines an element.' },
  { topic: 'Atomic Structure', skill: 'Isotopes', difficulty: 'core', fact: 'Isotopes of an element differ in number of', answer: 'Neutrons', distractors: ['Protons', 'Electron shells only', 'Atomic number'], explanation: 'Isotopes share proton count but have different neutron counts.' },
  { topic: 'Atomic Structure', skill: 'Electron discovery', difficulty: 'warmup', fact: 'The electron was discovered by', answer: 'J. J. Thomson', distractors: ['Niels Bohr', 'Ernest Rutherford', 'Dmitri Mendeleev'], explanation: 'Thomson identified electrons using cathode ray experiments.' },
  { topic: 'Atomic Structure', skill: 'Quantum model', difficulty: 'stretch', fact: 'An orbital describes a region of high electron', answer: 'Probability', distractors: ['Certainty', 'Nuclear charge', 'Mass density'], explanation: 'Orbitals are probability distributions, not fixed tracks.' },
  { topic: 'Atomic Structure', skill: 'Mass number', difficulty: 'warmup', fact: 'Mass number equals protons plus', answer: 'Neutrons', distractors: ['Electrons', 'Orbitals', 'Valence shells'], explanation: 'Mass number counts nucleons: protons and neutrons.' },
  { topic: 'Atomic Structure', skill: 'Neutral atom', difficulty: 'warmup', fact: 'In a neutral atom, number of electrons equals number of', answer: 'Protons', distractors: ['Neutrons', 'Nucleons', 'Shells'], explanation: 'Equal protons and electrons make the net charge zero.' },
  { topic: 'Atomic Structure', skill: 'Nucleus', difficulty: 'core', fact: 'Most atomic mass is concentrated in the', answer: 'Nucleus', distractors: ['Valence shell', 'Electron cloud', 'Bond pair'], explanation: 'Protons and neutrons in the nucleus account for nearly all atomic mass.' },
  { topic: 'Atomic Structure', skill: 'Cation formation', difficulty: 'core', fact: 'A cation forms when an atom loses', answer: 'Electrons', distractors: ['Protons', 'Neutrons', 'Nuclei'], explanation: 'Losing electrons leaves more protons than electrons, giving a positive charge.' },
  { topic: 'Atomic Structure', skill: 'Anion formation', difficulty: 'core', fact: 'An anion forms when an atom gains', answer: 'Electrons', distractors: ['Protons', 'Neutrons', 'Mass number'], explanation: 'Gaining electrons gives a negative net charge.' },
  { topic: 'Atomic Structure', skill: 'Isobar concept', difficulty: 'stretch', fact: 'Isobars have the same mass number but different', answer: 'Atomic numbers', distractors: ['Neutron numbers always', 'Electron spin only', 'Shell names'], explanation: 'Isobars are atoms of different elements with the same mass number.' },
  { topic: 'Quantum Numbers', skill: 'Principal quantum number', difficulty: 'core', fact: 'The principal quantum number mainly describes electron', answer: 'Energy level', distractors: ['Spin direction', 'Orbital orientation', 'Nuclear mass'], explanation: 'n identifies the shell and broadly the energy level.' },
  { topic: 'Quantum Numbers', skill: 'Spin', difficulty: 'core', fact: 'Electron spin quantum number can be', answer: '+1/2 or -1/2', distractors: ['0 only', '+1 or -1', 'Any integer'], explanation: 'Electrons have two allowed spin states.' },
  { topic: 'Periodic Trends', skill: 'Atomic radius', difficulty: 'core', fact: 'Atomic radius generally decreases across a period because', answer: 'Nuclear charge increases', distractors: ['New shells are added', 'Neutrons disappear', 'Mass becomes zero'], explanation: 'Increasing effective nuclear charge pulls electrons closer.' },
  { topic: 'Periodic Trends', skill: 'Ionization energy', difficulty: 'core', fact: 'Ionization energy generally increases across a period due to', answer: 'Stronger nuclear attraction', distractors: ['Lower proton count', 'More shielding only', 'Larger atomic radius'], explanation: 'Electrons are held more tightly across a period.' },
  { topic: 'Periodic Trends', skill: 'Electronegativity', difficulty: 'warmup', fact: 'Electronegativity means the tendency to attract', answer: 'Shared electrons', distractors: ['Neutrons', 'Nuclei', 'Alpha particles'], explanation: 'Electronegativity describes attraction for bonding electrons.' },
  { topic: 'Periodic Trends', skill: 'Group radius trend', difficulty: 'warmup', fact: 'Atomic radius generally increases down a group because new', answer: 'Shells are added', distractors: ['Protons disappear', 'Electrons stop moving', 'Nuclei split'], explanation: 'Additional shells place valence electrons farther from the nucleus.' },
  { topic: 'Periodic Trends', skill: 'Metallic character', difficulty: 'core', fact: 'Metallic character generally increases down a', answer: 'Group', distractors: ['Period left to right', 'Nucleus only', 'Single orbital'], explanation: 'Down a group, atoms lose electrons more easily due to larger size and shielding.' },
  { topic: 'Periodic Trends', skill: 'Nonmetallic trend', difficulty: 'core', fact: 'Nonmetallic character generally increases across a period from', answer: 'Left to right', distractors: ['Right to left', 'Bottom to top only', 'Middle outward'], explanation: 'Across a period, atoms attract electrons more strongly.' },
  { topic: 'Periodic Trends', skill: 'Electron affinity', difficulty: 'stretch', fact: 'Electron affinity is the energy change when an atom gains an', answer: 'Electron', distractors: ['Proton', 'Neutron', 'Alpha particle'], explanation: 'Electron affinity describes adding an electron to a gaseous atom.' },
  { topic: 'Periodic Trends', skill: 'Shielding effect', difficulty: 'core', fact: 'Shielding reduces attraction between nucleus and', answer: 'Valence electrons', distractors: ['Protons', 'Neutrons', 'Atomic mass'], explanation: 'Inner electrons partially shield outer electrons from nuclear charge.' },
  { topic: 'Periodic Trends', skill: 'Effective nuclear charge', difficulty: 'stretch', fact: 'Effective nuclear charge generally increases across a', answer: 'Period', distractors: ['Group downward only', 'Nucleus outward', 'Neutron series'], explanation: 'Across a period, proton number rises while shielding changes less.' },
  { topic: 'Periodic Trends', skill: 'Ion size', difficulty: 'core', fact: 'Cations are generally smaller than their parent', answer: 'Atoms', distractors: ['Nuclei', 'Neutrons', 'Isotopes always'], explanation: 'Losing electrons reduces repulsion and may remove an outer shell.' },
  { topic: 'Chemical Bonding', skill: 'Ionic bonds', difficulty: 'warmup', fact: 'An ionic bond forms mainly by electron', answer: 'Transfer', distractors: ['Sharing', 'Delocalization', 'Diffraction'], explanation: 'Ionic bonding forms oppositely charged ions by transfer.' },
  { topic: 'Chemical Bonding', skill: 'Covalent bonds', difficulty: 'warmup', fact: 'A covalent bond forms mainly by electron', answer: 'Sharing', distractors: ['Transfer', 'Loss only', 'Nuclear fusion'], explanation: 'Covalent bonds involve shared electron pairs.' },
  { topic: 'Molecular Structure', skill: 'VSEPR', difficulty: 'core', fact: 'Methane has approximately this bond angle', answer: '109.5 degrees', distractors: ['90 degrees', '120 degrees', '180 degrees'], explanation: 'CH4 is tetrahedral with bond angles near 109.5 degrees.' },
  { topic: 'Molecular Structure', skill: 'Hybridization', difficulty: 'core', fact: 'The hybridization of carbon in methane is', answer: 'sp3', distractors: ['sp', 'sp2', 'dsp2'], explanation: 'Four sigma bonds around carbon correspond to sp3 hybridization.' },
  { topic: 'Molecular Structure', skill: 'Geometry', difficulty: 'stretch', fact: 'Carbon dioxide has molecular geometry', answer: 'Linear', distractors: ['Bent', 'Tetrahedral', 'Trigonal pyramidal'], explanation: 'Two electron domains around carbon make CO2 linear.' },
  { topic: 'Molecular Structure', skill: 'Water shape', difficulty: 'core', fact: 'Water molecule has this shape', answer: 'Bent', distractors: ['Linear', 'Tetrahedral', 'Trigonal planar'], explanation: 'Two bond pairs and two lone pairs around oxygen make water bent.' },
  { topic: 'Molecular Structure', skill: 'Ammonia shape', difficulty: 'core', fact: 'Ammonia has molecular geometry', answer: 'Trigonal pyramidal', distractors: ['Linear', 'Bent', 'Octahedral'], explanation: 'NH3 has three bond pairs and one lone pair on nitrogen.' },
  { topic: 'Molecular Structure', skill: 'BF3 geometry', difficulty: 'core', fact: 'Boron trifluoride has geometry', answer: 'Trigonal planar', distractors: ['Tetrahedral', 'Bent', 'Trigonal pyramidal'], explanation: 'BF3 has three electron domains and no lone pair on boron.' },
  { topic: 'Molecular Structure', skill: 'Sigma bond', difficulty: 'warmup', fact: 'A sigma bond forms by head-on orbital', answer: 'Overlap', distractors: ['Ionization', 'Reflection', 'Diffraction'], explanation: 'Sigma bonds result from axial overlap of orbitals.' },
  { topic: 'Molecular Structure', skill: 'Pi bond', difficulty: 'core', fact: 'A pi bond forms by sideways overlap of', answer: 'p orbitals', distractors: ['s orbitals only', 'Nuclei', 'Neutrons'], explanation: 'Pi bonds come from lateral overlap of unhybridized p orbitals.' },
  { topic: 'Molecular Structure', skill: 'Lone pair effect', difficulty: 'stretch', fact: 'Lone pairs usually make bond angles', answer: 'Smaller', distractors: ['Always larger', 'Always 180 degrees', 'Zero'], explanation: 'Lone pair-bond pair repulsions compress bond angles.' },
  { topic: 'Molecular Structure', skill: 'Ethene hybridization', difficulty: 'stretch', fact: 'Carbon atoms in ethene are generally', answer: 'sp2 hybridized', distractors: ['sp3 hybridized', 'sp hybridized', 'Unhybridized only'], explanation: 'Each carbon in ethene has three electron domains and one pi bond.' },
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
  { topic: 'Historical Models', skill: 'Dalton model', difficulty: 'warmup', fact: 'Dalton described atoms as', answer: 'Indivisible solid spheres', distractors: ['Positive clouds', 'Nuclear systems', 'Electron orbitals'], explanation: 'Dalton treated atoms as tiny solid particles that combined in fixed ratios.' },
  { topic: 'Historical Models', skill: 'Thomson model', difficulty: 'warmup', fact: 'Thomson proposed the atom as a positive sphere containing', answer: 'Embedded electrons', distractors: ['Neutrons only', 'Empty space only', 'Fixed shells'], explanation: 'The plum pudding model placed electrons inside a diffuse positive charge.' },
  { topic: 'Historical Models', skill: 'Cathode rays', difficulty: 'core', fact: 'Cathode ray experiments led to the discovery of the', answer: 'Electron', distractors: ['Proton', 'Neutron', 'Nucleus'], explanation: 'J. J. Thomson showed cathode rays were streams of negatively charged particles.' },
  { topic: 'Historical Models', skill: 'Rutherford experiment', difficulty: 'core', fact: 'Rutherford used this experiment to infer a small dense nucleus', answer: 'Gold foil experiment', distractors: ['Oil drop experiment', 'Flame test', 'Discharge tube only'], explanation: 'Large alpha-particle deflections showed positive charge was concentrated in a nucleus.' },
  { topic: 'Historical Models', skill: 'Atomic space', difficulty: 'warmup', fact: 'Rutherford concluded that most of an atom is', answer: 'Empty space', distractors: ['Solid matter', 'Only neutrons', 'Liquid charge'], explanation: 'Most alpha particles passed straight through foil, showing atoms are mostly empty.' },
  { topic: 'Historical Models', skill: 'Bohr model', difficulty: 'core', fact: 'Bohr explained atomic spectra using fixed electron', answer: 'Energy levels', distractors: ['Mass numbers', 'Neutron shells', 'Random paths'], explanation: 'Bohr proposed electrons occupy quantized orbits with definite energies.' },
  { topic: 'Historical Models', skill: 'Spectral lines', difficulty: 'core', fact: 'Bohr model explains hydrogen line spectra by electron', answer: 'Transitions between levels', distractors: ['Nuclear fusion', 'Loss of protons', 'Molecular collisions only'], explanation: 'Light is emitted or absorbed when electrons jump between quantized levels.' },
  { topic: 'Historical Models', skill: 'Model limitation', difficulty: 'stretch', fact: 'A major limitation of Bohr model is that it works best for', answer: 'Hydrogen-like atoms', distractors: ['All molecules', 'All solids', 'Only noble gases'], explanation: 'Bohr theory is accurate mainly for one-electron atoms and ions.' },
  { topic: 'Historical Models', skill: 'Modern model', difficulty: 'core', fact: 'The modern atomic model describes electrons using', answer: 'Probability clouds', distractors: ['Fixed circular tracks', 'Solid rings', 'Positive pudding'], explanation: 'Quantum mechanics replaces exact orbits with orbital probability distributions.' },
  { topic: 'Historical Models', skill: 'Nuclear model', difficulty: 'warmup', fact: 'In Rutherford model, positive charge is concentrated in the', answer: 'Nucleus', distractors: ['Electron cloud', 'Outer shell', 'Cathode ray'], explanation: 'The nuclear model puts nearly all positive charge and mass at the center.' },
  { topic: 'Quantum Numbers', skill: 'Principal quantum number', difficulty: 'warmup', fact: 'Principal quantum number n identifies the electron', answer: 'Shell', distractors: ['Spin only', 'Charge', 'Nucleus'], explanation: 'n labels the main energy shell of an electron.' },
  { topic: 'Quantum Numbers', skill: 'Azimuthal quantum number', difficulty: 'core', fact: 'The azimuthal quantum number mainly identifies orbital', answer: 'Shape', distractors: ['Spin', 'Mass', 'Nuclear charge'], explanation: 'l distinguishes subshell shape such as s, p, d, or f.' },
  { topic: 'Quantum Numbers', skill: 'Magnetic quantum number', difficulty: 'core', fact: 'Magnetic quantum number tells orbital', answer: 'Orientation', distractors: ['Size only', 'Electron mass', 'Atomic number'], explanation: 'm_l identifies the orientation of an orbital in space.' },
  { topic: 'Quantum Numbers', skill: 'Spin quantum number', difficulty: 'warmup', fact: 'Electron spin can have values', answer: '+1/2 and -1/2', distractors: ['0 and 1', '+2 and -2', 'Only 0'], explanation: 'An electron has two allowed spin states.' },
  { topic: 'Quantum Numbers', skill: 's subshell', difficulty: 'warmup', fact: 'For an s subshell, l equals', answer: '0', distractors: ['1', '2', '3'], explanation: 'Subshell labels correspond to l values: s=0, p=1, d=2, f=3.' },
  { topic: 'Quantum Numbers', skill: 'p subshell', difficulty: 'core', fact: 'A p subshell can contain maximum electrons', answer: '6', distractors: ['2', '10', '14'], explanation: 'A p subshell has three orbitals, each holding two electrons.' },
  { topic: 'Quantum Numbers', skill: 'd subshell', difficulty: 'core', fact: 'A d subshell contains this many orbitals', answer: '5', distractors: ['1', '3', '7'], explanation: 'For d, l=2 and m_l has five possible values.' },
  { topic: 'Quantum Numbers', skill: 'Pauli principle', difficulty: 'core', fact: 'No two electrons in an atom can have the same set of', answer: 'Four quantum numbers', distractors: ['Two periods', 'Three isotopes', 'One mass number'], explanation: 'Pauli exclusion makes each electron quantum state unique.' },
  { topic: 'Quantum Numbers', skill: 'Orbital capacity', difficulty: 'warmup', fact: 'One orbital can hold at most', answer: '2 electrons', distractors: ['1 electron', '6 electrons', '8 electrons'], explanation: 'Two electrons may share an orbital only with opposite spins.' },
  { topic: 'Quantum Numbers', skill: 'Allowed l values', difficulty: 'stretch', fact: 'For n = 3, allowed l values are', answer: '0, 1, 2', distractors: ['1, 2, 3', '0 only', '0, 1, 2, 3'], explanation: 'For a shell n, l ranges from 0 to n - 1.' },
  { topic: 'Quantum Configuration', skill: 'Aufbau principle', difficulty: 'warmup', fact: 'Aufbau principle says electrons fill orbitals of lowest', answer: 'Energy first', distractors: ['Mass first', 'Charge first', 'Radius first'], explanation: 'Electrons occupy lower-energy orbitals before higher-energy orbitals.' },
  { topic: 'Quantum Configuration', skill: 'Pauli exclusion', difficulty: 'core', fact: 'Two electrons in the same orbital must have opposite', answer: 'Spins', distractors: ['Charges', 'Masses', 'Atomic numbers'], explanation: 'Opposite spin allows two electrons to occupy one orbital.' },
  { topic: 'Quantum Configuration', skill: 'Hund rule', difficulty: 'core', fact: 'Hund rule fills equal-energy orbitals singly before', answer: 'Pairing', distractors: ['Ionizing', 'Bonding', 'Nuclear decay'], explanation: 'Electrons spread out with parallel spins in degenerate orbitals first.' },
  { topic: 'Quantum Configuration', skill: '1s capacity', difficulty: 'warmup', fact: 'The maximum number of electrons in 1s orbital is', answer: '2', distractors: ['1', '6', '8'], explanation: 'Any single orbital can hold at most two electrons.' },
  { topic: 'Quantum Configuration', skill: '2p capacity', difficulty: 'core', fact: 'The 2p subshell can hold maximum', answer: '6 electrons', distractors: ['2 electrons', '8 electrons', '10 electrons'], explanation: 'Three 2p orbitals each hold two electrons.' },
  { topic: 'Quantum Configuration', skill: 'Sodium configuration', difficulty: 'core', fact: 'The outer configuration of sodium is', answer: '3s1', distractors: ['2p6', '3p1', '2s1'], explanation: 'Sodium has configuration 1s2 2s2 2p6 3s1.' },
  { topic: 'Quantum Configuration', skill: 'Chlorine valence', difficulty: 'core', fact: 'Chlorine has this many valence electrons', answer: '7', distractors: ['1', '2', '8'], explanation: 'Chlorine configuration ends in 3s2 3p5, giving seven valence electrons.' },
  { topic: 'Quantum Configuration', skill: 'Noble gas notation', difficulty: 'warmup', fact: 'Noble gas notation shortens electron configuration using', answer: 'Previous noble gas core', distractors: ['Atomic mass only', 'Isotope number', 'Bond angle'], explanation: 'Core electrons are represented by the preceding noble gas symbol.' },
  { topic: 'Quantum Configuration', skill: 'Half-filled stability', difficulty: 'stretch', fact: 'Extra stability is often associated with half-filled and', answer: 'Fully filled subshells', distractors: ['Empty nuclei', 'Unequal protons', 'Broken orbitals'], explanation: 'Symmetry and exchange energy stabilize half-filled and filled subshells.' },
  { topic: 'Quantum Configuration', skill: 'Orbital order', difficulty: 'stretch', fact: 'The 4s orbital generally fills before', answer: '3d', distractors: ['2p', '2s', '1s'], explanation: 'In the Aufbau order, 4s is filled before 3d for neutral atoms.' },
  { topic: 'Advanced Experiment Lab', skill: 'Reaction rate', difficulty: 'warmup', fact: 'Increasing concentration usually increases reaction', answer: 'Rate', distractors: ['Atomic number', 'Molar mass', 'pH always to 7'], explanation: 'Higher concentration increases collision frequency between reacting particles.' },
  { topic: 'Advanced Experiment Lab', skill: 'Temperature effect', difficulty: 'core', fact: 'Raising temperature generally increases rate by increasing particle', answer: 'Kinetic energy', distractors: ['Atomic number', 'Nuclear charge', 'Isotope count'], explanation: 'Faster particles collide more often and with more energy.' },
  { topic: 'Advanced Experiment Lab', skill: 'Catalyst role', difficulty: 'core', fact: 'A catalyst changes rate by providing lower activation', answer: 'Energy pathway', distractors: ['Atomic mass pathway', 'pH limit only', 'Density pathway'], explanation: 'Catalysts offer an alternate mechanism with lower activation energy.' },
  { topic: 'Advanced Experiment Lab', skill: 'pH monitoring', difficulty: 'warmup', fact: 'pH sensors primarily track acidity through hydrogen ion', answer: 'Concentration', distractors: ['Mass number', 'Neutron count', 'Bond angle'], explanation: 'pH is related to hydrogen ion concentration in solution.' },
  { topic: 'Advanced Experiment Lab', skill: 'Thermal safety', difficulty: 'core', fact: 'A rapid uncontrolled temperature rise in reaction monitoring indicates', answer: 'Thermal breach', distractors: ['Perfect equilibrium', 'Zero collision rate', 'Neutralization complete'], explanation: 'A sudden heat spike can signal unsafe runaway behavior.' },
  { topic: 'Advanced Experiment Lab', skill: 'Limiting reagent', difficulty: 'core', fact: 'The reactant consumed first is the', answer: 'Limiting reagent', distractors: ['Excess reagent', 'Catalyst', 'Solvent'], explanation: 'The limiting reagent determines maximum product yield.' },
  { topic: 'Advanced Experiment Lab', skill: 'Yield', difficulty: 'core', fact: 'Percent yield compares actual yield with', answer: 'Theoretical yield', distractors: ['Atomic radius', 'pH value', 'Boiling point'], explanation: 'Percent yield equals actual yield divided by theoretical yield times 100.' },
  { topic: 'Advanced Experiment Lab', skill: 'Collision theory', difficulty: 'stretch', fact: 'For a reaction, collisions must have enough energy and correct', answer: 'Orientation', distractors: ['Color', 'Atomic symbol', 'Mass defect'], explanation: 'Effective collisions require both sufficient energy and suitable orientation.' },
  { topic: 'Advanced Experiment Lab', skill: 'Equilibrium shift', difficulty: 'stretch', fact: 'Le Chatelier principle predicts response to changes in concentration, pressure, or', answer: 'Temperature', distractors: ['Atomic number', 'Electron spin only', 'Neutron ratio'], explanation: 'Equilibrium shifts to oppose imposed changes including temperature changes.' },
  { topic: 'Advanced Experiment Lab', skill: 'Titration endpoint', difficulty: 'warmup', fact: 'A titration endpoint is commonly detected by a color change of an', answer: 'Indicator', distractors: ['Isotope', 'Electrode shell', 'Inert gas'], explanation: 'Indicators change color near a specific pH range.' },
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

const topicClassMap: Record<SubjectId, Record<string, CurriculumClass[]>> = {
  [SubjectId.PHYSICS]: {
    'Refraction of Light': ['Class 9'],
    'Classical Mechanics': ['Class 11'],
    Thermodynamics: ['Class 11'],
    Electromagnetism: ['Class 12'],
    'Wave Optics': ['Class 12'],
  },
  [SubjectId.CHEMISTRY]: {
    'Historical Models': ['Class 9'],
    'Quantum Numbers': ['Class 10'],
    'Atomic Structure': ['Class 11'],
    'Molecular Structure': ['Class 11'],
    'Advanced Experiment Lab': ['Class 11', 'Class 12'],
    'Periodic Trends': ['Class 12'],
    'Quantum Configuration': ['Class 12'],
  },
  [SubjectId.MATH]: {
    'Coordinate Geometry': ['Class 9', 'Class 10'],
    'Pi Approximation': ['Class 10'],
    Algebra: ['Class 10', 'Class 11'],
    Trigonometry: ['Class 10', 'Class 11'],
    Functions: ['Class 11'],
    Calculus: ['Class 11', 'Class 12'],
    Probability: ['Class 10', 'Class 12'],
    'Linear Algebra': ['Class 12'],
    'Vector Algebra': ['Class 12'],
  },
  [SubjectId.BIOLOGY]: {
    'Cell Biology': ['Class 9', 'Class 11'],
    'Plant Physiology': ['Class 10', 'Class 11'],
    Genetics: ['Class 10', 'Class 12'],
    Evolution: ['Class 10', 'Class 12'],
    'Human Physiology': ['Class 10', 'Class 11'],
    Biochemistry: ['Class 11', 'Class 12'],
    Immunity: ['Class 12'],
    Microbiology: ['Class 12'],
    Respiration: ['Class 10', 'Class 11'],
    Blood: ['Class 11', 'Class 12'],
    'Nervous System': ['Class 10', 'Class 11'],
  },
};

const getSeedTargetClasses = (subjectId: SubjectId, seed: ChallengeSeed): CurriculumClass[] => {
  if (seed.targetClass) return seed.targetClass;
  const mappedClasses = topicClassMap[subjectId]?.[seed.topic];
  if (mappedClasses) return mappedClasses;
  return subjectId === SubjectId.CHEMISTRY ? [] : ALL_CLASSES;
};

const isCurriculumClass = (value?: string | null): value is CurriculumClass => {
  return Boolean(value && ALL_CLASSES.includes(value as CurriculumClass));
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
  const targetClass = getSeedTargetClasses(subjectId, seed);

  return {
    id: `${subjectId}-${targetClass.join('-').replace(/\s+/g, '').toLowerCase()}-${seedIndex + 1}-${variantIndex + 1}`,
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
    targetClass,
  };
};

export const DAILY_CHALLENGE_BANK: Record<SubjectId, DailyChallenge[]> = Object.values(SubjectId).reduce((bank, subjectId) => {
  bank[subjectId] = seedMap[subjectId].flatMap((seed, seedIndex) =>
    challengePrompts.map((_, variantIndex) => buildChallenge(subjectId, seed, seedIndex, variantIndex))
  );
  return bank;
}, {} as Record<SubjectId, DailyChallenge[]>);

export const getChallengeBankSize = (subjectId: SubjectId, selectedClass?: string | null): number => {
  const bank = DAILY_CHALLENGE_BANK[subjectId] || [];
  const eligibleBank = subjectId === SubjectId.CHEMISTRY ? bank.filter((challenge) => challenge.targetClass.length > 0) : bank;
  if (!isCurriculumClass(selectedClass)) return eligibleBank.length;
  const classBankSize = eligibleBank.filter((challenge) => challenge.targetClass.includes(selectedClass)).length;
  return classBankSize;
};

export const getDailyChallenges = (
  subjectId: SubjectId,
  date = new Date(),
  count = 5,
  selectedClass?: string | null
): DailyChallenge[] => {
  const subjectBank = DAILY_CHALLENGE_BANK[subjectId] || [];
  const eligibleBank = subjectId === SubjectId.CHEMISTRY
    ? subjectBank.filter((challenge) => challenge.targetClass.length > 0)
    : subjectBank;
  const classBank = isCurriculumClass(selectedClass)
    ? eligibleBank.filter((challenge) => challenge.targetClass.includes(selectedClass))
    : eligibleBank;
  const bank = classBank;
  if (!bank.length) return [];

  const dayKey = date.toISOString().slice(0, 10);
  const classKey = isCurriculumClass(selectedClass) ? selectedClass : 'all-classes';
  const start = hashString(`${subjectId}-${classKey}-${dayKey}`) % bank.length;

  return Array.from({ length: Math.min(count, bank.length) }, (_, index) => bank[(start + index * 17) % bank.length]);
};
