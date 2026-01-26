import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { toast } from 'sonner';
import { env } from '@/config/env';
import { AUTH, HTTP, ROUTES } from '@/config/constants';
import type { ApiErrorResponse } from '@/types';

/**
 * Cliente Axios configurado para la API
 * Usa la configuración centralizada de entorno
 */
export const apiClient = axios.create({
  baseURL: env.apiUrl,
  timeout: HTTP.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Log en desarrollo
if (env.isDev && typeof window !== 'undefined') {
  console.log(`🔌 API Client conectado a: ${env.apiUrl}`);
}

/**
 * Request Interceptor
 * Inyecta el token de autorización en cada request
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAuthToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Manejo global de errores
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const status = error.response?.status;
    const errorData = error.response?.data;
    const requestUrl = error.config?.url || '';

    // Verificar si es un request de autenticación (login/refresh)
    const isAuthRequest = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/refresh');

    // Manejo de error 401 - No autorizado
    if (status === 401) {
      // Si es un request de login, no hacer refresh ni redirigir
      // El error se maneja en el formulario de login
      if (isAuthRequest) {
        return Promise.reject(error);
      }

      // Intentar refresh token para otros requests
      const refreshed = await tryRefreshToken();

      if (refreshed && error.config) {
        // Reintentar request original
        return apiClient.request(error.config);
      }

      // No se pudo refrescar, redirigir a login
      clearAuth();
      if (typeof window !== 'undefined') {
        window.location.href = ROUTES.LOGIN;
      }
    }

    // No mostrar toast para errores de autenticación (se manejan en el formulario)
    if (isAuthRequest) {
      return Promise.reject(error);
    }

    // Manejo de errores 400 (Bad Request) y 5xx (Server Errors)
    if (status === 400 || (status && status >= 500)) {
      const errorMessage = getErrorMessage(errorData);
      toast.error(errorMessage);
    }

    // Manejo de error 403 - Forbidden
    if (status === 403) {
      toast.error('No tienes permisos para realizar esta acción');
    }

    // Manejo de error 404 - Not Found
    if (status === 404) {
      const errorMessage = errorData?.error?.message || 'Recurso no encontrado';
      toast.error(errorMessage);
    }

    // Manejo de error 409 - Conflict (duplicados)
    if (status === 409) {
      const errorMessage = errorData?.error?.message || 'El registro ya existe';
      toast.error(errorMessage);
    }

    // Error de red o servidor no disponible
    if (!error.response) {
      toast.error('Error de conexión. Verifica tu conexión a internet.');
    }

    return Promise.reject(error);
  }
);

// ============================================
// Auth helpers (SSR-safe)
// ============================================

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(AUTH.TOKEN_KEY);
}

function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(AUTH.REFRESH_TOKEN_KEY);
}

function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUTH.TOKEN_KEY, token);
  // También setear en cookie para el middleware
  document.cookie = `access_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
}

function setRefreshToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUTH.REFRESH_TOKEN_KEY, token);
}

function setUser(user: unknown): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUTH.USER_KEY, JSON.stringify(user));
}

function clearAuth(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH.TOKEN_KEY);
  localStorage.removeItem(AUTH.REFRESH_TOKEN_KEY);
  localStorage.removeItem(AUTH.USER_KEY);
  // Limpiar cookie
  document.cookie = 'access_token=; path=/; max-age=0';
}

/**
 * Intenta refrescar el token de acceso
 */
async function tryRefreshToken(): Promise<boolean> {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    return false;
  }

  try {
    // Crear instancia limpia para evitar loop infinito
    const response = await axios.post(
      `${env.apiUrl}/auth/refresh`,
      { refreshToken },
      { headers: { 'Content-Type': 'application/json' } }
    );

    const { actor, accessToken, refreshToken: newRefreshToken } = response.data;

    // Actualizar todos los datos de autenticación
    setAuthToken(accessToken);
    setRefreshToken(newRefreshToken);
    setUser(actor);

    return true;
  } catch {
    return false;
  }
}

/**
 * Extrae el mensaje de error de la respuesta de la API
 */
function getErrorMessage(errorData: ApiErrorResponse | undefined): string {
  if (!errorData?.error) {
    return 'Ha ocurrido un error inesperado';
  }

  const { error } = errorData;

  // Si hay detalles de validación, mostrarlos
  if (error.code === 'VALIDATION_ERROR' && error.details?.errors) {
    const errors = error.details.errors as string[];
    return errors.join(', ');
  }

  // Mensaje por defecto del error
  return error.message || 'Ha ocurrido un error';
}

export default apiClient;
