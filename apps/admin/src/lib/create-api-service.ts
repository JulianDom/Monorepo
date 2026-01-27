import { apiClient } from './api-client';
import type { ApiResponse, PaginatedResponse, ListParams } from '@/types/api.types';

/**
 * Opciones para el factory de servicios CRUD
 */
interface ServiceOptions {
  endpoint: string;
  resourceName?: string;
}

/**
 * Servicio CRUD genérico
 */
export interface CrudService<T, CreateDTO = Partial<T>, UpdateDTO = Partial<T>> {
  list: (params?: ListParams) => Promise<PaginatedResponse<T>>;
  getById: (id: string) => Promise<ApiResponse<T>>;
  create: (data: CreateDTO) => Promise<ApiResponse<T>>;
  update: (id: string, data: UpdateDTO) => Promise<ApiResponse<T>>;
  delete: (id: string) => Promise<ApiResponse<void>>;
}

/**
 * Factory para crear servicios CRUD estandarizados
 */
export function createApiService<T, CreateDTO = Partial<T>, UpdateDTO = Partial<T>>(
  options: ServiceOptions
): CrudService<T, CreateDTO, UpdateDTO> {
  const { endpoint } = options;

  return {
    /**
     * Listar recursos con paginación y filtros
     */
    async list(params?: ListParams): Promise<PaginatedResponse<T>> {
      const queryParams = new URLSearchParams();
      
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.sortField) queryParams.append('sortField', params.sortField);
      if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
      
      // Agregar filtros adicionales
      if (params?.filters) {
        Object.entries(params.filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, String(value));
          }
        });
      }

      const query = queryParams.toString();
      const url = query ? `${endpoint}?${query}` : endpoint;
      
      return apiClient.get<PaginatedResponse<T>>(url);
    },

    /**
     * Obtener un recurso por ID
     */
    async getById(id: string): Promise<ApiResponse<T>> {
      return apiClient.get<ApiResponse<T>>(`${endpoint}/${id}`);
    },

    /**
     * Crear un nuevo recurso
     */
    async create(data: CreateDTO): Promise<ApiResponse<T>> {
      return apiClient.post<ApiResponse<T>>(endpoint, data);
    },

    /**
     * Actualizar un recurso existente
     */
    async update(id: string, data: UpdateDTO): Promise<ApiResponse<T>> {
      return apiClient.put<ApiResponse<T>>(`${endpoint}/${id}`, data);
    },

    /**
     * Eliminar un recurso
     */
    async delete(id: string): Promise<ApiResponse<void>> {
      return apiClient.delete<ApiResponse<void>>(`${endpoint}/${id}`);
    },
  };
}

/**
 * Ejemplo de uso:
 * 
 * const userService = createApiService<User>({
 *   endpoint: '/users',
 *   resourceName: 'usuario'
 * });
 * 
 * // Listar usuarios
 * const users = await userService.list({ page: 1, pageSize: 10 });
 * 
 * // Obtener usuario
 * const user = await userService.getById('123');
 * 
 * // Crear usuario
 * const newUser = await userService.create({ name: 'Juan', email: 'juan@example.com' });
 * 
 * // Actualizar usuario
 * const updated = await userService.update('123', { name: 'Juan Actualizado' });
 * 
 * // Eliminar usuario
 * await userService.delete('123');
 */
