'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { storage, STORAGE_KEYS } from '@/lib/localStorage';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => User | null;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo users
const demoUsers: { email: string; password: string; user: User }[] = [
  {
    email: 'admin@loopwar.com',
    password: 'admin123',
    user: {
      id: 'user-001',
      name: 'Admin User',
      email: 'admin@loopwar.com',
      phone: '+91 98765 43210',
      role: 'admin',
      createdAt: new Date().toISOString(),
    },
  },
  {
    email: 'user@example.com',
    password: 'user123',
    user: {
      id: 'user-002',
      name: 'John Doe',
      email: 'user@example.com',
      phone: '+91 98765 43211',
      role: 'user',
      createdAt: new Date().toISOString(),
    },
  },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Load user from storage on mount
    const storedUser = storage.get<User>(STORAGE_KEYS.USER);
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const login = (email: string, password: string): User | null => {
    const matchedUser = demoUsers.find(
      (u) => u.email === email && u.password === password
    );

    if (matchedUser) {
      setUser(matchedUser.user);
      storage.set(STORAGE_KEYS.USER, matchedUser.user);
      return matchedUser.user;
    }
    return null;
  };

  const logout = () => {
    setUser(null);
    storage.remove(STORAGE_KEYS.USER);
    storage.remove(STORAGE_KEYS.CART); // Clear cart on logout
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
