import React, { useState, useEffect, useCallback } from 'react';
import { Play, RefreshCw, BarChart3, Binary, Info } from 'lucide-react';

type ExperimentMode = 'coin' | 'die';

interface Result {
  label: string;
  count: number;
  experimentalProb: number;
  theoreticalProb: number;
}

const ProbabilityLab: React.FC = () => {
  const [mode, setMode] = useState<ExperimentMode>('coin');
  const [trialInput, setTrialInput] = useState<number>(100);
  const [results, setResults] = useState<Result[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);

  // --- Simulation Logic ---
  const runExperiment = useCallback(() => {
    setIsSimulating(true);
    
    // Slight delay to allow UI feedback
    setTimeout(() => {
      const outcomes: Record<string, number> = {};
      const labels = mode === 'coin' ? ['Heads', 'Tails'] : ['1', '2', '3', '4', '5', '6'];
      const theoreticalProb = 1 / labels.length;

      // Initialize counts
      labels.forEach(l => (outcomes[l] = 0));

      // Run random trials
      for (let i = 0; i < trialInput; i++) {
        const rand = Math.floor(Math.random() * labels.length);
        outcomes[labels[rand]]++;
      }

      // Map to Result objects
      const newResults = labels.map(label => ({
        label,
        count: outcomes[label],
        experimentalProb: outcomes[label] / trialInput,
        theoreticalProb: theoreticalProb,
      }));

      setResults(newResults);
      setIsSimulating(false);
    }, 100);
  }, [mode, trialInput]);

  // Re-run if mode changes
  useEffect(() => {
    runExperiment();
  }, [mode]);

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto p-6 font-sans bg-slate-50 border border-slate-200 rounded-2xl shadow-sm">
      
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-800 m-0">Probability & Statistics Lab</h2>
        <p className="text-sm text-slate-500 mt-1">
          Visualizing the Law of Large Numbers through iterative sampling
        </p>
      </div>

      {/* Control Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        
        {/* Mode Toggle */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Experiment Type</label>
          <div className="flex p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => setMode('coin')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-xs font-bold transition-all ${mode === 'coin' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Binary size={14} /> Coin Flip
            </button>
            <button
              onClick={() => setMode('die')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-xs font-bold transition-all ${mode === 'die' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <BarChart3 size={14} /> Die Roll
            </button>
          </div>
        </div>

        {/* Trial Input Slider */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Number of Trials (n)</label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="1"
              max="10000"
              step="1"
              value={trialInput}
              onChange={(e) => setTrialInput(parseInt(e.target.value))}
              className="flex-1 accent-blue-600 cursor-pointer"
            />
            <span className="text-xs font-mono font-bold text-slate-700 w-12">{trialInput}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-end gap-2">
          <button
            onClick={runExperiment}
            disabled={isSimulating}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-xs font-bold transition-all active:scale-95 disabled:opacity-50"
          >
            {isSimulating ? <RefreshCw className="animate-spin" size={14} /> : <Play size={14} />} 
            Run Experiment
          </button>
        </div>
      </div>

      {/* Main Visualization Viewport */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-8">
        
        {/* Bar Chart Representation */}
        <div className="relative h-64 w-full flex items-end justify-around border-b border-slate-200 pb-2 px-4">
          
          {/* Theoretical Probability Marker Line */}
          {results.length > 0 && (
            <div 
              className="absolute w-full border-t-2 border-dashed border-red-400 z-10 pointer-events-none transition-all duration-500"
              style={{ bottom: `${results[0].theoreticalProb * 100 * 1.5}%` }}
            >
              <span className="absolute -top-5 right-0 text-[10px] font-bold text-red-500 bg-white px-1">
                Theoretical: {(results[0].theoreticalProb * 100).toFixed(1)}%
              </span>
            </div>
          )}

          {/* Individual Bars */}
          {results.map((res, idx) => (
            <div key={idx} className="flex flex-col items-center w-full max-w-[60px] group relative">
              {/* Experimental Bar */}
              <div 
                className="w-full bg-blue-500 rounded-t-md transition-all duration-500 ease-out relative"
                style={{ height: `${res.experimentalProb * 100 * 1.5}%` }}
              >
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-blue-700">
                  {(res.experimentalProb * 100).toFixed(1)}%
                </div>
              </div>
              <span className="mt-3 text-xs font-bold text-slate-600 uppercase tracking-tighter">{res.label}</span>
            </div>
          ))}
        </div>

        {/* Statistical Summary Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400">
                <th className="pb-2 font-bold uppercase tracking-wider">Outcome</th>
                <th className="pb-2 font-bold uppercase tracking-wider">Count</th>
                <th className="pb-2 font-bold uppercase tracking-wider">Experimental Prob.</th>
                <th className="pb-2 font-bold uppercase tracking-wider">Deviation (Error)</th>
              </tr>
            </thead>
            <tbody className="text-slate-700 font-mono">
              {results.map((res, idx) => {
                const deviation = res.experimentalProb - res.theoreticalProb;
                return (
                  <tr key={idx} className="border-b border-slate-50 last:border-0">
                    <td className="py-3 font-bold text-slate-900">{res.label}</td>
                    <td className="py-3">{res.count}</td>
                    <td className="py-3">{(res.experimentalProb * 100).toFixed(2)}%</td>
                    <td className={`py-3 font-bold ${deviation >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {deviation >= 0 ? '+' : ''}{(deviation * 100).toFixed(2)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Educational Footer */}
      <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex gap-3 items-start">
        <Info className="text-blue-500 shrink-0 mt-0.5" size={16} />
        <div>
          <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-1">Law of Large Numbers</h4>
          <p className="text-xs text-blue-700 leading-relaxed">
            Observation: As you increase <strong>n (trials)</strong>, the experimental probability 
            stabilizes and the <strong>Deviation</strong> decreases. In small samples, randomness 
            causes high error; in large samples, results converge toward the theoretical value.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProbabilityLab;