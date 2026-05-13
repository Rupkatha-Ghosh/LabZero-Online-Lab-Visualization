
import { ElementData, Molecule, Subject, SubjectId, TopicId } from '../types/types';

export const SUBJECTS: Subject[] = [
  {
    id: SubjectId.CHEMISTRY,
    slug: 'chemistry',
    name: 'Chemistry',
    icon: 'Beaker',
    color: 'emerald',
    targetClass: ['Class 11', 'Class 12'],
    topics: [
      {
        id: TopicId.ATOMIC_STRUCTURE,
        slug: 'atomic_structure',
        name: 'Atomic Structure',
        description: 'Explore the building blocks of matter, from subatomic particles to electron orbitals.',
        targetClass: ['Class 11'],
        theory: `
# Atomic Structure
The fundamental study of matter's composition and the behavior of subatomic particles.

## Subatomic Particles
- **Protons**: Positively charged (+1) particles located in the nucleus; determines atomic number (Z).
- **Neutrons**: Neutral particles in the nucleus; contributes to atomic mass and nuclear stability.
- **Electrons**: Negatively charged (-1) particles orbiting the nucleus in defined energy levels.

## Atomic Models
- **Bohr Model**: Electrons move in fixed circular orbits (shells) with quantized energy levels.
- **Quantum Model**: Electrons exist in probability regions called 'orbitals' (s, p, d, f).
- **Heisenberg Principle**: Impossible to know both position and momentum of an electron simultaneously.

## Key Principles
- **Aufbau Principle**: Electrons occupy the lowest energy orbitals first.
- **Pauli Exclusion**: An orbital can hold max 2 electrons with opposite spins.
- **Hund's Rule**: Degenerate orbitals are singly occupied before pairing.
        `
      },
      {
        id: TopicId.MOLECULAR_STRUCTURE,
        slug: 'molecular_structure',
        name: 'Molecular Structure',
        description: 'Understand how atoms bond together to form molecules and their 3D shapes.',
        targetClass: ['Class 11'],
        theory: `
# Molecular Structure
Analysis of chemical bonding and the spatial arrangement of atoms in molecules.

## Chemical Bonding
- **Ionic Bond**: Electrostatic attraction between oppositely charged ions (electron transfer).
- **Covalent Bond**: Sharing of electron pairs between atoms to achieve stability.
- **Metallic Bond**: Attraction between metal ions and a "sea" of delocalized electrons.

## VSEPR Theory
- **Linear**: 2 bonding pairs, 180° angle (e.g., BeCl₂, CO₂).
- **Trigonal Planar**: 3 bonding pairs, 120° angle (e.g., BF₃).
- **Tetrahedral**: 4 bonding pairs, 109.5° angle (e.g., CH₄).
- **Bent/V-Shape**: Presence of lone pairs reduces bond angles (e.g., H₂O, SO₂).

## Hybridization
- **sp**: Linear geometry (alkynes).
- **sp²**: Trigonal planar geometry (alkenes).
- **sp³**: Tetrahedral geometry (alkanes).

## Common Geometries
- **Linear**: 180° angle (e.g., CO₂)
- **Bent**: < 120° or 109.5° (e.g., H₂O)
- **Trigonal Planar**: 120° (e.g., BF₃)
- **Tetrahedral**: 109.5° (e.g., CH₄)
        `
      },
      {
        id: TopicId.QUANTUM_NUMBERS,
        slug: 'quantum_numbers',
        name: 'Quantum Numbers',
        description: 'Learn the four quantum numbers that describe the unique state of an electron.',
        targetClass: ['Class 11'],
        theory: `
# Quantum Numbers
Quantum numbers are like the "address" of an electron in an atom. No two electrons in the same atom can have the same set of four quantum numbers.

1. **Principal Quantum Number (n)**: Describes the energy level (1, 2, 3...).
2. **Angular Momentum (l)**: Describes the shape of the orbital (0 to n-1).
3. **Magnetic (ml)**: Describes the orientation of the orbital (-l to +l).
4. **Spin (ms)**: Describes the direction of electron spin (+1/2 or -1/2).
        `
      },
      {
        id: TopicId.PERIODIC_TRENDS,
        slug: 'periodic_trends',
        name: 'Periodic Trends',
        description: 'Discover how properties change across the periodic table.',
        targetClass: ['Class 12'],
        theory: `
# Periodic Trends
Systematic variations in physical and chemical properties of elements across periods and groups.

## Physical Properties
- **Atomic Radius**: Decreases across a period (nuclear charge); increases down a group (new shells).
- **Ionic Radius**: Cations are smaller than atoms; anions are larger than atoms.

## Chemical Properties
- **Electronegativity**: Ability to attract shared electrons; increases across, decreases down.
- **Ionization Energy**: Energy to remove an electron; increases across, decreases down.
- **Electron Affinity**: Energy change when adding an electron; becomes more negative across.
        `
      },
      {
        id: TopicId.HISTORICAL_MODELS,
        slug: 'historical_models',
        name: 'Historical Models',
        description: 'Explore how our understanding of the atom evolved from Dalton to Bohr.',
        targetClass: ['Class 11'],
        theory: `
# Historical Atomic Models
The journey of discovery from solid spheres to quantized energy levels.

## Dalton's Billiard Ball Model (1803)
- **Concept**: Atoms are indivisible, indestructible solid spheres.
- **Key Feature**: Atoms of the same element are identical.

## Thomson's Plum Pudding Model (1904)
- **Concept**: Positive sphere with embedded negative electrons.
- **Key Feature**: Discovery of subatomic particles (electrons).

## Rutherford's Nuclear Model (1911)
- **Concept**: Tiny, dense, positive nucleus with electrons in empty space.
- **Key Feature**: Atoms are mostly empty space.

## Bohr's Planetary Model (1913)
- **Concept**: Electrons orbit the nucleus in fixed, quantized energy levels.
- **Key Feature**: Energy shells explain spectral lines.
        `
      },
      {
        id: TopicId.QUANTUM_CONFIG,
        slug: 'quantum_config',
        name: 'Quantum Configuration',
        description: 'Master the rules for filling electrons in orbitals.',
        targetClass: ['Class 11'],
        theory: `
# Electron Configuration
The distribution of electrons in an atom's orbitals.

## Aufbau Principle
Electrons fill the lowest energy orbitals first (1s < 2s < 2p...).

## Pauli Exclusion Principle
An orbital can hold max 2 electrons with opposite spins.

## Hund's Rule
Degenerate orbitals are singly occupied before pairing occurs.

## Stability of Half-filled/Full Shells
Extra stability is observed in d⁵ and d¹⁰ configurations (e.g., Cr and Cu).
        `
      },
      {
        id: TopicId.REAL_EXPERIMENT,
        slug: 'advanced_lab',
        name: 'Advanced Experiment Lab',
        description: 'Interactive laboratory for studying reaction dynamics and kinetics.',
        targetClass: ['Class 11', 'Class 12'],
        theory: `
# Advanced Chemistry Lab
Dynamic simulation environment for exploring chemical reactions.

## Reaction Dynamics
- **Concentration Effects**: Observing how reactant quantity impacts speed.
- **Thermal Energy**: Analyzing the role of temperature in molecular collisions.
- **pH Monitoring**: Real-time tracking of acidity changes during reactions.

## Lab Safety
- Always monitor temperature to prevent thermal breach.
- Be careful when mixing strong acids and bases.
- Capacity is limited to 500ml for optimal simulation accuracy.
        `
      }
    ]
  },
  {
    id: SubjectId.PHYSICS,
    slug: 'physics',
    name: 'Physics',
    icon: 'Zap',
    color: 'blue',
    targetClass: ['Class 11', 'Class 12'],
    topics: [
      {
        id: TopicId.MECHANICS,
        slug: 'mechanics',
        name: 'Classical Mechanics',
        description: 'Study motion, forces, and energy in the macroscopic world.',
        targetClass: ['Class 11'],
        theory: `
# Classical Mechanics
The branch of physics dealing with the motion of bodies under the action of forces.

## Newton's Laws
- **Inertia (1st)**: Objects resist changes in their state of motion.
- **Force (2nd)**: F = ma; force equals mass times acceleration.
- **Action-Reaction (3rd)**: For every action, there is an equal and opposite reaction.

## Work and Energy
- **Work**: W = Fd cos(θ); energy transferred by a force acting through a distance.
- **Kinetic Energy**: K = ½mv²; energy due to an object's motion.
- **Potential Energy**: U = mgh; energy stored due to position in a field.

## Linear Momentum
- **Momentum**: p = mv; product of mass and velocity.
- **Impulse**: Change in momentum caused by a force over time.
- **Conservation**: Total momentum is conserved in the absence of external forces.
        `
      },
      {
        id: TopicId.ELECTROMAGNETISM,
        slug: 'electromagnetism',
        name: 'Electromagnetism',
        description: 'Explore electric fields, magnetic forces, and circuits.',
        targetClass: ['Class 12'],
        theory: `
# Electromagnetism
The interaction of electric currents or fields and magnetic fields.

## Electrostatics
- **Coulomb's Law**: Force between charges (F = kq₁q₂/r²).
- **Electric Field**: E = F/q; region where a charge experiences a force.
- **Gauss's Law**: Net electric flux through a closed surface is related to enclosed charge.

## Magnetostatics
- **Biot-Savart Law**: Magnetic field produced by a steady current.
- **Ampere's Law**: Relation between integrated magnetic field and current.
- **Lorentz Force**: Total force on a charge in E and B fields (F = qE + qv×B).

## Induction
- **Faraday's Law**: Changing magnetic flux induces electromotive force (EMF).
- **Lenz's Law**: Induced current opposes the change in flux that produced it.
        `
      },
      {
        id: TopicId.WAVE_OPTICS,
        slug: 'wave_optics',
        name: 'Wave Optics',
        description: 'Study of light as a wave and phenomena like interference and diffraction.',
        targetClass: ['Class 12'],
        theory: `
# Wave Optics
The study of light phenomena that cannot be explained by ray optics.

## Interference
- **Coherence**: Two sources must have a constant phase difference.
- **Constructive**: Waves add up (maxima); path difference = nλ.
- **Destructive**: Waves cancel out (minima); path difference = (n+½)λ.

## Diffraction
- **Single Slit**: Bending of light around edges or through narrow apertures.
- **Resolution**: Rayleigh criterion for the limit of optical instruments.

## Polarization
- **Transverse Nature**: Restriction of wave vibrations to a single plane.
- **Brewster's Law**: Relation between refractive index and polarizing angle.
        `
      },
      {
        id: TopicId.THERMODYNAMICS,
        slug: 'thermodynamics',
        name: 'Thermodynamics',
        description: 'Heat, work, and the laws governing energy transformation.',
        targetClass: ['Class 11'],
        theory: `
# Thermodynamics
Study of heat, work, temperature, and their relation to energy and physical properties.

## Laws of Thermodynamics
- **Zeroth Law**: Defines thermal equilibrium and temperature.
- **First Law**: Energy conservation; ΔU = Q - W.
- **Second Law**: Entropy of an isolated system always increases.

## Heat Engines
- **Carnot Cycle**: Theoretical ideal reversible cycle with maximum efficiency.
- **Efficiency**: Ratio of net work done to total heat absorbed.
- **Refrigerators**: Devices that transfer heat from cold to hot reservoirs.
        `
      },
      {
         id: TopicId.REFRACTION,
         slug: 'refraction-of-light',
  name: 'Refraction of Light',
  description: 'The bending of light as it passes across the boundary separating two media, governing optical density and total internal reflection.',
  targetClass: ['Class 11'],
  theory: `
# Refraction of Light
The phenomenon of the change in the path of light as it passes obliquely from one transparent medium to another is called refraction. This bending occurs because light travels at different speeds in different optical media.

## Laws of Refraction
- **First Law**: The incident ray, the refracted ray, and the normal to the interface at the point of incidence all lie in the same plane.
- **Second Law (Snell's Law)**: The ratio of the sine of the angle of incidence to the sine of the angle of refraction is constant for a given pair of media and a specific wavelength of light.
  sin(i) / sin(r) = n21

## Refractive Index
- **Absolute Refractive Index (n)**: The ratio of the speed of light in a vacuum (c) to the speed of light in the given medium (v).
  n = c / v
- **Relative Refractive Index (n21)**: The refractive index of medium 2 with respect to medium 1.
  n21 = n2 / n1 = v1 / v2
- **Optical Density**: A medium with a higher refractive index is optically denser. Light bends towards the normal when entering a denser medium and away from the normal when entering a rarer medium.

## Total Internal Reflection (TIR)
- **Critical Angle (ic)**: The angle of incidence in an optically denser medium for which the angle of refraction in the rarer medium is exactly 90°.
  sin(ic) = n_rarer / n_denser
- **Conditions for TIR**:
  1. The light ray must travel from an optically denser medium to an optically rarer medium.
  2. The angle of incidence must exceed the critical angle of the interface (i > ic).
- **Applications**: Optical fibers, the brilliance of diamonds, mirages in deserts, and totally reflecting glass prisms.

## Real and Apparent Depth
An object placed in a denser medium (like water), when viewed from a rarer medium (like air), appears to be raised due to refraction.
- **Formula**: n = Real Depth / Apparent Depth
- **Apparent Shift**: The apparent rise of the object is given by:
  Shift = Real Depth * (1 - 1/n)
`

       }
    ]
  },
  {
    id: SubjectId.MATH,
    slug: 'math',
    name: 'Mathematics',
    icon: 'Calculator',
    color: 'indigo',
    targetClass: ['Class 9', 'Class 10', 'Class 11', 'Class 12'],
    topics: [
      {
        id: TopicId.VECTOR_CALCULUS,
        slug: 'vector_calculus',
        name: 'Vector Algebra',
        description: 'Visualize 3D vectors, cross products, and orthogonal planes.',
        targetClass: ['Class 12'],
        theory: `
# Vector Cross Product
In 3D space, the cross product of two vectors **A** and **B** is a new vector **C** that is perfectly perpendicular (90 degrees) to both of them.

## Geometric Properties
- **Direction**: Determined by the **Right-Hand Rule**. If you curl your fingers from A to B, your thumb points in the direction of the Cross Product.
- **Magnitude**: The length of the resulting vector represents the area of the parallelogram formed by vectors A and B.
- **Formula**: **A × B = |A| |B| sin(θ) n**

## CSE Applications
This is the backbone of 3D lighting! It is used to calculate "surface normals" to determine how light bounces off a 3D model.
      `
      },
      {
        id: TopicId.PI_APPROXIMATION,
        slug: 'pi_approximation',
        name: 'Approximating Pi',
        description: 'Use the Archimedes method to calculate π by increasing polygon sides.',
        targetClass: ['Class 10'],
        theory: `
# Archimedes' Method
Archimedes discovered that you could find the value of **π** by "trapping" a circle between two polygons.

## The Limit Concept
- A **Hexagon** (n = 6) is a poor approximation of a circle.
- A **Myriagon** (n = 10,000) is almost indistinguishable from a circle.
- As the number of sides (n) approaches infinity, the ratio of the Perimeter to the Diameter approaches **π**.

## The Calculation
For a circle with radius r = 1:

**Perimeter = n × sin(180/n) × 2**

As n approaches infinity, **Perimeter → 2π**.
  `
      },
      {
        id: TopicId.COMPLEX_NUMBERS,
        slug: 'complex_numbers',
        name: 'Complex Numbers & Rotation',
        description: 'Explore the Argand plane and watch how multiplying by imaginary numbers rotates space.',
        targetClass: ['Class 11'],
        theory: `
# The Argand Plane
A complex number like **Z = a + bi** has two parts: a Real part (a) and an Imaginary part (b). Instead of a standard XY graph, we plot these on the **Argand Plane**, where the X-axis is Real and the Y-axis is Imaginary.

## The Magic of 'i'
The imaginary unit **i** is defined as the square root of -1 (**i² = -1**). 
But geometrically, multiplying any number by **i** does exactly one thing: it rotates that number perfectly **90 degrees counter-clockwise** around the origin!

* 1 × i = **i** (90° rotation)
* i × i = **-1** (180° rotation)
* -1 × i = **-i** (270° rotation)
* -i × i = **1** (360° back to the start)

## CSE Application
Complex numbers are the mathematical engine behind signal processing (Fourier Transforms). Every time your phone compresses an MP3 file or processes a JPEG image, it is using complex numbers to analyze frequencies!
    `
      },
      {
        id: TopicId.PYTHAGORAS_THEOREM,
        slug: 'pythagoras_theorem',
        name: 'Pythagorean Theorem',
        description: 'Adjust the base and height of a triangle to visualize how the hypotenuse is calculated.',
        targetClass: ['Class 9'],
        theory: `
# The Pythagorean Theorem
In any right-angled triangle, the square of the longest side (the hypotenuse) is equal to the sum of the squares of the other two sides.

## Differential Calculus
- **Limits**: Behavior of a function as it approaches a specific input.
- **Derivative**: Represents the instantaneous rate of change (slope of tangent).
- **Chain Rule**: Differentiation of composite functions.

## Integral Calculus
- **Definite Integral**: Represents the net area under a curve.
- **Indefinite Integral**: Antiderivative of a function.
- **Fundamental Theorem**: Connects differentiation and integration.

## Applications
- **Optimization**: Finding maximum or minimum values of functions.
- **Related Rates**: Calculating changes in one variable relative to another.
        `
      },
      {
        id: TopicId.CALCULUS,
        slug: 'calculus',
        name: 'Calculus',
        description: 'Master derivatives, integrals, and the study of continuous change.',
        targetClass: ['Class 11', 'Class 12'],
        theory: `
# Calculus
The mathematical study of continuous change, encompassing limits, derivatives, and integrals.

## Differential Calculus
- **Limits**: Behavior of a function as it approaches a specific input.
- **Derivative**: Represents the instantaneous rate of change (slope of tangent).
- **Chain Rule**: Differentiation of composite functions.

## Integral Calculus
- **Definite Integral**: Represents the net area under a curve.
- **Indefinite Integral**: Antiderivative of a function.
- **Fundamental Theorem**: Connects differentiation and integration.

## Applications
- **Optimization**: Finding maximum or minimum values of functions.
- **Related Rates**: Calculating changes in one variable relative to another.
        `
      },
      {
        id: TopicId.PROBABILITY,
        slug: 'probability',
        name: 'Probability',
        description: 'The science of uncertainty and data analysis.',
        targetClass: ['Class 10', 'Class 12'],
        theory: `
# Probability
The branch of mathematics concerning numerical descriptions of how likely an event is to occur.

## Basic Concepts
- **Sample Space**: The set of all possible outcomes of an experiment.
- **Events**: Subsets of the sample space (Simple, Compound, Independent).
- **Classical Definition**: P(E) = Number of favorable outcomes / Total outcomes.

## Conditional Probability
- **Bayes' Theorem**: Describes the probability of an event based on prior knowledge.
- **Multiplication Rule**: Probability of both events A and B occurring.

## Distributions
- **Binomial**: Probability of 'k' successes in 'n' independent trials.
- **Normal**: Bell-shaped curve representing continuous random variables.
        `
      },
      {
        id: TopicId.TRIGONOMETRY,
        slug: 'trigonometry',
        name: 'Trigonometry',
        description: 'Relationships between side lengths and angles of triangles.',
        targetClass: ['Class 10', 'Class 11'],
        theory: `
# Trigonometry
Study of the relationships involving lengths and angles of triangles.

## Functions
- **Sine (sin)**: Opposite / Hypotenuse.
- **Cosine (cos)**: Adjacent / Hypotenuse.
- **Tangent (tan)**: Opposite / Adjacent.

## Identities
- **Pythagorean**: sin²θ + cos²θ = 1.
- **Double Angle**: sin(2θ) = 2sinθcosθ.
- **Addition Formulas**: sin(A+B) = sinAcosB + cosAsinB.

## Graphs
- **Amplitude**: Maximum displacement from the x-axis.
- **Period**: Length of one complete cycle of the function.
        `
      },
      {
        id: TopicId.LINEAR_ALGEBRA,
        slug: 'linear_algebra',
        name: 'Linear Algebra',
        description: 'Study of vectors, matrices, and linear transformations.',
        targetClass: ['Class 11', 'Class 12'],
        theory: `
# Linear Algebra
The branch of mathematics concerning linear equations, vectors, and matrices.

## Vectors
- **Magnitude**: Length of the vector.
- **Dot Product**: Scalar result (A·B = |A||B|cosθ).
- **Cross Product**: Vector result perpendicular to both inputs.

## Matrices
- **Determinant**: Scalar value that can be computed from a square matrix.
- **Inverse**: Matrix that, when multiplied by the original, yields identity.
- **Eigenvalues**: Scalars associated with linear transformations.
        `
      }
    ]
  },
  {
    id: SubjectId.BIOLOGY,
    slug: 'biology',
    name: 'Biology',
    icon: 'Dna',
    color: 'emerald',
    targetClass: ['Class 11', 'Class 12'],
    topics: [
      {
        id: TopicId.MICROBIOLOGY,
        slug: 'microbiology',
        name: 'Microorganisms',
        description: 'Analyze the 3D structure and movement mechanisms of a single-celled bacterium.',
        targetClass: ['Class 11'],
        theory: `
# Microbiology
The study of microscopic organisms, such as bacteria, viruses, archaea, fungi and protozoa.

## Bacteria
- **Structure**: Prokaryotic cells with various shapes (cocci, bacilli, spirilla).
- **Function**: Roles in decomposition, nitrogen fixation, and disease.

## Viruses
- **Nature**: Non-living infectious agents that require a host cell to replicate.
- **Reproduction**: Lytic and lysogenic cycles.
        `
      },
      {
        id: TopicId.CELL_BIOLOGY,
        slug: 'cell_biology',
        name: 'Cellular Anatomy',
        description: 'Explore a 3D cross-section of a eukaryotic cell and its organelles.',
        targetClass: ['Class 11'],
        theory: `
# Cell Biology
The fundamental unit of life; studying structural and functional components.

## Organelles
- **Nucleus**: Contains genetic material (DNA); controls cellular activities.
- **Mitochondria**: Site of ATP production via cellular respiration.
- **Ribosomes**: Protein synthesis machinery.
- **Endoplasmic Reticulum**: Protein (rough) and lipid (smooth) synthesis.

## Cell Division
- **Mitosis**: Process of equational division producing two identical daughter cells.
- **Meiosis**: Reductional division producing four genetically diverse gametes.

## Membrane Transport
- **Diffusion**: Movement of solutes from high to low concentration.
- **Osmosis**: Diffusion of water across a semi-permeable membrane.
- **Active Transport**: Energy-requiring movement against concentration gradient.
        `
      },
      {
        id: TopicId.GENETICS,
        slug: 'genetics',
        name: 'Genetics',
        description: 'Study of genes, genetic variation, and heredity.',
        targetClass: ['Class 12'],
        theory: `
# Genetics
The study of heredity and the variation of inherited characteristics.

## Mendelian Principles
- **Law of Dominance**: Dominant alleles mask recessive ones in heterozygotes.
- **Law of Segregation**: Allele pairs separate during gamete formation.
- **Independent Assortment**: Genes for different traits segregate independently.

## DNA Structure
- **Double Helix**: Two anti-parallel strands of nucleotides.
- **Base Pairing**: Adenine-Thymine (A-T) and Guanine-Cytosine (G-C).

## Biotechnology
- **PCR**: Technique to amplify small segments of DNA.
- **CRISPR**: Tool for precise gene editing and modification.
        `
      },
      {
        id: TopicId.PLANT_PHYSIOLOGY,
        slug: 'plant_physiology',
        name: 'Plant Physiology',
        description: 'Functional processes occurring in plants.',
        targetClass: ['Class 11'],
        theory: `
# Plant Physiology
Study of plant function, including photosynthesis and nutrient transport.

## Photosynthesis
- **Light Reaction**: Occurs in thylakoids; produces ATP and NADPH.
- **Calvin Cycle**: Occurs in stroma; fixes CO₂ into glucose.

## Transport
- **Xylem**: Conducts water and minerals from roots to leaves.
- **Phloem**: Transports organic nutrients (sugars) throughout the plant.
- **Transpiration**: Evaporation of water from leaf stomata.

## Hormones
- **Auxins**: Promote cell elongation and apical dominance.
- **Gibberellins**: Stimulate stem growth and seed germination.
        `
      },
      {
        id: TopicId.HUMAN_REPRODUCTION,
        slug: 'human_reproduction',
        name: 'Human Reproduction',
        description: 'Biological processes of human life cycle.',
        targetClass: ['Class 12'],
        theory: `
# Human Reproduction
The process of producing offspring through sexual reproduction.

## Reproductive Systems
- **Male**: Production of sperm in testes and delivery via ducts.
- **Female**: Production of ova in ovaries and gestation in the uterus.

## Gametogenesis
- **Spermatogenesis**: Continuous production of sperm in males.
- **Oogenesis**: Cyclic production of mature eggs in females.

## Embryonic Development
- **Fertilization**: Fusion of sperm and egg to form a zygote.
- **Implantation**: Attachment of the blastocyst to the uterine wall.
- **Gestation**: The 9-month period of fetal development.
        `
      },
    ]
  }
];

