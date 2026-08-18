import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Wallet } from '../types';
import { authService } from '../services/auth.service';

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
  }, []);

  const loginSession = (newToken: string, newUser: User) => {
    localStorage.setItem('wink_token', newToken);
    setToken(newToken);
    setUser(newUser);
    fetchSession();
  };

  const logout = () => {
    localStorage.removeItem('wink_token');
    setToken(null);
    setUser(null);
    setWallet(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        wallet,
        token,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN',
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
