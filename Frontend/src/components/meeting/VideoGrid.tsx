import React from 'react';
import VideoTile from './VideoTile';

interface VideoGridProps {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  localName: string;
  remoteName?: string;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
}

const VideoGrid: React.FC<VideoGridProps> = ({
  localStream,
  remoteStream,
  localName,
  remoteName = 'Remote participant',
  isAudioEnabled,
  isVideoEnabled,
}) => (
  <div className={`mx-auto grid h-full w-full max-w-[1440px] place-items-center gap-4 ${remoteStream ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1'}`}>
    <VideoTile
      stream={localStream}
      name={localName}
      label="You"
      muted
      isLocal
      isAudioEnabled={isAudioEnabled}
      isVideoEnabled={isVideoEnabled}
    />
    {remoteStream ? (
      <VideoTile stream={remoteStream} name={remoteName} label="Connected" />
    ) : (
      <div className="flex h-full min-h-[260px] w-full max-w-3xl flex-col items-center justify-center gap-3 rounded-[28px] border border-dashed border-white/10 bg-[#2b2c30] p-8 text-center">
        <p className="text-base font-medium text-slate-200">Waiting for another participant</p>
        <p className="max-w-sm text-sm leading-relaxed text-slate-400">
          Keep this room open. When the other side joins through the same meeting workflow, their video appears here.
        </p>
      </div>
    )}
  </div>
);

export default VideoGrid;
