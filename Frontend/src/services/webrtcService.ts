const ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

export const createPeerConnection = () =>
  new RTCPeerConnection({
    iceServers: ICE_SERVERS,
  });

export const addStreamTracks = (connection: RTCPeerConnection, stream: MediaStream) => {
  stream.getTracks().forEach((track) => connection.addTrack(track, stream));
};

export const replaceSenderTrack = async (
  connection: RTCPeerConnection | null,
  kind: 'audio' | 'video',
  nextTrack: MediaStreamTrack,
) => {
  const sender = connection?.getSenders().find((item) => item.track?.kind === kind);

  if (sender) {
    await sender.replaceTrack(nextTrack);
  }
};
