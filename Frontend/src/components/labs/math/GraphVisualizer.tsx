import { useLanguage } from '../../../context/LanguageContext';
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
  
  const { t } = useLanguage();const [expression, setExpression] = useState('x*x');
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
    <div className="bg-[var(--bg-panel)] backdrop-blur-xl p-8 rounded-[32px] border border-[var(--border-glass)] shadow-2xl transition-colors duration-500">

      <h2 className="text-xl font-display font-bold mb-6 text-[var(--color-primary)] uppercase tracking-tight flex items-center gap-3">
        <span>📊</span>{t('Interactive Graph')}</h2>

      {/* INPUT */}
      <div className="flex gap-3 mb-8">
        <input
          value={expression}
          onChange={(e) => setExpression(e.target.value)}
          placeholder={t('Enter function e.g. x*x + 2*x')}
          className="flex-1 px-6 py-3 rounded-2xl bg-[var(--bg-deep)] text-[var(--text-primary)] border border-[var(--border-glass)] outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all font-mono text-sm shadow-inner"
        />

        <button
          onClick={handlePlot}
          className="px-8 py-3 bg-[var(--color-primary)] text-white rounded-2xl hover:opacity-90 transition-all font-bold shadow-lg shadow-[var(--color-primary)]/20"
        >{t('Plot')}</button>
      </div>

      {/* GRAPH */}
      <div className="h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-glass)" />
            <XAxis 
              dataKey="x" 
              stroke="var(--text-muted)" 
              tick={{ fill: 'var(--text-muted)', fontSize: 10, fontWeight: 'bold' }} 
            />
            <YAxis 
              stroke="var(--text-muted)" 
              tick={{ fill: 'var(--text-muted)', fontSize: 10, fontWeight: 'bold' }} 
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'var(--bg-panel)', 
                borderColor: 'var(--border-glass)', 
                borderRadius: '16px',
                color: 'var(--text-primary)',
                fontSize: '12px',
                fontWeight: 'bold'
              }} 
            />
            <Line type="monotone" dataKey="y" stroke="var(--color-primary)" strokeWidth={4} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
};

export default GraphVisualizer;