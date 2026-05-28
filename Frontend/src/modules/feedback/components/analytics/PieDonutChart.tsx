import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

interface PieDonutDatum {
  name: string;
  value: number;
  fill?: string;
}

interface PieDonutChartProps {
  data: PieDonutDatum[];
  heightClass?: string;
  legendGridClassName?: string;
  legendMaxHeightClass?: string;
}

const PieDonutChart = ({
  data,
  heightClass = 'h-72',
  legendGridClassName = '',
  legendMaxHeightClass = 'max-h-28',
}: PieDonutChartProps) => {
  const coloredData = data.map((entry, index) => ({
    ...entry,
    fill: entry.fill ?? fallbackColors[index % fallbackColors.length],
  }));

  return (
    <div className={`${heightClass} flex min-h-0 min-w-0 flex-col gap-3`}>
      {coloredData.length ? (
        <>
          <div className="min-h-36 min-w-0 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
                <Tooltip />
                <Pie
                  data={coloredData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius="54%"
                  outerRadius="92%"
                  paddingAngle={coloredData.length > 1 ? 2 : 0}
                >
                  {coloredData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <PieLegend
            data={coloredData}
            gridClassName={legendGridClassName}
            maxHeightClass={legendMaxHeightClass}
          />
        </>
      ) : (
        <div className="flex h-full min-h-36 items-center justify-center rounded-xl border border-dashed border-slate-200 text-sm text-slate-400">
          No responses yet
        </div>
      )}
    </div>
  );
};

const PieLegend = ({
  data,
  gridClassName,
  maxHeightClass,
}: {
  data: PieDonutDatum[];
  gridClassName: string;
  maxHeightClass: string;
}) => (
  <div className={`${maxHeightClass} overflow-y-auto pr-1`}>
    <div className={`grid gap-1.5 text-xs ${gridClassName}`}>
      {data.map((entry) => (
        <div
          key={entry.name}
          className="grid min-w-0 grid-cols-[0.75rem_minmax(0,1fr)_auto] items-center gap-2 rounded-lg bg-white/70 px-2 py-1.5 text-slate-700"
          title={`${entry.name}: ${entry.value}`}
        >
          <span
            className="h-3 w-3 rounded-sm"
            style={{ backgroundColor: entry.fill }}
          />
          <span className="min-w-0 truncate font-medium">{entry.name}</span>
          <span className="tabular-nums text-slate-500">{entry.value}</span>
        </div>
      ))}
    </div>
  </div>
);

export default PieDonutChart;

const fallbackColors = [
  '#4f46e5',
  '#0891b2',
  '#059669',
  '#d97706',
  '#c026d3',
  '#e11d48',
  '#475569',
];
