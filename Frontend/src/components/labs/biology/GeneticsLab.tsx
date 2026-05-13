import React, { useState } from 'react';

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

const GeneticsSimulator: React.FC = () => {
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
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto p-6 font-sans bg-slate-50 border border-slate-200 rounded-2xl shadow-sm select-none">
      
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-800 m-0">Punnett Square Genetics Lab</h2>
        <p className="text-sm text-slate-500 mt-1">
          Model allelic segregation, independent assortment, and genotypic probabilities
        </p>
      </div>

      {/* Preset Selector Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Experimental Presets:</span>
        <div className="flex flex-wrap gap-1.5">
          {presets.map(p => (
            <button
              key={p.id}
              onClick={() => handleLoadPreset(p.id)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                selectedPreset === p.id ? 'bg-slate-800 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center items-center overflow-x-auto">
          
          <div className="text-center mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Gamete Matrix</span>
            <span className="text-sm font-semibold text-slate-700">
              Parent 1 ({p1}) × Parent 2 ({p2})
            </span>
          </div>

          {/* Render Punnett Table */}
          <table className="border-collapse">
            <thead>
              <tr>
                <td className="p-2"></td>
                {p1Gametes.map((gamete, idx) => (
                  <th key={`h-${idx}`} className="p-3 bg-slate-100 border border-slate-200 text-slate-800 font-mono text-base rounded-t">
                    {gamete}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {p2Gametes.map((rowGamete, rIdx) => (
                <tr key={`r-${rIdx}`}>
                  <th className="p-3 bg-slate-100 border border-slate-200 text-slate-800 font-mono text-base rounded-l">
                    {rowGamete}
                  </th>
                  {p1Gametes.map((_, cIdx) => {
                    const cell = gridCells[rIdx * p1Gametes.length + cIdx];
                    const colorStyle = getPhenoColor(cell.phenotype);
                    return (
                      <td 
                        key={`c-${cIdx}`} 
                        className={`p-4 border border-slate-200 text-center transition-all duration-200 w-24 h-20 ${colorStyle}`}
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
          <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-3 shadow-sm">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-1">
              Configuration Rules
            </div>

            {/* Cross Complexity Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Cross Complexity</label>
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
                className="w-full bg-slate-50 border border-slate-300 rounded p-1.5 text-xs font-bold text-slate-700 outline-none"
              >
                <option value="monohybrid">Monohybrid Cross (2×2)</option>
                <option value="dihybrid">Dihybrid Cross (4×4)</option>
              </select>
            </div>

            {/* Inheritance Mode */}
            {crossType === 'monohybrid' && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Inheritance Mode</label>
                <select
                  value={inheritanceMode}
                  onChange={(e) => {
                    setInheritanceMode(e.target.value as 'complete' | 'incomplete');
                    setSelectedPreset('custom');
                  }}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-1.5 text-xs font-bold text-slate-700 outline-none"
                >
                  <option value="complete">Complete Dominance</option>
                  <option value="incomplete">Incomplete Dominance</option>
                </select>
              </div>
            )}

            {/* Parental Input Fields */}
            <div className="space-y-2 pt-1.5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Parent 1 Genotype</label>
                <input
                  type="text"
                  maxLength={crossType === 'dihybrid' ? 4 : 2}
                  value={p1}
                  onChange={(e) => { setP1(e.target.value.replace(/[^a-zA-Z]/g, '')); setSelectedPreset('custom'); }}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-1.5 text-xs font-mono font-bold text-slate-800 tracking-widest text-center uppercase outline-none focus:border-slate-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Parent 2 Genotype</label>
                <input
                  type="text"
                  maxLength={crossType === 'dihybrid' ? 4 : 2}
                  value={p2}
                  onChange={(e) => { setP2(e.target.value.replace(/[^a-zA-Z]/g, '')); setSelectedPreset('custom'); }}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-1.5 text-xs font-mono font-bold text-slate-800 tracking-widest text-center uppercase outline-none focus:border-slate-500"
                />
              </div>
            </div>

          </div>

          {/* Phenotype Key Definition Helper */}
          <div className="bg-slate-100 p-3 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1.5">
            <span className="font-bold text-slate-700 block border-b border-slate-200 pb-1">Trait Mappings</span>
            <div className="flex justify-between">
              <span>Dominant Allele:</span>
              <span className="font-semibold text-slate-800">{trait1.dom}</span>
            </div>
            <div className="flex justify-between">
              <span>Recessive Allele:</span>
              <span className="font-semibold text-slate-800">{trait1.rec}</span>
            </div>
            {inheritanceMode === 'incomplete' && crossType === 'monohybrid' && (
              <div className="flex justify-between text-rose-700">
                <span>Heterozygous Blended:</span>
                <span className="font-bold">{trait1.inc}</span>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Aggregate Analytical Results Dashboard */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-6 justify-around items-start md:items-center">
        
        {/* Output 1: Genotypic Probabilities */}
        <div className="flex-1 w-full">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2 border-b border-slate-100 pb-1">
            Genotypic Probability
          </span>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {Object.entries(genotypicCounts).map(([geno, count]) => (
              <div key={geno} className="flex justify-between items-center bg-slate-50 px-2.5 py-1.5 rounded border border-slate-100">
                <span className="font-mono font-bold text-slate-800 tracking-wide">{geno}</span>
                <span className="text-xs font-semibold text-slate-600">
                  {count}/{totalOffspring} ({Math.round((count / totalOffspring) * 100)}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Output 2: Phenotypic Distribution */}
        <div className="flex-1 w-full border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2 border-b border-slate-100 pb-1">
            Phenotypic Ratio
          </span>
          <div className="space-y-1.5">
            {Object.entries(phenotypicCounts).map(([pheno, count]) => (
              <div key={pheno} className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-700 truncate pr-2 flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full inline-block ${getPhenoColor(pheno).split(' ')[0]}`} />
                  {pheno}
                </span>
                <span className="font-mono font-bold text-slate-900">
                  {Math.round((count / totalOffspring) * 100)}% <span className="text-[10px] text-slate-400 font-normal">({count})</span>
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