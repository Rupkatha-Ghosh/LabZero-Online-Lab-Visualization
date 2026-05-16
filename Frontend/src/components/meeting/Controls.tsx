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
}

const Controls: React.FC<ControlsProps> = ({
  isAudioEnabled,
  isVideoEnabled,
  isScreenSharing,
  onToggleAudio,
  onToggleVideo,
  onToggleScreenShare,
  onLeave,
}) => (
  <div className="flex items-center justify-center gap-3">
    <button
      onClick={onToggleAudio}
      className={`flex h-12 w-12 items-center justify-center rounded-full transition-all ${isAudioEnabled ? 'bg-[#3c4043] text-white hover:bg-[#4b5055]' : 'bg-rose-600 text-white hover:bg-rose-500'}`}
      title={isAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}
    >
      {isAudioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
    </button>
    <button
      onClick={onToggleVideo}
      className={`flex h-12 w-12 items-center justify-center rounded-full transition-all ${isVideoEnabled ? 'bg-[#3c4043] text-white hover:bg-[#4b5055]' : 'bg-rose-600 text-white hover:bg-rose-500'}`}
      title={isVideoEnabled ? 'Turn camera off' : 'Turn camera on'}
    >
      {isVideoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
    </button>
    <button
      onClick={onToggleScreenShare}
      className={`flex h-12 w-12 items-center justify-center rounded-full transition-all ${isScreenSharing ? 'bg-sky-500 text-white' : 'bg-[#3c4043] text-white hover:bg-[#4b5055]'}`}
      title={isScreenSharing ? 'Stop screen share' : 'Share screen'}
    >
      {isScreenSharing ? <MonitorX size={20} /> : <MonitorUp size={20} />}
    </button>
    <button
      onClick={onLeave}
      className="flex h-12 items-center gap-2 rounded-full bg-rose-600 px-5 text-xs font-semibold uppercase tracking-[0.14em] text-white transition-all hover:bg-rose-500"
    >
      <PhoneOff size={18} />
      Leave
    </button>
  </div>
);

export default Controls;
