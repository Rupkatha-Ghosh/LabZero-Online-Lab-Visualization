export const DEFAULT_MEDIA_CONSTRAINTS: MediaStreamConstraints = {
  video: {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    facingMode: 'user',
  },
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  },
};

export const stopMediaStream = (stream?: MediaStream | null) => {
  stream?.getTracks().forEach((track) => track.stop());
};

export const setTrackEnabled = (stream: MediaStream | null, kind: 'audio' | 'video', enabled: boolean) => {
  stream?.getTracks().forEach((track) => {
    if (track.kind === kind) {
      track.enabled = enabled;
    }
  });
};

export const getDisplayMediaStream = async () => {
  if (!navigator.mediaDevices?.getDisplayMedia) {
    throw new Error('Screen sharing is not supported in this browser.');
  }

  return navigator.mediaDevices.getDisplayMedia({
    video: true,
    audio: false,
  });
};
