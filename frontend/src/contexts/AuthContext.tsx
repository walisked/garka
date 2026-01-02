import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authAPI } from '../api/auth';
import toast from 'react-hot-toast';
import { detectRoleByEmail, validateRoleEmail } from '../utils/roleValidator';
import type { User } from '../types/user.types';

type AuthContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; user?: User } | { success: false; error: any }>;
  register: (data: { name?: string; email: string; password: string; role?: string }) => Promise<any>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('garka_token'));
  const [refresh, setRefresh] = useState<string | null>(localStorage.getItem('garka_refresh'));
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const init = async () => {
      const storedToken = localStorage.getItem('garka_token');
      const storedUser = localStorage.getItem('garka_user');
      const storedRefresh = localStorage.getItem('garka_refresh');
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        setRefresh(storedRefresh);
      } else if (storedRefresh) {
        // try to refresh silently
        localStorage.removeItem('garka_token');
        await refreshToken();
      }
      setLoading(false);
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setTokenInStorage = (t: string | null, r?: string | null) => {
    if (t) localStorage.setItem('garka_token', t); else localStorage.removeItem('garka_token');
    if (typeof r !== 'undefined') {
      if (r) localStorage.setItem('garka_refresh', r); else localStorage.removeItem('garka_refresh');
    }
    setToken(t);
  };

  const register = async (data: { name?: string; firstName?: string; lastName?: string; email: string; phone?: string; password: string; role?: string }) => {
    try {
      setLoading(true);
      // detect role based on email if not provided
      const detected = detectRoleByEmail(data.email);
      const role = (data.role as string) || detected;

      // Disallow creating Agent or Deal Initiator via public registration
      if (role && role !== 'USER') {
        toast.error('Agents and Deal Initiators must be invited by an admin. Please contact support.');
        return { success: false, error: 'invite_only' };
      }

      // Build payload expected by the backend
      const fullName = data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim();
      const payload = {
        fullName,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: 'USER'
      };

      const res = await authAPI.register(payload);
      if (res.success) {
        const { token: t, refreshToken: r, user: u } = res.data;
        setUser(u);
        setTokenInStorage(t, r);
        localStorage.setItem('garka_user', JSON.stringify(u));
        toast.success('Registration successful');
        return { success: true, user: u };
      }
      toast.error(res.message || 'Registration failed');
      return { success: false, error: res.message };
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const res = await authAPI.login({ email, password });
      if (res.success) {
        const { token: t, refreshToken: r, user: u } = res.data;
        setUser(u);
        setTokenInStorage(t, r);
        localStorage.setItem('garka_user', JSON.stringify(u));
        toast.success('Login successful');
        return { success: true, user: u };
      }
      toast.error(res.message || 'Login failed');
      return { success: false, error: res.message };
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const refreshToken = async () => {
    try {
      setLoading(true);
      const storedRefresh = localStorage.getItem('garka_refresh');
      const res = await authAPI.refresh(storedRefresh);
      if (res.success) {
        const { token: t, refreshToken: r, user: u } = res.data;
        setUser(u);
        setTokenInStorage(t, r);
        localStorage.setItem('garka_user', JSON.stringify(u));
        return true;
      }
      // fallback - clear storage
      setUser(null);
      setTokenInStorage(null, null);
      localStorage.removeItem('garka_user');
      return false;
    } catch (err) {
      setUser(null);
      setTokenInStorage(null, null);
      localStorage.removeItem('garka_user');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await authAPI.logout(token || undefined);
    } catch (err) {
      // ignore
    } finally {
      setUser(null);
      setTokenInStorage(null, null);
      localStorage.removeItem('garka_user');
      toast.success('Logged out');
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
