import React, { useState } from 'react';
import { SimulationProps } from '../../../types/types';

// Preset configurations for easy exploration
interface Preset {
  id: string;
  name: string;
  type: 'monohybrid' | 'dihybrid';
  mode: 'complete' | 'incomplete';
  p1: string;
  p2: string;
  trait1Name: string;
  t1Dom: string;
  t1Rec: string;
  t1Inc?: string; // Blended phenotype for incomplete dominance
  trait2Name?: string;
  t2Dom?: string;
  t2Rec?: string;
}

const presets: Preset[] = [
  {
    id: 'pea-height',
    name: 'Mendel\'s Peas: Height (Monohybrid)',
    type: 'monohybrid',
    mode: 'complete',
    p1: 'Tt',
    p2: 'Tt',
    trait1Name: 'Plant Height',
    t1Dom: 'Tall',
    t1Rec: 'Short',
  },
  {
    id: 'snapdragon',
    name: 'Snapdragons: Color (Incomplete Dominance)',
    type: 'monohybrid',
    mode: 'incomplete',
    p1: 'Rr',
    p2: 'Rr',
    trait1Name: 'Flower Color',
    t1Dom: 'Red',
    t1Rec: 'White',
    t1Inc: 'Pink',
  },
  {
    id: 'pea-dihybrid',
    name: 'Mendel\'s Peas: Height & Color (Dihybrid)',
    type: 'dihybrid',
    mode: 'complete',
    p1: 'TtPp',
    p2: 'TtPp',
    trait1Name: 'Plant Height',
    t1Dom: 'Tall',
    t1Rec: 'Short',
    trait2Name: 'Flower Color',
    t2Dom: 'Purple',
    t2Rec: 'White',
  },
];

