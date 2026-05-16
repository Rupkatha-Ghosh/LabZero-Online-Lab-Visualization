import { useCallback, useEffect, useRef, useState } from 'react';
import { addStreamTracks, createPeerConnection, replaceSenderTrack } from '../services/webrtcService';
import { useMediaStream } from './useMediaStream';
import { useSocket } from './useSocket';
import { getDisplayMediaStream, stopMediaStream } from '../utils/mediaUtils';
import { MeetingRole, roleToSignalRole } from '../utils/peerUtils';
import { getDefaultSignalingUrl } from '../utils/urlUtils';

interface UseWebRTCOptions {
  roomId: string;
  role: MeetingRole;
}

export const useWebRTC = ({ roomId, role }: UseWebRTCOptions) => {
  const localMedia = useMediaStream();
  const socket = useSocket(getDefaultSignalingUrl());
  const connectionRef = useRef<RTCPeerConnection | null>(null);
  const originalVideoTrackRef = useRef<MediaStreamTrack | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const leaveMeetingRef = useRef<() => void>(() => undefined);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [connectionState, setConnectionState] = useState<RTCPeerConnectionState>('new');

  const sendSignal = useCallback((payload: any) => {
    socket.send({ ...payload, roomId });
  }, [roomId, socket]);

  const ensureConnection = useCallback((stream: MediaStream) => {
    if (connectionRef.current) {
      return connectionRef.current;
    }

    const connection = createPeerConnection();
    addStreamTracks(connection, stream);

    connection.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignal({ candidate: event.candidate });
      }
    };

    connection.ontrack = (event) => {
      setRemoteStream(event.streams[0] ?? null);
    };

    connection.onconnectionstatechange = () => {
      setConnectionState(connection.connectionState);
    };

    connectionRef.current = connection;
    return connection;
  }, [sendSignal]);

  const startMeeting = useCallback(async () => {
    const stream = await localMedia.start();
    if (!stream) return;

    ensureConnection(stream);
    socket.connect();
  }, [ensureConnection, localMedia.start, socket]);

  useEffect(() => {
    if (socket.status !== 'connected') return;
    const signalRole = roleToSignalRole(role);
    socket.send({ type: `${signalRole}-ready`, roomId });
  }, [role, roomId, socket.send, socket.status]);

  useEffect(() => {
    if (!localMedia.stream) return;

    const handleMessage = async (message: any) => {
      const connection = ensureConnection(localMedia.stream!);

      if (role === 'host' && message.type === 'receiver-ready') {
        const offer = await connection.createOffer();
        await connection.setLocalDescription(offer);
        sendSignal({ offer });
        return;
      }

      if (message.offer) {
        await connection.setRemoteDescription(new RTCSessionDescription(message.offer));
        const answer = await connection.createAnswer();
        await connection.setLocalDescription(answer);
        sendSignal({ answer });
        return;
      }

      if (message.answer && !connection.currentRemoteDescription) {
        await connection.setRemoteDescription(new RTCSessionDescription(message.answer));
        return;
      }

      if (message.candidate) {
        try {
          await connection.addIceCandidate(new RTCIceCandidate(message.candidate));
        } catch (error) {
          console.error('Failed to add ICE candidate:', error);
        }
      }
    };

    const unsubscribe = socket.onMessage((message: any) => {
      handleMessage(message).catch((error) => console.error('WebRTC signaling failed:', error));
    });

    return () => {
      unsubscribe();
    };
  }, [ensureConnection, localMedia.stream, role, sendSignal, socket.onMessage]);

  const startScreenShare = useCallback(async () => {
    if (!connectionRef.current) return;

    const screenStream = await getDisplayMediaStream();
    const [screenTrack] = screenStream.getVideoTracks();
    if (!screenTrack) return;

    screenStreamRef.current = screenStream;
    originalVideoTrackRef.current = localMedia.stream?.getVideoTracks()[0] ?? null;
    await replaceSenderTrack(connectionRef.current, 'video', screenTrack);
    setIsScreenSharing(true);

    screenTrack.onended = async () => {
      if (connectionRef.current && originalVideoTrackRef.current) {
        await replaceSenderTrack(connectionRef.current, 'video', originalVideoTrackRef.current);
      }
      stopMediaStream(screenStreamRef.current);
      screenStreamRef.current = null;
      setIsScreenSharing(false);
    };
  }, [localMedia.stream]);

  const stopScreenShare = useCallback(async () => {
    if (connectionRef.current && originalVideoTrackRef.current) {
      await replaceSenderTrack(connectionRef.current, 'video', originalVideoTrackRef.current);
    }
    stopMediaStream(screenStreamRef.current);
    screenStreamRef.current = null;
    setIsScreenSharing(false);
  }, []);

  const leaveMeeting = useCallback(() => {
    stopScreenShare();
    connectionRef.current?.close();
    connectionRef.current = null;
    socket.disconnect();
    localMedia.stop();
    setRemoteStream(null);
    setConnectionState('closed');
  }, [localMedia, socket, stopScreenShare]);

  useEffect(() => {
    leaveMeetingRef.current = leaveMeeting;
  }, [leaveMeeting]);

  useEffect(() => () => leaveMeetingRef.current(), []);

  return {
    localStream: localMedia.stream,
    remoteStream,
    mediaError: localMedia.error,
    isMediaLoading: localMedia.isLoading,
    isAudioEnabled: localMedia.isAudioEnabled,
    isVideoEnabled: localMedia.isVideoEnabled,
    isScreenSharing,
    socketStatus: socket.status,
    connectionState,
    startMeeting,
    leaveMeeting,
    toggleAudio: localMedia.toggleAudio,
    toggleVideo: localMedia.toggleVideo,
    startScreenShare,
    stopScreenShare,
  };
};
