import { useCallback, useEffect, useMemo, useState } from 'react';
import { SocketService } from '../services/socketService';

export const useSocket = (url?: string) => {
  const service = useMemo(() => new SocketService(), []);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'closed' | 'error'>('idle');
  const [lastMessage, setLastMessage] = useState<any>(null);

  const connect = useCallback(() => {
    setStatus('connecting');
    const socket = service.connect(url);

    socket.onopen = () => setStatus('connected');
    socket.onerror = () => setStatus('error');
    socket.onclose = () => setStatus('closed');
  }, [service, url]);

  const send = useCallback((payload: any) => {
    service.send(payload);
  }, [service]);

  useEffect(() => {
    const unsubscribe = service.onMessage(setLastMessage);
    return () => {
      unsubscribe();
    };
  }, [service]);

  useEffect(() => () => service.disconnect(), [service]);

  return {
    status,
    lastMessage,
    connect,
    send,
    disconnect: service.disconnect.bind(service),
    onMessage: service.onMessage.bind(service),
  };
};
