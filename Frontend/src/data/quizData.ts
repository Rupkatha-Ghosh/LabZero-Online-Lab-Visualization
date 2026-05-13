export type Question = {
  question: string;
  options: string[];
  answer: string;
};

const shuffle = <T>(arr: T[]): T[] => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

// ======================
// 🧠 MATHEMATICS (ADVANCED)
// ======================
const mathPool: Question[] = [
  { question: "Derivative of x²?", options: ["2x","x","x²","1"], answer: "2x" },
  { question: "Integral of 1 dx?", options: ["x","1","0","x²"], answer: "x" },
  { question: "Limit of 1/x as x→∞?", options: ["0","∞","1","-1"], answer: "0" },
  { question: "Determinant of identity matrix?", options: ["1","0","n","-1"], answer: "1" },
  { question: "log₁₀(100)?", options: ["2","1","10","0"], answer: "2" },
  { question: "sin²θ + cos²θ =", options: ["1","0","2","θ"], answer: "1" },
  { question: "sec²θ - tan²θ =", options: ["1","0","2","θ"], answer: "1" },
  { question: "Derivative of sin x?", options: ["cos x","-cos x","sin x","-sin x"], answer: "cos x" },
  { question: "Integral of x dx?", options: ["x²/2","x²","2x","1"], answer: "x²/2" },
  { question: "Matrix inverse exists when?", options: ["det≠0","det=0","always","never"], answer: "det≠0" },
  { question: "Eigenvalues solve?", options: ["|A-λI|=0","Ax=0","A=0","none"], answer: "|A-λI|=0" },
  { question: "Derivative of e^x?", options: ["e^x","x","1","ln x"], answer: "e^x" },
  { question: "∫ cos x dx?", options: ["sin x","-sin x","cos x","-cos x"], answer: "sin x" },
  { question: "Value of π approx?", options: ["3.14","2.17","1.61","3.5"], answer: "3.14" },
  { question: "Quadratic roots formula?", options: ["(-b±√(b²-4ac))/2a","b²-4ac","-b/a","none"], answer: "(-b±√(b²-4ac))/2a" },
  { question: "Slope of horizontal line?", options: ["0","∞","1","-1"], answer: "0" },
  { question: "Slope of vertical line?", options: ["∞","0","1","-1"], answer: "∞" },
  { question: "Domain of √x?", options: ["x≥0","x≤0","all x","none"], answer: "x≥0" },
  { question: "Range of sin x?", options: ["[-1,1]","[0,1]","(-∞,∞)","[1,∞)"], answer: "[-1,1]" },
  { question: "cos²x - sin²x = ?", options: ["cos2x","sin2x","1","0"], answer: "cos2x" },
  { question: "log(a*b)?", options: ["log a + log b","log a - log b","ab","none"], answer: "log a + log b" },
  { question: "Probability max value?", options: ["1","0","∞","-1"], answer: "1" },
  { question: "Mean formula?", options: ["Σx/n","Σx","n/x","none"], answer: "Σx/n" },
  { question: "Vector magnitude?", options: ["√(x²+y²)","x+y","xy","none"], answer: "√(x²+y²)" },
  { question: "Derivative of x³?", options: ["3x²","x²","3x","x³"], answer: "3x²" },
  { question: "Integration of 0?", options: ["constant","0","1","x"], answer: "constant" },
  { question: "tan x = ?", options: ["sin/cos","cos/sin","1","0"], answer: "sin/cos" },
  { question: "Matrix multiplication possible when?", options: ["cols=rows","rows=rows","cols=cols","none"], answer: "cols=rows" },
  { question: "Determinant of 2x2?", options: ["ad-bc","ab+cd","a+b","none"], answer: "ad-bc" },
  { question: "lim x→0 sinx/x?", options: ["1","0","∞","-1"], answer: "1" },
  { question: "Even function example?", options: ["x²","x","sin x","tan x"], answer: "x²" },
  { question: "Derivative of ln x?", options: ["1/x","x","ln x","0"], answer: "1/x" },
  { question: "∫ e^x dx?", options: ["e^x","x","1","ln x"], answer: "e^x" },
  { question: "tan 45°?", options: ["1","0","-1","∞"], answer: "1" },
  { question: "cos 90°?", options: ["0","1","-1","∞"], answer: "0" },
  { question: "sin 90°?", options: ["0","1","-1","∞"], answer: "1" },
  { question: "Rank of zero matrix?", options: ["0","1","n","-1"], answer: "0" },

];




