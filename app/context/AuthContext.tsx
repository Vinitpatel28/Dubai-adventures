"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
}

interface AuthCtx {
  user: User | null;
  isLoading: boolean;
  login: (userData: User) => void;
  logout: () => Promise<void>;
  refreshUser: (force?: boolean) => Promise<void>;
}

const AuthContext = createContext<AuthCtx>({
  user: null,
  isLoading: true,
  login: () => {},
  logout: async () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async (force = false) => {
    try {
      if (!force && typeof window !== 'undefined') {
        const cached = sessionStorage.getItem('auth_data_v1');
        if (cached) {
          const { user: cUser, timestamp } = JSON.parse(cached);
          // Only accept the cache if it's within 5 mins AND it possesses the critical 'id' field
          if (cUser && cUser.id && (Date.now() - timestamp < 5 * 60 * 1000)) {
            setUser(cUser);
            setIsLoading(false);
            return;
          }
        }
      }

      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('auth_data_v1', JSON.stringify({ user: data.user, timestamp: Date.now() }));
        }
      } else {
        setUser(null);
        if (typeof window !== 'undefined') sessionStorage.removeItem('auth_data_v1');
      }
    } catch (err) {
      console.error("Auth refresh failed", err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();

    // Listen for storage events (e.g., from other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth-trigger') {
        refreshUser();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    
    // Custom event for internal tab updates
    const handleAuthChange = () => refreshUser(true);
    window.addEventListener('authStatusChanged', handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authStatusChanged', handleAuthChange);
    };
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    // Trigger sync for other tabs
    localStorage.setItem('auth-trigger', Date.now().toString());
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('auth_data_v1');
        // Clean up ALL cart-related localStorage to prevent data leaking to next user
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('dubai_adventures_cart')) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(k => localStorage.removeItem(k));
      }
      localStorage.setItem('auth-trigger', Date.now().toString());
      window.dispatchEvent(new Event('authStatusChanged'));
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
