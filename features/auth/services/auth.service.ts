// ============================================================
// CARTICOM AUTHENTICATION — API Service
// ============================================================

import axiosInstance, { extractErrorMessage } from '@/lib/axios';
import type { RegisterBusinessOwnerDto, LoginDto, ForgotPasswordDto, VerifyEmailDto, AuthResponse, UserDto, ApiResponse, BackendAuthData } from '../types';
import { AccountStatus } from '../types';

const AUTH_ENDPOINTS = {
  REGISTER: '/api/v1/auth/register',
  LOGIN: '/api/v1/auth/login',
  LOGOUT: '/api/v1/auth/logout',
  REFRESH: '/api/v1/auth/refresh',
  FORGOT_PASSWORD: '/api/v1/auth/forgot-password',
  RESET_PASSWORD: '/api/v1/auth/reset-password',
  VERIFY_EMAIL: '/api/v1/auth/verify-email',
  RESEND_VERIFICATION: '/api/v1/auth/resend-verification',
  ME: '/api/v1/auth/me',
  UPDATE_PROFILE: '/api/v1/auth/profile'} as const;

// ─── Service Class ───────────────────────────────────────────

class AuthService {
  // ─── Register Business Owner ────────────────────────────────

  async registerBusinessOwner(
    dto: RegisterBusinessOwnerDto
  ): Promise<AuthResponse> {
    try {
      const response = await axiosInstance.post<ApiResponse<BackendAuthData>>(
        AUTH_ENDPOINTS.REGISTER,
        dto
      );
      
      // Backend returns: { success: true, data: { accessToken, refreshToken, userId, email, fullName, role } }
      if (response.data?.success && response.data?.data) {
        const backendData = response.data.data;
        
        // Convert backend flat structure to our AuthResponse format
        const authResponse: AuthResponse = {
          user: {
            id: backendData.userId,
            email: backendData.email,
            fullName: backendData.fullName,
            businessName: dto.businessName, // Use from registration
            phone: dto.phone, // Use from registration
            role: backendData.role,
            status: AccountStatus.ACTIVE, // Default to ACTIVE
            emailVerified: false, // Default
            mustChangePassword: backendData.mustChangePassword,
            profileImageUrl: backendData.profileImageUrl,
            onboardingCompleted: backendData.onboardingCompleted,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()},
          tokens: {
            accessToken: backendData.accessToken,
            refreshToken: backendData.refreshToken,
            expiresIn: backendData.expiresIn,
            tokenType: backendData.tokenType || 'Bearer'}};
        
        return authResponse;
      }
      
      // If success is false, extract error message
      const errorMessage = response.data?.error?.message || 'Registration failed';
      throw new Error(errorMessage);
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }

  // ─── Login ─────────────────────────────────────────────────

  async login(dto: LoginDto): Promise<AuthResponse> {
    try {
      const response = await axiosInstance.post<ApiResponse<BackendAuthData>>(
        AUTH_ENDPOINTS.LOGIN,
        dto
      );
      
      // Backend returns: { success: true, data: { accessToken, refreshToken, userId, email, fullName, role } }
      if (response.data?.success && response.data?.data) {
        const backendData = response.data.data;
        
        // Convert backend flat structure to our AuthResponse format
        const authResponse: AuthResponse = {
          user: {
            id: backendData.userId,
            email: backendData.email,
            fullName: backendData.fullName,
            businessName: '', // Not provided by backend
            phone: '', // Not provided by backend
            role: backendData.role,
            status: AccountStatus.ACTIVE, // Default to ACTIVE
            emailVerified: false, // Default
            mustChangePassword: backendData.mustChangePassword,
            profileImageUrl: backendData.profileImageUrl,
            onboardingCompleted: backendData.onboardingCompleted,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()},
          tokens: {
            accessToken: backendData.accessToken,
            refreshToken: backendData.refreshToken,
            expiresIn: backendData.expiresIn,
            tokenType: backendData.tokenType || 'Bearer'}};
        
        return authResponse;
      }
      
      // If success is false, extract error message
      const errorMessage = response.data?.error?.message || 'Login failed';
      throw new Error(errorMessage);
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }

  // ─── Logout ────────────────────────────────────────────────

  async logout(): Promise<void> {
    try {
      await axiosInstance.post(AUTH_ENDPOINTS.LOGOUT);
    } catch {
      // Even if the server request fails, we still clear local state
    }
  }

  // ─── Refresh Token ─────────────────────────────────────────

  async refreshToken(refreshToken?: string): Promise<{
    accessToken: string;
    refreshToken?: string;
  }> {
    try {
      const response = await axiosInstance.post<
        ApiResponse<{ accessToken: string; refreshToken?: string }>
      >(AUTH_ENDPOINTS.REFRESH, refreshToken ? { refreshToken } : undefined);
      if (!response.data?.data?.accessToken) {
        throw new Error('No access token in refresh response');
      }
      return response.data.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }

  // ─── Forgot Password ───────────────────────────────────────

  async forgotPassword(dto: ForgotPasswordDto): Promise<void> {
    try {
      const response = await axiosInstance.post(AUTH_ENDPOINTS.FORGOT_PASSWORD, dto);
      if (!response.data) {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }

  // ─── Reset Password ────────────────────────────────────────

  async resetPassword(dto: {
    email: string;
    token: string;
    newPassword: string;
  }): Promise<void> {
    try {
      const response = await axiosInstance.post(AUTH_ENDPOINTS.RESET_PASSWORD, dto);
      if (!response.data) {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }

  // ─── Verify Email ──────────────────────────────────────────

  async verifyEmail(dto: VerifyEmailDto): Promise<void> {
    try {
      await axiosInstance.post(AUTH_ENDPOINTS.VERIFY_EMAIL, dto);
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }

  // ─── Resend Verification Email ───────────────────────────

  async resendVerification(): Promise<void> {
    try {
      await axiosInstance.post(AUTH_ENDPOINTS.RESEND_VERIFICATION);
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }

  // ─── Get Current User ──────────────────────────────────────

  async getCurrentUser(): Promise<UserDto> {
    try {
      const response = await axiosInstance.get<ApiResponse<UserDto>>(
        AUTH_ENDPOINTS.ME
      );
      if (!response.data?.data) {
        throw new Error('Invalid response from server');
      }
      return response.data.data as UserDto;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }

  // ─── Change Password ─────────────────────────────────────

  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> {
    try {
      await axiosInstance.put('/api/v1/auth/password', data);
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }

  // ─── Update Profile ────────────────────────────────────────

  async updateProfile(
    data: Partial<Pick<UserDto, 'fullName' | 'phone' | 'businessName' | 'profileImageUrl'>>
  ): Promise<UserDto> {
    try {
      const response = await axiosInstance.put<ApiResponse<UserDto>>(
        AUTH_ENDPOINTS.UPDATE_PROFILE,
        data
      );
      if (!response.data?.data) {
        throw new Error('Invalid response from server');
      }
      return response.data.data as UserDto;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }
}

// ─── Singleton Export ────────────────────────────────────────

export const authService = new AuthService();
export default authService;