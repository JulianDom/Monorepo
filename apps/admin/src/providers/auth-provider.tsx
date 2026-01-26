'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AUTH, ROUTES, ENDPOINTS } from '@/config';
import { apiClient } from '@/lib';
import type {
  User,
  LoginCredentials,
  LoginResponse,
  RefreshTokenResponse,
  AuthState,
} from '@/types/auth.types';

interface AuthContextValue extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ============================================
// Storage helpers (SSR-safe)
// ============================================
const storage = {
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(AUTH.TOKEN_KEY);
  },
  setToken: (token: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(AUTH.TOKEN_KEY, token);
    // También setear en cookie para el middleware
    document.cookie = `access_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
  },
  getRefreshToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(AUTH.REFRESH_TOKEN_KEY);
  },
  setRefreshToken: (token: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(AUTH.REFRESH_TOKEN_KEY, token);
  },
  getUser: (): User | null => {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(AUTH.USER_KEY);
    return data ? JSON.parse(data) : null;
  },
  setUser: (user: User): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(AUTH.USER_KEY, JSON.stringify(user));
  },
  clear: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(AUTH.TOKEN_KEY);
    localStorage.removeItem(AUTH.REFRESH_TOKEN_KEY);
    localStorage.removeItem(AUTH.USER_KEY);
    // Limpiar cookie
    document.cookie = 'access_token=; path=/; max-age=0';
  },
};

// ============================================
// Provider
// ============================================
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Inicializar desde storage
  useEffect(() => {
    const user = storage.getUser();
    const token = storage.getToken();

    if (user && token) {
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } else {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  // Login
  const login = useCallback(
    async (credentials: LoginCredentials): Promise<void> => {
      // Enviar con actorType: ADMIN para el panel de administración
      const response = await apiClient.post<LoginResponse>(
        ENDPOINTS.AUTH.LOGIN,
        {
          email: credentials.email,
          password: credentials.password,
          actorType: 'ADMIN',
        }
      );

      const { actor, accessToken, refreshToken } = response.data;

      // Guardar en storage
      storage.setToken(accessToken);
      storage.setRefreshToken(refreshToken);
      storage.setUser(actor);

      // Actualizar estado
      setState({
        user: actor,
        isAuthenticated: true,
        isLoading: false,
      });

      // Redirigir a callbackUrl o dashboard
      const callbackUrl = searchParams.get('callbackUrl');
      router.push(callbackUrl || ROUTES.DASHBOARD);
    },
    [router, searchParams]
  );

  // Logout
  const logout = useCallback(async (): Promise<void> => {
    try {
      await apiClient.post(ENDPOINTS.AUTH.LOGOUT, { allSessions: false });
    } catch {
      // Ignorar errores de logout (el token podría ya estar expirado)
    } finally {
      storage.clear();
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
      router.push(ROUTES.LOGIN);
    }
  }, [router]);

  // Refresh auth (refrescar token)
  const refreshAuth = useCallback(async (): Promise<void> => {
    const refreshToken = storage.getRefreshToken();

    if (!refreshToken) {
      storage.clear();
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
      return;
    }

    try {
      const response = await apiClient.post<RefreshTokenResponse>(
        ENDPOINTS.AUTH.REFRESH,
        { refreshToken }
      );

      const { actor, accessToken, refreshToken: newRefreshToken } = response.data;

      // Actualizar tokens
      storage.setToken(accessToken);
      storage.setRefreshToken(newRefreshToken);
      storage.setUser(actor);

      setState({
        user: actor,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      // Token inválido, limpiar
      storage.clear();
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      login,
      logout,
      refreshAuth,
    }),
    [state, login, logout, refreshAuth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ============================================
// Hook
// ============================================
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

// ============================================
// Export storage para uso en api-client
// ============================================
export { storage as authStorage };