// Full 1-118 Periodic Table Dataset
export const ELEMENTS: ElementData[] = [
  { number: 1, symbol: 'H', name: 'Hydrogen', mass: 1.008, category: 'Nonmetal', electrons: [1], discovery: '1766', color: '#3b82f6', config: '1s¹', radius: 37, ionization: 1312, electronegativity: 2.20, period: 1, group: 1, summary: 'The lightest element and most abundant chemical substance in the universe.' },
  { number: 2, symbol: 'He', name: 'Helium', mass: 4.0026, category: 'Noble Gas', electrons: [2], discovery: '1868', color: '#f59e0b', config: '1s²', radius: 31, ionization: 2372, electronegativity: 0, period: 1, group: 18, summary: 'A colorless, odorless, tasteless, non-toxic, inert, monatomic gas.' },
  { number: 3, symbol: 'Li', name: 'Lithium', mass: 6.94, category: 'Alkali Metal', electrons: [2, 1], discovery: '1817', color: '#ef4444', config: '[He] 2s¹', radius: 152, ionization: 520, electronegativity: 0.98, period: 2, group: 1, summary: 'A soft, silvery-white alkali metal.' },
  { number: 4, symbol: 'Be', name: 'Beryllium', mass: 9.0122, category: 'Alkaline Earth Metal', electrons: [2, 2], discovery: '1798', color: '#10b981', config: '[He] 2s²', radius: 112, ionization: 900, electronegativity: 1.57, period: 2, group: 2, summary: 'A steel-gray, strong, lightweight and brittle alkaline earth metal.' },
  { number: 5, symbol: 'B', name: 'Boron', mass: 10.81, category: 'Metalloid', electrons: [2, 3], discovery: '1808', color: '#8b5cf6', config: '[He] 2s² 2p¹', radius: 88, ionization: 801, electronegativity: 2.04, period: 2, group: 13, summary: 'A metalloid element, found entirely in combination in various minerals.' },
  { number: 6, symbol: 'C', name: 'Carbon', mass: 12.011, category: 'Nonmetal', electrons: [2, 4], discovery: 'Ancient', color: '#4b5563', config: '[He] 2s² 2p²', radius: 77, ionization: 1086, electronegativity: 2.55, period: 2, group: 14, summary: 'Nonmetallic and tetravalent—making four electrons available to form covalent chemical bonds.' },
  { number: 7, symbol: 'N', name: 'Nitrogen', mass: 14.007, category: 'Nonmetal', electrons: [2, 5], discovery: '1772', color: '#3b82f6', config: '[He] 2s² 2p³', radius: 70, ionization: 1402, electronegativity: 3.04, period: 2, group: 15, summary: 'A chemical element that at standard temperature and pressure is a colorless gas.' },
  { number: 8, symbol: 'O', name: 'Oxygen', mass: 15.999, category: 'Nonmetal', electrons: [2, 6], discovery: '1774', color: '#ef4444', config: '[He] 2s² 2p⁴', radius: 66, ionization: 1314, electronegativity: 3.44, period: 2, group: 16, summary: 'The third-most abundant element in the universe, after hydrogen and helium.' },
  { number: 9, symbol: 'F', name: 'Fluorine', mass: 18.998, category: 'Halogen', electrons: [2, 7], discovery: '1886', color: '#10b981', config: '[He] 2s² 2p⁵', radius: 64, ionization: 1681, electronegativity: 3.98, period: 2, group: 17, summary: 'The most electronegative element and is extremely reactive.' },
  { number: 10, symbol: 'Ne', name: 'Neon', mass: 20.180, category: 'Noble Gas', electrons: [2, 8], discovery: '1898', color: '#f59e0b', config: '[He] 2s² 2p⁶', radius: 58, ionization: 2081, electronegativity: 0, period: 2, group: 18, summary: 'A noble gas. Neon is chemically inert.' },
  { number: 11, symbol: 'Na', name: 'Sodium', mass: 22.990, category: 'Alkali Metal', electrons: [2, 8, 1], discovery: '1807', color: '#ef4444', config: '[Ne] 3s¹', radius: 186, ionization: 496, electronegativity: 0.93, period: 3, group: 1, summary: 'A soft, silvery-white, highly reactive metal.' },
  { number: 12, symbol: 'Mg', name: 'Magnesium', mass: 24.305, category: 'Alkaline Earth Metal', electrons: [2, 8, 2], discovery: '1755', color: '#10b981', config: '[Ne] 3s²', radius: 160, ionization: 738, electronegativity: 1.31, period: 3, group: 2, summary: 'A shiny gray solid.' },
  { number: 13, symbol: 'Al', name: 'Aluminium', mass: 26.982, category: 'Post-transition Metal', electrons: [2, 8, 3], discovery: '1825', color: '#6366f1', config: '[Ne] 3s² 3p¹', radius: 143, ionization: 578, electronegativity: 1.61, period: 3, group: 13, summary: 'A silvery-white, soft metal.' },
  { number: 14, symbol: 'Si', name: 'Silicon', mass: 28.085, category: 'Metalloid', electrons: [2, 8, 4], discovery: '1823', color: '#8b5cf6', config: '[Ne] 3s² 3p²', radius: 111, ionization: 786, electronegativity: 1.90, period: 3, group: 14, summary: 'A hard, brittle crystalline solid.' },
  { number: 15, symbol: 'P', name: 'Phosphorus', mass: 30.974, category: 'Nonmetal', electrons: [2, 8, 5], discovery: '1669', color: '#4b5563', config: '[Ne] 3s² 3p³', radius: 106, ionization: 1012, electronegativity: 2.19, period: 3, group: 15, summary: 'Highly reactive element.' },
  { number: 16, symbol: 'S', name: 'Sulfur', mass: 32.06, category: 'Nonmetal', electrons: [2, 8, 6], discovery: 'Ancient', color: '#fbbf24', config: '[Ne] 3s² 3p⁴', radius: 102, ionization: 1000, electronegativity: 2.58, period: 3, group: 16, summary: 'A bright yellow, brittle solid.' },
  { number: 17, symbol: 'Cl', name: 'Chlorine', mass: 35.45, category: 'Halogen', electrons: [2, 8, 7], discovery: '1774', color: '#10b981', config: '[Ne] 3s² 3p⁵', radius: 99, ionization: 1251, electronegativity: 3.16, period: 3, group: 17, summary: 'The second-lightest of the halogens.' },
  { number: 18, symbol: 'Ar', name: 'Argon', mass: 39.948, category: 'Noble Gas', electrons: [2, 8, 8], discovery: '1894', color: '#f59e0b', config: '[Ne] 3s² 3p⁶', radius: 97, ionization: 1521, electronegativity: 0, period: 3, group: 18, summary: 'The third-most abundant gas in Earth\'s atmosphere.' },
  { number: 19, symbol: 'K', name: 'Potassium', mass: 39.098, category: 'Alkali Metal', electrons: [2, 8, 8, 1], discovery: '1807', color: '#ef4444', config: '[Ar] 4s¹', radius: 227, ionization: 419, electronegativity: 0.82, period: 4, group: 1, summary: 'A silvery-white metal.' },
  { number: 20, symbol: 'Ca', name: 'Calcium', mass: 40.078, category: 'Alkaline Earth Metal', electrons: [2, 8, 8, 2], discovery: '1808', color: '#10b981', config: '[Ar] 4s²', radius: 197, ionization: 590, electronegativity: 1.00, period: 4, group: 2, summary: 'An alkaline earth metal.' },
  { number: 21, symbol: 'Sc', name: 'Scandium', mass: 44.956, category: 'Transition Metal', electrons: [2, 8, 9, 2], discovery: '1879', color: '#6366f1', config: '[Ar] 3d¹ 4s²', radius: 160, ionization: 633, electronegativity: 1.36, period: 4, group: 3, summary: 'A soft, silvery-white metallic element.' },
  { number: 22, symbol: 'Ti', name: 'Titanium', mass: 47.867, category: 'Transition Metal', electrons: [2, 8, 10, 2], discovery: '1791', color: '#8b5cf6', config: '[Ar] 3d² 4s²', radius: 140, ionization: 658, electronegativity: 1.54, period: 4, group: 4, summary: 'A strong, low-density, highly corrosion-resistant metal.' },
  { number: 23, symbol: 'V', name: 'Vanadium', mass: 50.941, category: 'Transition Metal', electrons: [2, 8, 11, 2], discovery: '1801', color: '#4b5563', config: '[Ar] 3d³ 4s²', radius: 135, ionization: 650, electronegativity: 1.63, period: 4, group: 5, summary: 'A hard, silvery-grey, ductile transition metal.' },
  { number: 24, symbol: 'Cr', name: 'Chromium', mass: 51.996, category: 'Transition Metal', electrons: [2, 8, 13, 1], discovery: '1797', color: '#fbbf24', config: '[Ar] 3d⁵ 4s¹', radius: 140, ionization: 653, electronegativity: 1.66, period: 4, group: 6, summary: 'A steely-grey, lustrous, hard and brittle metal.' },
  { number: 25, symbol: 'Mn', name: 'Manganese', mass: 54.938, category: 'Transition Metal', electrons: [2, 8, 13, 2], discovery: '1774', color: '#10b981', config: '[Ar] 3d⁵ 4s²', radius: 139, ionization: 717, electronegativity: 1.55, period: 4, group: 7, summary: 'A silvery-gray metal.' },
  { number: 26, symbol: 'Fe', name: 'Iron', mass: 55.845, category: 'Transition Metal', electrons: [2, 8, 14, 2], discovery: 'Ancient', color: '#f87171', config: '[Ar] 3d⁶ 4s²', radius: 138, ionization: 762, electronegativity: 1.83, period: 4, group: 8, summary: 'The most common element on Earth by mass.' },
  { number: 27, symbol: 'Co', name: 'Cobalt', mass: 58.933, category: 'Transition Metal', electrons: [2, 8, 15, 2], discovery: '1735', color: '#6366f1', config: '[Ar] 3d⁷ 4s²', radius: 135, ionization: 760, electronegativity: 1.88, period: 4, group: 9, summary: 'A hard, lustrous, silver-gray metal.' },
  { number: 28, symbol: 'Ni', name: 'Nickel', mass: 58.693, category: 'Transition Metal', electrons: [2, 8, 16, 2], discovery: '1751', color: '#8b5cf6', config: '[Ar] 3d⁸ 4s²', radius: 134, ionization: 737, electronegativity: 1.91, period: 4, group: 10, summary: 'A silvery-white lustrous metal with a slight golden tinge.' },
  { number: 29, symbol: 'Cu', name: 'Copper', mass: 63.546, category: 'Transition Metal', electrons: [2, 8, 18, 1], discovery: 'Ancient', color: '#fbbf24', config: '[Ar] 3d¹⁰ 4s¹', radius: 135, ionization: 745, electronegativity: 1.90, period: 4, group: 11, summary: 'A soft, malleable, and ductile metal with very high thermal and electrical conductivity.' },
  { number: 30, symbol: 'Zn', name: 'Zinc', mass: 65.38, category: 'Transition Metal', electrons: [2, 8, 18, 2], discovery: '1746', color: '#10b981', config: '[Ar] 3d¹⁰ 4s²', radius: 134, ionization: 906, electronegativity: 1.65, period: 4, group: 12, summary: 'A slightly brittle metal at room temperature and has a blue-silvery appearance when oxidation is removed.' },
  { number: 31, symbol: 'Ga', name: 'Gallium', mass: 69.723, category: 'Post-transition Metal', electrons: [2, 8, 18, 3], discovery: '1875', color: '#6366f1', config: '[Ar] 3d¹⁰ 4s² 4p¹', radius: 126, ionization: 579, electronegativity: 1.81, period: 4, group: 13, summary: 'A soft, silvery metal.' },
  { number: 32, symbol: 'Ge', name: 'Germanium', mass: 72.63, category: 'Metalloid', electrons: [2, 8, 18, 4], discovery: '1886', color: '#8b5cf6', config: '[Ar] 3d¹⁰ 4s² 4p²', radius: 125, ionization: 762, electronegativity: 2.01, period: 4, group: 14, summary: 'A lustrous, hard-brittle, grayish-white metalloid.' },
  { number: 33, symbol: 'As', name: 'Arsenic', mass: 74.922, category: 'Metalloid', electrons: [2, 8, 18, 5], discovery: '1250', color: '#4b5563', config: '[Ar] 3d¹⁰ 4s² 4p³', radius: 114, ionization: 947, electronegativity: 2.18, period: 4, group: 15, summary: 'A metalloid that has various allotropes.' },
  { number: 34, symbol: 'Se', name: 'Selenium', mass: 78.971, category: 'Nonmetal', electrons: [2, 8, 18, 6], discovery: '1817', color: '#fbbf24', config: '[Ar] 3d¹⁰ 4s² 4p⁴', radius: 103, ionization: 941, electronegativity: 2.55, period: 4, group: 16, summary: 'A nonmetal with properties that are intermediate between the elements above and below in the periodic table.' },
  { number: 35, symbol: 'Br', name: 'Bromine', mass: 79.904, category: 'Halogen', electrons: [2, 8, 18, 7], discovery: '1826', color: '#10b981', config: '[Ar] 3d¹⁰ 4s² 4p⁵', radius: 94, ionization: 1140, electronegativity: 2.96, period: 4, group: 17, summary: 'A fuming red-brown liquid at room temperature.' },
  { number: 36, symbol: 'Kr', name: 'Krypton', mass: 83.798, category: 'Noble Gas', electrons: [2, 8, 18, 8], discovery: '1898', color: '#f59e0b', config: '[Ar] 3d¹⁰ 4s² 4p⁶', radius: 88, ionization: 1350, electronegativity: 0, period: 4, group: 18, summary: 'A colorless, odorless, tasteless noble gas.' },
  { number: 37, symbol: 'Rb', name: 'Rubidium', mass: 85.467, category: 'Alkali Metal', electrons: [2, 8, 18, 8, 1], discovery: '1861', color: '#ef4444', config: '[Kr] 5s¹', radius: 235, ionization: 403, electronegativity: 0.82, period: 5, group: 1, summary: 'A soft, silvery-white metallic element.' },
  { number: 38, symbol: 'Sr', name: 'Strontium', mass: 87.62, category: 'Alkaline Earth Metal', electrons: [2, 8, 18, 8, 2], discovery: '1790', color: '#10b981', config: '[Kr] 5s²', radius: 200, ionization: 550, electronegativity: 0.95, period: 5, group: 2, summary: 'A soft silver-white yellowish metallic element.' },
  { number: 39, symbol: 'Y', name: 'Yttrium', mass: 88.906, category: 'Transition Metal', electrons: [2, 8, 18, 9, 2], discovery: '1794', color: '#6366f1', config: '[Kr] 4d¹ 5s²', radius: 180, ionization: 600, electronegativity: 1.22, period: 5, group: 3, summary: 'A silvery-metallic transition metal.' },
  { number: 40, symbol: 'Zr', name: 'Zirconium', mass: 91.224, category: 'Transition Metal', electrons: [2, 8, 18, 10, 2], discovery: '1789', color: '#8b5cf6', config: '[Kr] 4d² 5s²', radius: 160, ionization: 640, electronegativity: 1.33, period: 5, group: 4, summary: 'A lustrous, grey-white, strong transition metal.' },
  { number: 41, symbol: 'Nb', name: 'Niobium', mass: 92.906, category: 'Transition Metal', electrons: [2, 8, 18, 12, 1], discovery: '1801', color: '#4b5563', config: '[Kr] 4d⁴ 5s¹', radius: 145, ionization: 652, electronegativity: 1.6, period: 5, group: 5, summary: 'A soft, grey, ductile transition metal.' },
  { number: 42, symbol: 'Mo', name: 'Molybdenum', mass: 95.95, category: 'Transition Metal', electrons: [2, 8, 18, 13, 1], discovery: '1778', color: '#fbbf24', config: '[Kr] 4d⁵ 5s¹', radius: 145, ionization: 684, electronegativity: 2.16, period: 5, group: 6, summary: 'A silvery metal with a gray cast.' },
  { number: 43, symbol: 'Tc', name: 'Technetium', mass: 98, category: 'Transition Metal', electrons: [2, 8, 18, 13, 2], discovery: '1937', color: '#10b981', config: '[Kr] 4d⁵ 5s²', radius: 136, ionization: 702, electronegativity: 1.9, period: 5, group: 7, summary: 'The lightest element whose isotopes are all radioactive.' },
  { number: 44, symbol: 'Ru', name: 'Ruthenium', mass: 101.07, category: 'Transition Metal', electrons: [2, 8, 18, 15, 1], discovery: '1844', color: '#6366f1', config: '[Kr] 4d⁷ 5s¹', radius: 134, ionization: 710, electronegativity: 2.2, period: 5, group: 8, summary: 'A rare transition metal belonging to the platinum group.' },
  { number: 45, symbol: 'Rh', name: 'Rhodium', mass: 102.91, category: 'Transition Metal', electrons: [2, 8, 18, 16, 1], discovery: '1803', color: '#8b5cf6', config: '[Kr] 4d⁸ 5s¹', radius: 134, ionization: 719, electronegativity: 2.28, period: 5, group: 9, summary: 'A rare, silvery-white, hard, corrosion-resistant transition metal.' },
  { number: 46, symbol: 'Pd', name: 'Palladium', mass: 106.42, category: 'Transition Metal', electrons: [2, 8, 18, 18], discovery: '1803', color: '#4b5563', config: '[Kr] 4d¹⁰', radius: 137, ionization: 804, electronegativity: 2.20, period: 5, group: 10, summary: 'A rare and lustrous silvery-white metal.' },
  { number: 47, symbol: 'Ag', name: 'Silver', mass: 107.87, category: 'Transition Metal', electrons: [2, 8, 18, 18, 1], discovery: 'Ancient', color: '#fbbf24', config: '[Kr] 4d¹⁰ 5s¹', radius: 144, ionization: 731, electronegativity: 1.93, period: 5, group: 11, summary: 'A soft, white, lustrous transition metal.' },
  { number: 48, symbol: 'Cd', name: 'Cadmium', mass: 112.41, category: 'Transition Metal', electrons: [2, 8, 18, 18, 2], discovery: '1817', color: '#10b981', config: '[Kr] 4d¹⁰ 5s²', radius: 151, ionization: 867, electronegativity: 1.69, period: 5, group: 12, summary: 'A soft, bluish-white metal.' },
  { number: 49, symbol: 'In', name: 'Indium', mass: 114.82, category: 'Post-transition Metal', electrons: [2, 8, 18, 18, 3], discovery: '1863', color: '#6366f1', config: '[Kr] 4d¹⁰ 5s² 5p¹', radius: 156, ionization: 558, electronegativity: 1.78, period: 5, group: 13, summary: 'A post-transition metal that is very soft and malleable.' },
  { number: 50, symbol: 'Sn', name: 'Tin', mass: 118.71, category: 'Post-transition Metal', electrons: [2, 8, 18, 18, 4], discovery: 'Ancient', color: '#8b5cf6', config: '[Kr] 4d¹⁰ 5s² 5p²', radius: 145, ionization: 708, electronegativity: 1.96, period: 5, group: 14, summary: 'A post-transition metal known for its malleability and resistance to corrosion.' },
  { number: 51, symbol: 'Sb', name: 'Antimony', mass: 121.76, category: 'Metalloid', electrons: [2, 8, 18, 18, 5], discovery: 'Ancient', color: '#4b5563', config: '[Kr] 4d¹⁰ 5s² 5p³', radius: 133, ionization: 834, electronegativity: 2.05, period: 5, group: 15, summary: 'A lustrous gray metalloid.' },
  { number: 52, symbol: 'Te', name: 'Tellurium', mass: 127.60, category: 'Metalloid', electrons: [2, 8, 18, 18, 6], discovery: '1782', color: '#fbbf24', config: '[Kr] 4d¹⁰ 5s² 5p⁴', radius: 123, ionization: 869, electronegativity: 2.1, period: 5, group: 16, summary: 'A brittle, mildly toxic metalloid.' },
  { number: 53, symbol: 'I', name: 'Iodine', mass: 126.90, category: 'Halogen', electrons: [2, 8, 18, 18, 7], discovery: '1811', color: '#10b981', config: '[Kr] 4d¹⁰ 5s² 5p⁵', radius: 115, ionization: 1008, electronegativity: 2.66, period: 5, group: 17, summary: 'A lustrous, purple-black nonmetal.' },
  { number: 54, symbol: 'Xe', name: 'Xenon', mass: 131.29, category: 'Noble Gas', electrons: [2, 8, 18, 18, 8], discovery: '1898', color: '#f59e0b', config: '[Kr] 4d¹⁰ 5s² 5p⁶', radius: 108, ionization: 1170, electronegativity: 0, period: 5, group: 18, summary: 'A colorless, dense, odorless noble gas.' },
  { number: 55, symbol: 'Cs', name: 'Cesium', mass: 132.91, category: 'Alkali Metal', electrons: [2, 8, 18, 18, 8, 1], discovery: '1860', color: '#ef4444', config: '[Xe] 6s¹', radius: 260, ionization: 376, electronegativity: 0.79, period: 6, group: 1, summary: 'A soft, gold-colored metal.' },
  { number: 56, symbol: 'Ba', name: 'Barium', mass: 137.33, category: 'Alkaline Earth Metal', electrons: [2, 8, 18, 18, 8, 2], discovery: '1808', color: '#10b981', config: '[Xe] 6s²', radius: 215, ionization: 502, electronegativity: 0.89, period: 6, group: 2, summary: 'A soft, silvery alkaline earth metal.' },
  { number: 57, symbol: 'La', name: 'Lanthanum', mass: 138.91, category: 'Lanthanide', electrons: [2, 8, 18, 18, 9, 2], discovery: '1839', color: '#6366f1', config: '[Xe] 5d¹ 6s²', radius: 195, ionization: 538, electronegativity: 1.10, period: 6, group: 3, summary: 'A soft, ductile, silvery-white metal.' },
  { number: 58, symbol: 'Ce', name: 'Cerium', mass: 140.12, category: 'Lanthanide', electrons: [2, 8, 18, 19, 9, 2], discovery: '1839', color: '#8b5cf6', config: '[Xe] 4f¹ 5d¹ 6s²', radius: 185, ionization: 534, electronegativity: 1.12, period: 6, group: 3, summary: 'A soft, silvery, ductile metal.' },
  { number: 59, symbol: 'Pr', name: 'Praseodymium', mass: 140.91, category: 'Lanthanide', electrons: [2, 8, 18, 21, 8, 2], discovery: '1885', color: '#4b5563', config: '[Xe] 4f³ 6s²', radius: 185, ionization: 527, electronegativity: 1.13, period: 6, group: 3, summary: 'A soft, silvery, malleable and ductile metal.' },
  { number: 60, symbol: 'Nd', name: 'Neodymium', mass: 144.24, category: 'Lanthanide', electrons: [2, 8, 18, 22, 8, 2], discovery: '1885', color: '#fbbf24', config: '[Xe] 4f⁴ 6s²', radius: 181, ionization: 533, electronegativity: 1.14, period: 6, group: 3, summary: 'A soft silvery metal that tarnishes in air.' },
  { number: 61, symbol: 'Pm', name: 'Promethium', mass: 145, category: 'Lanthanide', electrons: [2, 8, 18, 23, 8, 2], discovery: '1945', color: '#10b981', config: '[Xe] 4f⁵ 6s²', radius: 183, ionization: 540, electronegativity: 1.13, period: 6, group: 3, summary: 'A radioactive metal that does not occur naturally on Earth.' },
  { number: 62, symbol: 'Sm', name: 'Samarium', mass: 150.36, category: 'Lanthanide', electrons: [2, 8, 18, 24, 8, 2], discovery: '1879', color: '#6366f1', config: '[Xe] 4f⁶ 6s²', radius: 180, ionization: 544, electronegativity: 1.17, period: 6, group: 3, summary: 'A silvery metal that oxidizes in air.' },
  { number: 63, symbol: 'Eu', name: 'Europium', mass: 151.96, category: 'Lanthanide', electrons: [2, 8, 18, 25, 8, 2], discovery: '1901', color: '#8b5cf6', config: '[Xe] 4f⁷ 6s²', radius: 198, ionization: 547, electronegativity: 1.2, period: 6, group: 3, summary: 'A soft, silvery metal that is the least abundant of the rare earth elements.' },
  { number: 64, symbol: 'Gd', name: 'Gadolinium', mass: 157.25, category: 'Lanthanide', electrons: [2, 8, 18, 25, 9, 2], discovery: '1880', color: '#4b5563', config: '[Xe] 4f⁷ 5d¹ 6s²', radius: 179, ionization: 593, electronegativity: 1.2, period: 6, group: 3, summary: 'A silvery-white metal that is ductile and malleable.' },
  { number: 65, symbol: 'Tb', name: 'Terbium', mass: 158.93, category: 'Lanthanide', electrons: [2, 8, 18, 27, 8, 2], discovery: '1843', color: '#fbbf24', config: '[Xe] 4f⁹ 6s²', radius: 177, ionization: 566, electronegativity: 1.2, period: 6, group: 3, summary: 'A silvery-white metal that is malleable and ductile.' },
  { number: 66, symbol: 'Dy', name: 'Dysprosium', mass: 162.50, category: 'Lanthanide', electrons: [2, 8, 18, 28, 8, 2], discovery: '1886', color: '#10b981', config: '[Xe] 4f¹⁰ 6s²', radius: 178, ionization: 573, electronegativity: 1.22, period: 6, group: 3, summary: 'A soft, silvery metal that is relatively stable in air.' },
  { number: 67, symbol: 'Ho', name: 'Holmium', mass: 164.93, category: 'Lanthanide', electrons: [2, 8, 18, 29, 8, 2], discovery: '1878', color: '#6366f1', config: '[Xe] 4f¹¹ 6s²', radius: 176, ionization: 581, electronegativity: 1.23, period: 6, group: 3, summary: 'A relatively soft and malleable silvery metal.' },
  { number: 68, symbol: 'Er', name: 'Erbium', mass: 167.26, category: 'Lanthanide', electrons: [2, 8, 18, 30, 8, 2], discovery: '1842', color: '#8b5cf6', config: '[Xe] 4f¹² 6s²', radius: 175, ionization: 589, electronegativity: 1.24, period: 6, group: 3, summary: 'A silvery-white metal that is malleable and ductile.' },
  { number: 69, symbol: 'Tm', name: 'Thulium', mass: 168.93, category: 'Lanthanide', electrons: [2, 8, 18, 31, 8, 2], discovery: '1879', color: '#4b5563', config: '[Xe] 4f¹³ 6s²', radius: 173, ionization: 597, electronegativity: 1.25, period: 6, group: 3, summary: 'A silvery-gray metal that is the least abundant of the lanthanides.' },
  { number: 70, symbol: 'Yb', name: 'Ytterbium', mass: 173.04, category: 'Lanthanide', electrons: [2, 8, 18, 32, 8, 2], discovery: '1878', color: '#fbbf24', config: '[Xe] 4f¹⁴ 6s²', radius: 222, ionization: 603, electronegativity: 1.1, period: 6, group: 3, summary: 'A soft, malleable, and ductile metal.' },
  { number: 71, symbol: 'Lu', name: 'Lutetium', mass: 174.97, category: 'Lanthanide', electrons: [2, 8, 18, 32, 9, 2], discovery: '1907', color: '#10b981', config: '[Xe] 4f¹⁴ 5d¹ 6s²', radius: 172, ionization: 524, electronegativity: 1.27, period: 6, group: 3, summary: 'A silvery-white metal that is the densest and hardest of the lanthanides.' },
  { number: 72, symbol: 'Hf', name: 'Hafnium', mass: 178.49, category: 'Transition Metal', electrons: [2, 8, 18, 32, 10, 2], discovery: '1923', color: '#6366f1', config: '[Xe] 4f¹⁴ 5d² 6s²', radius: 159, ionization: 658, electronegativity: 1.3, period: 6, group: 4, summary: 'A lustrous, silvery-gray metal.' },
  { number: 73, symbol: 'Ta', name: 'Tantalum', mass: 180.95, category: 'Transition Metal', electrons: [2, 8, 18, 32, 11, 2], discovery: '1802', color: '#8b5cf6', config: '[Xe] 4f¹⁴ 5d³ 6s²', radius: 146, ionization: 761, electronegativity: 1.5, period: 6, group: 5, summary: 'A hard, blue-gray metal that is highly corrosion-resistant.' },
  { number: 74, symbol: 'W', name: 'Tungsten', mass: 183.84, category: 'Transition Metal', electrons: [2, 8, 18, 32, 12, 2], discovery: '1783', color: '#4b5563', config: '[Xe] 4f¹⁴ 5d⁴ 6s²', radius: 139, ionization: 770, electronegativity: 2.36, period: 6, group: 6, summary: 'A hard, rare metal known for its high melting point.' },
  { number: 75, symbol: 'Re', name: 'Rhenium', mass: 186.21, category: 'Transition Metal', electrons: [2, 8, 18, 32, 13, 2], discovery: '1925', color: '#fbbf24', config: '[Xe] 4f¹⁴ 5d⁵ 6s²', radius: 137, ionization: 760, electronegativity: 1.9, period: 6, group: 7, summary: 'A silvery-white metal with one of the highest melting points.' },
  { number: 76, symbol: 'Os', name: 'Osmium', mass: 190.23, category: 'Transition Metal', electrons: [2, 8, 18, 32, 14, 2], discovery: '1803', color: '#10b981', config: '[Xe] 4f¹⁴ 5d⁶ 6s²', radius: 135, ionization: 840, electronegativity: 2.2, period: 6, group: 8, summary: 'A hard, brittle, bluish-white transition metal.' },
  { number: 77, symbol: 'Ir', name: 'Iridium', mass: 192.22, category: 'Transition Metal', electrons: [2, 8, 18, 32, 15, 2], discovery: '1803', color: '#6366f1', config: '[Xe] 4f¹⁴ 5d⁷ 6s²', radius: 136, ionization: 880, electronegativity: 2.20, period: 6, group: 9, summary: 'A very hard, brittle, silvery-white transition metal.' },
  { number: 78, symbol: 'Pt', name: 'Platinum', mass: 195.08, category: 'Transition Metal', electrons: [2, 8, 18, 32, 17, 1], discovery: '1735', color: '#8b5cf6', config: '[Xe] 4f¹⁴ 5d⁹ 6s¹', radius: 139, ionization: 870, electronegativity: 2.28, period: 6, group: 10, summary: 'A dense, malleable, ductile, highly unreactive, precious, silverish-white transition metal.' },
  { number: 79, symbol: 'Au', name: 'Gold', mass: 196.97, category: 'Transition Metal', electrons: [2, 8, 18, 32, 18, 1], discovery: 'Ancient', color: '#fbbf24', config: '[Xe] 4f¹⁴ 5d¹⁰ 6s¹', radius: 144, ionization: 890, electronegativity: 2.54, period: 6, group: 11, summary: 'A  soft, dense, yellow, malleable, and ductile metal.' },
  { number: 80, symbol: 'Hg', name: 'Mercury', mass: 200.59, category: 'Transition Metal', electrons: [2, 8, 18, 32, 18, 2], discovery: 'Ancient', color: '#10b981', config: '[Xe] 4f¹⁴ 5d¹⁰ 6s²', radius: 151, ionization: 1007, electronegativity: 2.00, period: 6, group: 12, summary: 'A heavy, silvery d-block element that is the only metallic element that is liquid at standard conditions for temperature and pressure.' },
  { number: 81, symbol: 'Tl', name: 'Thallium', mass: 204.38, category: 'Post-transition Metal', electrons: [2, 8, 18, 32, 18, 3], discovery: '1861', color: '#6366f1', config: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p¹', radius: 156, ionization: 589, electronegativity: 1.62, period: 6, group: 13, summary: 'A soft gray post-transition metal that resembles tin but is more malleable.' },
  { number: 82, symbol: 'Pb', name: 'Lead', mass: 207.2, category: 'Post-transition Metal', electrons: [2, 8, 18, 32, 18, 4], discovery: 'Ancient', color: '#8b5cf6', config: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p²', radius: 154, ionization: 715, electronegativity: 2.33, period: 6, group: 14, summary: 'A heavy metal that is denser than most common materials.' },
  { number: 83, symbol: 'Bi', name: 'Bismuth', mass: 208.98, category: 'Post-transition Metal', electrons: [2, 8, 18, 32, 18, 5], discovery: 'Ancient', color: '#4b5563', config: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p³', radius: 143, ionization: 703, electronegativity: 2.02, period: 6, group: 15, summary: 'A brittle metal with a silvery white color when freshly cut, but often has a pinkish tinge due to surface oxidation.' },
  { number: 84, symbol: 'Po', name: 'Polonium', mass: 209, category: 'Metalloid', electrons: [2, 8, 18, 32, 18, 6], discovery: '1898', color: '#fbbf24', config: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁴', radius: 135, ionization: 812, electronegativity: 2.0, period: 6, group: 16, summary: 'A rare and highly radioactive metalloid.' },
  { number: 85, symbol: 'At', name: 'Astatine', mass: 210, category: 'Halogen', electrons: [2, 8, 18, 32, 18, 7], discovery: '1940', color: '#10b981', config: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁵', radius: 127, ionization: 920, electronegativity: 2.2, period: 6, group: 17, summary: 'A rare and radioactive halogen.' },
  { number: 86, symbol: 'Rn', name: 'Radon', mass: 222, category: 'Noble Gas', electrons: [2, 8, 18, 32, 18, 8], discovery: '1900', color: '#f59e0b', config: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁶', radius: 120, ionization: 1037, electronegativity: 0, period: 6, group: 18, summary: 'A colorless, odorless, tasteless noble gas that is radioactive.' },
  { number: 87, symbol: 'Fr', name: 'Francium', mass: 223, category: 'Alkali Metal', electrons: [2, 8, 18, 32, 18, 8, 1], discovery: '1939', color: '#ef4444', config: '[Rn] 7s¹', radius: 270, ionization: 380, electronegativity: 0.7, period: 7, group: 1, summary: 'An extremely rare and highly radioactive metal.' },
  { number: 88, symbol: 'Ra', name: 'Radium', mass: 226, category: 'Alkaline Earth Metal', electrons: [2, 8, 18, 32, 18, 8, 2], discovery: '1898', color: '#10b981', config: '[Rn] 7s²', radius: 215, ionization: 509, electronegativity: 0.9, period: 7, group: 2, summary: 'A highly radioactive metal that glows faintly in the dark.' },
  { number: 89, symbol: 'Ac', name: 'Actinium', mass: 227, category: 'Actinide', electrons: [2, 8, 18, 32, 18, 9, 2], discovery: '1899', color: '#6366f1', config: '[Rn] 6d¹ 7s²', radius: 180, ionization: 499, electronegativity: 1.1, period: 7, group: 3, summary: 'A soft, silvery-white radioactive metal.' },
  { number: 90, symbol: 'Th', name: 'Thorium', mass: 232.04, category: 'Actinide', electrons: [2, 8, 18, 32, 18, 10, 2], discovery: '1829', color: '#8b5cf6', config: '[Rn] 6d² 7s²', radius: 175, ionization: 587, electronegativity: 1.3, period: 7, group: 3, summary: 'A weakly radioactive metallic element.' },
  { number: 91, symbol: 'Pa', name: 'Protactinium', mass: 231.04, category: 'Actinide', electrons: [2, 8, 18, 32, 20, 9, 2], discovery: '1913', color: '#4b5563', config: '[Rn] 5f² 6d¹ 7s²', radius: 175, ionization: 568, electronegativity: 1.5, period: 7, group: 3, summary: 'A dense, silvery-gray metal that is highly radioactive.' },
  { number: 92, symbol: 'U', name: 'Uranium', mass: 238.03, category: 'Actinide', electrons: [2, 8, 18, 32, 21, 9, 2], discovery: '1789', color: '#fbbf24', config: '[Rn] 5f³ 6d¹ 7s²', radius: 175, ionization: 597, electronegativity: 1.38, period: 7, group: 3, summary: 'A dense, silvery-gray metal that is weakly radioactive.' },
  { number: 93, symbol: 'Np', name: 'Neptunium', mass: 237, category: 'Actinide', electrons: [2, 8, 18, 32, 22, 9, 2], discovery: '1940', color: '#10b981', config: '[Rn] 5f⁴ 6d¹ 7s²', radius: 175, ionization: 604, electronegativity: 1.36, period: 7, group: 3, summary: 'A radioactive metal that is the first transuranic element.' },
  { number: 94, symbol: 'Pu', name: 'Plutonium', mass: 244, category: 'Actinide', electrons: [2, 8, 18, 32, 24, 8, 2], discovery: '1940', color: '#6366f1', config: '[Rn] 5f⁶ 7s²', radius: 175, ionization: 584, electronegativity: 1.28, period: 7, group: 3, summary: 'A radioactive metal used as a fuel in nuclear reactors and weapons.' },
  { number: 95, symbol: 'Am', name: 'Americium', mass: 243, category: 'Actinide', electrons: [2, 8, 18, 32, 25, 8, 2], discovery: '1944', color: '#8b5cf6', config: '[Rn] 5f⁷ 7s²', radius: 175, ionization: 578, electronegativity: 1.3, period: 7, group: 3, summary: 'A radioactive metal used in smoke detectors.' },
  { number: 96, symbol: 'Cm', name: 'Curium', mass: 247, category: 'Actinide', electrons: [2, 8, 18, 32, 25, 9, 2], discovery: '1944', color: '#4b5563', config: '[Rn] 5f⁷ 6d¹ 7s²', radius: 175, ionization: 581, electronegativity: 1.3, period: 7, group: 3, summary: 'A radioactive metal named after Marie and Pierre Curie.' },
  { number: 97, symbol: 'Bk', name: 'Berkelium', mass: 247, category: 'Actinide', electrons: [2, 8, 18, 32, 27, 8, 2], discovery: '1949', color: '#fbbf24', config: '[Rn] 5f⁹ 7s²', radius: 175, ionization: 601, electronegativity: 1.3, period: 7, group: 3, summary: 'A radioactive metal named after the city of Berkeley, California.' },
  { number: 98, symbol: 'Cf', name: 'Californium', mass: 251, category: 'Actinide', electrons: [2, 8, 18, 32, 28, 8, 2], discovery: '1950', color: '#10b981', config: '[Rn] 5f¹⁰ 7s²', radius: 175, ionization: 608, electronegativity: 1.3, period: 7, group: 3, summary: 'A radioactive metal named after the state of California.' },
  { number: 99, symbol: 'Es', name: 'Einsteinium', mass: 252, category: 'Actinide', electrons: [2, 8, 18, 32, 29, 8, 2], discovery: '1952', color: '#6366f1', config: '[Rn] 5f¹¹ 7s²', radius: 175, ionization: 619, electronegativity: 1.3, period: 7, group: 3, summary: 'A synthetic radioactive metal named after Albert Einstein.' },
  { number: 100, symbol: 'Fm', name: 'Fermium', mass: 257, category: 'Actinide', electrons: [2, 8, 18, 32, 30, 8, 2], discovery: '1952', color: '#8b5cf6', config: '[Rn] 5f¹² 7s²', radius: 175, ionization: 627, electronegativity: 1.3, period: 7, group: 3, summary: 'A synthetic radioactive metal named after Enrico Fermi.' },
  { number: 101, symbol: 'Md', name: 'Mendelevium', mass: 258, category: 'Actinide', electrons: [2, 8, 18, 32, 31, 8, 2], discovery: '1955', color: '#4b5563', config: '[Rn] 5f¹³ 7s²', radius: 175, ionization: 635, electronegativity: 1.3, period: 7, group: 3, summary: 'A synthetic radioactive metal named after Dmitri Mendeleev.' },
  { number: 102, symbol: 'No', name: 'Nobelium', mass: 259, category: 'Actinide', electrons: [2, 8, 18, 32, 32, 8, 2], discovery: '1958', color: '#fbbf24', config: '[Rn] 5f¹⁴ 7s²', radius: 175, ionization: 642, electronegativity: 1.3, period: 7, group: 3, summary: 'A synthetic radioactive metal named after Alfred Nobel.' },
  { number: 103, symbol: 'Lr', name: 'Lawrencium', mass: 262, category: 'Actinide', electrons: [2, 8, 18, 32, 32, 9, 2], discovery: '1961', color: '#10b981', config: '[Rn] 5f¹⁴ 6d¹ 7s²', radius: 175, ionization: 470, electronegativity: 1.3, period: 7, group: 3, summary: 'A synthetic radioactive metal named after Ernest O. Lawrence.' },
  { number: 104, symbol: 'Rf', name: 'Rutherfordium', mass: 267, category: 'Transition Metal', electrons: [2, 8, 18, 32, 32, 10, 2], discovery: '1969', color: '#6366f1', config: '[Rn] 5f¹⁴ 6d² 7s²', radius: 150, ionization: 580, electronegativity: 0, period: 7, group: 4, summary: 'A synthetic radioactive element named after Ernest Rutherford.' },
  { number: 105, symbol: 'Db', name: 'Dubnium', mass: 268, category: 'Transition Metal', electrons: [2, 8, 18, 32, 32, 11, 2], discovery: '1970', color: '#8b5cf6', config: '[Rn] 5f¹⁴ 6d³ 7s²', radius: 139, ionization: 0, electronegativity: 0, period: 7, group: 5, summary: 'A synthetic radioactive element named after Dubna, Russia.' },
  { number: 106, symbol: 'Sg', name: 'Seaborgium', mass: 271, category: 'Transition Metal', electrons: [2, 8, 18, 32, 32, 12, 2], discovery: '1974', color: '#4b5563', config: '[Rn] 5f¹⁴ 6d⁴ 7s²', radius: 132, ionization: 0, electronegativity: 0, period: 7, group: 6, summary: 'A synthetic radioactive element named after Glenn T. Seaborg.' },
  { number: 107, symbol: 'Bh', name: 'Bohrium', mass: 272, category: 'Transition Metal', electrons: [2, 8, 18, 32, 32, 13, 2], discovery: '1981', color: '#fbbf24', config: '[Rn] 5f¹⁴ 6d⁵ 7s²', radius: 128, ionization: 0, electronegativity: 0, period: 7, group: 7, summary: 'A synthetic radioactive element named after Niels Bohr.' },
  { number: 108, symbol: 'Hs', name: 'Hassium', mass: 270, category: 'Transition Metal', electrons: [2, 8, 18, 32, 32, 14, 2], discovery: '1984', color: '#10b981', config: '[Rn] 5f¹⁴ 6d⁶ 7s²', radius: 126, ionization: 0, electronegativity: 0, period: 7, group: 8, summary: 'A synthetic radioactive element named after the German state of Hesse.' },
  { number: 109, symbol: 'Mt', name: 'Meitnerium', mass: 276, category: 'Transition Metal', electrons: [2, 8, 18, 32, 32, 15, 2], discovery: '1982', color: '#6366f1', config: '[Rn] 5f¹⁴ 6d⁷ 7s²', radius: 121, ionization: 0, electronegativity: 0, period: 7, group: 9, summary: 'A synthetic radioactive element named after Lise Meitner.' },
  { number: 110, symbol: 'Ds', name: 'Darmstadtium', mass: 281, category: 'Transition Metal', electrons: [2, 8, 18, 32, 32, 17, 1], discovery: '1994', color: '#8b5cf6', config: '[Rn] 5f¹⁴ 6d⁹ 7s¹', radius: 118, ionization: 0, electronegativity: 0, period: 7, group: 10, summary: 'A synthetic radioactive element named after Darmstadt, Germany.' },
  { number: 111, symbol: 'Rg', name: 'Roentgenium', mass: 282, category: 'Transition Metal', electrons: [2, 8, 18, 32, 32, 18, 1], discovery: '1994', color: '#4b5563', config: '[Rn] 5f¹⁴ 6d¹⁰ 7s¹', radius: 113, ionization: 0, electronegativity: 0, period: 7, group: 11, summary: 'A synthetic radioactive element named after Wilhelm Conrad Röntgen.' },
  { number: 112, symbol: 'Cn', name: 'Copernicium', mass: 285, category: 'Transition Metal', electrons: [2, 8, 18, 32, 32, 18, 2], discovery: '1996', color: '#fbbf24', config: '[Rn] 5f¹⁴ 6d¹⁰ 7s²', radius: 122, ionization: 0, electronegativity: 0, period: 7, group: 12, summary: 'A synthetic radioactive element named after Nicolaus Copernicus.' },
  { number: 113, symbol: 'Nh', name: 'Nihonium', mass: 286, category: 'Post-transition Metal', electrons: [2, 8, 18, 32, 32, 18, 3], discovery: '2004', color: '#10b981', config: '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p¹', radius: 136, ionization: 0, electronegativity: 0, period: 7, group: 13, summary: 'A synthetic radioactive element named after Japan (Nihon).' },
  { number: 114, symbol: 'Fl', name: 'Flerovium', mass: 289, category: 'Post-transition Metal', electrons: [2, 8, 18, 32, 32, 18, 4], discovery: '1998', color: '#6366f1', config: '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p²', radius: 143, ionization: 0, electronegativity: 0, period: 7, group: 14, summary: 'A synthetic radioactive element named after the Flerov Laboratory of Nuclear Reactions.' },
  { number: 115, symbol: 'Mc', name: 'Moscovium', mass: 288, category: 'Post-transition Metal', electrons: [2, 8, 18, 32, 32, 18, 5], discovery: '2003', color: '#8b5cf6', config: '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p³', radius: 138, ionization: 0, electronegativity: 0, period: 7, group: 15, summary: 'A synthetic radioactive element named after Moscow Oblast.' },
  { number: 116, symbol: 'Lv', name: 'Livermorium', mass: 293, category: 'Post-transition Metal', electrons: [2, 8, 18, 32, 32, 18, 6], discovery: '2000', color: '#4b5563', config: '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁴', radius: 135, ionization: 0, electronegativity: 0, period: 7, group: 16, summary: 'A synthetic radioactive element named after the Lawrence Livermore National Laboratory.' },
  { number: 117, symbol: 'Ts', name: 'Tennessine', mass: 294, category: 'Halogen', electrons: [2, 8, 18, 32, 32, 18, 7], discovery: '2010', color: '#fbbf24', config: '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁵', radius: 120, ionization: 0, electronegativity: 0, period: 7, group: 17, summary: 'A synthetic radioactive element named after the state of Tennessee.' },
  { number: 118, symbol: 'Og', name: 'Oganesson', mass: 294, category: 'Noble Gas', electrons: [2, 8, 18, 32, 32, 18, 8], discovery: '2002', color: '#10b981', config: '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁶', radius: 116, ionization: 0, electronegativity: 0, period: 7, group: 18, summary: 'A synthetic radioactive element named after Yuri Oganessian.' },
];

export const MOLECULES: Molecule[] = [
  {
    formula: 'H2O',
    name: 'Water',
    centralAtom: 'O',
    atoms: [
      { symbol: 'H', pos: { x: 0.7, y: -0.6, z: 0.1 } },
      { symbol: 'H', pos: { x: -0.7, y: -0.6, z: 0.1 } },
    ],
    lonePairs: [
      { x: 0, y: 0.6, z: 0.75 },
      { x: 0, y: 0.6, z: -0.75 },
    ],
    realAngle: '104.5°',
    modelAngle: '109.5°',
  },
  {
    formula: 'CO2',
    name: 'Carbon Dioxide',
    centralAtom: 'C',
    atoms: [
      { symbol: 'O', pos: { x: 1, y: 0, z: 0 } },
      { symbol: 'O', pos: { x: -1, y: 0, z: 0 } },
    ],
    lonePairs: [],
    realAngle: '180°',
    modelAngle: '180°',
  },
  {
    formula: 'NH3',
    name: 'Ammonia',
    centralAtom: 'N',
    atoms: [
      { symbol: 'H', pos: { x: 0.9, y: -0.3, z: 0 } },
      { symbol: 'H', pos: { x: -0.45, y: -0.3, z: 0.78 } },
      { symbol: 'H', pos: { x: -0.45, y: -0.3, z: -0.78 } },
    ],
    lonePairs: [
      { x: 0, y: 1, z: 0 },
    ],
    realAngle: '107.0°',
    modelAngle: '109.5°',
  },
  {
    formula: 'CH4',
    name: 'Methane',
    centralAtom: 'C',
    atoms: [
      { symbol: 'H', pos: { x: 0, y: 1, z: 0 } },
      { symbol: 'H', pos: { x: 0.94, y: -0.33, z: 0 } },
      { symbol: 'H', pos: { x: -0.47, y: -0.33, z: 0.81 } },
      { symbol: 'H', pos: { x: -0.47, y: -0.33, z: -0.81 } },
    ],
    lonePairs: [],
    realAngle: '109.5°',
    modelAngle: '109.5°',
  },
  {
    formula: 'BF3',
    name: 'Boron Trifluoride',
    centralAtom: 'B',
    atoms: [
      { symbol: 'F', pos: { x: 0, y: 1, z: 0 } },
      { symbol: 'F', pos: { x: 0.86, y: -0.5, z: 0 } },
      { symbol: 'F', pos: { x: -0.86, y: -0.5, z: 0 } },
    ],
    lonePairs: [],
    realAngle: '120°',
    modelAngle: '120°',
  },
  {
    formula: 'SF6',
    name: 'Sulfur Hexafluoride',
    centralAtom: 'S',
    atoms: [
      { symbol: 'F', pos: { x: 0, y: 1.2, z: 0 } },
      { symbol: 'F', pos: { x: 0, y: -1.2, z: 0 } },
      { symbol: 'F', pos: { x: 1.2, y: 0, z: 0 } },
      { symbol: 'F', pos: { x: -1.2, y: 0, z: 0 } },
      { symbol: 'F', pos: { x: 0, y: 0, z: 1.2 } },
      { symbol: 'F', pos: { x: 0, y: 0, z: -1.2 } },
    ],
    lonePairs: [],
    realAngle: '90°, 180°',
    modelAngle: '90° (Octahedral)',
  },
  {
    formula: 'PCl5',
    name: 'Phosphorus Pentachloride',
    centralAtom: 'P',
    atoms: [
      { symbol: 'Cl', pos: { x: 0, y: 1.2, z: 0 } },
      { symbol: 'Cl', pos: { x: 0, y: -1.2, z: 0 } },
      { symbol: 'Cl', pos: { x: 1.2, y: 0, z: 0 } },
      { symbol: 'Cl', pos: { x: -1.2, y: 0, z: 0 } },
      { symbol: 'Cl', pos: { x: 0, y: 0, z: 1.2 } },
    ],
    lonePairs: [],
    realAngle: '90°, 120°',
    modelAngle: '90°, 120° (Trigonal Bipyramidal)',
  }
];
