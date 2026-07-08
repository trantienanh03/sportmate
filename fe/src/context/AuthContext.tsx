import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authService } from '../services/authService';

export interface SportCard {
  name: string;
  tag: string;
  level: string;
  note: string;
}

export interface AvailabilitySlot {
  label: string;
  morning: 'Rảnh' | 'Bận';
  afternoon: 'Rảnh' | 'Bận';
  evening: 'Rảnh' | 'Bận';
}

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: string;
  avatarUrl?: string;
  bio?: string | null;
  district?: string | null;
  lat?: number | null;
  lng?: number | null;
  isActive?: boolean | null;
  isBanned?: boolean | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  sports?: SportCard[] | null;
  availability?: AvailabilitySlot[] | null;
  avgAttitudeScore?: number | null;
  avgSkillScore?: number | null;
  completedMatches?: number | null;
  badges?: string[] | null;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (userData: User) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      try {
        const userData = await authService.getProfile();
        if (userData.isBanned || userData.isActive === false) {
          setUser(null);
          await authService.logout().catch(() => {});
        } else {
          setUser(userData);
        }
      } catch (error) {
        setUser(null);
        localStorage.removeItem("token");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
