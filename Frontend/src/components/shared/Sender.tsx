import { useEffect, useRef, useState, useCallback } from "react";
// @ts-ignore
import { GestureRecognizer } from '@mediapipe/tasks-vision';
import { getGestureRecognizer } from "../../services/gestureService";

import { getDefaultSignalingUrl } from "../../utils/urlUtils";

const getSignalingConfig = () => {
  const params = new URLSearchParams(window.location.search);
  const signalUrl = params.get("signal");
  const roomId = params.get("room");
  
  return {
    url: signalUrl || getDefaultSignalingUrl(),
    roomId: roomId || "gestures-default"
  };
};

export default function Sender() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const pc = useRef<RTCPeerConnection | null>(null);
  const ws = useRef<WebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const dataChannel = useRef<RTCDataChannel | null>(null);
  const gestureRecRef = useRef<GestureRecognizer | null>(null);
  const offerStartedRef = useRef(false);
  const lastVideoTimeRef = useRef(-1);

  const [status, setStatus] = useState("📱 Starting phone camera...");
  const [isDataChannelOpen, setIsDataChannelOpen] = useState(false);

  // ── Detection Loop ─────────────────────────────
  const loop = useCallback(() => {
    if (!videoRef.current || !gestureRecRef.current || !dataChannel.current) return;
    if (dataChannel.current.readyState !== "open") {
      requestAnimationFrame(loop);
      return;
    }

    const video = videoRef.current;
    const now = Date.now();

    if (video.currentTime !== lastVideoTimeRef.current && video.videoWidth > 0) {
      lastVideoTimeRef.current = video.currentTime;

      try {
        const result = gestureRecRef.current.recognizeForVideo(video, now);

        if (result.gestures.length > 0) {
          const top = result.gestures[0][0];
          const gesture = top.categoryName;
          const score = top.score;
          const landmarks = result.landmarks[0];

          // Simplified packet to save bandwidth
          const packet = {
            type: "gesture-data",
            gesture,
            score,
            landmarks: landmarks.map(l => ({ x: l.x, y: l.y, z: l.z }))
          };

          dataChannel.current.send(JSON.stringify(packet));
        } else {
          // No hand detected
          dataChannel.current.send(JSON.stringify({ type: "gesture-data", gesture: "None", score: 0 }));
        }
      } catch (err) {
        console.error("❌ Recognition error on phone:", err);
      }
    }

    requestAnimationFrame(loop);
  }, []);

  useEffect(() => {
    console.log("📡 Sender starting...");

    const { url, roomId } = getSignalingConfig();
    const socket = new WebSocket(url);

    const peer = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    ws.current = socket;
    pc.current = peer;

    // 🎯 Init Recognizer
    getGestureRecognizer().then(r => {
      gestureRecRef.current = r;
      console.log("✅ Gesture recognizer ready on phone");
    });

    // 📡 Create DataChannel
    const dc = peer.createDataChannel("gesture-data", { ordered: false });
    dataChannel.current = dc;

    dc.onopen = () => {
      console.log("✅ DataChannel open on sender");
      setIsDataChannelOpen(true);
    };
    dc.onclose = () => {
      setIsDataChannelOpen(false);
      console.warn("⚠️ DataChannel closed on sender");
    };

    // ─────────────────────────────
    // WebSocket Events
    // ─────────────────────────────
    socket.onopen = () => {
      console.log("✅ Connected to signaling server");
      setStatus("Connected. Waiting for LabZero...");

      const { roomId } = getSignalingConfig();
      socket.send(JSON.stringify({ type: "sender-ready", roomId }));
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

        if (data.type === "receiver-disconnected") {
          setStatus("LabZero disconnected");
        }

        if (data.type === "waiting-for-peer") {
          setStatus("Connected. Waiting for LabZero...");
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
      setStatus("🚀 Connected! Move your hand.");
      requestAnimationFrame(loop);
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
