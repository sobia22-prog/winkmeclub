import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    const token = localStorage.getItem('wink_token');
    
    // In production, VITE_API_URL may point to Railway or custom domain, or fallback to current origin
    const apiUrl = (import.meta as any).env?.VITE_API_URL || '';
    const socketUrl = apiUrl ? apiUrl.replace(/\/api\/?$/, '') : window.location.origin;

    socket = io(socketUrl, {
      path: '/socket.io',
      auth: {
        token: token || '',
      },
      transports: ['websocket', 'polling'],
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      autoConnect: true,
    });

    socket.on('connect', () => {
      console.log('[Socket] Connected to real-time server. ID:', socket?.id);
      const currentToken = localStorage.getItem('wink_token');
      if (currentToken) {
        socket?.emit('join', { token: currentToken });
      }
    });

    socket.onAny((event, ...args) => {
      console.log(`[Socket Realtime] Received: "${event}"`, args[0]);
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected from real-time server:', reason);
    });

    socket.on('connect_error', (err) => {
      console.warn('[Socket] Connection error:', err.message);
    });
  }

  return socket;
};

export const updateSocketAuth = (token: string | null) => {
  if (socket) {
    socket.auth = { token: token || '' };
    if (token) {
      socket.emit('join', { token });
      // If already connected, reconnect to ensure the server handshake middleware registers the new role/user
      if (socket.connected) {
        socket.disconnect().connect();
      }
    }
  }
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