// ⚛️ PHYSICS (ADVANCED)
// ======================
const physicsPool: Question[] = [
  { question: "Unit of force?", options: ["Newton","Joule","Watt","Pascal"], answer: "Newton" },
  { question: "F = ?", options: ["ma","mv","m/a","a/m"], answer: "ma" },
  { question: "Work formula?", options: ["F×d","m×a","v/t","p×v"], answer: "F×d" },
  { question: "Power unit?", options: ["Watt","Joule","Volt","Ampere"], answer: "Watt" },
  { question: "Acceleration unit?", options: ["m/s²","m/s","km/h","N"], answer: "m/s²" },
  { question: "Gravitational force ∝ ?", options: ["1/r²","r²","r","1/r"], answer: "1/r²" },
  { question: "Speed of light?", options: ["3×10⁸","3×10⁶","3×10⁵","3×10⁷"], answer: "3×10⁸" },
  { question: "Momentum?", options: ["mv","ma","v/m","m/a"], answer: "mv" },
  { question: "Ohm's law?", options: ["V=IR","P=VI","F=ma","E=mc²"], answer: "V=IR" },
  { question: "Energy unit?", options: ["Joule","Watt","Newton","Volt"], answer: "Joule" },
  { question: "Unit of power?", options: ["Watt","Joule","Newton","Volt"], answer: "Watt" },
  { question: "Acceleration due to gravity?", options: ["9.8","10","8","12"], answer: "9.8" },
  { question: "Work done when force=0?", options: ["0","1","∞","depends"], answer: "0" },
  { question: "Kinetic energy formula?", options: ["½mv²","mv","ma","mgh"], answer: "½mv²" },
  { question: "Potential energy?", options: ["mgh","mv²","F×d","none"], answer: "mgh" },
  { question: "Frequency unit?", options: ["Hz","m","s","kg"], answer: "Hz" },
  { question: "Wave length symbol?", options: ["λ","μ","π","ω"], answer: "λ" },
  { question: "Voltage unit?", options: ["Volt","Ampere","Ohm","Watt"], answer: "Volt" },
  { question: "Current unit?", options: ["Ampere","Volt","Watt","Joule"], answer: "Ampere" },
  { question: "Resistance unit?", options: ["Ohm","Volt","Amp","Joule"], answer: "Ohm" },
  { question: "Ohm law graph?", options: ["Straight line","Curve","Circle","None"], answer: "Straight line" },
  { question: "Mirror type?", options: ["Concave","Convex","Plane","All"], answer: "All" },
  { question: "Light is?", options: ["Wave+particle","Only wave","Only particle","None"], answer: "Wave+particle" },
  { question: "Unit of energy?", options: ["Joule","Watt","Volt","Amp"], answer: "Joule" },
  { question: "Momentum unit?", options: ["kg m/s","kg","m/s","N"], answer: "kg m/s" },
  { question: "Sound speed depends on?", options: ["Medium","Mass","Force","Time"], answer: "Medium" },
  { question: "Refraction law?", options: ["Snell's law","Newton law","Ohm law","None"], answer: "Snell's law" },
  { question: "Angle of reflection?", options: ["= incidence","0","90","varies"], answer: "= incidence" },
  { question: "Thermal energy unit?", options: ["Joule","Watt","Kelvin","Amp"], answer: "Joule" },
  { question: "Heat transfer mode?", options: ["All","Radiation","Conduction","Convection"], answer: "All" },
  { question: "Lens formula?", options: ["1/f=1/v+1/u","f=uv","v=u+f","none"], answer: "1/f=1/v+1/u" },
  { question: "Wave speed?", options: ["fλ","f/λ","λ/f","none"], answer: "fλ" },
  { question: "Charge unit?", options: ["Coulomb","Ampere","Volt","Ohm"], answer: "Coulomb" },

 
];

