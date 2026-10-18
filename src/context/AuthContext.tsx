import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  googleLogin: (email?: string, name?: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<boolean>;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('pmr_token'));
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          // Token expired
          localStorage.removeItem('pmr_token');
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.error('Error loading user session:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadUser();
  }, [token]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        showToast('error', 'Login Failed', data.error || 'Invalid credentials');
        return false;
      }
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('pmr_token', data.token);
      showToast('success', `Welcome back, ${data.user.name}!`);
      return true;
    } catch (err: any) {
      showToast('error', 'Login Error', err.message);
      return false;
    }
  };

  const googleLogin = async (customEmail?: string, customName?: string): Promise<boolean> => {
    try {
      const email = customEmail || 'google.user@example.com';
      const name = customName || 'Google User';
      const res = await fetch('/api/auth/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name,
          avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=0284c7`
        })
      });
      const data = await res.json();
      if (!res.ok) {
        showToast('error', 'Google Login Failed', data.error);
        return false;
      }
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('pmr_token', data.token);
      showToast('success', 'Logged in via Google Authentication', `Welcome, ${data.user.name}`);
      return true;
    } catch (err: any) {
      showToast('error', 'Google Login Error', err.message);
      return false;
    }
  };

  const register = async (name: string, email: string, password: string, phone?: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone })
      });
      const data = await res.json();
      if (!res.ok) {
        showToast('error', 'Registration Failed', data.error);
        return false;
      }
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('pmr_token', data.token);
      showToast('success', 'Account Created!', 'Welcome to Pawan Mobile Repairing Center.');
      return true;
    } catch (err: any) {
      showToast('error', 'Registration Error', err.message);
      return false;
    }
  };

  const updateProfile = async (data: Partial<User>): Promise<boolean> => {
    if (!token) return false;
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (!res.ok) {
        showToast('error', 'Profile Update Failed', result.error);
        return false;
      }
      setUser(result.user);
      showToast('success', 'Profile Updated Successfully');
      return true;
    } catch (err: any) {
      showToast('error', 'Profile Error', err.message);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('pmr_token');
    setToken(null);
    setUser(null);
    showToast('info', 'Logged Out', 'You have been safely signed out.');
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAdmin,
        login,
        googleLogin,
        register,
        updateProfile,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
