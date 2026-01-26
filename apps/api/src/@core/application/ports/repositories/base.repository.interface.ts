import {
  PaginationParams,
  PaginatedResult,
  FindOptions,
} from '@shared/types';

/**
 * IBaseRepository<T>
 *
 * Interfaz genérica para repositorios.
 * Define el contrato que deben cumplir todas las implementaciones de repositorio.
 *
 * Características:
 * - CRUD completo
 * - Paginación dinámica
 * - Soft delete por defecto
 * - Opción para incluir registros eliminados
 */
export interface IBaseRepository<T, CreateDto = Partial<T>, UpdateDto = Partial<T>> {
  /**
   * Buscar por ID
   * @param id - Identificador único
   * @param options - Opciones de búsqueda
   * @returns Entidad o null si no existe
   */
  findById(id: string, options?: FindOptions): Promise<T | null>;

  /**
   * Buscar todos los registros
   * @param options - Opciones de búsqueda
   * @returns Array de entidades
   */
  findAll(options?: FindOptions): Promise<T[]>;

  /**
   * Buscar con paginación
   * @param params - Parámetros de paginación
   * @param options - Opciones de búsqueda
   * @returns Resultado paginado
   */
  findPaginated(params: PaginationParams, options?: FindOptions): Promise<PaginatedResult<T>>;

  /**
   * Buscar uno por condición
   * @param where - Condición de búsqueda
   * @param options - Opciones de búsqueda
   * @returns Entidad o null
   */
  findOne(where: Partial<T>, options?: FindOptions): Promise<T | null>;

  /**
   * Buscar muchos por condición
   * @param where - Condición de búsqueda
   * @param options - Opciones de búsqueda
   * @returns Array de entidades
   */
  findMany(where: Partial<T>, options?: FindOptions): Promise<T[]>;

  /**
   * Crear nuevo registro
   * @param data - Datos para crear
   * @returns Entidad creada
   */
  create(data: CreateDto): Promise<T>;

  /**
   * Crear múltiples registros
   * @param data - Array de datos
   * @returns Cantidad de registros creados
   */
  createMany(data: CreateDto[]): Promise<number>;

  /**
   * Actualizar registro
   * @param id - Identificador único
   * @param data - Datos a actualizar
   * @returns Entidad actualizada
   */
  update(id: string, data: UpdateDto): Promise<T>;

  /**
   * Actualizar múltiples registros
   * @param where - Condición de búsqueda
   * @param data - Datos a actualizar
   * @returns Cantidad de registros actualizados
   */
  updateMany(where: Partial<T>, data: UpdateDto): Promise<number>;

  /**
   * Eliminar registro (soft delete)
   * @param id - Identificador único
   * @returns Entidad eliminada
   */
  delete(id: string): Promise<T>;

  /**
   * Eliminar permanentemente
   * @param id - Identificador único
   * @returns Entidad eliminada
   */
  hardDelete(id: string): Promise<T>;

  /**
   * Restaurar registro eliminado
   * @param id - Identificador único
   * @returns Entidad restaurada
   */
  restore(id: string): Promise<T>;

  /**
   * Contar registros
   * @param where - Condición de búsqueda
   * @param options - Opciones de búsqueda
   * @returns Cantidad de registros
   */
  count(where?: Partial<T>, options?: FindOptions): Promise<number>;

  /**
   * Verificar si existe
   * @param where - Condición de búsqueda
   * @param options - Opciones de búsqueda
   * @returns true si existe
   */
  exists(where: Partial<T>, options?: FindOptions): Promise<boolean>;
}
