export type MeetingRole = 'host' | 'guest';
export type SignalRole = 'sender' | 'receiver';

export interface MeetingParticipant {
  id: string;
  name: string;
  role: MeetingRole;
  isLocal?: boolean;
  isMuted?: boolean;
  isCameraOff?: boolean;
}

export const roleToSignalRole = (role: MeetingRole): SignalRole => (role === 'host' ? 'sender' : 'receiver');

export const createParticipantId = (prefix = 'participant') => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

export const createRoomId = (seed: string | number) =>
  String(seed)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'labzero-class';
