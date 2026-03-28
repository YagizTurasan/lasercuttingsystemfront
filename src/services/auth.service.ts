import { httpClient } from '../lib/http-client';
import { API_CONFIG } from '../lib/config';
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
  UserInfoResponse,
} from '../types/api';

export class AuthService {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await httpClient.post<LoginResponse>(
      API_CONFIG.ENDPOINTS.AUTH.LOGIN,
      data
    );

    if (response.accessToken) {
      httpClient.setAuthToken(response.accessToken);
      httpClient.setRefreshToken(response.refreshToken);
    }

    return response;
  }

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    return await httpClient.post<RegisterResponse>(
      API_CONFIG.ENDPOINTS.AUTH.REGISTER,
      data
    );
  }

  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem('laser_cutting_refresh_token');
    
    try {
      if (refreshToken) {
        await httpClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT, {
          refreshToken
        });
      }
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      // Her durumda local token'ları temizle
      httpClient.clearAuthToken();
    }
  }

  // Forgot Password
  async forgotPassword(data: ForgotPasswordRequest): Promise<void> {
    await httpClient.post(API_CONFIG.ENDPOINTS.AUTH.FORGOTPASSWORD, data);
  }

  // Reset Password
  async resetPassword(data: ResetPasswordRequest): Promise<void> {
    await httpClient.post(API_CONFIG.ENDPOINTS.AUTH.RESETPASSWORD, data);
  }

  // Change Password
  async changePassword(data: ChangePasswordRequest): Promise<void> {
    await httpClient.post(API_CONFIG.ENDPOINTS.AUTH.CHANGEPASSWORD, data);
  }

  // Send Email Verification
  async sendEmailVerification(email: string): Promise<void> {
    await httpClient.post(API_CONFIG.ENDPOINTS.AUTH.SENDEMAILVERIFICATION, {
      email
    });
  }

  // Verify Email
  async verifyEmail(data: VerifyEmailRequest): Promise<void> {
    await httpClient.post(API_CONFIG.ENDPOINTS.AUTH.VERIFYEMAIL, data);
  }

  // Get Profile
  async getProfile(): Promise<UserInfoResponse> {
    return await httpClient.get<UserInfoResponse>(
      API_CONFIG.ENDPOINTS.AUTH.PROFILE
    );
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return httpClient.hasAuthToken();
  }

  // Get current user from localStorage (basic info)
  getCurrentUser(): UserInfoResponse | null {
    const userStr = localStorage.getItem('laser_cutting_user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  // Save user info to localStorage
  saveUserInfo(user: UserInfoResponse): void {
    localStorage.setItem('laser_cutting_user', JSON.stringify(user));
  }

  // Clear all auth data
  clearAuthData(): void {
    httpClient.clearAuthToken();
    localStorage.removeItem('laser_cutting_user');
  }
}

// Export singleton instance
export const authService = new AuthService();
