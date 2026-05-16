import React from 'react';
import { Mic, MicOff, UserRound, Video, VideoOff } from 'lucide-react';
import { MeetingParticipant } from '../../utils/peerUtils';

interface ParticipantListProps {
  participants: MeetingParticipant[];
}

const ParticipantList: React.FC<ParticipantListProps> = ({ participants }) => (
  <aside className="h-full rounded-[24px] bg-[#303134] p-3">
    <div className="space-y-3">
      {participants.map((participant) => (
        <div key={participant.id} className="flex items-center justify-between gap-3 rounded-2xl bg-[#3c4043] p-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-500/20 text-sky-200">
              <UserRound size={18} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-slate-200">{participant.name}</p>
              <p className="text-[10px] uppercase tracking-[0.12em] text-slate-400">{participant.role}</p>
            </div>
          </div>
          <div className="flex gap-2 text-slate-500">
            {participant.isMuted ? <MicOff size={15} /> : <Mic size={15} />}
            {participant.isCameraOff ? <VideoOff size={15} /> : <Video size={15} />}
          </div>
        </div>
      ))}
    </div>
  </aside>
);

export default ParticipantList;