// ======================
// 🧪 CHEMISTRY (ADVANCED)
// ======================
const chemistryPool: Question[] = [
  { question: "Atomic number represents?", options: ["Protons","Neutrons","Mass","Electrons"], answer: "Protons" },
  { question: "pH of neutral?", options: ["7","0","14","1"], answer: "7" },
  { question: "Oxidation = ?", options: ["loss of electrons","gain","neutral","none"], answer: "loss of electrons" },
  { question: "Reduction = ?", options: ["gain of electrons","loss","none","oxidation"], answer: "gain of electrons" },
  { question: "Avogadro number?", options: ["6.022×10²³","10²³","6×10²²","none"], answer: "6.022×10²³" },
  { question: "Electron discovered by?", options: ["Thomson","Bohr","Einstein","Rutherford"], answer: "Thomson" },
  { question: "Periodic law based on?", options: ["Atomic number","Mass","Volume","Density"], answer: "Atomic number" },
  { question: "Bond in NaCl?", options: ["Ionic","Covalent","Metallic","Hydrogen"], answer: "Ionic" },
  { question: "Covalent bond formed by?", options: ["Sharing","Transfer","Loss","Gain"], answer: "Sharing" },

  { question: "Hybridization of CH₄?", options: ["sp³","sp²","sp","dsp²"], answer: "sp³" },
  { question: "Strongest bond?", options: ["Triple","Double","Single","Ionic"], answer: "Triple" },
  { question: "pH < 7 means?", options: ["Acidic","Basic","Neutral","None"], answer: "Acidic" },
  { question: "pH > 7 means?", options: ["Basic","Acidic","Neutral","None"], answer: "Basic" },
  { question: "NaCl type?", options: ["Ionic","Covalent","Metallic","None"], answer: "Ionic" },
  { question: "Water formula?", options: ["H2O","CO2","O2","H2"], answer: "H2O" },
  { question: "Gas constant?", options: ["R","K","G","P"], answer: "R" },
  { question: "Periodic table rows?", options: ["Periods","Groups","Blocks","None"], answer: "Periods" },
  { question: "Group meaning?", options: ["Columns","Rows","Blocks","None"], answer: "Columns" },
  { question: "Noble gases?", options: ["Stable","Reactive","Metal","Liquid"], answer: "Stable" },
  { question: "Valency of Na?", options: ["1","2","3","0"], answer: "1" },
  { question: "Valency of O?", options: ["2","1","3","0"], answer: "2" },
  { question: "Strong acid example?", options: ["HCl","H2O","NaOH","CO2"], answer: "HCl" },
  { question: "Base example?", options: ["NaOH","HCl","CO2","O2"], answer: "NaOH" },
  { question: "Electronegativity?", options: ["Attract electrons","Lose","Neutral","None"], answer: "Attract electrons" },
  { question: "Isotope differs in?", options: ["Neutrons","Protons","Electrons","None"], answer: "Neutrons" },
  { question: "Mole concept?", options: ["6.022×10²³","10²³","1","0"], answer: "6.022×10²³" },
  { question: "Organic chemistry studies?", options: ["Carbon","Metal","Gas","Liquid"], answer: "Carbon" },
  { question: "Bond angle CH4?", options: ["109.5","120","180","90"], answer: "109.5" },
  { question: "Catalyst does?", options: ["Speeds reaction","Stops","Slows","None"], answer: "Speeds reaction" },
  { question: "Exothermic releases?", options: ["Heat","Cold","Light only","None"], answer: "Heat" },
  { question: "Endothermic absorbs?", options: ["Heat","Cold","Energy","None"], answer: "Heat" },
];

