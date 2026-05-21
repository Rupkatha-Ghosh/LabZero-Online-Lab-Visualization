import { MessageSquareText } from 'lucide-react';

interface FeedbackButtonProps {
  theme: 'dark' | 'light';
  onClick: () => void;
}

const FeedbackButton = ({ theme, onClick }: FeedbackButtonProps) => {
  const isLight = theme === 'light';

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Open feedback page"
      title="Feedback"
      className={`fixed bottom-24 right-6 z-[140] inline-flex h-14 w-14 items-center justify-center rounded-2xl border transition-all duration-300 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
        isLight
          ? 'border-slate-200 bg-white/90 text-indigo-700 shadow-[0_18px_45px_rgba(15,23,42,0.16)] hover:bg-indigo-50 focus-visible:ring-indigo-500 focus-visible:ring-offset-white'
          : 'border-white/10 bg-slate-900/90 text-cyan-200 shadow-[0_18px_45px_rgba(0,0,0,0.38)] hover:border-cyan-300/30 hover:bg-slate-800 focus-visible:ring-cyan-300 focus-visible:ring-offset-slate-950'
      }`}
    >
      <MessageSquareText size={24} />
    </button>
  );
};

export default FeedbackButton;
