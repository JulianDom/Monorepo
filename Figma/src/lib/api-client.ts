import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { env } from '@/config';
import type { ApiResponse, ApiError } from '@/types/api.types';

/**
 * Cliente API configurado con Axios
 */
class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: env.apiUrl,
      timeout: env.apiTimeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - agregar token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - manejo de errores
    this.client.interceptors.response.use(
      (response) => response.data,
      (error: AxiosError<ApiError>) => {
        const apiError = this.handleError(error);
        return Promise.reject(apiError);
      }
    );
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(env.authTokenKey);
  }

  private handleError(error: AxiosError<ApiError>): ApiError {
    if (error.response) {
      // Error de respuesta del servidor
      const { data, status } = error.response;
      
      if (status === 401) {
        // No autenticado - redirigir a login
        if (typeof window !== 'undefined') {
          localStorage.removeItem(env.authTokenKey);
          localStorage.removeItem(env.authUserKey);
          window.location.href = '/login';
        }
      }
      
      return {
        message: data?.message || 'Error en la solicitud',
        code: data?.code,
        errors: data?.errors,
      };
    } else if (error.request) {
      // Error de red
      return {
        message: 'Error de conexión. Por favor verifica tu conexión a internet.',
        code: 'NETWORK_ERROR',
      };
    } else {
      // Error de configuración
      return {
        message: error.message || 'Error desconocido',
        code: 'UNKNOWN_ERROR',
      };
    }
  }

  /**
   * GET request
   */
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.client.get(url, config);
  }

  /**
   * POST request
   */
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.client.post(url, data, config);
  }

  /**
   * PUT request
   */
  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.client.put(url, data, config);
  }

  /**
   * PATCH request
   */
  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.client.patch(url, data, config);
  }

  /**
   * DELETE request
   */
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.client.delete(url, config);
  }
}

// Exportar instancia singleton
export const apiClient = new ApiClient();
