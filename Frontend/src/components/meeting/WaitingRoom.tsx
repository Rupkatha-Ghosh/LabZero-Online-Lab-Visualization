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
  <div className="flex min-h-screen flex-col items-center justify-center bg-[#020617] p-4 text-white md:p-8">
    <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-stretch gap-8 lg:grid-cols-2">
      
      {/* 📹 Video Preview Section */}
      <div className="relative flex min-h-[300px] w-full flex-col overflow-hidden rounded-[40px] bg-white/[0.04] shadow-2xl ring-1 ring-white/10 backdrop-blur-xl md:min-h-[400px]">
        {/* Back Button (Overlay) */}
        <button 
          onClick={onBack}
          className="absolute left-6 top-6 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-xl transition-all hover:bg-black/60 active:scale-95"
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
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
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
      <div className="flex flex-col justify-center rounded-[40px] border border-white/10 bg-white/[0.04] p-8 shadow-2xl backdrop-blur-xl md:p-12 lg:p-16">
        <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-3xl bg-sky-500/10 text-sky-300">
          <Camera size={30} />
        </div>
        
        <h1 className="mb-4 text-3xl font-display font-semibold tracking-tight md:text-5xl lg:text-6xl">{title}</h1>
        <p className="mb-12 max-w-md text-lg leading-relaxed text-slate-400">
          {subtitle || 'Check your camera and microphone before entering the online class.'}
        </p>
        
        {error && (
          <div className="mb-8 rounded-2xl border border-rose-400/30 bg-rose-400/10 p-5 text-sm text-rose-100">
            <span className="font-bold uppercase tracking-wider text-rose-300">Camera Error:</span> {error}
          </div>
        )}

        <div className="flex flex-col gap-4 sm:flex-row">
          <button
            onClick={onJoin}
            disabled={isLoading}
            className="group flex flex-[2] items-center justify-center gap-3 rounded-2xl bg-sky-600 px-8 py-6 text-xs font-bold uppercase tracking-[0.25em] text-white transition-all hover:bg-sky-500 hover:shadow-2xl hover:shadow-sky-500/30 disabled:opacity-60"
          >
            {isLoading && <Loader2 size={18} className="animate-spin" />}
            Join Online Class
          </button>
        </div>
        
        <p className="mt-8 text-center text-xs text-slate-500 md:text-left">
          By joining, you agree to LabZero's terms and conditions.
        </p>
      </div>
    </div>
  </div>
);


export default WaitingRoom;
