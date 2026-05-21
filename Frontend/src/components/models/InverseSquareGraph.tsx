import React from 'react';

interface InverseSquareGraphProps {
  theme?: 'light' | 'dark';
}

export const InverseSquareGraph: React.FC<InverseSquareGraphProps> = ({ theme = 'light' }) => {
  const axisColor = theme === 'dark' ? "#f8fafc" : "#0F172A";
  const labelColor = theme === 'dark' ? "#cbd5e1" : "#64748B";
  const gridColor = theme === 'dark' ? "#334155" : "#CBD5E1";

  const generatePath = () => {
    let path = "";
    for (let i = 0; i <= 100; i++) {
      const r = 0.8 + (i / 100) * 4.3;
      const E = 1 / (r * r);
      const px = 35 + ((r - 0.7) / 4.3) * 185;
      const py = 160 - (E / 2.2) * 140;
      if (i === 0) path += `M ${px} ${py} `;
      else path += `L ${px} ${py} `;
    }
    return path;
  };

  return (
    <svg viewBox="0 0 250 210" className="w-full h-full block mx-auto overflow-visible" preserveAspectRatio="xMidYMid meet">
      <line x1="35" y1="96" x2="48" y2="96" stroke={gridColor} strokeWidth="1" strokeDasharray="4 4" />
      <line x1="48" y1="160" x2="48" y2="96" stroke={gridColor} strokeWidth="1" strokeDasharray="4 4" />
      
      {/* Y Axis */}
      <line x1="35" y1="15" x2="35" y2="160" stroke={axisColor} strokeWidth="1.5" />
      <polygon points="32,20 38,20 35,10" fill={axisColor} />
      <text x="12" y="24" fontSize="13" fill={axisColor} fontFamily="serif" fontWeight="600">|E|</text>
      
      {/* X Axis */}
      <line x1="35" y1="160" x2="235" y2="160" stroke={axisColor} strokeWidth="1.5" />
      <polygon points="230,157 230,163 240,160" fill={axisColor} />
      <text x="238" y="172" fontSize="14" fill={axisColor} fontStyle="italic" fontFamily="serif" fontWeight="600">r</text>
      
      {[1, 2, 3, 4].map(val => {
        const tickX = 35 + ((val - 0.7) / 4.3) * 185;
        return (
          <g key={val}>
            <line x1={tickX} y1="160" x2={tickX} y2="166" stroke={axisColor} strokeWidth="1.5" />
            <text x={tickX} y="188" fontSize="13" fill={labelColor} textAnchor="middle" fontWeight="600">{val}</text>
          </g>
        );
      })}
      <path d={generatePath()} fill="none" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};
