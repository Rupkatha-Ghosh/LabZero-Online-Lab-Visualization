import React from 'react';
import { Camera, Loader2 } from 'lucide-react';

interface WaitingRoomProps {
  title: string;
  subtitle?: string;
  isLoading: boolean;
  error?: string | null;
  onJoin: () => void;
  onBack: () => void;
}

const WaitingRoom: React.FC<WaitingRoomProps> = ({ title, subtitle, isLoading, error, onJoin, onBack }) => (
  <div className="flex h-full items-center justify-center bg-[#020617] p-6 text-white">
    <div className="w-full max-w-xl rounded-[36px] border border-white/10 bg-white/[0.04] p-8 shadow-2xl backdrop-blur-xl">
      <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-3xl bg-sky-500/10 text-sky-300">
        <Camera size={30} />
      </div>
      <h1 className="mb-3 text-3xl font-display font-semibold tracking-tight">{title}</h1>
      <p className="mb-8 text-sm leading-relaxed text-slate-400">{subtitle || 'Check your camera and microphone before entering the online class.'}</p>
      {error && <div className="mb-5 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-100">{error}</div>}
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          onClick={onJoin}
          disabled={isLoading}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-sky-600 px-5 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-all hover:bg-sky-500 disabled:opacity-60"
        >
          {isLoading && <Loader2 size={16} className="animate-spin" />}
          Join Class
        </button>
        <button onClick={onBack} className="rounded-2xl border border-white/10 px-5 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300 hover:bg-white/10">
          Back
        </button>
      </div>
    </div>
  </div>
);

export default WaitingRoom;
