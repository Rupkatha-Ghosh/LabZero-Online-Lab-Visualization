import React from 'react';

interface FeedbackPageShellProps {
  children: React.ReactNode;
  tone?: 'cyan' | 'indigo' | 'emerald';
}

const backgrounds = {
  cyan: 'bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.16),transparent_28rem),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)]',
  indigo:
    'bg-[radial-gradient(circle_at_top_left,rgba(79,70,229,0.14),transparent_30rem),radial-gradient(circle_at_bottom_right,rgba(20,184,166,0.13),transparent_28rem),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)]',
  emerald:
    'bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.16),transparent_30rem),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.12),transparent_28rem),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)]',
};

const FeedbackPageShell = ({
  children,
  tone = 'cyan',
}: FeedbackPageShellProps) => (
  <main
    className={`feedback-module min-h-screen overflow-y-auto text-slate-950 ${backgrounds[tone]}`}
  >
    {children}
  </main>
);

export default FeedbackPageShell;
