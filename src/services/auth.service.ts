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
  UserDto,
} from '../types/api';

function toUserInfo(user: UserDto): UserInfoResponse {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: user.fullName,
    companyName: user.companyName,
    emailConfirmed: user.emailConfirmed,
    isActive: user.isActive,
    role: user.roles.includes('Admin') ? 'Admin' : user.roles[0] ?? 'User',
    subscriptionLevel: user.subscriptionLevel,
  };
}

export class AuthService {
  // Refresh token backend tarafından httpOnly cookie olarak ayarlanır; burada yalnızca access token saklanır
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await httpClient.post<LoginResponse>(
      API_CONFIG.ENDPOINTS.AUTH.LOGIN,
      data
    );

    if (response.accessToken) {
      httpClient.setAuthToken(response.accessToken);
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
    try {
      // Refresh token cookie ile gönderilir; backend iptal edip cookie'yi siler
      await httpClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      httpClient.clearAuthToken();
    }
  }

  /**
   * Sayfa yenilendiğinde oturumu refresh token cookie'si ile geri yükler.
   * Geçerli bir oturum yoksa null döner.
   */
  async restoreSession(): Promise<UserInfoResponse | null> {
    const refreshed = await httpClient.refreshAccessToken();
    if (!refreshed) return null;

    try {
      return await this.getCurrentUser();
    } catch {
      httpClient.clearAuthToken();
      return null;
    }
  }

  // Rol bilgisini de içeren güncel kullanıcı bilgisi
  async getCurrentUser(): Promise<UserInfoResponse> {
    const user = await httpClient.get<UserDto>(API_CONFIG.ENDPOINTS.USERS.GETPROFILE);
    return toUserInfo(user);
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

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return httpClient.hasAuthToken();
  }
}

// Export singleton instance
export const authService = new AuthService();
