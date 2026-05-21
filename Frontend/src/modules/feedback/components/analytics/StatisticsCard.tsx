import { LucideIcon } from 'lucide-react';

interface StatisticsCardProps {
  label: string;
  value: string | number;
  detail?: string;
  icon: LucideIcon;
  tone?: 'cyan' | 'indigo' | 'emerald' | 'amber';
}

const toneClasses = {
  cyan: 'bg-cyan-50 text-cyan-700 border-cyan-100',
  indigo: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  amber: 'bg-amber-50 text-amber-700 border-amber-100',
};

const StatisticsCard = ({
  label,
  value,
  detail,
  icon: Icon,
  tone = 'indigo',
}: StatisticsCardProps) => (
  <article className="rounded-2xl border border-slate-200/80 bg-white/85 p-4 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="mt-2 text-3xl font-black text-slate-950">{value}</p>
      </div>
      <span
        className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${toneClasses[tone]}`}
      >
        <Icon size={21} />
      </span>
    </div>
    {detail && <p className="mt-3 text-sm text-slate-500">{detail}</p>}
  </article>
);

export default StatisticsCard;
