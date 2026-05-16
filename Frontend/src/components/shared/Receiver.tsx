import { useEffect, useRef, useState } from "react";

type ReceiverProps = {
  isActive: boolean;
  onStream: (stream: MediaStream) => void;
  onData?: (data: any) => void;
  onConnected?: () => void;
  onConnectionStateChange?: (state: RTCPeerConnectionState) => void;
  signalingUrl?: string;
  roomId: string;
};

import { getDefaultSignalingUrl } from "../../utils/urlUtils";

export default function Receiver({
  isActive,
  onStream,
  onData,
  onConnected,
  onConnectionStateChange,
  signalingUrl = getDefaultSignalingUrl(),
  roomId,
}: ReceiverProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const pc = useRef<RTCPeerConnection | null>(null);
  const ws = useRef<WebSocket | null>(null);

  const [status, setStatus] = useState("Waiting for phone");

  useEffect(() => {
    if (!isActive) return;

    console.log("📡 Receiver starting...");

    // ✅ Create PeerConnection
    const peer = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    // ✅ Create WebSocket
    const socket = new WebSocket(signalingUrl);

    pc.current = peer;
    ws.current = socket;

    // ─────────────────────────────
    // WebSocket Events
    // ─────────────────────────────
    socket.onopen = () => {
      console.log("✅ Connected to signaling server");
      setStatus("Connected to signaling");

      socket.send(JSON.stringify({ type: "receiver-ready", roomId }));
    };

    socket.onerror = (err) => {
      console.error("❌ WebSocket error", err);
      setStatus("Signaling error");
    };

    socket.onclose = () => {
      console.warn("⚠️ WebSocket closed");
      setStatus("Disconnected");
    };

    socket.onmessage = async (msg: MessageEvent) => {
      try {
        const data = JSON.parse(msg.data as string);
        console.log("📩 Received:", data);

        if (data.type === "sender-ready") {
          console.log("📱 Sender ready");
          setStatus("Phone ready");
        }

        if (data.type === "sender-disconnected") {
          setStatus("Phone disconnected");
        }

        if (data.type === "waiting-for-peer") {
          setStatus("Waiting for phone");
        }

        // 🎥 Offer from phone
        if (data.offer) {
          console.log("📥 Received offer");

          await peer.setRemoteDescription(
            new RTCSessionDescription(data.offer)
          );

          const answer = await peer.createAnswer();
          await peer.setLocalDescription(answer);

          socket.send(JSON.stringify({ answer }));
          setStatus("Connecting to phone...");
        }

        // 🌐 ICE candidate
        if (data.candidate) {
          try {
            await peer.addIceCandidate(
              new RTCIceCandidate(data.candidate)
            );
          } catch (err) {
            console.warn("ICE error:", err);
          }
        }
      } catch (err) {
        console.error("❌ Message parse error", err);
      }
    };

    // ─────────────────────────────
    // WebRTC Events
    // ─────────────────────────────
    peer.ondatachannel = (event) => {
      console.log("📡 DataChannel received!");
      const channel = event.channel;

      channel.onmessage = (e) => {
        try {
          const gestureData = JSON.parse(e.data);
          onData?.(gestureData);
        } catch (err) {
          console.error("❌ DataChannel message error:", err);
        }
      };

      channel.onopen = () => {
        console.log("✅ DataChannel open");
        onConnected?.();
      };
      channel.onclose = () => console.log("⚠️ DataChannel closed");
    };

    peer.ontrack = (event) => {
      console.log("🎥 Stream received!");

      const stream = event.streams[0];

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        videoRef.current
          .play()
          .catch(() => console.warn("Autoplay blocked"));
      }

      setStatus("📱 Phone camera live");
      onStream(stream);
      onConnected?.();
    };

    peer.onicecandidate = (event) => {
      if (event.candidate && socket.readyState === WebSocket.OPEN) {
        socket.send(
          JSON.stringify({ candidate: event.candidate })
        );
      }
    };

    peer.onconnectionstatechange = () => {
      console.log("🔗 Connection state:", peer.connectionState);
      onConnectionStateChange?.(peer.connectionState);

      if (peer.connectionState === "connected") {
        setStatus("Connected");
      }

      if (peer.connectionState === "failed") {
        setStatus("Connection failed");
      }
    };

    // ─────────────────────────────
    // Cleanup
    // ─────────────────────────────
    return () => {
      console.log("🛑 Cleaning up receiver");

      peer.close();
      socket.close();

      pc.current = null;
      ws.current = null;
    };
  }, [isActive, onStream, signalingUrl]);

  if (!isActive) return null;

  return null;
}
