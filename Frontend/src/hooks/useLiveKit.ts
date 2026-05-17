import { useEffect, useState, useCallback, useRef } from 'react';
import { 
  Room, 
  RoomEvent, 
  RemoteParticipant, 
  Participant,
  Track,
  RemoteTrackPublication,
  RemoteTrack
} from 'livekit-client';

interface UseLiveKitOptions {
  roomId: string;
  tokenEndpoint: string;
  serverUrl: string;
}

export interface LiveKitParticipant {
  id: string;
  name: string;
  stream: MediaStream | null;
  isLocal: boolean;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
}

export const useLiveKit = ({ roomId, tokenEndpoint, serverUrl }: UseLiveKitOptions) => {
  const [room, setRoom] = useState<Room | null>(null);
  const [participants, setParticipants] = useState<LiveKitParticipant[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const participantsRef = useRef<Map<string, LiveKitParticipant>>(new Map());

  const updateParticipant = useCallback((participant: Participant) => {
    // Determine if this is the local participant safely (handle initial connection where state isn't updated)
    const isLocal = participant instanceof Participant && (participant.isLocal || participant.identity === room?.localParticipant?.identity);
    
    // Create or update MediaStream
    const videoTrack = participant.getTrackPublication(Track.Source.Camera)?.track;
    const audioTrack = participant.getTrackPublication(Track.Source.Microphone)?.track;
    
    
    const stream = new MediaStream();
    if (videoTrack?.mediaStreamTrack) stream.addTrack(videoTrack.mediaStreamTrack);
    if (audioTrack?.mediaStreamTrack) stream.addTrack(audioTrack.mediaStreamTrack);

    const data: LiveKitParticipant = {
      id: participant.identity,
      name: participant.name || participant.identity,
      stream: stream.getTracks().length > 0 ? stream : null,
      isLocal: isLocal,
      isAudioEnabled: participant.isMicrophoneEnabled,
      isVideoEnabled: participant.isCameraEnabled,
    };

    participantsRef.current.set(participant.identity, data);
    setParticipants(Array.from(participantsRef.current.values()));
  }, [room]);

  const connect = useCallback(async (authToken: string) => {
    try {
      setIsConnecting(true);
      setError(null);

      const response = await fetch(tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ room_name: roomId })
      });

      if (!response.ok) throw new Error('Failed to fetch LiveKit token');
      const { token } = await response.json();

      const newRoom = new Room();
      
      const handleParticipantUpdate = (participant: Participant) => {
        updateParticipant(participant);
      };

      newRoom
        .on(RoomEvent.ParticipantConnected, handleParticipantUpdate)
        .on(RoomEvent.ParticipantDisconnected, (p) => {
          participantsRef.current.delete(p.identity);
          setParticipants(Array.from(participantsRef.current.values()));
        })
        .on(RoomEvent.TrackSubscribed, (_, __, participant) => {
          updateParticipant(participant);
        })
        .on(RoomEvent.TrackUnsubscribed, (_, __, participant) => {
          updateParticipant(participant);
        })
        .on(RoomEvent.TrackMuted, (_, participant) => updateParticipant(participant))
        .on(RoomEvent.TrackUnmuted, (_, participant) => updateParticipant(participant))
        .on(RoomEvent.Disconnected, () => {
          setRoom(null);
          participantsRef.current.clear();
          setParticipants([]);
        });

      await newRoom.connect(serverUrl, token);
      await newRoom.localParticipant.enableCameraAndMicrophone();
      
      setRoom(newRoom);
      updateParticipant(newRoom.localParticipant);
      newRoom.remoteParticipants.forEach(updateParticipant);
      
    } catch (err: any) {
      setError(err);
      console.error('LiveKit connection error:', err);
    } finally {
      setIsConnecting(false);
    }
  }, [roomId, tokenEndpoint, serverUrl, updateParticipant]);

  const disconnect = useCallback(async () => {
    if (room) {
      await room.disconnect();
    }
  }, [room]);

  return {
    room,
    participants,
    isConnecting,
    error,
    connect,
    disconnect,
    toggleAudio: () => room?.localParticipant.setMicrophoneEnabled(!room.localParticipant.isMicrophoneEnabled),
    toggleVideo: () => room?.localParticipant.setCameraEnabled(!room.localParticipant.isCameraEnabled),
  };
};
