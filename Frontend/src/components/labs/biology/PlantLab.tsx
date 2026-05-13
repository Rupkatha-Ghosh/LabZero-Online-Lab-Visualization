import React, { useState } from 'react';

const PlantPhysiologySimulator: React.FC = () => {
  // --- Interface State ---
  const [activeTab, setActiveTab] = useState<'photosynthesis' | 'transpiration'>('photosynthesis');
  
  // --- Environmental Chamber Parameters ---
  const [light, setLight] = useState<number>(60);       // Light Intensity (%)
  const [co2, setCo2] = useState<number>(500);          // CO2 Concentration (ppm)
  const [temp, setTemp] = useState<number>(25);         // Temperature (°C)
  const [humidity, setHumidity] = useState<number>(50); // Relative Humidity (%)

  // --- Physiological Mathematical Models ---

  // 1. Photosynthesis Model (Blackman's Law of Limiting Factors)
  // Light saturates around 80%
  const lightFactor = Math.min(light / 80, 1);
  // CO2 saturates around 1000 ppm
  const co2Factor = Math.min(co2 / 1000, 1);
  // Temperature optimal curve peaking at 28°C. Drops to 0 below 8°C or above 48°C due to enzyme denaturation.
  const tempFactor = Math.max(0, 1 - Math.pow((temp - 28) / 20, 2));

  // Overall Photosynthetic Rate (0 - 100 scale)
  const photoRate = Math.max(0, Math.min(lightFactor, co2Factor) * tempFactor * 100);

  // Determine Active Limiting Factor
  let limitingFactor = 'Optimal / Co-limiting';
  if (tempFactor <= 0.15) {
    limitingFactor = temp > 40 ? 'Temperature (Enzyme Denaturation)' : 'Temperature (Extreme Cold Inactivity)';
  } else if (tempFactor < 0.6 && temp < 20) {
    limitingFactor = 'Temperature (Low Kinetic Energy)';
  } else if (lightFactor < co2Factor) {
    limitingFactor = 'Light Intensity';
  } else if (co2Factor < lightFactor) {
    limitingFactor = 'CO₂ Concentration';
  }

  // 2. Transpiration & Stomatal Mechanics Model
  // Light triggers active transport of K+ ions to open guard cells
  const lightDrive = light / 100;
  // Severe heat and low humidity cause high water tension, triggering stomatal closure to prevent wilting
  const droughtStress = Math.max(0, (temp - 25) / 25) * (1 - humidity / 100);
  
  // Stomatal Aperture (Width of the pore: 0.05 closed slit to 1.0 fully turgid)
  const aperture = Math.max(0.05, Math.min(1, lightDrive - droughtStress + 0.1));

  // Transpiration rate relies on pore size and Vapor Pressure Deficit (VPD proxy)
  const vpd = Math.max(0.05, (temp / 30) * (1 - humidity / 100));
  const transpirationRate = Math.min(100, aperture * vpd * 140);

  // Status strings
  const stomatalStatus = aperture > 0.7 ? 'Fully Turgid (Wide Open)' : aperture > 0.3 ? 'Partially Open' : 'Flaccid (Pore Closed)';

  // Quick Preset Handlers
  const applyPreset = (type: 'optimal' | 'drought' | 'night' | 'heatwave') => {
    if (type === 'optimal') { setLight(85); setCo2(1000); setTemp(28); setHumidity(60); }
    if (type === 'drought') { setLight(90); setCo2(400); setTemp(38); setHumidity(15); }
    if (type === 'night')   { setLight(0); setCo2(450); setTemp(18); setHumidity(80); }
    if (type === 'heatwave'){ setLight(95); setCo2(600); setTemp(46); setHumidity(30); }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto p-6 font-sans bg-slate-50 border border-slate-200 rounded-2xl shadow-sm select-none">
      
      {/* Inline CSS Animation definitions for floating oxygen bubbles */}
      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(0px); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateY(-160px); opacity: 0; }
        }
        .bubble { animation: floatUp 2.5s infinite linear; }
      `}</style>

      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-800 m-0">Plant Physiology Chamber</h2>
        <p className="text-sm text-slate-500 mt-1">
          Model internal chemical energy synthesis and environmental fluid mechanics
        </p>
      </div>

      {/* Lab Navigation / Toggles */}
      <div className="flex justify-center border-b border-slate-200">
        <div className="flex gap-2 bg-slate-200/60 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('photosynthesis')}
            className={`px-4 py-2 rounded-md text-xs font-bold transition-all ${
              activeTab === 'photosynthesis' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🌿 Photosynthesis Lab (O₂ Output)
          </button>
          <button
            onClick={() => setActiveTab('transpiration')}
            className={`px-4 py-2 rounded-md text-xs font-bold transition-all ${
              activeTab === 'transpiration' ? 'bg-white text-sky-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🔬 Transpiration Lab (Stomata View)
          </button>
        </div>
      </div>

      {/* Main Grid Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Graphical Viewport Frame (Spans 2 columns) */}
        <div className="lg:col-span-2 bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between items-center relative overflow-hidden">
          
          <div className="w-full flex justify-between items-center px-2 z-10">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {activeTab === 'photosynthesis' ? 'Aquatic Elodea O₂ Output' : 'Microscopic Epidermal Peel'}
            </span>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
              Chamber Live
            </span>
          </div>

          {/* LAB 1: PHOTOSYNTHESIS VISUALIZATION */}
          {activeTab === 'photosynthesis' ? (
            <div className="w-full flex flex-col items-center my-2">
              <svg viewBox="0 0 300 240" className="w-full max-w-[280px] h-auto">
                {/* Background Light Ray tinting based on light intensity */}
                <rect x="0" y="0" width="300" height="240" fill="#fcfedd" opacity={light / 200} />
                
                {/* Water Beaker Container */}
                <path d="M 70 20 L 70 220 A 10 10 0 0 0 80 230 L 220 230 A 10 10 0 0 0 230 220 L 230 20" fill="none" stroke="#cbd5e1" strokeWidth="4" />
                <rect x="73" y="40" width="154" height="186" fill="#e0f2fe" opacity="0.6" rx="4" />
                <line x1="73" y1="40" x2="227" y2="40" stroke="#0284c7" strokeWidth="1.5" strokeDasharray="4 2" />

                {/* Aquatic Plant Stem & Leaves */}
                <g stroke="#15803d" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  {/* Central main stem */}
                  <line x1="150" y1="225" x2="150" y2="70" strokeWidth="5" />
                  {/* Leaves branching off */}
                  <path d="M 150 190 Q 120 170 100 180" fill="#16a34a" />
                  <path d="M 150 180 Q 180 160 200 170" fill="#16a34a" />
                  <path d="M 150 140 Q 115 120 105 135" fill="#16a34a" />
                  <path d="M 150 130 Q 185 110 195 125" fill="#16a34a" />
                  <path d="M 150 90 Q 125 75 115 85" fill="#16a34a" />
                  <path d="M 150 85 Q 175 70 185 80" fill="#16a34a" />
                </g>

                {/* Dynamic Oxygen Bubbles floating up (amount and presence scaled by photoRate) */}
                {photoRate > 5 && (
                  <g fill="none" stroke="#0369a1" strokeWidth="1.5">
                    <circle cx="140" cy="190" r="3" className="bubble" style={{ animationDelay: '0.0s', animationDuration: `${maxDuration(photoRate)}s` }} />
                    <circle cx="165" cy="160" r="4" className="bubble" style={{ animationDelay: '0.4s', animationDuration: `${maxDuration(photoRate)}s` }} />
                    <circle cx="130" cy="130" r="2.5" className="bubble" style={{ animationDelay: '0.8s', animationDuration: `${maxDuration(photoRate)}s` }} />
                    <circle cx="155" cy="100" r="3.5" className="bubble" style={{ animationDelay: '1.2s', animationDuration: `${maxDuration(photoRate)}s` }} />
                    {photoRate > 40 && (
                      <>
                        <circle cx="120" cy="170" r="3" className="bubble" style={{ animationDelay: '0.2s', animationDuration: `${maxDuration(photoRate)}s` }} />
                        <circle cx="175" cy="120" r="4" className="bubble" style={{ animationDelay: '0.6s', animationDuration: `${maxDuration(photoRate)}s` }} />
                        <circle cx="145" cy="80"  r="4.5" className="bubble" style={{ animationDelay: '1.0s', animationDuration: `${maxDuration(photoRate)}s` }} />
                      </>
                    )}
                  </g>
                )}
                
                {/* Light Source Indicator */}
                {light > 0 && (
                  <g transform="translate(30, 30)">
                    <circle cx="0" cy="0" r="12" fill="#facc15" />
                    <text x="-4" y="4" fontSize="11" fontWeight="bold" fill="#854d0e">☀</text>
                  </g>
                )}
              </svg>

              <div className="text-center mt-1">
                <span className="text-xs text-slate-500 block">Visual Indicator: Oxygen Evolution Rate</span>
                <span className="text-xs font-bold text-emerald-700">
                  {photoRate < 3 ? 'No Activity' : photoRate < 35 ? 'Slow Bubbling' : photoRate < 75 ? 'Moderate Bubbling' : 'Vigorous O₂ Saturation'}
                </span>
              </div>
            </div>
          ) : (
            
            /* LAB 2: TRANSPIRATION & STOMATA VISUALIZATION */
            <div className="w-full flex flex-col items-center my-2">
              <svg viewBox="0 0 300 240" className="w-full max-w-[280px] h-auto bg-emerald-50/20 rounded-lg border border-emerald-100">
                
                {/* Epidermal Wall backdrop lines */}
                <path d="M 0 50 Q 80 60 120 0 M 300 80 Q 220 100 180 0 M 0 180 Q 100 200 120 300 M 300 200 Q 200 220 180 300" fill="none" stroke="#bbf7d0" strokeWidth="2" />

                {/* Stomatal Complex Center: (150, 120) */}
                {/* Left Guard Cell */}
                <path
                  d={`M 150 40 C ${130 - aperture * 45} 50, ${110 - aperture * 55} 190, 150 200 C ${145 - aperture * 25} 170, ${145 - aperture * 25} 70, 150 40 Z`}
                  fill="#86efac"
                  stroke="#16a34a"
                  strokeWidth="3"
                />
                
                {/* Right Guard Cell */}
                <path
                  d={`M 150 40 C ${170 + aperture * 45} 50, ${190 + aperture * 55} 190, 150 200 C ${155 + aperture * 25} 170, ${155 + aperture * 25} 70, 150 40 Z`}
                  fill="#86efac"
                  stroke="#16a34a"
                  strokeWidth="3"
                />

                {/* Chloroplasts inside Guard Cells */}
                <g fill="#15803d">
                  {/* Left cell chloroplasts */}
                  <circle cx={140 - aperture * 15} cy="80" r="3.5" />
                  <circle cx={132 - aperture * 22} cy="120" r="3.5" />
                  <circle cx={138 - aperture * 18} cy="160" r="3.5" />
                  {/* Right cell chloroplasts */}
                  <circle cx={160 + aperture * 15} cy="80" r="3.5" />
                  <circle cx={168 + aperture * 22} cy="120" r="3.5" />
                  <circle cx={162 + aperture * 18} cy="160" r="3.5" />
                </g>

                {/* Central Stomatal Pore (Black inner space visible when bowing open) */}
                <path
                  d={`M 150 45 C ${146 - aperture * 23} 70, ${146 - aperture * 23} 170, 150 195 C ${154 + aperture * 23} 170, ${154 + aperture * 23} 70, 150 45 Z`}
                  fill="#0f172a"
                />

                {/* Escaping Water Vapor Molecules (H2O) */}
                {transpirationRate > 10 && aperture > 0.1 && (
                  <g fill="#38bdf8" opacity="0.8">
                    <circle cx="150" cy="120" r="2.5" className="bubble" style={{ animationDuration: '1.5s', animationDelay: '0s' }} />
                    <circle cx="146" cy="130" r="3"   className="bubble" style={{ animationDuration: '1.5s', animationDelay: '0.5s' }} />
                    <circle cx="154" cy="110" r="2"   className="bubble" style={{ animationDuration: '1.5s', animationDelay: '1.0s' }} />
                  </g>
                )}
              </svg>

              <div className="text-center mt-1">
                <span className="text-xs text-slate-500 block">Microscopic Geometry: Stomatal Guard Cells</span>
                <span className="text-xs font-bold text-sky-700">
                  Pore Aperture Width: {Math.round(aperture * 100)}% ({stomatalStatus})
                </span>
              </div>
            </div>
          )}

          {/* Bottom Alert/Status Bar */}
          <div className="w-full flex justify-between items-center bg-slate-50 border-t border-slate-100 pt-2 px-1 text-xs">
            <span className="font-semibold text-slate-500">Chamber Status:</span>
            <span className="font-mono font-bold text-slate-800">
              {temp > 42 ? '⚠️ High Temp Alert' : humidity < 25 ? '⚠️ High VPD / Arid' : 'Normal Equilibrium'}
            </span>
          </div>

        </div>

        {/* Input Parameters Controls Sidebar */}
        <div className="flex flex-col gap-4">
          
          {/* Quick Environment Presets */}
          <div className="bg-slate-100 p-3 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
              Chamber Presets
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              <button onClick={() => applyPreset('optimal')}  className="p-1 text-[11px] font-semibold bg-white hover:bg-slate-50 border border-slate-200 rounded text-slate-700">Tropical Day</button>
              <button onClick={() => applyPreset('drought')}  className="p-1 text-[11px] font-semibold bg-white hover:bg-slate-50 border border-slate-200 rounded text-slate-700">Arid Drought</button>
              <button onClick={() => applyPreset('night')}    className="p-1 text-[11px] font-semibold bg-white hover:bg-slate-50 border border-slate-200 rounded text-slate-700">Cool Night</button>
              <button onClick={() => applyPreset('heatwave')} className="p-1 text-[11px] font-semibold bg-white hover:bg-slate-50 border border-slate-200 rounded text-slate-700">Heatwave</button>
            </div>
          </div>

          {/* Environmental Controls Stack */}
          <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-3.5 shadow-sm">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-1">
              Environmental Controls
            </div>

            {/* Light Intensity Slider */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span className="flex items-center gap-1">☀ Light Intensity</span>
                <span className="font-mono text-amber-600 font-bold">{light}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={light}
                onChange={(e) => setLight(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {/* CO2 Concentration Slider */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span className="flex items-center gap-1">☁ Atmospheric CO₂</span>
                <span className="font-mono text-emerald-700 font-bold">{co2} ppm</span>
              </div>
              <input
                type="range"
                min="0"
                max="1500"
                step="25"
                value={co2}
                onChange={(e) => setCo2(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

            {/* Temperature Slider */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span className="flex items-center gap-1">🌡 Temperature</span>
                <span className="font-mono text-red-600 font-bold">{temp}°C</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={temp}
                onChange={(e) => setTemp(Number(e.target.value))}
                className="w-full accent-red-500 cursor-pointer"
              />
            </div>

            {/* Humidity Slider */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span className="flex items-center gap-1">💧 Relative Humidity</span>
                <span className="font-mono text-sky-600 font-bold">{humidity}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={humidity}
                onChange={(e) => setHumidity(Number(e.target.value))}
                className="w-full accent-sky-500 cursor-pointer"
              />
            </div>

          </div>
        </div>

      </div>

      {/* Outputs & Metrics Dashboard Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
        
        {/* Output 1: Photosynthetic Rate */}
        <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl flex flex-col justify-between">
          <span className="text-[10px] font-bold text-emerald-700 uppercase block">Photosynthesis Rate</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-mono font-bold text-emerald-900">{photoRate.toFixed(1)}</span>
            <span className="text-[10px] text-emerald-600 font-bold">% max</span>
          </div>
        </div>

        {/* Output 2: Active Limiting Factor */}
        <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-xl flex flex-col justify-between">
          <span className="text-[10px] font-bold text-amber-700 uppercase block">Active Limiting Factor</span>
          <span className="text-xs font-bold text-amber-900 mt-1 leading-tight">{limitingFactor}</span>
        </div>

        {/* Output 3: Transpiration Rate */}
        <div className="p-3 bg-sky-50/50 border border-sky-100 rounded-xl flex flex-col justify-between">
          <span className="text-[10px] font-bold text-sky-700 uppercase block">Transpiration Rate</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-mono font-bold text-sky-900">{transpirationRate.toFixed(1)}</span>
            <span className="text-[10px] text-sky-600 font-bold">% max</span>
          </div>
        </div>

        {/* Output 4: Vapor Pressure Deficit */}
        <div className="p-3 bg-slate-100/70 border border-slate-200 rounded-xl flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-600 uppercase block">Evaporative Pull (VPD)</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-mono font-bold text-slate-800">{vpd.toFixed(2)}</span>
            <span className="text-[10px] text-slate-500 font-bold">kPa proxy</span>
          </div>
        </div>

      </div>
    </div>
  );
};

// Helper function to scale CSS float animation speed cleanly based on rate
function maxDuration(rate: number): number {
  if (rate <= 0) return 99;
  // Speed bounds: Fast bubbling = 1.0s, Slow bubbling = 3.0s
  return Math.max(0.8, 3.5 - (rate / 100) * 2.5);
}

export default PlantPhysiologySimulator;