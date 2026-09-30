// ============================================================
// CARTICOM AUTHENTICATION — Type Definitions
// ============================================================

// ─── Enums ───────────────────────────────────────────────────

export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  BUSINESS_OWNER = 'BUSINESS_OWNER',
  VENDOR = 'VENDOR',
  STAFF = 'STAFF',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN'}

export enum AccountStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  DISABLED = 'DISABLED'}

export enum EmailVerificationStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  EXPIRED = 'EXPIRED',
  INVALID_TOKEN = 'INVALID_TOKEN'}

// ─── DTOs ────────────────────────────────────────────────────

export interface RegisterBusinessOwnerDto {
  fullName: string;
  businessName: string;
  email: string;
  phone: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  email: string;
  token: string;
  newPassword: string;
}

export interface VerifyEmailDto {
  token: string;
}

// ─── Response Types ──────────────────────────────────────────

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface UserDto {
  id: string;
  fullName: string;
  businessName: string;
  email: string;
  phone: string;
  role: UserRole;
  status: AccountStatus;
  emailVerified: boolean;
  avatarUrl?: string;
  profileImageUrl?: string;
  mustChangePassword?: boolean;
  onboardingCompleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: UserDto;
  tokens: AuthTokens;
}

// Backend returns flat structure in data field
export interface BackendAuthData {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  userId: string;
  email: string;
  fullName: string;
  role: UserRole;
  mustChangePassword?: boolean;
  profileImageUrl?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

// ─── Session Types ───────────────────────────────────────────

export interface SessionInfo {
  user: UserDto;
  expiresAt: number;
  lastActivity: number;
}

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterFormData {
  fullName: string;
  businessName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export interface ForgotPasswordFormData {
  email: string;
}

export interface ResetPasswordFormData {
  token: string;
  password: string;
  confirmPassword: string;
}

// ─── Guard Types ─────────────────────────────────────────────

export type AllowedRoles = UserRole[];

export interface GuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}