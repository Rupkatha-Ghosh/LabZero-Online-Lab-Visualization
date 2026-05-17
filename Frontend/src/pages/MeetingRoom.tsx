import React, { useMemo, useState, useEffect } from 'react';
import { ArrowLeft, MessageSquare, Users, Wifi, WifiOff, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { MeetingConfig, MeetingProvider } from '../context/MeetingContext';
import { useMediaStream } from '../hooks/useMediaStream';
import { useLiveKit } from '../hooks/useLiveKit';
import { createParticipantId, MeetingParticipant } from '../utils/peerUtils';
import VideoGrid from '../components/meeting/VideoGrid';
import Controls from '../components/meeting/Controls';
import ChatPanel from '../components/meeting/ChatPanel';
import ParticipantList from '../components/meeting/ParticipantList';
import WaitingRoom from '../components/meeting/WaitingRoom';

interface MeetingRoomProps {
  config: MeetingConfig;
  onLeave: () => void;
}

const MeetingRoomContent: React.FC<MeetingRoomProps> = ({ config, onLeave }) => {
  const { user } = useAuth();
  const [hasJoined, setHasJoined] = useState(false);
  const [sidePanel, setSidePanel] = useState<'participants' | 'chat' | null>('participants');
  const localName = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || user?.username || 'LabZero User';
  
  // Local preview for the Waiting Room
  const localMedia = useMediaStream();
  
  // Initialize LiveKit for scalable multi-user video/audio
  const livekit = useLiveKit({
    roomId: config.roomId,
    tokenEndpoint: `${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'}/classrooms/livekit/token/`,
    serverUrl: import.meta.env.VITE_LIVEKIT_URL || 'wss://your-project.livekit.cloud'
  });

  const participants = useMemo(() => {
    if (livekit.room) {
      return livekit.participants.map(p => ({
        id: p.id,
        name: p.name,
        role: p.isLocal ? config.role : (config.role === 'host' ? 'guest' : 'host'),
        isLocal: p.isLocal,
        isMuted: !p.isAudioEnabled,
        isCameraOff: !p.isVideoEnabled,
      }));
    }
    return [];
  }, [config.role, livekit.room, livekit.participants]);

  // Pre-warm the camera for the waiting room
  const hasStartedRef = React.useRef(false);
  useEffect(() => {
    if (!hasJoined && !hasStartedRef.current) {
      hasStartedRef.current = true;
      localMedia.start();
    }
  }, [hasJoined, localMedia]);

  const join = async () => {
    setHasJoined(true);
    localMedia.stop(); // Stop preview before joining LiveKit
    const token = localStorage.getItem('labzero_token');
    if (token) {
      await livekit.connect(token);
    }
  };

  const leave = () => {
    livekit.disconnect();
    localMedia.stop();
    onLeave();
  };

  const toggleScreenShare = () => {
    // Screen share logic can be implemented later using LiveKit
    console.log("Screen share via LiveKit coming soon");
  };

  if (!hasJoined) {
    return (
      <WaitingRoom
        title={config.title}
        subtitle={config.subtitle}
        stream={localMedia.stream}
        isAudioEnabled={localMedia.isAudioEnabled}
        isVideoEnabled={localMedia.isVideoEnabled}
        isLoading={localMedia.isLoading}
        error={localMedia.error}
        onJoin={join}
        onBack={onLeave}
        onToggleAudio={localMedia.toggleAudio}
        onToggleVideo={localMedia.toggleVideo}
      />
    );
  }

  const isConnected = !!livekit.room;

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-[#202124] text-white">
      <header className="flex h-[76px] shrink-0 items-center justify-between gap-4 border-b border-white/10 bg-[#202124] px-4 md:px-6">
        <div className="flex min-w-0 items-center gap-4">
          <button onClick={leave} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-slate-300 transition-colors hover:bg-white/10 hover:text-white">
            <ArrowLeft size={18} />
          </button>
          <div className="min-w-0">
            <h1 className="truncate text-base font-medium text-slate-100 md:text-lg">{config.title}</h1>
            <p className="truncate text-xs text-slate-400">Room {config.roomId}</p>
          </div>
        </div>
        <div className={`hidden w-fit items-center gap-2 rounded-full border px-4 py-2 text-sm md:flex ${livekit.error ? 'border-red-400/30 bg-red-400/10 text-red-100' : isConnected ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-100' : 'border-amber-400/30 bg-amber-400/10 text-amber-100'}`}>
          {livekit.error ? <WifiOff size={15} /> : isConnected ? <Wifi size={15} /> : <WifiOff size={15} />}
          <span>{livekit.error ? `Error: ${livekit.error.message}` : isConnected ? 'Connected' : 'Connecting to LiveKit...'}</span>
        </div>
      </header>

      <main className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[minmax(0,1fr)_auto]">
        <section className="relative flex min-h-0 flex-col overflow-hidden">
          <div className="min-h-0 flex-1 p-4 pb-28 md:p-6 md:pb-28">
            <VideoGrid
              participants={livekit.room ? livekit.participants : []}
            />
          </div>

          <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-[#202124] via-[#202124]/95 to-transparent px-4 pb-5 pt-14">
            <div className="pointer-events-auto mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 md:flex-row">
              <div className="hidden min-w-0 flex-1 items-center gap-3 md:flex">
                <div className={`flex items-center gap-2 rounded-full px-3 py-2 text-xs ${isConnected ? 'bg-emerald-500/15 text-emerald-100' : 'bg-amber-500/15 text-amber-100'}`}>
                  {isConnected ? <Wifi size={14} /> : <WifiOff size={14} />}
                  <span>{isConnected ? 'Connected' : 'Waiting for another participant'}</span>
                </div>
              </div>

            <Controls
              isAudioEnabled={livekit.room ? livekit.room.localParticipant.isMicrophoneEnabled : false}
              isVideoEnabled={livekit.room ? livekit.room.localParticipant.isCameraEnabled : false}
              isScreenSharing={false}
              onToggleAudio={livekit.toggleAudio}
              onToggleVideo={livekit.toggleVideo}
              onToggleScreenShare={toggleScreenShare}
              onLeave={leave}
            />

              <div className="flex flex-1 justify-center gap-2 md:justify-end">
                <button
                  onClick={() => setSidePanel((current) => current === 'participants' ? null : 'participants')}
                  className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${sidePanel === 'participants' ? 'bg-sky-500 text-white' : 'bg-[#3c4043] text-slate-100 hover:bg-[#4b5055]'}`}
                  title="Participants"
                >
                  <Users size={20} />
                </button>
                <button
                  onClick={() => setSidePanel((current) => current === 'chat' ? null : 'chat')}
                  className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${sidePanel === 'chat' ? 'bg-sky-500 text-white' : 'bg-[#3c4043] text-slate-100 hover:bg-[#4b5055]'}`}
                  title="Chat"
                >
                  <MessageSquare size={20} />
                </button>
              </div>
            </div>
          </div>
        </section>

        {sidePanel && (
          <aside className="fixed bottom-0 right-0 top-0 z-40 flex w-full max-w-[380px] flex-col border-l border-white/10 bg-[#2b2c30] shadow-2xl lg:relative lg:top-auto lg:z-auto">
            <div className="flex h-[76px] shrink-0 items-center justify-between border-b border-white/10 px-5">
              <div>
                <h2 className="text-base font-semibold text-white">{sidePanel === 'participants' ? 'People' : 'In-call messages'}</h2>
                <p className="text-xs text-slate-400">{sidePanel === 'participants' ? `${participants.length} in this call` : 'Messages are local to this session'}</p>
              </div>
              <button onClick={() => setSidePanel(null)} className="flex h-10 w-10 items-center justify-center rounded-full text-slate-300 hover:bg-white/10 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <div className="min-h-0 flex-1 p-4">
              {sidePanel === 'participants' ? (
                <ParticipantList participants={participants} />
              ) : (
                <ChatPanel userName={localName} />
              )}
            </div>
          </aside>
        )}
      </main>
    </div>
  );
};

const MeetingRoom: React.FC<MeetingRoomProps> = (props) => (
  <MeetingProvider config={props.config}>
    <MeetingRoomContent {...props} />
  </MeetingProvider>
);

export default MeetingRoom;
