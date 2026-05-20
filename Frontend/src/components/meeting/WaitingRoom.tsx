import React from 'react';
import { Camera, Loader2, ArrowLeft } from 'lucide-react';
import VideoTile from './VideoTile';
import Controls from './Controls';


interface WaitingRoomProps {
  title: string;
  subtitle?: string;
  stream: MediaStream | null;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isLoading: boolean;
  error?: string | null;
  onJoin: () => void;
  onBack: () => void;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
}

const WaitingRoom: React.FC<WaitingRoomProps> = ({ 
  title, 
  subtitle, 
  stream,
  isAudioEnabled,
  isVideoEnabled,
  isLoading, 
  error, 
  onJoin, 
  onBack,
  onToggleAudio,
  onToggleVideo
}) => (
  <div className="flex min-h-screen flex-col items-center justify-center bg-[#020617] p-3 text-white sm:p-4 md:p-8">
    <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-stretch gap-4 sm:gap-6 lg:grid-cols-2 lg:gap-8">
      
      {/* 📹 Video Preview Section */}
      <div className="relative flex min-h-[260px] w-full flex-col overflow-hidden rounded-3xl bg-white/[0.04] shadow-2xl ring-1 ring-white/10 backdrop-blur-xl sm:min-h-[320px] md:min-h-[400px] md:rounded-[40px]">
        {/* Back Button (Overlay) */}
        <button 
          onClick={onBack}
          className="absolute left-4 top-4 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-xl transition-all hover:bg-black/60 active:scale-95 sm:left-6 sm:top-6 sm:h-12 sm:w-12"
          title="Go Back"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="flex-1 overflow-hidden">
          <VideoTile 
            stream={stream} 
            name="Preview" 
            isLocal 
            muted 
            isAudioEnabled={isAudioEnabled} 
            isVideoEnabled={isVideoEnabled} 
          />
        </div>

        {/* Controls Overlay */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 sm:bottom-8">
          <Controls 
            isAudioEnabled={isAudioEnabled}
            isVideoEnabled={isVideoEnabled}
            isScreenSharing={false}
            onToggleAudio={onToggleAudio}
            onToggleVideo={onToggleVideo}
            onToggleScreenShare={() => {}}
            onLeave={() => {}}
            minimal 
          />
        </div>
      </div>

      {/* 📝 Info & Join Section */}
      <div className="flex flex-col justify-center rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl backdrop-blur-xl sm:p-8 md:rounded-[40px] md:p-12 lg:p-16">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-300 sm:mb-8 sm:h-16 sm:w-16 sm:rounded-3xl">
          <Camera size={26} />
        </div>
        
        <h1 className="mb-3 text-2xl font-display font-semibold tracking-tight sm:mb-4 sm:text-3xl md:text-5xl lg:text-6xl">{title}</h1>
        <p className="mb-7 max-w-md text-sm leading-relaxed text-slate-400 sm:mb-12 sm:text-lg">
          {subtitle || 'Check your camera and microphone before entering the online class.'}
        </p>
        
        {error && (
          <div className="mb-6 rounded-2xl border border-rose-400/30 bg-rose-400/10 p-4 text-sm text-rose-100 sm:mb-8 sm:p-5">
            <span className="font-bold uppercase tracking-wider text-rose-300">Camera Error:</span> {error}
          </div>
        )}

        <div className="flex flex-col gap-4 sm:flex-row">
          <button
            onClick={onJoin}
            disabled={isLoading}
            className="group flex flex-[2] items-center justify-center gap-3 rounded-2xl bg-sky-600 px-6 py-4 text-[11px] font-bold uppercase tracking-[0.18em] text-white transition-all hover:bg-sky-500 hover:shadow-2xl hover:shadow-sky-500/30 disabled:opacity-60 sm:px-8 sm:py-6 sm:text-xs sm:tracking-[0.25em]"
          >
            {isLoading && <Loader2 size={18} className="animate-spin" />}
            Join Online Class
          </button>
        </div>
        
        <p className="mt-5 text-center text-xs text-slate-500 sm:mt-8 md:text-left">
          By joining, you agree to LabZero's terms and conditions.
        </p>
      </div>
    </div>
  </div>
);


export default WaitingRoom;
