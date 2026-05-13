import React, { useState } from 'react';

// Define matrix transformation preset structures
interface TransformationPreset {
  id: string;
  name: string;
  matrix: [number, number, number, number]; // [a, b, c, d] for [[a, b], [c, d]]
  description: string;
}

const presets: TransformationPreset[] = [
  {
    id: 'identity',
    name: 'Identity Matrix',
    matrix: [1, 0, 0, 1],
    description: 'No change. The standard basis vectors remain perfectly at (1,0) and (0,1).',
  },
  {
    id: 'rotation-45',
    name: 'Counter-Clockwise Rotation (45°)',
    matrix: [0.71, -0.71, 0.71, 0.71], // cos(45), -sin(45), sin(45), cos(45)
    description: 'Rotates all vectors by 45 degrees while preserving overall grid area.',
  },
  {
    id: 'shear-x',
    name: 'Horizontal Shear (X-Shear)',
    matrix: [1, 1, 0, 1],
    description: 'Pushes the top of space to the right. Notice how j-hat tilts but i-hat stays stationary.',
  },
  {
    id: 'scale-2x',
    name: 'Uniform Scale (2x)',
    matrix: [2, 0, 0, 2],
    description: 'Stretches space evenly. The Determinant is 4, meaning all regions end up with 4x their original area.',
  },
  {
    id: 'singular',
    name: 'Singular Projection (Collapse)',
    matrix: [1, 0, 1, 0], // Columns are linearly dependent
    description: 'The Determinant drops to 0. The entire 2D area completely collapses onto a single 1D span.',
  },
  {
    id: 'reflection',
    name: 'Reflection across Y-Axis',
    matrix: [-1, 0, 0, 1],
    description: 'Flips the horizontal orientation. Notice the negative determinant indicating a spatial flip.',
  },
];

const LinearAlgebraVisualizer: React.FC = () => {
  // --- Core Transformational State ---
  const [a, setA] = useState<number>(1);
  const [b, setB] = useState<number>(0);
  const [c, setC] = useState<number>(0);
  const [d, setD] = useState<number>(1);

  // Target Input Vector v = [x, y]
  const [vecX, setVecX] = useState<number>(1);
  const [vecY, setVecY] = useState<number>(1);

  const [activePreset, setActivePreset] = useState<string>('identity');

  // --- Handle Quick Presets ---
  const applyPreset = (preset: TransformationPreset) => {
    setActivePreset(preset.id);
    setA(preset.matrix[0]);
    setB(preset.matrix[1]);
    setC(preset.matrix[2]);
    setD(preset.matrix[3]);
  };

  const handleMatrixChange = (setter: React.Dispatch<React.SetStateAction<number>>, val: number) => {
    setter(val);
    setActivePreset('custom');
  };

  // --- Mathematical Core Computations ---
  // 1. Transformed Basis Vectors landing coordinates
  const iTransX = a;
  const iTransY = c;

  const jTransX = b;
  const jTransY = d;

  // 2. Transformed Target Vector T(v) = A * v
  const transVecX = a * vecX + b * vecY;
  const transVecY = c * vecX + d * vecY;

  // 3. Determinant: det(A) = ad - bc
  const determinant = a * d - b * c;

  // Resolve visual status descriptive output
  let detStatus = '';
  if (Math.abs(determinant) < 0.05) {
    detStatus = '⚠️ Singular Matrix: Space collapsed to a 1D span (Information Lost)';
  } else if (determinant < 0) {
    detStatus = `🔄 Orientation Flipped (Area Scaled by ${Math.abs(determinant).toFixed(2)}x)`;
  } else if (Math.abs(determinant - 1) < 0.05) {
    detStatus = '✨ Area Perfectly Preserved (det = 1)';
  } else {
    detStatus = `📏 Area Scaled by ${determinant.toFixed(2)}x`;
  }

  // --- SVG Scaling & Coordinate Layout Mapping ---
  const svgSize = 500;
  const origin = svgSize / 2;
  const scale = 45; // pixels per logical grid unit
  const gridLimit = 5;

  const mapX = (xVal: number) => origin + xVal * scale;
  const mapY = (yVal: number) => origin - yVal * scale;

  const gridLines: React.ReactElement[] = [];

  for (let idx = -gridLimit; idx <= gridLimit; idx++) {
    if (idx === 0) continue;

    // Vertical line mappings
    const vStartX = a * idx + b * (-gridLimit);
    const vStartY = c * idx + d * (-gridLimit);
    const vEndX = a * idx + b * gridLimit;
    const vEndY = c * idx + d * gridLimit;

    gridLines.push(
      <line
        key={`v-${idx}`}
        x1={mapX(vStartX)}
        y1={mapY(vStartY)}
        x2={mapX(vEndX)}
        y2={mapY(vEndY)}
        stroke="#cbd5e1"
        strokeWidth="1"
        opacity="0.5"
      />
    );

    // Horizontal line mappings
    const hStartX = a * (-gridLimit) + b * idx;
    const hStartY = c * (-gridLimit) + d * idx;
    const hEndX = a * gridLimit + b * idx;
    const hEndY = c * gridLimit + d * idx;

    gridLines.push(
      <line
        key={`h-${idx}`}
        x1={mapX(hStartX)}
        y1={mapY(hStartY)}
        x2={mapX(hEndX)}
        y2={mapY(hEndY)}
        stroke="#cbd5e1"
        strokeWidth="1"
        opacity="0.5"
      />
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto p-6 font-sans bg-slate-50 border border-slate-200 rounded-2xl shadow-sm select-none">
      
      {/* Structural Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-800 m-0">Linear Transformations Visualizer</h2>
        <p className="text-sm text-slate-500 mt-1">
          Observe matrices warping space by tracking where basis vectors <b>i-hat</b> and <b>j-hat</b> land
        </p>
      </div>

      {/* Preset Application Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Matrix Presets:</span>
        <div className="flex flex-wrap gap-1.5">
          {presets.map((p) => (
            <button
              key={p.id}
              onClick={() => applyPreset(p)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activePreset === p.id
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {p.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid Interface Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SVG Visualization Canvas Space */}
        <div className="lg:col-span-2 bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center relative overflow-hidden">
          
          <div className="w-full flex justify-between items-center px-2 pb-2 z-10 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Vector Space (2D Plane)</span>
            <span className="text-xs font-mono font-bold text-slate-500">
              det(A) = {determinant.toFixed(2)}
            </span>
          </div>

          {/* SVG Coordinate Sub-System */}
          <svg viewBox={`0 0 ${svgSize} ${svgSize}`} className="w-full max-w-[420px] h-auto my-2 border border-slate-100 rounded bg-slate-50/30 overflow-hidden">
            
            {/* Background Faded Original Grid Lines */}
            <g stroke="#e2e8f0" strokeWidth="1" strokeDasharray="2 2">
              {[-4, -3, -2, -1, 1, 2, 3, 4].map((v) => (
                <React.Fragment key={`orig-${v}`}>
                  <line x1={mapX(v)} y1={0} x2={mapX(v)} y2={svgSize} />
                  <line x1={0} y1={mapY(v)} x2={svgSize} y2={mapY(v)} />
                </React.Fragment>
              ))}
            </g>

            {/* Dynamic Transformed Space Grid Mappings */}
            <g>{gridLines}</g>

            {/* Main Static Fixed Origin Cartesian Axes */}
            <line x1={0} y1={origin} x2={svgSize} y2={origin} stroke="#94a3b8" strokeWidth="1.5" />
            <line x1={origin} y1={0} x2={origin} y2={svgSize} stroke="#94a3b8" strokeWidth="1.5" />

            {/* Vector Arrow Definitions */}
            <defs>
              <marker id="arrow-i" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto-start-reverse">
                <path d="M 0 0 L 6 3 L 0 6 z" fill="#10b981" />
              </marker>
              <marker id="arrow-j" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto-start-reverse">
                <path d="M 0 0 L 6 3 L 0 6 z" fill="#06b6d4" />
              </marker>
              <marker id="arrow-v" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto-start-reverse">
                <path d="M 0 0 L 6 3 L 0 6 z" fill="#f59e0b" />
              </marker>
              <marker id="arrow-trans" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto-start-reverse">
                <path d="M 0 0 L 6 3 L 0 6 z" fill="#ef4444" />
              </marker>
            </defs>

            {/* 1. Transformed Basis i-hat */}
            <line
              x1={origin}
              y1={origin}
              x2={mapX(iTransX)}
              y2={mapY(iTransY)}
              stroke="#10b981"
              strokeWidth="3.5"
              strokeLinecap="round"
              markerEnd="url(#arrow-i)"
            />

            {/* 2. Transformed Basis j-hat */}
            <line
              x1={origin}
              y1={origin}
              x2={mapX(jTransX)}
              y2={mapY(jTransY)}
              stroke="#06b6d4"
              strokeWidth="3.5"
              strokeLinecap="round"
              markerEnd="url(#arrow-j)"
            />

            {/* 3. Original Input Vector v */}
            <line
              x1={origin}
              y1={origin}
              x2={mapX(vecX)}
              y2={mapY(vecY)}
              stroke="#f59e0b"
              strokeWidth="2"
              strokeDasharray="4 2"
              strokeLinecap="round"
              markerEnd="url(#arrow-v)"
              opacity="0.6"
            />

            {/* 4. Resulting Transformed Target Vector T(v) */}
            <line
              x1={origin}
              y1={origin}
              x2={mapX(transVecX)}
              y2={mapY(transVecY)}
              stroke="#ef4444"
              strokeWidth="3"
              strokeLinecap="round"
              markerEnd="url(#arrow-trans)"
            />

            {/* Origin Nodes */}
            <circle cx={origin} cy={origin} r="4" className="fill-slate-700" />
            <circle cx={mapX(iTransX)} cy={mapY(iTransY)} r="3.5" fill="#10b981" />
            <circle cx={mapX(jTransX)} cy={mapY(jTransY)} r="3.5" fill="#06b6d4" />
            <circle cx={mapX(transVecX)} cy={mapY(transVecY)} r="3.5" fill="#ef4444" />
          </svg>

          {/* Graphical Key Definitions */}
          <div className="w-full flex flex-wrap justify-center gap-4 pt-2 text-[11px] font-medium text-slate-600 border-t border-slate-100">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Transformed i-hat</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-cyan-500 inline-block" /> Transformed j-hat</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-amber-500 inline-block opacity-60" /> Original v</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> Resulting Av</span>
          </div>

        </div>

        {/* Dynamic Controls Config Sidebar Stack */}
        <div className="flex flex-col gap-4">
          
          <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-3.5 shadow-sm">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-1">
              Transformation Operator Matrix
            </div>

            <div className="flex items-center justify-center gap-3 py-2 bg-slate-50 rounded-lg border border-slate-100 font-mono">
              <span className="text-xl text-slate-300 font-light">[</span>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  step="0.1"
                  value={a}
                  onChange={(e) => handleMatrixChange(setA, parseFloat(e.target.value) || 0)}
                  className="w-16 bg-white border border-slate-300 rounded p-1 text-center font-bold text-slate-800 text-sm outline-none"
                />
                <input
                  type="number"
                  step="0.1"
                  value={b}
                  onChange={(e) => handleMatrixChange(setB, parseFloat(e.target.value) || 0)}
                  className="w-16 bg-white border border-slate-300 rounded p-1 text-center font-bold text-slate-800 text-sm outline-none"
                />
                <input
                  type="number"
                  step="0.1"
                  value={c}
                  onChange={(e) => handleMatrixChange(setC, parseFloat(e.target.value) || 0)}
                  className="w-16 bg-white border border-slate-300 rounded p-1 text-center font-bold text-slate-800 text-sm outline-none"
                />
                <input
                  type="number"
                  step="0.1"
                  value={d}
                  onChange={(e) => handleMatrixChange(setD, parseFloat(e.target.value) || 0)}
                  className="w-16 bg-white border border-slate-300 rounded p-1 text-center font-bold text-slate-800 text-sm outline-none"
                />
              </div>
              <span className="text-xl text-slate-300 font-light">]</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px] text-center text-slate-500 font-medium">
              <div>
                <span className="block text-emerald-600 font-bold">Col 1 (i-hat Landing)</span>
                <span>[{a.toFixed(1)}, {c.toFixed(1)}]</span>
              </div>
              <div>
                <span className="block text-cyan-600 font-bold">Col 2 (j-hat Landing)</span>
                <span>[{b.toFixed(1)}, {d.toFixed(1)}]</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-2.5">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Target Input Vector (v)
              </span>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">X Coordinate</label>
                  <input
                    type="range"
                    min="-4"
                    max="4"
                    step="0.2"
                    value={vecX}
                    onChange={(e) => setVecX(parseFloat(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <span className="text-xs font-mono font-bold text-slate-700 block text-center mt-0.5">{vecX.toFixed(1)}</span>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Y Coordinate</label>
                  <input
                    type="range"
                    min="-4"
                    max="4"
                    step="0.2"
                    value={vecY}
                    onChange={(e) => setVecY(parseFloat(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <span className="text-xs font-mono font-bold text-slate-700 block text-center mt-0.5">{vecY.toFixed(1)}</span>
                </div>
              </div>
            </div>

          </div>

          <div className="bg-slate-100 p-3 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
            <span className="font-bold text-slate-700 block border-b border-slate-200 pb-1">
              Transformation Insight
            </span>
            <p className="leading-relaxed mt-1 text-slate-600">
              {presets.find((p) => p.id === activePreset)?.description || 
               'Custom linear map warping space based on individual matrix configuration input metrics.'}
            </p>
          </div>

        </div>

      </div>

      {/* Aggregate Analytical Math Execution Panels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
        
        {/* Output 1: Safely Escaped Matrix form */}
        <div className="p-3 bg-white border border-slate-200 rounded-xl flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Linear Transformation Equation</span>
          <div className="font-mono text-xs font-bold text-slate-800 flex items-center justify-center gap-1 mt-2">
            <span>{`$\\begin{bmatrix} ${a.toFixed(1)} & ${b.toFixed(1)} \\\\ ${c.toFixed(1)} & ${d.toFixed(1)} \\end{bmatrix}$`}</span>
            <span>{"$\\cdot$"}</span>
            <span>{`$\\begin{bmatrix} ${vecX.toFixed(1)} \\\\ ${vecY.toFixed(1)} \\end{bmatrix}$`}</span>
            <span>{"$=$"}</span>
            <span className="text-red-600">{`$\\begin{bmatrix} ${transVecX.toFixed(1)} \\\\ ${transVecY.toFixed(1)} \\end{bmatrix}$`}</span>
          </div>
        </div>

        {/* Output 2: Target Mapping Coordinates */}
        <div className="p-3 bg-red-50/50 border border-red-100 rounded-xl flex flex-col justify-between">
          <span className="text-[10px] font-bold text-red-700 uppercase block">Transformed Vector Mapping</span>
          <div className="mt-1">
            <span className="text-lg font-mono font-bold text-red-900">
              T(v) = ({transVecX.toFixed(2)}, {transVecY.toFixed(2)})
            </span>
          </div>
        </div>

        {/* Output 3: Determinant Area Status Mapping */}
        <div className="p-3 bg-sky-50/50 border border-sky-100 rounded-xl flex flex-col justify-between">
          <span className="text-[10px] font-bold text-sky-700 uppercase block">Space & Area Scaling Impact</span>
          <span className="text-xs font-bold text-sky-950 mt-1 leading-tight">
            {detStatus}
          </span>
        </div>

      </div>

    </div>
  );
};

export default LinearAlgebraVisualizer;