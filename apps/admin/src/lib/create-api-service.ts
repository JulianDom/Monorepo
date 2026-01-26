import { apiClient } from './api-client';
import type { ApiFilterParams, PaginatedResponse } from '@/types';

/**
 * Factory para crear servicios CRUD estandarizados
 *
 * @example
 * ```ts
 * // src/services/user.service.ts
 * export const userService = createApiService<User, CreateUserDto, UpdateUserDto>('/users');
 *
 * // Uso:
 * const users = await userService.getAll({ page: 1, limit: 10 });
 * const user = await userService.getById('123');
 * const newUser = await userService.create({ name: 'John' });
 * await userService.update('123', { name: 'Jane' });
 * await userService.delete('123');
 * ```
 */
export function createApiService<
  TEntity,
  TCreateDto = Partial<TEntity>,
  TUpdateDto = Partial<TEntity>,
>(basePath: string) {
  return {
    /**
     * Obtener todos los registros con paginación y filtros
     */
    getAll: async (
      params?: ApiFilterParams
    ): Promise<PaginatedResponse<TEntity>> => {
      const response = await apiClient.get<PaginatedResponse<TEntity>>(
        basePath,
        { params }
      );
      return response.data;
    },

    /**
     * Obtener un registro por ID
     */
    getById: async (id: string): Promise<TEntity> => {
      const response = await apiClient.get<TEntity>(`${basePath}/${id}`);
      return response.data;
    },

    /**
     * Crear un nuevo registro
     */
    create: async (data: TCreateDto): Promise<TEntity> => {
      const response = await apiClient.post<TEntity>(basePath, data);
      return response.data;
    },

    /**
     * Actualizar un registro existente
     */
    update: async (id: string, data: TUpdateDto): Promise<TEntity> => {
      const response = await apiClient.put<TEntity>(`${basePath}/${id}`, data);
      return response.data;
    },

    /**
     * Actualización parcial (PATCH)
     */
    patch: async (id: string, data: Partial<TUpdateDto>): Promise<TEntity> => {
      const response = await apiClient.patch<TEntity>(
        `${basePath}/${id}`,
        data
      );
      return response.data;
    },

    /**
     * Eliminar un registro (soft delete)
     */
    delete: async (id: string): Promise<void> => {
      await apiClient.delete(`${basePath}/${id}`);
    },

    /**
     * Endpoint personalizado GET
     */
    customGet: async <T = unknown>(
      endpoint: string,
      params?: Record<string, unknown>
    ): Promise<T> => {
      const response = await apiClient.get<T>(`${basePath}${endpoint}`, {
        params,
      });
      return response.data;
    },

    /**
     * Endpoint personalizado POST
     */
    customPost: async <T = unknown, D = unknown>(
      endpoint: string,
      data?: D
    ): Promise<T> => {
      const response = await apiClient.post<T>(`${basePath}${endpoint}`, data);
      return response.data;
    },
  };
}

/**
 * Tipo del servicio creado
 */
export type ApiService<
  TEntity,
  TCreateDto = Partial<TEntity>,
  TUpdateDto = Partial<TEntity>,
> = ReturnType<typeof createApiService<TEntity, TCreateDto, TUpdateDto>>;
