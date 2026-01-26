import {
  PaginatedResult,
  QueryParams,
  SortConfig,
  EntityFilterConfig,
} from '@shared/types';
import { QueryParser } from '@shared/utils';
import { IBaseRepository } from '@core/application/ports/repositories';

/**
 * BaseCrudService<T>
 *
 * Servicio genérico que encapsula operaciones CRUD comunes.
 * Elimina la necesidad de crear use-cases individuales para operaciones simples.
 *
 * @template T - Tipo de la entidad de dominio
 * @template CreateDto - Tipo del DTO de creación
 * @template UpdateDto - Tipo del DTO de actualización
 *
 * @example
 * ```typescript
 * // En el módulo, crear el servicio con factory
 * {
 *   provide: ProductCrudService,
 *   useFactory: (repo: IProductRepository) => new BaseCrudService(repo, PRODUCT_FILTER_CONFIG),
 *   inject: [PRODUCT_REPOSITORY],
 * }
 * ```
 */
export class BaseCrudService<T, CreateDto = Partial<T>, UpdateDto = Partial<T>> {
  constructor(
    protected readonly repository: IBaseRepository<T, CreateDto, UpdateDto>,
    protected readonly filterConfig?: EntityFilterConfig,
  ) { }

  /**
   * Buscar por ID
   */
  async findById(id: string): Promise<T | null> {
    return this.repository.findById(id);
  }

  /**
   * Listar con filtros, paginación y ordenamiento
   *
   * @param queryParams - Parámetros parseados del query string
   */
  async findAll(queryParams: QueryParams): Promise<PaginatedResult<T>> {
    const { page = 1, limit = 10, sort } = queryParams;

    // Parsear ordenamiento
    const sortableFields = this.filterConfig?.filterableFields
      .filter((f) => f.sortable)
      .map((f) => f.field);
    const sortConfigs = QueryParser.parseSort(sort as string, sortableFields, this.filterConfig?.defaultSort);

    // Ejecutar query con el repositorio
    return this.findPaginatedWithFilters(page, limit, sortConfigs);
  }

  /**
   * Ejecuta búsqueda paginada con filtros personalizados
   */
  protected async findPaginatedWithFilters(
    page: number,
    limit: number,
    sortConfigs: SortConfig[],
  ): Promise<PaginatedResult<T>> {
    // El repositorio base tiene findPaginated pero no acepta where personalizado
    // Por ahora delegamos al método estándar
    // En una implementación más avanzada, extenderíamos el repositorio base
    return this.repository.findPaginated(
      {
        page,
        limit,
        sortBy: sortConfigs[0]?.field,
        sortOrder: sortConfigs[0]?.order,
      },
    );
  }

  /**
   * Crear registro
   */
  async create(data: CreateDto): Promise<T> {
    return this.repository.create(data);
  }

  /**
   * Actualizar registro
   */
  async update(id: string, data: UpdateDto): Promise<T> {
    // Cast seguro porque UpdateDto debe ser compatible con Record<string, unknown>
    return this.repository.update(id, data as UpdateDto);
  }

  /**
   * Eliminar registro (soft delete)
   */
  async delete(id: string): Promise<T> {
    return this.repository.delete(id);
  }

  /**
   * Restaurar registro eliminado
   */
  async restore(id: string): Promise<T> {
    return this.repository.restore(id);
  }

  /**
   * Verificar si existe
   */
  async exists(where: Partial<T>): Promise<boolean> {
    return this.repository.exists(where);
  }

  /**
   * Contar registros
   */
  async count(where?: Partial<T>): Promise<number> {
    return this.repository.count(where);
  }
}
