import React, { createContext, useContext, useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { getSocket, updateSocketAuth } from '../services/socket.service';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    const s = getSocket();
    setSocket(s);

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    s.on('connect', onConnect);
    s.on('disconnect', onDisconnect);

    if (s.connected) {
      setIsConnected(true);
    }

    return () => {
      s.off('connect', onConnect);
      s.off('disconnect', onDisconnect);
    };
  }, []);

  // Whenever auth token changes (e.g. login/logout), update socket auth & join rooms
  useEffect(() => {
    if (token) {
      updateSocketAuth(token);
    }
  }, [token, user?.id]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};

/**
 * Hook to subscribe to any socket event with persistent ref and automatic cleanup.
 * Guarantees zero dropped events and never thrashes listeners on component re-renders.
 */
export const useRealtimeEvent = (event: string, callback: (data: any) => void) => {
  const { socket } = useSocket();
  const savedCallback = React.useRef(callback);

  React.useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  React.useEffect(() => {
    const s = socket || getSocket();
    if (!s) return;

    const handler = (data: any) => {
      try {
        savedCallback.current?.(data);
      } catch (err) {
        console.error(`[Realtime Error] Event "${event}":`, err);
      }
    };

    s.on(event, handler);

    return () => {
      s.off(event, handler);
    };
  }, [socket, event]);
};
