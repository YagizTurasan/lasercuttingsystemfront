import { useState, useEffect } from 'react';
import { authService } from '../services/auth.service';
import { UserInfoResponse, LoginRequest, RegisterRequest } from '../types/api';

interface UseAuthReturn {
  user: UserInfoResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  refreshUser: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<UserInfoResponse | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = () => {
      const isAuth = authService.isAuthenticated();
      const currentUser = authService.getCurrentUser();
      
      setIsAuthenticated(isAuth);
      setUser(currentUser);
    };

    initAuth();
  }, []);

  const login = async (data: LoginRequest) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authService.login(data);
      
      setUser(response.user);
      setIsAuthenticated(true);
      
      authService.saveUserInfo(response.user);
    } catch (err: any) {
      setError(err.message || 'Login failed');
      setIsAuthenticated(false);
      setUser(null);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      setIsLoading(true);
      setError(null);

      await authService.register(data);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await authService.logout();
    } catch (err: any) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
      authService.clearAuthData();
    }
  };

  const refreshUser = async () => {
    try {
      if (!isAuthenticated) return;
      
      setIsLoading(true);
      const userProfile = await authService.getProfile();
      
      setUser(userProfile);
      authService.saveUserInfo(userProfile);
    } catch (err: any) {
      console.error('Failed to refresh user:', err);
      await logout();
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
    refreshUser
  };
}