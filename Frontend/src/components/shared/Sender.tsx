import { useEffect, useRef, useState } from "react";

const getDefaultSignalingUrl = () => {
  const params = new URLSearchParams(window.location.search);
  const url = params.get("signal");
  if (url) return url;

  const host = window.location.hostname;
  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  return `${protocol}://${host}:5000`;
};

export default function Sender() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const pc = useRef<RTCPeerConnection | null>(null);
  const ws = useRef<WebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const offerStartedRef = useRef(false);

  const [status, setStatus] = useState("📱 Starting phone camera...");

  useEffect(() => {
    console.log("📡 Sender starting...");

    const socket = new WebSocket(getDefaultSignalingUrl());

    const peer = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    ws.current = socket;
    pc.current = peer;

    // ─────────────────────────────
    // WebSocket Events
    // ─────────────────────────────
    socket.onopen = () => {
      console.log("✅ Connected to signaling server");
      setStatus("Connected. Waiting for LabZero...");

      socket.send(JSON.stringify({ type: "sender-ready" }));
    };

    socket.onerror = (err) => {
      console.error("❌ WebSocket error", err);
      setStatus("❌ Signaling server error");
    };

    socket.onclose = () => {
      console.warn("⚠️ WebSocket closed");
      setStatus("Disconnected");
    };

    socket.onmessage = async (msg: MessageEvent) => {
      try {
        const data = JSON.parse(msg.data as string);
        console.log("📩 Received:", data);

        // 🎯 Receiver is ready → start camera
        if (data.type === "receiver-ready") {
          console.log("🖥 Receiver ready");
          startCamera();
        }

        // 🎥 Answer from receiver
        if (data.answer) {
          console.log("📥 Received answer");

          await peer.setRemoteDescription(
            new RTCSessionDescription(data.answer)
          );

          setStatus("🚀 Streaming to LabZero");
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
        setStatus("✅ Connected to LabZero");
      }

      if (peer.connectionState === "failed") {
        setStatus("❌ Connection failed");
      }
    };

    // ─────────────────────────────
    // Cleanup
    // ─────────────────────────────
    return () => {
      console.log("🛑 Cleaning up sender");

      streamRef.current?.getTracks().forEach((track) => track.stop());
      peer.close();
      socket.close();
    };
  }, []);

  // ─────────────────────────────
  // Start Camera + Send Offer
  // ─────────────────────────────
  const startCamera = async () => {
    if (!pc.current || !ws.current) return;
    if (ws.current.readyState !== WebSocket.OPEN) return;
    if (offerStartedRef.current) return;

    offerStartedRef.current = true;

    try {
      console.log("📷 Starting camera...");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: 640,
          height: 480,
          facingMode: "user",
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Add tracks
      stream.getTracks().forEach((track) => {
        pc.current?.addTrack(track, stream);
      });

      console.log("📤 Creating offer...");

      const offer = await pc.current.createOffer();
      await pc.current.setLocalDescription(offer);

      ws.current.send(JSON.stringify({ offer }));

      setStatus("📡 Sending video to LabZero...");
    } catch (error) {
      console.error("❌ Camera failed", error);
      offerStartedRef.current = false;
      setStatus("❌ Camera permission denied");
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="h-screen w-full object-cover"
      />

      <div className="fixed inset-x-0 bottom-0 bg-slate-950/80 p-5 text-center backdrop-blur-xl">
        <p className="text-xs font-mono uppercase tracking-[0.25em] text-indigo-300">
          {status}
        </p>
      </div>
    </main>
  );
}