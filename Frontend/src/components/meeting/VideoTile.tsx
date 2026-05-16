import React, { useEffect, useRef } from 'react';
import { MicOff, VideoOff, User } from 'lucide-react';

interface VideoTileProps {
  stream: MediaStream | null;
  name: string;
  label?: string;
  muted?: boolean;
  isAudioEnabled?: boolean;
  isVideoEnabled?: boolean;
  isLocal?: boolean;
}

const VideoTile: React.FC<VideoTileProps> = ({
  stream,
  name,
  label,
  muted = false,
  isAudioEnabled = true,
  isVideoEnabled = true,
  isLocal = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && videoRef.current.srcObject !== stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="relative h-full min-h-[320px] w-full overflow-hidden rounded-[28px] bg-[#111214] shadow-2xl ring-1 ring-white/10">
      {stream && isVideoEnabled ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={muted}
          className={`h-full w-full object-cover ${isLocal ? 'scale-x-[-1]' : ''}`}
        />
      ) : (
        <div className="flex h-full min-h-[320px] flex-col items-center justify-center gap-4 bg-[#2b2c30] text-slate-400">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#3c4043]">
            <User size={42} />
          </div>
          <span className="text-sm font-medium">Camera is off</span>
        </div>
      )}

      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3">
        <div className="min-w-0 rounded-full bg-black/55 px-4 py-2 text-white backdrop-blur-xl">
          <p className="truncate text-sm font-semibold">{name}</p>
          {label && <p className="text-[10px] text-slate-300">{label}</p>}
        </div>
        <div className="flex gap-2">
          {!isAudioEnabled && (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-500 text-white">
              <MicOff size={16} />
            </div>
          )}
          {!isVideoEnabled && (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500 text-slate-950">
              <VideoOff size={16} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoTile;
