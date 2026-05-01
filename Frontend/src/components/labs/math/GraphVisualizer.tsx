import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const generateData = (func: (x: number) => number) => {
  const data = [];
  for (let x = -10; x <= 10; x += 0.2) {
    try {
      data.push({ x, y: func(x) });
    } catch {
      data.push({ x, y: null });
    }
  }
  return data;
};

const GraphVisualizer: React.FC = () => {
  const [expression, setExpression] = useState('x*x');
  const [data, setData] = useState(generateData((x) => x * x));

  const handlePlot = () => {
    try {
      // ⚠️ eval used carefully for learning project
      const func = new Function('x', `return ${expression}`) as (x: number) => number;
      setData(generateData(func));
    } catch {
      alert('Invalid expression!');
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-xl">

      <h2 className="text-xl font-semibold mb-4 text-indigo-400">
        📊 Interactive Graph
      </h2>

      {/* INPUT */}
      <div className="flex gap-3 mb-4">
        <input
          value={expression}
          onChange={(e) => setExpression(e.target.value)}
          placeholder="Enter function e.g. x*x + 2*x"
          className="flex-1 px-4 py-2 rounded-lg bg-slate-800 text-white border border-white/10 outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <button
          onClick={handlePlot}
          className="px-4 py-2 bg-indigo-600 rounded-lg hover:scale-105 transition"
        >
          Plot
        </button>
      </div>

      {/* GRAPH */}
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="x" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="y" stroke="#6366f1" strokeWidth={3} dot={false} />
        </LineChart>
      </ResponsiveContainer>

    </div>
  );
};

export default GraphVisualizer;