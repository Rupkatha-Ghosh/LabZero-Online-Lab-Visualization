import React, { useState } from 'react';

// Define available function presets with precise analytical formulas
interface FunctionPreset {
  id: string;
  name: string;
  f: (x: number) => number;
  df: (x: number) => number; // Analytical derivative f'(x)
  F: (x: number) => number;  // Analytical antiderivative ∫f(x)dx
}

const presets: FunctionPreset[] = [
  {
    id: 'quadratic',
    name: 'f(x) = x²',
    f: (x) => x * x,
    df: (x) => 2 * x,
    F: (x) => (x * x * x) / 3,
  },
  {
    id: 'sin',
    name: 'f(x) = sin(x)',
    f: (x) => Math.sin(x),
    df: (x) => Math.cos(x),
    F: (x) => -Math.cos(x),
  },
  {
    id: 'cubic',
    name: 'f(x) = 0.5x³ - x',
    f: (x) => 0.5 * Math.pow(x, 3) - x,
    df: (x) => 1.5 * x * x - 1,
    F: (x) => 0.125 * Math.pow(x, 4) - 0.5 * x * x,
  },
];

const CalculusSimulator: React.FC = () => {
  // --- State Variables ---
  const [selectedPreset, setSelectedPreset] = useState<string>('quadratic');
  const [targetX, setTargetX] = useState<number>(1.0); // Derivative evaluation point
  const [boundA, setBoundA] = useState<number>(0.0);   // Integration lower bound
  const [boundB, setBoundB] = useState<number>(2.0);   // Integration upper bound
  const [partitions, setPartitions] = useState<number>(6); // Riemann sum rectangles (n)
  const [riemannMethod, setRiemannMethod] = useState<'left' | 'right' | 'mid'>('left');

  // Ensure lower bound doesn't cross upper bound visually
  const a = Math.min(boundA, boundB);
  const b = Math.max(boundA, boundB);

  // Active mathematical function objects
  const preset = presets.find((p) => p.id === selectedPreset) || presets[0];

  // --- SVG Scaling & Domain Mapping ---
  // Math coordinate space: X ranges from -3 to 3; Y ranges from -4 to 4
  const svgWidth = 600;
  const svgHeight = 400;
  const xMin = -3;
  const xMax = 3;
  const yMin = -4;
  const yMax = 4;

  // Convert analytical X/Y values to rendering screen coordinates
  const mapX = (x: number) => ((x - xMin) / (xMax - xMin)) * svgWidth;
  const mapY = (y: number) => svgHeight - ((y - yMin) / (yMax - yMin)) * svgHeight;

  // --- Mathematical Computations ---
  // 1. Derivative Outputs
  const fx = preset.f(targetX);
  const slope = preset.df(targetX);

  // Calculate tangent line endpoints crossing our visible X boundaries
  const tangentY1 = fx + slope * (xMin - targetX);
  const tangentY2 = fx + slope * (xMax - targetX);

  // 2. Definite Integral Outputs (Exact Area via Fundamental Theorem of Calculus)
  const exactArea = preset.F(b) - preset.F(a);

  // 3. Riemann Sum Approximation
  const dx = (b - a) / partitions;
  let riemannSumArea = 0;
  const rectangles: { x: number; y: number; w: number; h: number; isNegative: boolean }[] = [];

  for (let i = 0; i < partitions; i++) {
    const xLeft = a + i * dx;
    const xRight = xLeft + dx;
    let evalPoint = xLeft; // Default to Left sum

    if (riemannMethod === 'right') evalPoint = xRight;
    if (riemannMethod === 'mid') evalPoint = xLeft + dx / 2;

    const rectHeightVal = preset.f(evalPoint);
    riemannSumArea += rectHeightVal * dx;

    // Convert values for proper SVG top-left anchoring mapping
    const svgX = mapX(xLeft);
    const svgW = mapX(xRight) - svgX;
    const yOrigin = mapY(0);
    const yTop = mapY(rectHeightVal);

    rectangles.push({
      x: svgX,
      y: rectHeightVal >= 0 ? yTop : yOrigin,
      w: svgW,
      h: Math.abs(yOrigin - yTop),
      isNegative: rectHeightVal < 0,
    });
  }

  // Generate smooth path array for the main function curve
  const generateCurvePath = () => {
    const points: string[] = [];
    const steps = 150; // Rendering fidelity
    for (let i = 0; i <= steps; i++) {
      const currentX = xMin + (i / steps) * (xMax - xMin);
      const currentY = preset.f(currentX);
      // Skip offscreen massive coordinate plotting
      if (currentY >= yMin - 2 && currentY <= yMax + 2) {
        points.push(`${mapX(currentX)},${mapY(currentY)}`);
      }
    }
    return points.join(' L ');
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto p-6 font-sans bg-slate-50 border border-slate-200 rounded-2xl shadow-sm select-none">
      
      {/* Title Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-800 m-0">Interactive Calculus Simulator</h2>
        <p className="text-sm text-slate-500 mt-1">
          Explore derivatives (rates of change) and definite integrals (accumulation under curves)
        </p>
      </div>

      {/* Main Viewport Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SVG Mathematical Graph Display (Spans 2 columns) */}
        <div className="lg:col-span-2 bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between items-center relative overflow-hidden">
          
          {/* Preset Selector Dropdown */}
          <div className="w-full flex justify-between items-center mb-2 z-10 px-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Graph Viewport</span>
            <select
              value={selectedPreset}
              onChange={(e) => setSelectedPreset(e.target.value)}
              className="bg-slate-100 border border-slate-300 rounded px-3 py-1 text-xs font-bold text-slate-700 cursor-pointer outline-none hover:bg-slate-200"
            >
              {presets.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Core Visual SVG Workspace */}
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto border border-slate-100 rounded bg-slate-50/20">
            
            {/* Cartesian Grid Guides */}
            <g stroke="#e2e8f0" strokeWidth="1">
              {[...Array(7)].map((_, idx) => {
                const gridX = mapX(xMin + idx);
                return <line key={`gx-${idx}`} x1={gridX} y1="0" x2={gridX} y2={svgHeight} strokeDasharray="3 3" />;
              })}
              {[...Array(9)].map((_, idx) => {
                const gridY = mapY(yMin + idx);
                return <line key={`gy-${idx}`} x1="0" y1={gridY} x2={svgWidth} y2={gridY} strokeDasharray="3 3" />;
              })}
            </g>

            {/* Main X & Y Axes */}
            <line x1="0" y1={mapY(0)} x2={svgWidth} y2={mapY(0)} stroke="#94a3b8" strokeWidth="1.5" />
            <line x1={mapX(0)} y1="0" x2={mapX(0)} y2={svgHeight} stroke="#94a3b8" strokeWidth="1.5" />

            {/* Riemann Sum Integration Rectangles */}
            <g opacity="0.45">
              {rectangles.map((rect, idx) => (
                <rect
                  key={`rect-${idx}`}
                  x={rect.x}
                  y={rect.y}
                  width={rect.w}
                  height={rect.h}
                  className={rect.isNegative ? 'fill-amber-500 stroke-amber-700' : 'fill-sky-500 stroke-sky-700'}
                  strokeWidth="1"
                />
              ))}
            </g>

            {/* Mathematical Function Path Trace */}
            <path
              d={`M ${generateCurvePath()}`}
              fill="none"
              stroke="#334155"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Derivative Tangent Line */}
            <line
              x1={mapX(xMin)}
              y1={mapY(tangentY1)}
              x2={mapX(xMax)}
              y2={mapY(tangentY2)}
              stroke="#dc2626"
              strokeWidth="2"
              strokeDasharray="5 3"
            />

            {/* Tangent Target Node */}
            <circle
              cx={mapX(targetX)}
              cy={mapY(fx)}
              r="6"
              className="fill-red-600 stroke-white stroke-2"
            />

            {/* Origin labels */}
            <text x={mapX(0.1)} y={mapY(-0.3)} fontSize="10" fill="#64748b" fontWeight="bold">0</text>
          </svg>

          {/* Visual State Color Legend */}
          <div className="w-full flex justify-center gap-6 mt-3 text-[11px] font-medium text-slate-600">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-700 inline-block"></span> Curve f(x)</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block"></span> Tangent Slope f'(x)</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-sky-500 inline-block opacity-60"></span> Accumulated Area</span>
          </div>
        </div>

        {/* Input Parameters Controls Sidebar */}
        <div className="flex flex-col gap-4">
          
          {/* Derivative Control Group */}
          <div className="bg-red-50/50 border border-red-100 p-4 rounded-xl space-y-3">
            <div className="text-xs font-bold text-red-800 uppercase tracking-wider">Differential Parameters</div>
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Evaluation Point (x)</span>
                <span className="font-mono text-red-900 font-bold">{targetX.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min={xMin + 0.2}
                max={xMax - 0.2}
                step="0.05"
                value={targetX}
                onChange={(e) => setTargetX(parseFloat(e.target.value))}
                className="w-full accent-red-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Integral Control Group */}
          <div className="bg-sky-50/50 border border-sky-100 p-4 rounded-xl space-y-3">
            <div className="text-xs font-bold text-sky-800 uppercase tracking-wider">Integral Parameters</div>
            
            {/* Bound A Slider */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Interval Bound (a)</span>
                <span className="font-mono text-sky-900 font-bold">{boundA.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min={xMin}
                max={xMax}
                step="0.1"
                value={boundA}
                onChange={(e) => setBoundA(parseFloat(e.target.value))}
                className="w-full accent-sky-600 cursor-pointer"
              />
            </div>

            {/* Bound B Slider */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Interval Bound (b)</span>
                <span className="font-mono text-sky-900 font-bold">{boundB.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min={xMin}
                max={xMax}
                step="0.1"
                value={boundB}
                onChange={(e) => setBoundB(parseFloat(e.target.value))}
                className="w-full accent-sky-600 cursor-pointer"
              />
            </div>

            {/* Partitions (n) Slider */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Riemann Rectangles (n)</span>
                <span className="font-mono text-sky-900 font-bold">{partitions}</span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                value={partitions}
                onChange={(e) => setPartitions(parseInt(e.target.value))}
                className="w-full accent-sky-600 cursor-pointer"
              />
            </div>

            {/* Evaluation Placement Multi-Toggle */}
            <div className="pt-1">
              <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">Approximation Height Mapping</span>
              <div className="grid grid-cols-3 gap-1 bg-slate-200/70 p-1 rounded-lg">
                {(['left', 'mid', 'right'] as const).map((method) => (
                  <button
                    key={method}
                    onClick={() => setRiemannMethod(method)}
                    className={`py-1 text-[11px] font-bold rounded capitalize transition-all ${
                      riemannMethod === method ? 'bg-white text-sky-800 shadow-sm' : 'text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Outputs Dashboard Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
        
        {/* Output 1: Function evaluation */}
        <div className="p-3 bg-white border border-slate-200 rounded-xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Function Output</span>
          <span className="text-sm font-mono font-bold text-slate-800">f({targetX.toFixed(1)}) = {fx.toFixed(2)}</span>
        </div>

        {/* Output 2: Tangent slope */}
        <div className="p-3 bg-red-50/40 border border-red-100 rounded-xl">
          <span className="text-[10px] font-bold text-red-500 uppercase block">Instantaneous Slope</span>
          <span className="text-sm font-mono font-bold text-red-900">f'({targetX.toFixed(1)}) = {slope.toFixed(2)}</span>
        </div>

        {/* Output 3: Approximated Integral */}
        <div className="p-3 bg-sky-50/40 border border-sky-100 rounded-xl">
          <span className="text-[10px] font-bold text-sky-600 uppercase block">Riemann Sum Area</span>
          <span className="text-sm font-mono font-bold text-sky-900">≈ {riemannSumArea.toFixed(3)}</span>
        </div>

        {/* Output 4: Analytical Definite Integral Area */}
        <div className="p-3 bg-emerald-50/40 border border-emerald-100 rounded-xl">
          <span className="text-[10px] font-bold text-emerald-600 uppercase block">Exact Integral Area</span>
          <span className="text-sm font-mono font-bold text-emerald-900">∫ f(x)dx = {exactArea.toFixed(3)}</span>
        </div>

      </div>
    </div>
  );
};

export default CalculusSimulator;