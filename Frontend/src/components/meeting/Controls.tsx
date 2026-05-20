import React from 'react';
import { MonitorUp, MonitorX, Mic, MicOff, PhoneOff, Video, VideoOff } from 'lucide-react';

interface ControlsProps {
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
  onLeave: () => void;
  minimal?: boolean;
}

const Controls: React.FC<ControlsProps> = ({
  isAudioEnabled,
  isVideoEnabled,
  isScreenSharing,
  onToggleAudio,
  onToggleVideo,
  onToggleScreenShare,
  onLeave,
  minimal = false,
}) => (
  <div className={`flex items-center justify-center gap-2 sm:gap-3 ${minimal ? 'rounded-full bg-black/40 p-2 backdrop-blur-xl' : ''}`}>
    <button
      onClick={onToggleAudio}
      className={`flex h-11 w-11 items-center justify-center rounded-full transition-all sm:h-12 sm:w-12 ${isAudioEnabled ? 'bg-[#3c4043] text-white hover:bg-[#4b5055]' : 'bg-rose-600 text-white hover:bg-rose-500'}`}
      title={isAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}
    >
      {isAudioEnabled ? <Mic size={19} /> : <MicOff size={19} />}
    </button>
    <button
      onClick={onToggleVideo}
      className={`flex h-11 w-11 items-center justify-center rounded-full transition-all sm:h-12 sm:w-12 ${isVideoEnabled ? 'bg-[#3c4043] text-white hover:bg-[#4b5055]' : 'bg-rose-600 text-white hover:bg-rose-500'}`}
      title={isVideoEnabled ? 'Turn camera off' : 'Turn camera on'}
    >
      {isVideoEnabled ? <Video size={19} /> : <VideoOff size={19} />}
    </button>
    {!minimal && (
      <>
        <button
          onClick={onToggleScreenShare}
          className={`hidden h-12 w-12 items-center justify-center rounded-full transition-all sm:flex ${isScreenSharing ? 'bg-sky-500 text-white' : 'bg-[#3c4043] text-white hover:bg-[#4b5055]'}`}
          title={isScreenSharing ? 'Stop screen share' : 'Share screen'}
        >
          {isScreenSharing ? <MonitorX size={20} /> : <MonitorUp size={20} />}
        </button>
        <button
          onClick={onLeave}
          className="flex h-11 w-11 items-center justify-center gap-2 rounded-full bg-rose-600 text-xs font-semibold uppercase tracking-[0.14em] text-white transition-all hover:bg-rose-500 sm:h-12 sm:w-auto sm:px-5"
          title="Leave class"
        >
          <PhoneOff size={18} />
          <span className="hidden sm:inline">Leave</span>
        </button>
      </>
    )}
  </div>
);

export default Controls;
