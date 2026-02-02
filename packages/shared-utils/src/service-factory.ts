/**
 * Factory para crear servicios CRUD genéricos
 */

/**
 * Respuesta paginada estándar de la API
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Parámetros base para listar entidades
 */
export interface BaseListParams {
  page?: number;
  limit?: number;
}

/**
 * Interface del cliente HTTP (compatible con apiClient de admin)
 */
export interface HttpClient {
  get<T>(url: string): Promise<T>;
  post<T>(url: string, data?: unknown): Promise<T>;
  put<T>(url: string, data?: unknown): Promise<T>;
  patch<T>(url: string, data?: unknown): Promise<T>;
  delete<T>(url: string): Promise<T>;
}

/**
 * Servicio CRUD generado por el factory
 */
export interface CrudService<
  TEntity,
  TCreateDTO,
  TUpdateDTO,
  TListParams extends BaseListParams = BaseListParams
> {
  list(params?: TListParams): Promise<PaginatedResponse<TEntity>>;
  getById(id: string): Promise<TEntity>;
  create(data: TCreateDTO): Promise<TEntity>;
  update(id: string, data: TUpdateDTO): Promise<TEntity>;
  delete(id: string): Promise<void>;
}

/**
 * Opciones para personalizar el servicio
 */
export interface ServiceOptions {
  /** Ruta para toggle de estado (ej: '/status') */
  toggleStatusPath?: string;
}

/**
 * Convierte parámetros a query string
 */
function buildQueryString(params?: Record<string, unknown>): string {
  if (!params) return '';

  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (value instanceof Date) {
        queryParams.append(key, value.toISOString());
      } else {
        queryParams.append(key, String(value));
      }
    }
  });

  const query = queryParams.toString();
  return query ? `?${query}` : '';
}

/**
 * Crea un servicio CRUD para una entidad
 *
 * @example
 * ```typescript
 * import { createCrudService } from '@framework/shared-utils';
 * import { apiClient } from '@/lib/api-client';
 * import type { Product, CreateProductDTO, UpdateProductDTO, ProductListParams } from '@framework/shared-types';
 *
 * export const productService = createCrudService<
 *   Product,
 *   CreateProductDTO,
 *   UpdateProductDTO,
 *   ProductListParams
 * >(apiClient, '/products');
 * ```
 */
export function createCrudService<
  TEntity,
  TCreateDTO,
  TUpdateDTO,
  TListParams extends BaseListParams = BaseListParams
>(
  httpClient: HttpClient,
  endpoint: string,
  options?: ServiceOptions
): CrudService<TEntity, TCreateDTO, TUpdateDTO, TListParams> & {
  toggleStatus?: (id: string, data: { enable: boolean }) => Promise<TEntity>;
} {
  const service: CrudService<TEntity, TCreateDTO, TUpdateDTO, TListParams> = {
    async list(params?: TListParams): Promise<PaginatedResponse<TEntity>> {
      const query = buildQueryString(params as Record<string, unknown>);
      return httpClient.get<PaginatedResponse<TEntity>>(`${endpoint}${query}`);
    },

    async getById(id: string): Promise<TEntity> {
      return httpClient.get<TEntity>(`${endpoint}/${id}`);
    },

    async create(data: TCreateDTO): Promise<TEntity> {
      return httpClient.post<TEntity>(endpoint, data);
    },

    async update(id: string, data: TUpdateDTO): Promise<TEntity> {
      return httpClient.put<TEntity>(`${endpoint}/${id}`, data);
    },

    async delete(id: string): Promise<void> {
      return httpClient.delete(`${endpoint}/${id}`);
    },
  };

  // Agregar toggleStatus si se especificó la ruta
  if (options?.toggleStatusPath) {
    return {
      ...service,
      async toggleStatus(id: string, data: { enable: boolean }): Promise<TEntity> {
        // Fix field name mismatch: frontend sends "enable" but backend expects "activate"
        const backendData = { activate: data.enable };
        console.log('🔍 [Service] Field mapping:', { frontend: data, backend: backendData });

        return httpClient.patch<TEntity>(
          `${endpoint}/${id}${options.toggleStatusPath}`,
          backendData
        );
      },
    };
  }

  return service;
}

/**
 * Crea un servicio CRUD con soporte para toggle de estado
 *
 * @example
 * ```typescript
 * export const adminService = createCrudServiceWithStatus<
 *   Admin,
 *   CreateAdminDTO,
 *   UpdateAdminDTO,
 *   AdminListParams
 * >(apiClient, '/administrators');
 *
 * // Uso:
 * adminService.toggleStatus('123', { enable: false });
 * ```
 */
export function createCrudServiceWithStatus<
  TEntity,
  TCreateDTO,
  TUpdateDTO,
  TListParams extends BaseListParams = BaseListParams
>(
  httpClient: HttpClient,
  endpoint: string,
  statusPath: string = '/status'
) {
  return createCrudService<TEntity, TCreateDTO, TUpdateDTO, TListParams>(
    httpClient,
    endpoint,
    { toggleStatusPath: statusPath }
  ) as CrudService<TEntity, TCreateDTO, TUpdateDTO, TListParams> & {
    toggleStatus: (id: string, data: { enable: boolean }) => Promise<TEntity>;
  };
}
