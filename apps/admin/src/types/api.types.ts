/**
 * Tipos para respuestas de la API
 * Basados en la estructura de Clean Architecture del backend
 */

// Estructura de error de la API
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// Respuesta de error de la API
export interface ApiErrorResponse {
  success: false;
  error: ApiError;
  timestamp: string;
  path: string;
}

// Metadata de paginación
export interface PaginationMeta {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Respuesta paginada
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// Parámetros de paginación para requests
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
