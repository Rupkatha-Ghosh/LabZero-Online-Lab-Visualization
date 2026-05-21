interface FeedbackSkeletonProps {
  rows?: number;
  variant?: 'page' | 'cards' | 'table';
}

const FeedbackSkeleton = ({
  rows = 4,
  variant = 'page',
}: FeedbackSkeletonProps) => {
  if (variant === 'table') {
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-white/75 p-4 shadow-sm">
        <SkeletonBlock className="mb-4 h-8 w-44" />
        <div className="space-y-3">
          {Array.from({ length: rows }, (_, index) => (
            <SkeletonBlock key={index} className="h-14 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'cards') {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: rows }, (_, index) => (
          <SkeletonBlock key={index} className="h-32 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
      <SkeletonBlock className="h-48 w-full rounded-3xl" />
      <SkeletonBlock className="h-24 w-full rounded-2xl" />
      {Array.from({ length: rows }, (_, index) => (
        <SkeletonBlock key={index} className="h-36 w-full rounded-2xl" />
      ))}
    </div>
  );
};

const SkeletonBlock = ({ className }: { className: string }) => (
  <div
    className={`animate-pulse bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] ${className}`}
  />
);

export default FeedbackSkeleton;
