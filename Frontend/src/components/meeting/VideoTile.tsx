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
    if (videoRef.current && stream) {
      if (videoRef.current.srcObject !== stream) {
        videoRef.current.srcObject = stream;
      }
      
      // Explicitly call play() and handle potential browser blocks
      const playVideo = async () => {
        try {
          if (videoRef.current) {
            await videoRef.current.play();
          }
        } catch (err) {
          console.warn("Video play interrupted or blocked:", err);
        }
      };
      
      playVideo();
    }
  }, [stream, isVideoEnabled]);

  return (
    <div className="relative h-full w-full min-h-[120px] overflow-hidden rounded-2xl bg-[#111214] shadow-2xl ring-1 ring-white/10 sm:min-h-[150px] sm:rounded-[28px]">
      {stream && isVideoEnabled ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={muted}
          className={`h-full w-full object-cover ${isLocal ? 'scale-x-[-1]' : ''}`}
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-[#2b2c30] p-4 text-slate-400">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#3c4043] sm:h-16 sm:w-16 md:h-24 md:w-24">
            <User className="h-7 w-7 sm:h-8 sm:w-8 md:h-12 md:w-12" />
          </div>
          <span className="text-[11px] font-medium sm:text-xs md:text-sm">Camera is off</span>
        </div>
      )}

      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between gap-2 sm:bottom-4 sm:left-4 sm:right-4 sm:gap-3">
        <div className="min-w-0 rounded-full bg-black/55 px-3 py-1.5 text-white backdrop-blur-xl sm:px-4 sm:py-2">
          <p className="truncate text-xs font-semibold sm:text-sm">{name}</p>
          {label && <p className="text-[10px] text-slate-300">{label}</p>}
        </div>
        <div className="flex gap-2">
          {!isAudioEnabled && (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-500 text-white sm:h-10 sm:w-10">
              <MicOff size={15} />
            </div>
          )}
          {!isVideoEnabled && (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-slate-950 sm:h-10 sm:w-10">
              <VideoOff size={15} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoTile;
