import { WebSocketServer } from "ws";

const PORT = Number(process.env.PORT || 5000);
const wss = new WebSocketServer({ port: PORT });

let sender = null;
let receiver = null;

wss.on("connection", (ws) => {
  console.log("🔌 New client connected");

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log("📩 Received:", data);

      // ─────────────────────────────
      // REGISTER ROLES
      // ─────────────────────────────
      if (data.type === "sender-ready") {
        sender = ws;
        console.log("📱 Sender registered");

        // Notify receiver
        if (receiver) {
          receiver.send(JSON.stringify({ type: "sender-ready" }));
        }
      }

      if (data.type === "receiver-ready") {
        receiver = ws;
        console.log("🖥 Receiver registered");

        // Notify sender
        if (sender) {
          sender.send(JSON.stringify({ type: "receiver-ready" }));
        }
      }

      // ─────────────────────────────
      // SIGNALING: OFFER → RECEIVER
      // ─────────────────────────────
      if (data.offer && receiver) {
        console.log("📤 Forwarding offer → receiver");
        receiver.send(JSON.stringify({ offer: data.offer }));
      }

      // ─────────────────────────────
      // SIGNALING: ANSWER → SENDER
      // ─────────────────────────────
      if (data.answer && sender) {
        console.log("📤 Forwarding answer → sender");
        sender.send(JSON.stringify({ answer: data.answer }));
      }

      // ─────────────────────────────
      // ICE → BOTH SIDES
      // ─────────────────────────────
      if (data.candidate) {
        if (ws === sender && receiver) {
          receiver.send(JSON.stringify({ candidate: data.candidate }));
        } else if (ws === receiver && sender) {
          sender.send(JSON.stringify({ candidate: data.candidate }));
        }
      }

    } catch (err) {
      console.error("❌ Error parsing message:", err);
    }
  });

  ws.on("close", () => {
    console.log("❌ Client disconnected");

    if (ws === sender) {
      sender = null;
      console.log("📱 Sender cleared");
    }

    if (ws === receiver) {
      receiver = null;
      console.log("🖥 Receiver cleared");
    }
  });
});

console.log(`🚀 Signaling server running on ws://0.0.0.0:${PORT}`);