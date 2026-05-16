import { WebSocket, WebSocketServer } from "ws";

const PORT = Number(process.env.PORT || 5000);
const wss = new WebSocketServer({ host: "0.0.0.0", port: PORT });
const rooms = new Map();

const sendJson = (socket, payload) => {
  if (socket?.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(payload));
  }
};

const getOppositeRole = (role) => (role === "sender" ? "receiver" : "sender");

wss.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("message", (message) => {
    let data;
    try {
      data = JSON.parse(message.toString());
    } catch (error) {
      console.error("Invalid signaling message", error);
      return;
    }

    const { type, roomId, role, offer, answer, candidate } = data;

    // 1. Handle Registration (sender-ready or receiver-ready)
    if (type === "sender-ready" || type === "receiver-ready") {
      if (!roomId) {
        console.error("Registration failed: No roomId provided");
        return;
      }

      const assignedRole = type === "sender-ready" ? "sender" : "receiver";

      // Initialize room if it doesn't exist
      if (!rooms.has(roomId)) {
        rooms.set(roomId, { sender: null, receiver: null });
      }

      const room = rooms.get(roomId);

      // Close previous socket if re-registering
      if (room[assignedRole] && room[assignedRole] !== socket) {
        room[assignedRole].close(1012, "Replaced by new session");
      }

      room[assignedRole] = socket;
      socket.roomId = roomId;
      socket.role = assignedRole;

      console.log(`${assignedRole} joined room: ${roomId}`);

      // Notify the other peer if they are already in the room
      const otherRole = getOppositeRole(assignedRole);
      if (room[otherRole]) {
        sendJson(room[otherRole], { type: `${assignedRole}-ready` });
        sendJson(socket, { type: `${otherRole}-ready` });
      } else {
        sendJson(socket, { type: "waiting-for-peer", peer: otherRole });
      }
      return;
    }

    // 2. Handle Signaling Forwarding (Offer, Answer, Candidate)
    if (offer || answer || candidate) {
      const currentRoomId = roomId || socket.roomId;
      const currentRole = socket.role;

      if (!currentRoomId || !currentRole) {
        console.warn("Discarding message: Client not registered in a room");
        return;
      }

      const room = rooms.get(currentRoomId);
      if (room) {
        const target = room[getOppositeRole(currentRole)];
        if (target) {
          sendJson(target, data);
        }
      }
      return;
    }
  });

  socket.on("close", () => {
    const { roomId, role } = socket;
    if (roomId && role) {
      const room = rooms.get(roomId);
      if (room) {
        room[role] = null;
        // Notify the other peer
        const otherPeer = room[getOppositeRole(role)];
        if (otherPeer) {
          sendJson(otherPeer, { type: `${role}-disconnected` });
        }

        // Cleanup empty rooms
        if (!room.sender && !room.receiver) {
          rooms.delete(roomId);
          console.log(`Room ${roomId} closed and cleaned up.`);
        }
      }
      console.log(`${role} left room: ${roomId}`);
    }
  });
});

console.log(`🚀 Signaling server with Room Support running on ws://0.0.0.0:${PORT}`);
