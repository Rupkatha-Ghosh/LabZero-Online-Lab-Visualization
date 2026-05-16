type SocketListener = (payload: any) => void;

export class SocketService {
  private socket: WebSocket | null = null;
  private listeners = new Set<SocketListener>();

  connect(url = import.meta.env.VITE_SIGNALING_URL || 'ws://localhost:5000') {
    this.disconnect();

    this.socket = new WebSocket(url);
    this.socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        this.listeners.forEach((listener) => listener(payload));
      } catch (error) {
        console.error('Invalid socket message:', error);
      }
    };

    return this.socket;
  }

  onMessage(listener: SocketListener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  send(payload: any) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(payload));
    }
  }

  disconnect() {
    if (this.socket && this.socket.readyState <= WebSocket.OPEN) {
      this.socket.close();
    }
    this.socket = null;
  }

  get readyState() {
    return this.socket?.readyState ?? WebSocket.CLOSED;
  }
}

export const socketService = new SocketService();
