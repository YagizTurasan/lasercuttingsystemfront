import { create } from 'zustand';
import { authService } from '../services/auth.service';
import { httpClient, getErrorMessage } from '../lib/http-client';
import { UserInfoResponse, LoginRequest, RegisterRequest } from '../types/api';

interface AuthState {
  user: UserInfoResponse | null;
  isAuthenticated: boolean;
  /** Uygulama açılışındaki oturum geri yükleme denemesi tamamlandı mı */
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  login: (data: LoginRequest) => Promise<UserInfoResponse>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  refreshUser: () => Promise<void>;
}

// Token'lar bellekte tutulduğu için oturum durumu tüm bileşenlerin paylaştığı tek bir store'da yaşar
let initializePromise: Promise<void> | null = null;

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isInitialized: false,
  isLoading: false,
  error: null,

  initialize: () => {
    // StrictMode'da efektler iki kez çalışır; geri yükleme yalnızca bir kez yapılır
    if (!initializePromise) {
      initializePromise = (async () => {
        const user = await authService.restoreSession();
        set({ user, isAuthenticated: !!user, isInitialized: true });
      })();
    }
    return initializePromise;
  },

  login: async (data) => {
    try {
      set({ isLoading: true, error: null });
      const response = await authService.login(data);
      set({ user: response.user, isAuthenticated: true, isInitialized: true });
      return response.user;
    } catch (err) {
      set({ error: getErrorMessage(err, 'Login failed'), isAuthenticated: false, user: null });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (data) => {
    try {
      set({ isLoading: true, error: null });
      await authService.register(data);
    } catch (err) {
      set({ error: getErrorMessage(err, 'Registration failed') });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    set({ isLoading: true });
    await authService.logout();
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  refreshUser: async () => {
    if (!get().isAuthenticated) return;
    try {
      const user = await authService.getCurrentUser();
      set({ user });
    } catch (err) {
      console.error('Failed to refresh user:', err);
      await get().logout();
    }
  },

  clearError: () => set({ error: null }),
}));

// Refresh token da geçersizse (süresi doldu, iptal edildi) oturum kapatılır; ProtectedRoute /login'e yönlendirir
httpClient.onSessionExpired(() => {
  httpClient.clearAuthToken();
  useAuth.setState({ user: null, isAuthenticated: false });
});
