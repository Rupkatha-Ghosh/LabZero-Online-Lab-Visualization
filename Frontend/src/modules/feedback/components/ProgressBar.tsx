interface ProgressBarProps {
  completed: number;
  total: number;
  currentSection: number;
  totalSections: number;
}

const ProgressBar = ({
  completed,
  total,
  currentSection,
  totalSections,
}: ProgressBarProps) => {
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm backdrop-blur">
      <div className="mb-3 flex items-center justify-between gap-3 text-sm">
        <span className="font-medium text-slate-700">
          Section {currentSection} of {totalSections}
        </span>
        <span className="text-slate-500">
          {completed}/{total} answered
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-500 transition-all duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