// ======================
// 🧬 BIOLOGY (ADVANCED)
// ======================
const biologyPool: Question[] = [
  { question: "Powerhouse of cell?", options: ["Mitochondria","Nucleus","Ribosome","Golgi"], answer: "Mitochondria" },
  { question: "DNA full form?", options: ["Deoxyribonucleic Acid","RNA","None","Acid"], answer: "Deoxyribonucleic Acid" },
  { question: "Photosynthesis occurs in?", options: ["Chloroplast","Nucleus","Mitochondria","Ribosome"], answer: "Chloroplast" },
  { question: "Basic unit of life?", options: ["Cell","Atom","Organ","Tissue"], answer: "Cell" },
  { question: "Protein synthesis site?", options: ["Ribosome","Nucleus","Golgi","Mitochondria"], answer: "Ribosome" },
  { question: "Human chromosome count?", options: ["46","23","44","48"], answer: "46" },
  { question: "Enzyme nature?", options: ["Protein","Carbohydrate","Fat","DNA"], answer: "Protein" },
  { question: "Respiration produces?", options: ["ATP","DNA","RNA","Glucose"], answer: "ATP" },
  { question: "Blood group universal donor?", options: ["O","A","B","AB"], answer: "O" },

  { question: "Genetic unit?", options: ["Gene","Cell","Chromosome","Protein"], answer: "Gene" },
  { question: "Evolution theory by?", options: ["Darwin","Newton","Einstein","Mendel"], answer: "Darwin" },
  // 🔹 ADDITIONAL BIOLOGY QUESTIONS
  { question: "Cell discovered by?", options: ["Hooke","Newton","Darwin","Mendel"], answer: "Hooke" },
  { question: "Plant cell wall?", options: ["Cellulose","Protein","Fat","DNA"], answer: "Cellulose" },
  { question: "Chlorophyll color?", options: ["Green","Red","Blue","Yellow"], answer: "Green" },
  { question: "Photosynthesis uses?", options: ["CO2","O2","N2","H2"], answer: "CO2" },
  { question: "Respiration needs?", options: ["Oxygen","CO2","Nitrogen","None"], answer: "Oxygen" },
  { question: "Blood is?", options: ["Tissue","Cell","Organ","None"], answer: "Tissue" },
  { question: "Heart pumps?", options: ["Blood","Air","Water","None"], answer: "Blood" },
  { question: "Brain part?", options: ["Cerebrum","Liver","Kidney","Lung"], answer: "Cerebrum" },
  { question: "DNA location?", options: ["Nucleus","Ribosome","Cytoplasm","Membrane"], answer: "Nucleus" },
  { question: "RNA full form?", options: ["Ribonucleic Acid","DNA","Protein","None"], answer: "Ribonucleic Acid" },
  { question: "Enzyme function?", options: ["Catalyst","Energy","Structure","None"], answer: "Catalyst" },
  { question: "Digestion starts in?", options: ["Mouth","Stomach","Intestine","Liver"], answer: "Mouth" },
  { question: "Lungs function?", options: ["Gas exchange","Digestion","Circulation","None"], answer: "Gas exchange" },
  { question: "Neuron transmits?", options: ["Signal","Blood","Oxygen","Food"], answer: "Signal" },
  { question: "Immunity protects from?", options: ["Disease","Heat","Cold","Water"], answer: "Disease" },
  { question: "Protein made of?", options: ["Amino acids","DNA","Sugar","Fat"], answer: "Amino acids" },
  { question: "Human organ system count?", options: ["11","10","12","9"], answer: "11" },
  { question: "Kidney function?", options: ["Filter blood","Pump blood","Digest","None"], answer: "Filter blood" },
  { question: "Liver function?", options: ["Detox","Pump","Digest only","None"], answer: "Detox" },
  { question: "Muscle function?", options: ["Movement","Digestion","Breathing","None"], answer: "Movement" },
];

// ======================
// 🎯 MAIN GENERATOR
// ======================
export const generateQuizAI = (subject: string, quizLevel: string): Question[] => {
  let pool: Question[] = [];

  const sub = subject.toLowerCase();
  switch (sub) {
    case "math":
    case "mathematics":
      pool = mathPool;
      break;
    case "physics":
      pool = physicsPool;
      break;
    case "chemistry":
      pool = chemistryPool;
      break;
    case "biology":
      pool = biologyPool;
      break;
    default:
      console.warn(`No quiz pool found for subject: ${subject}`);
      return [];
  }

  return shuffle(pool).slice(0, 10);
};