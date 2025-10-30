import React, {createContext, useState, useContext, useEffect} from 'react';
import {authService} from '../services/api';
import {storage} from '../utils/storage';
import {User, AuthResponse} from '../types';

interface AuthContextData {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: User) => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await storage.getToken();
      const storedUser = await storage.getUser();

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response: AuthResponse = await authService.login(email, password);
      await storage.setToken(response.token);
      await storage.setUser(response);
      setToken(response.token);
      setUser(response as unknown as User);
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData: any) => {
    try {
      const response: AuthResponse = await authService.register(userData);
      await storage.setToken(response.token);
      await storage.setUser(response);
      setToken(response.token);
      setUser(response as unknown as User);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await storage.clear();
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const updateUser = (userData: User) => {
    setUser(userData);
    storage.setUser(userData);
  };

  return (
    <AuthContext.Provider
      value={{user, token, loading, login, register, logout, updateUser}}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
