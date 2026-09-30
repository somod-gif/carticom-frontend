// ============================================================
// CARTICOM AUTHENTICATION — Zustand State Store
// Tokens live in memory only (NOT localStorage — C9).
// Session restoration uses HttpOnly cookies set by the backend.
// ============================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserDto, AuthTokens } from '../types';
import { setAccessToken, setRefreshTokenValue } from '@/lib/axios';
import authService from '../services/auth.service';

// ─── Constants ───────────────────────────────────────────────

const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes idle timeout
const STORAGE_KEY = 'carticom-auth';

// ─── Session marker for middleware (role + expiry only — no tokens) ──

const setSessionMarker = (role: string, expiresIn: number) => {
  const ttl = Number.isFinite(expiresIn) && expiresIn > 0 ? expiresIn : 86400;
  const payload = JSON.stringify({ role, exp: Date.now() + ttl * 1000 });
  document.cookie = `carticom_session=${btoa(payload)}; Path=/; Max-Age=${ttl}; SameSite=Lax`;
};

const removeSessionMarker = () => {
  document.cookie = 'carticom_session=; Path=/; Max-Age=0; SameSite=Lax';
};

// ─── State Interface ─────────────────────────────────────────

interface AuthState {
  // State
  user: UserDto | null;
  accessToken: string | null;
  refreshToken: string | null;
  expiresIn: number | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  lastActivity: number | null;

  // Actions
  login: (user: UserDto, tokens: AuthTokens) => void;
  logout: () => void;
  setUser: (user: UserDto) => void;
  setTokens: (tokens: AuthTokens) => void;
  setLoading: (loading: boolean) => void;
  updateActivity: () => void;
  checkSession: () => boolean;
  hasRole: (roles: string[]) => boolean;
  initialize: () => Promise<void>;
}

// ─── Store Implementation ────────────────────────────────────

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // ─── Initial State ────────────────────────────────────
      user: null,
      accessToken: null,
      refreshToken: null,
      expiresIn: null,
      isAuthenticated: false,
      isLoading: true,
      lastActivity: null,

      // ─── Login ────────────────────────────────────────────
      login: (user: UserDto, tokens: AuthTokens) => {
        if (!tokens?.accessToken) {
          return;
        }
        setAccessToken(tokens.accessToken);
        setRefreshTokenValue(tokens.refreshToken ?? null);
        setSessionMarker(user.role, tokens.expiresIn);
        set({
          user,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn: tokens.expiresIn,
          isAuthenticated: true,
          isLoading: false,
          lastActivity: Date.now()});
        // Redirect to change-password if mustChangePassword is set
        if (user.mustChangePassword && typeof window !== 'undefined') {
          window.location.href = '/change-password';
          return;
        }
        // Redirect to onboarding if not completed
        if (
          user.onboardingCompleted === false &&
          typeof window !== 'undefined' &&
          window.location.pathname !== '/onboarding'
        ) {
          window.location.href = '/onboarding';
        }
      },

      // ─── Logout ───────────────────────────────────────────
      logout: () => {
        setAccessToken(null);
        setRefreshTokenValue(null);
        removeSessionMarker();
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          expiresIn: null,
          isAuthenticated: false,
          isLoading: false,
          lastActivity: null});
      },

      // ─── Set User ─────────────────────────────────────────
      setUser: (user: UserDto) => {
        set({ user });
      },

      // ─── Set Tokens ───────────────────────────────────────
      setTokens: (tokens: AuthTokens) => {
        if (!tokens?.accessToken) {
          return;
        }
        setAccessToken(tokens.accessToken);
        setRefreshTokenValue(tokens.refreshToken ?? null);
        set({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn: tokens.expiresIn,
          lastActivity: Date.now()});
      },

      // ─── Set Loading ──────────────────────────────────────
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      // ─── Update Activity ──────────────────────────────────
      updateActivity: () => {
        set({ lastActivity: Date.now() });
      },

      // ─── Check Session ────────────────────────────────────
      checkSession: () => {
        const state = get();
        if (!state.isAuthenticated || !state.lastActivity) {
          return false;
        }

        const idleTime = Date.now() - state.lastActivity;
        if (idleTime > SESSION_TIMEOUT_MS) {
          get().logout();
          return false;
        }

        // Check token expiry based on last activity
        if (state.expiresIn && state.lastActivity) {
          const elapsed = Date.now() - state.lastActivity;
          if (elapsed > state.expiresIn * 1000) {
            get().logout();
            return false;
          }
        }

        return true;
      },

      // ─── Has Role ─────────────────────────────────────────
      hasRole: (roles: string[]) => {
        const state = get();
        if (!state.user) return false;
        return roles.includes(state.user.role);
      },

      // ─── Initialize ───────────────────────────────────────
      initialize: async () => {
        try {
          const state = get();
          if (state?.accessToken) {
            setAccessToken(state.accessToken);
            try {
              const user = await authService.getCurrentUser();
              set({ user, isLoading: false, isAuthenticated: true });
              if (user?.mustChangePassword && typeof window !== 'undefined') {
                window.location.href = '/change-password';
                return;
              }
              if (
                user?.onboardingCompleted === false &&
                typeof window !== 'undefined' &&
                window.location.pathname !== '/onboarding'
              ) {
                window.location.href = '/onboarding';
                return;
              }
              return;
            } catch {
              // fall through to refresh
            }
          }

          // No in-memory token (page reload): restore session via HttpOnly
          // refresh cookie set by the backend.
          try {
            const { accessToken: newToken, refreshToken: newRefresh } =
              await authService.refreshToken();
            if (newToken) {
              setAccessToken(newToken);
              setRefreshTokenValue(newRefresh ?? null);
              const user = await authService.getCurrentUser();
              set({
                user,
                accessToken: newToken,
                refreshToken: newRefresh,
                isAuthenticated: true,
                isLoading: false,
                lastActivity: Date.now()});
              if (user?.role) setSessionMarker(user.role, 3600);
              if (user?.mustChangePassword && typeof window !== 'undefined') {
                window.location.href = '/change-password';
                return;
              }
              if (
                user?.onboardingCompleted === false &&
                typeof window !== 'undefined' &&
                window.location.pathname !== '/onboarding'
              ) {
                window.location.href = '/onboarding';
                return;
              }
              return;
            }
          } catch {
            // Refresh failed — not authenticated
          }

          get().logout();
          set({ isLoading: false, isAuthenticated: false });
        } catch {
          get().logout();
          set({ isLoading: false });
        }
      }}),
    {
      name: STORAGE_KEY,
      // CRITICAL (C9): never persist tokens — only the user profile,
      // which contains no credentials an attacker can use.
      partialize: (state) => ({
        user: state.user,
        lastActivity: state.lastActivity})}
  )
);

// ─── Selectors ───────────────────────────────────────────────

export const selectUser = (state: AuthState) => state.user;
export const selectIsAuthenticated = (state: AuthState) =>
  state.isAuthenticated;
export const selectIsLoading = (state: AuthState) => state.isLoading;
export const selectUserRole = (state: AuthState) => state.user?.role;
export const selectIsBusinessOwner = (state: AuthState) =>
  state.user?.role === 'BUSINESS_OWNER' || state.user?.role === 'VENDOR';

export default useAuthStore;
