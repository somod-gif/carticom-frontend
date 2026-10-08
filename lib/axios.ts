// ============================================================
// CARTICOM — Axios HTTP Client Configuration
// ============================================================

import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig} from 'axios';

// ─── Types ───────────────────────────────────────────────────

interface FailedRequest {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}

interface RateLimitBody {
  error?: string;
  message?: string;
  retryAfterSeconds?: number;
}

// ─── Constants ───────────────────────────────────────────────

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
const REFRESH_ENDPOINT = '/api/v1/auth/refresh';

// ─── State ───────────────────────────────────────────────────

let accessToken: string | null = null;
let refreshTokenValue: string | null = null;
let isRefreshing = false;
let failedQueue: FailedRequest[] = [];

// ─── Token Management ────────────────────────────────────────

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const getAccessToken = (): string | null => {
  return accessToken;
};

export const setRefreshTokenValue = (token: string | null) => {
  refreshTokenValue = token;
};

export const getRefreshTokenValue = (): string | null => {
  return refreshTokenValue;
};

// ─── Queue Management ────────────────────────────────────────

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (token) {
      promise.resolve(token);
    } else {
      promise.reject(error);
    }
  });
  failedQueue = [];
};

// ─── Axios Instance ──────────────────────────────────────────

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'},
  withCredentials: true, // For HTTP-only cookies
});

// ─── Request Interceptor ─────────────────────────────────────
// ENABLED: Authorization header interceptor for authenticated requests

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    if (config.headers && typeof window !== 'undefined') {
      let sid = window.localStorage.getItem('cart_sid');
      if (!sid) {
        sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
        window.localStorage.setItem('cart_sid', sid);
      }
      config.headers['X-Cart-Session'] = sid;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// ─── Response Interceptor ────────────────────────────────────

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
      _rateLimitRetried?: boolean;
    };

    // Don't retry refresh endpoint itself
    if (originalRequest?.url === REFRESH_ENDPOINT) {
      return Promise.reject(error);
    }

    // ── Rate limited (429) ──────────────────────────────────
    // For safe (GET) requests we transparently wait out the short
    // cooldown and retry once. Everything else surfaces a friendly,
    // plain-language message with the wait time via extractErrorMessage.
    if (error.response?.status === 429 && !originalRequest?._rateLimitRetried) {
      const retryAfter = getRateLimitRetryAfter(error);
      const method = (originalRequest?.method || 'get').toLowerCase();
      if (retryAfter !== null && retryAfter > 0 && retryAfter <= 5 && method === 'get') {
        originalRequest._rateLimitRetried = true;
        await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
        return axiosInstance(originalRequest);
      }
    }

    // If 401 and not already retried
    if (error.response?.status === 401 && !originalRequest?._retry) {
      if (isRefreshing) {
        // Queue this request until refresh completes
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return axiosInstance(originalRequest);
          })
          .catch((err: unknown) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = refreshTokenValue;
        const response = await axiosInstance.post<{
          data?: { accessToken?: string; refreshToken?: string };
        }>(REFRESH_ENDPOINT, refreshToken ? { refreshToken } : undefined);

        const payload = response.data?.data;
        const newToken = payload?.accessToken;
        if (!newToken) {
          throw new Error('No access token in refresh response');
        }

        setAccessToken(newToken);
        if (payload?.refreshToken) {
          setRefreshTokenValue(payload.refreshToken);
        }
        processQueue(null, newToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }

        return axiosInstance(originalRequest);
      } catch (refreshError: unknown) {
        processQueue(refreshError, null);
        setAccessToken(null);
        setRefreshTokenValue(null);

        // Clear session marker so proxy/guard routes treat user as logged out
        if (typeof document !== 'undefined') {
          document.cookie =
            'carticom_session=; Path=/; Max-Age=0; SameSite=Lax';
        }

        // Redirect to login — avoid full page reload in SPA
        if (typeof window !== 'undefined') {
          window.location.href = '/login?session=expired';
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ─── Error Message Extractor ─────────────────────────────────

/**
 * Returns the cooldown in seconds from a 429 response, or null when the
 * server did not specify one.
 */
export const getRateLimitRetryAfter = (error: unknown): number | null => {
  if (!axios.isAxiosError(error) || error.response?.status !== 429) return null;
  const body = error.response.data as RateLimitBody | undefined;
  const fromBody = Number(body?.retryAfterSeconds);
  if (Number.isFinite(fromBody) && fromBody > 0) return Math.ceil(fromBody);
  const fromHeader = Number(error.response.headers?.['retry-after']);
  if (Number.isFinite(fromHeader) && fromHeader > 0) return Math.ceil(fromHeader);
  return null;
};

export const extractErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const serverError = error.response?.data as Record<string, unknown> | undefined;
    if (!serverError) {
      return 'An unexpected error occurred. Please try again.';
    }

    // Rate limiting gets its own friendly wording with the wait time.
    if (error.response?.status === 429) {
      const seconds = Number((serverError as RateLimitBody).retryAfterSeconds);
      if (Number.isFinite(seconds) && seconds > 0) {
        const wait = Math.ceil(seconds);
        return `You're doing that a little too often. Please wait ${wait} second${wait === 1 ? '' : 's'} and try again.`;
      }
      return 'You are doing that a little too often. Please wait a moment and try again.';
    }

    const data = serverError as {
      error?: { message: string; code?: string };
      message?: string;
    };

    if (data?.error?.message) {
      return data.error.message;
    }

    if (data?.message) {
      return data.message;
    }

    switch (error.response?.status) {
      case 400:
        return 'Invalid request. Please check your input.';
      case 401:
        return 'Invalid credentials. Please try again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 409:
        return 'This resource already exists.';
      case 422:
        return 'Validation failed. Please check your input.';
      case 429:
        return 'Too many attempts. Please try again later.';
      case 500:
        return 'Something went wrong. Please try again later.';
      default:
        break;
    }

    if (error.code === 'ERR_NETWORK') {
      return 'Unable to connect to the server. Please check your internet connection.';
    }

    if (error.code === 'ECONNABORTED') {
      return 'Request timed out. Please try again.';
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
};

export default axiosInstance;