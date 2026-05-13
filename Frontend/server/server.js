import { WebSocket, WebSocketServer } from "ws";

const PORT = Number(process.env.PORT || 5000);
const wss = new WebSocketServer({ host: "0.0.0.0", port: PORT });

const peers = {
  sender: null,
  receiver: null,
};

const sendJson = (socket, payload) => {
  if (socket?.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(payload));
  }
};

const getPeerRole = (socket) => {
  if (peers.sender === socket) return "sender";
  if (peers.receiver === socket) return "receiver";
  return null;
};

const oppositeRole = (role) => (role === "sender" ? "receiver" : "sender");

const registerPeer = (role, socket) => {
  const previous = peers[role];

  if (previous && previous !== socket) {
    previous.close(1012, "Replaced by a new pairing session");
  }

  peers[role] = socket;
  socket.role = role;

  const otherRole = oppositeRole(role);
  sendJson(peers[otherRole], { type: `${role}-ready` });
  sendJson(
    socket,
    peers[otherRole]
      ? { type: `${otherRole}-ready` }
      : { type: "waiting-for-peer", peer: otherRole }
  );

  console.log(`${role} registered`);
};

const forwardToPeer = (fromSocket, payload) => {
  const role = getPeerRole(fromSocket);
  if (!role) return;

  const target = peers[oppositeRole(role)];
  sendJson(target, payload);
};

wss.on("connection", (socket) => {
  console.log("Client connected");

  socket.on("message", (message) => {
    let data;

    try {
      data = JSON.parse(message.toString());
    } catch (error) {
      console.error("Invalid signaling message", error);
      sendJson(socket, { type: "error", message: "Invalid JSON payload" });
      return;
    }

    if (data.type === "sender-ready") {
      registerPeer("sender", socket);
      return;
    }

    if (data.type === "receiver-ready") {
      registerPeer("receiver", socket);
      return;
    }

    if (data.offer) {
      forwardToPeer(socket, { offer: data.offer });
      return;
    }

    if (data.answer) {
      forwardToPeer(socket, { answer: data.answer });
      return;
    }

    if (data.candidate) {
      forwardToPeer(socket, { candidate: data.candidate });
    }
  });

  socket.on("close", () => {
    const role = getPeerRole(socket);

    if (role) {
      peers[role] = null;
      sendJson(peers[oppositeRole(role)], { type: `${role}-disconnected` });
      console.log(`${role} disconnected`);
      return;
    }

    console.log("Unregistered client disconnected");
  });
});

console.log(`Signaling server running on ws://0.0.0.0:${PORT}`);
