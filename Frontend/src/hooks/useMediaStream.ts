import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_MEDIA_CONSTRAINTS, setTrackEnabled, stopMediaStream } from '../utils/mediaUtils';

export const useMediaStream = (constraints: MediaStreamConstraints = DEFAULT_MEDIA_CONSTRAINTS) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const start = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Camera and microphone access is not supported in this browser.');
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);
      const nextStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(nextStream);
      return nextStream;
    } catch (err: any) {
      const message = err?.message || 'Unable to access camera or microphone.';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [constraints]);

  const stop = useCallback(() => {
    stopMediaStream(stream);
    setStream(null);
  }, [stream]);

  const toggleAudio = useCallback(() => {
    setIsAudioEnabled((current) => {
      const next = !current;
      setTrackEnabled(stream, 'audio', next);
      return next;
    });
  }, [stream]);

  const toggleVideo = useCallback(() => {
    setIsVideoEnabled((current) => {
      const next = !current;
      setTrackEnabled(stream, 'video', next);
      return next;
    });
  }, [stream]);

  useEffect(() => () => stopMediaStream(stream), [stream]);

  return {
    stream,
    error,
    isLoading,
    isAudioEnabled,
    isVideoEnabled,
    start,
    stop,
    toggleAudio,
    toggleVideo,
  };
};
