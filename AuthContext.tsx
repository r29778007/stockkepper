import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserData {
  ownerName: string;
  shopName: string;
  shopAddress: string;
  shopCategory: string;
  email: string;
  password: string;
}

interface AuthContextValue {
  user: UserData | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  signup: (data: UserData) => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  getAllUsers: () => Promise<UserData[]>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem('current_user').then((data) => {
      if (data) {
        setUser(JSON.parse(data));
      }
      setIsLoading(false);
    });
  }, []);

  const signup = useCallback(async (data: UserData) => {
    const usersStr = await AsyncStorage.getItem('all_users');
    const users: UserData[] = usersStr ? JSON.parse(usersStr) : [];
    users.push(data);
    await AsyncStorage.setItem('all_users', JSON.stringify(users));
    await AsyncStorage.setItem('current_user', JSON.stringify(data));
    setUser(data);
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    const usersStr = await AsyncStorage.getItem('all_users');
    const users: UserData[] = usersStr ? JSON.parse(usersStr) : [];
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (found) {
      await AsyncStorage.setItem('current_user', JSON.stringify(found));
      setUser(found);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem('current_user');
    setUser(null);
  }, []);

  const getAllUsers = useCallback(async (): Promise<UserData[]> => {
    const usersStr = await AsyncStorage.getItem('all_users');
    return usersStr ? JSON.parse(usersStr) : [];
  }, []);

  const value = useMemo(() => ({
    user,
    isLoggedIn: !!user,
    isLoading,
    signup,
    login,
    logout,
    getAllUsers,
  }), [user, isLoading, signup, login, logout, getAllUsers]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
