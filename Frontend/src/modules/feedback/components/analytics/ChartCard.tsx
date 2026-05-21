import { ReactNode } from 'react';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}

const ChartCard = ({ title, subtitle, action, children }: ChartCardProps) => (
  <section className="rounded-2xl border border-slate-200/80 bg-white/85 p-4 shadow-sm backdrop-blur sm:p-5">
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h2 className="text-lg font-bold text-slate-950">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </div>
    {children}
  </section>
);

export default ChartCard;
