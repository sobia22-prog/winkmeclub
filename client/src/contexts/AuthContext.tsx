import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Wallet } from '../types';
import { authService } from '../services/auth.service';

import { getSocket } from '../services/socket.service';

interface AuthContextType {
  user: User | null;
  wallet: Wallet | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loginSession: (token: string, user: User) => void;
  logout: () => void;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('wink_token'));
  const [loading, setLoading] = useState<boolean>(true);

  const fetchSession = async () => {
    const storedToken = localStorage.getItem('wink_token');
    if (!storedToken) {
      setUser(null);
      setWallet(null);
      setLoading(false);
      return;
    }

    try {
      const res = await authService.getMe();
      if (res.data.success) {
        setUser(res.data.user);
        setWallet(res.data.wallet);
      }
    } catch (err) {
      console.error('Session restoration error:', err);
      localStorage.removeItem('wink_token');
      setToken(null);
      setUser(null);
      setWallet(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();

    // 1. Listen for real-time WebSocket events to update session & wallet immediately
    const socket = getSocket();

    const handleRealtimeUpdate = (data: any) => {
      const currentToken = localStorage.getItem('wink_token');
      if (!currentToken) return;

      // If event has a target userId, only refresh if it matches current user (or if admin/staff)
      fetchSession();
    };

    socket.on('balance:updated', handleRealtimeUpdate);
    socket.on('trade:settled', handleRealtimeUpdate);
    socket.on('trade:created', handleRealtimeUpdate);
    socket.on('recharge:updated', handleRealtimeUpdate);
    socket.on('withdrawal:updated', handleRealtimeUpdate);
    socket.on('user:updated', handleRealtimeUpdate);
    socket.on('data:invalidate', handleRealtimeUpdate);

    // 2. Fail-safe Polling every 2.5 seconds + focus/visibility listeners
    let isMounted = true;
    let pollTimer: NodeJS.Timeout;

    const poll = async () => {
      const currentToken = localStorage.getItem('wink_token');
      if (currentToken) {
        await fetchSession();
      }
      if (isMounted) {
        pollTimer = setTimeout(poll, 2500);
      }
    };
    poll();

    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        fetchSession();
      }
    };
    window.addEventListener('focus', onVisible);
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      isMounted = false;
      clearTimeout(pollTimer);
      socket.off('balance:updated', handleRealtimeUpdate);
      socket.off('trade:settled', handleRealtimeUpdate);
      socket.off('trade:created', handleRealtimeUpdate);
      socket.off('recharge:updated', handleRealtimeUpdate);
      socket.off('withdrawal:updated', handleRealtimeUpdate);
      socket.off('user:updated', handleRealtimeUpdate);
      socket.off('data:invalidate', handleRealtimeUpdate);
      window.removeEventListener('focus', onVisible);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  const loginSession = (newToken: string, newUser: User) => {
    localStorage.setItem('wink_token', newToken);
    setToken(newToken);
    setUser(newUser);
    fetchSession();
  };

  const logout = () => {
    const isStaff = user?.role === 'STAFF' || window.location.pathname.startsWith('/staff');
    const isAdmin = user?.role === 'ADMIN' || window.location.pathname.startsWith('/admin');

    localStorage.removeItem('wink_token');
    setToken(null);
    setUser(null);
    setWallet(null);

    if (isStaff) {
      window.location.href = '/staff/login';
    } else if (isAdmin) {
      window.location.href = '/admin/login';
    } else {
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        wallet,
        token,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN' || user?.role === 'STAFF',
        loginSession,
        logout,
        refreshSession: fetchSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
