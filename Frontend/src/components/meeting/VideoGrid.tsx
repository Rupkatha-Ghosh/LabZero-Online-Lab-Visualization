import React from 'react';
import VideoTile from './VideoTile';

export interface ParticipantInfo {
  id: string;
  name: string;
  stream: MediaStream | null;
  isLocal?: boolean;
  isAudioEnabled?: boolean;
  isVideoEnabled?: boolean;
}

interface VideoGridProps {
  participants: ParticipantInfo[];
}

const VideoGrid: React.FC<VideoGridProps> = ({ participants }) => {
  // If participants array is provided (LiveKit mode)
  if (participants && participants.length > 0) {
    if (participants.length === 1) {
      return (
        <div className="mx-auto grid h-full w-full max-w-[1440px] grid-cols-1 place-items-center gap-2 md:gap-4">
          <VideoTile
            stream={participants[0].stream}
            name={participants[0].name}
            muted={participants[0].isLocal}
            isLocal={participants[0].isLocal}
            isAudioEnabled={participants[0].isAudioEnabled ?? true}
            isVideoEnabled={participants[0].isVideoEnabled ?? true}
          />
        </div>
      );
    }
    
    if (participants.length === 2) {
      // Guaranteed vertical stack on mobile (1 col, 2 rows), side-by-side only on large screens (lg)
      return (
        <div className="mx-auto grid h-full w-full max-w-[1440px] grid-cols-1 grid-rows-2 gap-2 lg:grid-cols-2 lg:grid-rows-1 lg:gap-4">
          {participants.map((p) => (
            <div key={p.id} className="min-h-0 min-w-0 h-full w-full">
              <VideoTile
                stream={p.stream}
                name={p.name}
                muted={p.isLocal}
                isLocal={p.isLocal}
                isAudioEnabled={p.isAudioEnabled ?? true}
                isVideoEnabled={p.isVideoEnabled ?? true}
              />
            </div>
          ))}
        </div>
      );
    }

    // Grid for 3+ participants
    let gridLayout = participants.length <= 4 
      ? 'grid-cols-2 grid-rows-2' 
      : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 auto-rows-fr';
    
    return (
      <div className={`mx-auto grid h-full w-full max-w-[1440px] place-items-center gap-2 md:gap-4 ${gridLayout}`}>
        {participants.map((p) => (
          <VideoTile
            key={p.id}
            stream={p.stream}
            name={p.name}
            muted={p.isLocal}
            isLocal={p.isLocal}
            isAudioEnabled={p.isAudioEnabled ?? true}
            isVideoEnabled={p.isVideoEnabled ?? true}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-[1440px] items-center justify-center gap-2 md:gap-4">
      <div className="flex h-full min-h-[260px] w-full max-w-3xl flex-col items-center justify-center gap-3 rounded-[28px] border border-dashed border-white/10 bg-[#2b2c30] p-8 text-center col-span-full">
        <p className="text-base font-medium text-slate-200">Waiting for participants...</p>
      </div>
    </div>
  );
};

export default VideoGrid;