const GeneticsSimulator: React.FC<Partial<SimulationProps>> = ({ theme = 'light' }) => {
  const isDark = theme === 'dark';
  // --- State ---
  const [selectedPreset, setSelectedPreset] = useState<string>('pea-height');
  const [crossType, setCrossType] = useState<'monohybrid' | 'dihybrid'>('monohybrid');
  const [inheritanceMode, setInheritanceMode] = useState<'complete' | 'incomplete'>('complete');
  
  // Parental Genotypes
  const [p1, setP1] = useState<string>('Tt');
  const [p2, setP2] = useState<string>('Tt');

  // Trait Customization Labels
  const [trait1, setTrait1] = useState({ name: 'Plant Height', dom: 'Tall', rec: 'Short', inc: 'Medium' });
  const [trait2, setTrait2] = useState({ name: 'Flower Color', dom: 'Purple', rec: 'White' });

  // Handle preset loading
  const handleLoadPreset = (presetId: string) => {
    const target = presets.find(p => p.id === presetId);
    if (!target) return;

    setSelectedPreset(target.id);
    setCrossType(target.type);
    setInheritanceMode(target.mode);
    setP1(target.p1);
    setP2(target.p2);

    setTrait1({
      name: target.trait1Name,
      dom: target.t1Dom,
      rec: target.t1Rec,
      inc: target.t1Inc || 'Blended',
    });

    if (target.trait2Name) {
      setTrait2({
        name: target.trait2Name,
        dom: target.t2Dom || '',
        rec: target.t2Rec || '',
      });
    }
  };

  // --- Gamete Generation ---
  const getGametes = (genotype: string, type: 'monohybrid' | 'dihybrid'): string[] => {
    const cleaned = genotype.padEnd(type === 'dihybrid' ? 4 : 2, 'A');
    if (type === 'monohybrid') {
      return [cleaned[0], cleaned[1]];
    } else {
      // Dihybrid FOIL method: First, Outer, Inner, Last
      return [
        cleaned[0] + cleaned[2],
        cleaned[0] + cleaned[3],
        cleaned[1] + cleaned[2],
        cleaned[1] + cleaned[3],
      ];
    }
  };

  const p1Gametes = getGametes(p1, crossType);
  const p2Gametes = getGametes(p2, crossType);

  // --- Helper: Sort alleles conventionally (Dominant/Uppercase first) ---
  const sortAlleles = (allelePair: string) => {
    return allelePair.split('').sort().reverse().join('');
  };

  // --- Phenotype Resolver ---
  const resolvePhenotype = (genotype: string): string => {
    if (crossType === 'monohybrid') {
      const g = sortAlleles(genotype);
      const isHetero = g[0] !== g[1];
      const isRecessive = g[0] === g[0].toLowerCase() && g[1] === g[1].toLowerCase();

      if (inheritanceMode === 'incomplete' && isHetero) {
        return trait1.inc;
      }
      return isRecessive ? trait1.rec : trait1.dom;
    } else {
      // Dihybrid resolution (assumes complete dominance for standard Class 10/11 scope)
      const gene1 = sortAlleles(genotype[0] + genotype[1]);
      const gene2 = sortAlleles(genotype[2] + genotype[3]);

      const p1Res = (gene1[0] === gene1[0].toLowerCase()) ? trait1.rec : trait1.dom;
      const p2Res = (gene2[0] === gene2[0].toLowerCase()) ? trait2.rec : trait2.dom;

      return `${p1Res} & ${p2Res}`;
    }
  };

  // --- Generate Offspring Grid & Analytics ---
  const gridCells: { genotype: string; phenotype: string }[] = [];
  const genotypicCounts: Record<string, number> = {};
  const phenotypicCounts: Record<string, number> = {};

  p2Gametes.forEach(rowGamete => {
    p1Gametes.forEach(colGamete => {
      let combinedGenotype = '';
      if (crossType === 'monohybrid') {
        combinedGenotype = sortAlleles(colGamete + rowGamete);
      } else {
        // Keep individual traits paired together: TtPp
        const gene1 = sortAlleles(colGamete[0] + rowGamete[0]);
        const gene2 = sortAlleles(colGamete[1] + rowGamete[1]);
        combinedGenotype = gene1 + gene2;
      }

      const pheno = resolvePhenotype(combinedGenotype);
      gridCells.push({ genotype: combinedGenotype, phenotype: pheno });

      genotypicCounts[combinedGenotype] = (genotypicCounts[combinedGenotype] || 0) + 1;
      phenotypicCounts[pheno] = (phenotypicCounts[pheno] || 0) + 1;
    });
  });

  const totalOffspring = gridCells.length;

  // Visual Palette mapping to keep matching phenotypes visually identical
  const colorPalette = [
    'bg-purple-50 border-purple-200 text-purple-900',
    'bg-emerald-50 border-emerald-200 text-emerald-900',
    'bg-amber-50 border-amber-200 text-amber-900',
    'bg-rose-50 border-rose-200 text-rose-900',
    'bg-sky-50 border-sky-200 text-sky-900',
  ];

  const uniquePhenotypes = Object.keys(phenotypicCounts);
  const getPhenoColor = (pheno: string) => {
    const idx = uniquePhenotypes.indexOf(pheno) % colorPalette.length;
    return colorPalette[idx];
  };

  return (
    <div className={`flex flex-col gap-6 w-full max-w-4xl mx-auto p-6 font-sans border rounded-2xl shadow-sm select-none transition-colors duration-500 ${
      isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
    }`}>
      
      {/* Header */}
      <div className="text-center">
        <h2 className={`text-2xl font-bold m-0 ${isDark ? 'text-white' : 'text-slate-800'}`}>Punnett Square Genetics Lab</h2>
        <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Model allelic segregation, independent assortment, and genotypic probabilities
        </p>
      </div>

      {/* Preset Selector Banner */}
      <div className={`flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border shadow-sm transition-colors duration-500 ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <span className={`text-xs font-bold uppercase tracking-wider pl-1 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Experimental Presets:</span>
        <div className="flex flex-wrap gap-1.5">
          {presets.map(p => (
            <button
              key={p.id}
              onClick={() => handleLoadPreset(p.id)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all border ${
                selectedPreset === p.id 
                  ? isDark ? 'bg-sky-500 text-white shadow-sm border-sky-500' : 'bg-indigo-600 text-white shadow-sm border-indigo-600' 
                  : isDark ? 'bg-slate-800 text-slate-400 hover:bg-slate-700 border-slate-700' : 'bg-white text-slate-800 hover:bg-slate-200 border-slate-200'
              }`}
            >
              {p.name.split(':')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Primary Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Dynamic Punnett Square Grid (Spans 2 cols) */}
        <div className={`lg:col-span-2 p-6 rounded-xl border shadow-sm flex flex-col justify-center items-center overflow-x-auto transition-colors duration-500 ${
          isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          
          <div className="text-center mb-4">
            <span className={`text-xs font-bold uppercase tracking-widest block ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Gamete Matrix</span>
            <span className={`text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Parent 1 ({p1}) × Parent 2 ({p2})
            </span>
          </div>

          {/* Render Punnett Table */}
          <table className="border-collapse">
            <thead>
              <tr>
                <td className="p-2"></td>
                {p1Gametes.map((gamete, idx) => (
                  <th key={`h-${idx}`} className={`p-3 border font-mono text-base rounded-t transition-colors duration-500 ${
                    isDark ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-slate-100 border-slate-200 text-slate-800'
                  }`}>
                    {gamete}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {p2Gametes.map((rowGamete, rIdx) => (
                <tr key={`r-${rIdx}`}>
                  <th className={`p-3 border font-mono text-base rounded-l transition-colors duration-500 ${
                    isDark ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-slate-100 border-slate-200 text-slate-800'
                  }`}>
                    {rowGamete}
                  </th>
                  {p1Gametes.map((_, cIdx) => {
                    const cell = gridCells[rIdx * p1Gametes.length + cIdx];
                    const colorStyle = getPhenoColor(cell.phenotype);
                    return (
                      <td 
                        key={`c-${cIdx}`} 
                        className={`p-4 border text-center transition-all duration-200 w-24 h-20 ${
                          isDark ? 'border-slate-800' : 'border-slate-200'
                        } ${colorStyle}`}
                      >
                        <div className="font-mono font-bold text-lg tracking-wide">{cell.genotype}</div>
                        <div className="text-[11px] font-medium opacity-90 mt-1 leading-tight">{cell.phenotype}</div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>

        </div>

        {/* Right Side: Configuration Sidebar */}
        <div className="flex flex-col gap-4">
          
          {/* Mode & Cross Config */}
          <div className={`p-4 rounded-xl space-y-3 border shadow-sm transition-colors duration-500 ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className={`text-xs font-bold uppercase tracking-wider border-b pb-1 ${
              isDark ? 'text-slate-300 border-slate-800' : 'text-slate-700 border-slate-100'
            }`}>
              Configuration Rules
            </div>

            {/* Cross Complexity Dropdown */}
            <div>
              <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Cross Complexity</label>
              <select
                value={crossType}
                onChange={(e) => {
                  const val = e.target.value as 'monohybrid' | 'dihybrid';
                  setCrossType(val);
                  setSelectedPreset('custom');
                  // Adjust padding dynamically
                  setP1(val === 'dihybrid' ? 'TtPp' : 'Tt');
                  setP2(val === 'dihybrid' ? 'TtPp' : 'Tt');
                }}
                className={`w-full border rounded p-1.5 text-xs font-bold outline-none transition-colors ${
                  isDark ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-700'
                }`}
              >
                <option value="monohybrid">Monohybrid Cross (2×2)</option>
                <option value="dihybrid">Dihybrid Cross (4×4)</option>
              </select>
            </div>

            {/* Inheritance Mode */}
            {crossType === 'monohybrid' && (
              <div>
                <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Inheritance Mode</label>
                <select
                  value={inheritanceMode}
                  onChange={(e) => {
                    setInheritanceMode(e.target.value as 'complete' | 'incomplete');
                    setSelectedPreset('custom');
                  }}
                  className={`w-full border rounded p-1.5 text-xs font-bold outline-none transition-colors ${
                    isDark ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-700'
                  }`}
                >
                  <option value="complete">Complete Dominance</option>
                  <option value="incomplete">Incomplete Dominance</option>
                </select>
              </div>
            )}

            {/* Parental Input Fields */}
            <div className="space-y-2 pt-1.5">
              <div>
                <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Parent 1 Genotype</label>
                <input
                  type="text"
                  maxLength={crossType === 'dihybrid' ? 4 : 2}
                  value={p1}
                  onChange={(e) => { setP1(e.target.value.replace(/[^a-zA-Z]/g, '')); setSelectedPreset('custom'); }}
                  className={`w-full border rounded p-1.5 text-xs font-mono font-bold tracking-widest text-center uppercase outline-none transition-colors ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white focus:border-slate-500' : 'bg-slate-50 border-slate-300 text-slate-800 focus:border-slate-500'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Parent 2 Genotype</label>
                <input
                  type="text"
                  maxLength={crossType === 'dihybrid' ? 4 : 2}
                  value={p2}
                  onChange={(e) => { setP2(e.target.value.replace(/[^a-zA-Z]/g, '')); setSelectedPreset('custom'); }}
                  className={`w-full border rounded p-1.5 text-xs font-mono font-bold tracking-widest text-center uppercase outline-none transition-colors ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white focus:border-slate-500' : 'bg-slate-50 border-slate-300 text-slate-800 focus:border-slate-500'
                  }`}
                />
              </div>
            </div>

          </div>

          {/* Phenotype Key Definition Helper */}
          <div className={`p-3 rounded-xl border text-xs transition-colors duration-500 ${
            isDark ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'
          }`}>
            <span className={`font-bold block border-b pb-1 ${
              isDark ? 'text-slate-300 border-slate-700' : 'text-slate-700 border-slate-200'
            }`}>Trait Mappings</span>
            <div className="flex justify-between mt-1.5">
              <span>Dominant Allele:</span>
              <span className={`font-semibold ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>{trait1.dom}</span>
            </div>
            <div className="flex justify-between">
              <span>Recessive Allele:</span>
              <span className={`font-semibold ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>{trait1.rec}</span>
            </div>
            {inheritanceMode === 'incomplete' && crossType === 'monohybrid' && (
              <div className="flex justify-between text-rose-500">
                <span>Heterozygous Blended:</span>
                <span className="font-bold">{trait1.inc}</span>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Aggregate Analytical Results Dashboard */}
      <div className={`p-4 rounded-xl border shadow-sm flex flex-col md:flex-row gap-6 justify-around items-start md:items-center transition-colors duration-500 ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        
        <div className="flex-1 w-full">
          <span className={`text-[11px] font-bold uppercase tracking-wider block mb-2 border-b pb-1 ${
            isDark ? 'text-slate-500 border-slate-800' : 'text-slate-400 border-slate-100'
          }`}>
            Genotypic Probability
          </span>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {Object.entries(genotypicCounts).map(([geno, count]) => (
              <div key={geno} className={`flex justify-between items-center px-2.5 py-1.5 rounded border transition-colors duration-500 ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-100'
              }`}>
                <span className={`font-mono font-bold tracking-wide ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>{geno}</span>
                <span className={`text-xs font-semibold ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
                  {count}/{totalOffspring} ({Math.round((count / totalOffspring) * 100)}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Output 2: Phenotypic Distribution */}
        <div className={`flex-1 w-full border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6 ${
          isDark ? 'border-slate-800' : 'border-slate-100'
        }`}>
          <span className={`text-[11px] font-bold uppercase tracking-wider block mb-2 border-b pb-1 ${
            isDark ? 'text-slate-500 border-slate-800' : 'text-slate-400 border-slate-100'
          }`}>
            Phenotypic Ratio
          </span>
          <div className="space-y-1.5">
            {Object.entries(phenotypicCounts).map(([pheno, count]) => (
              <div key={pheno} className="flex justify-between items-center text-xs">
                <span className={`font-semibold truncate pr-2 flex items-center gap-1.5 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
                  <span className={`w-2 h-2 rounded-full inline-block ${getPhenoColor(pheno).split(' ')[0]}`} />
                  {pheno}
                </span>
                <span className={`font-mono font-bold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
                  {Math.round((count / totalOffspring) * 100)}% <span className="text-[10px] text-slate-500 font-normal">({count})</span>
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

export default GeneticsSimulator;