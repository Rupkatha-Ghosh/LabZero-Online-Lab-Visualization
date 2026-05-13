import { useEffect, useRef, useState } from "react";

type ReceiverProps = {
  isActive: boolean;
  onStream: (stream: MediaStream) => void;
  signalingUrl?: string;
};

// ✅ Automatically use PC IP instead of localhost
const getDefaultSignalingUrl = () => {
  const host = window.location.hostname;
  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  return `${protocol}://${host}:5000`;
};

export default function Receiver({
  isActive,
  onStream,
  signalingUrl = getDefaultSignalingUrl(),
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

      socket.send(JSON.stringify({ type: "receiver-ready" }));
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

        // 🔁 Sender connected
        if (data.type === "sender-ready") {
          console.log("📱 Sender ready");
          socket.send(JSON.stringify({ type: "receiver-ready" }));
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

  return (
    <div className="fixed bottom-40 right-4 z-[120] w-52 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/90 shadow-2xl backdrop-blur-xl">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="h-28 w-full object-cover"
      />

      <div className="px-3 py-2 text-[9px] font-mono uppercase tracking-[0.2em] text-slate-400">
        {status}
      </div>
    </div>
  );
}