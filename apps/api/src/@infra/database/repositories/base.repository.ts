import {
  PaginationParams,
  PaginatedResult,
  FindOptions,
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  MAX_LIMIT,
} from '@shared/types';
import { EntityNotFoundException } from '@shared/exceptions';
import { PrismaService } from '../prisma';

/**
 * EntityMapper<PrismaModel, DomainEntity>
 *
 * Contrato para implementar el patron Mapper entre capas.
 * Permite desacoplar el modelo de persistencia de la entidad de dominio.
 *
 * @template PrismaModel - Tipo del modelo generado por Prisma
 * @template DomainEntity - Tipo de la entidad de dominio (@core/domain)
 *
 * @example
 * ```typescript
 * class UserMapper implements EntityMapper<User, UserEntity> {
 *   toDomain(model: User): UserEntity {
 *     return UserEntity.reconstitute({ ...model });
 *   }
 *   toPersistence(entity: UserEntity): Partial<User> {
 *     return { fullName: entity.fullName, ... };
 *   }
 * }
 * ```
 */
export interface EntityMapper<PrismaModel, DomainEntity> {
  /**
   * Convierte un modelo Prisma a entidad de dominio.
   * Se usa al LEER datos de la base de datos.
   *
   * @param model - Modelo Prisma crudo desde la BD
   * @returns Entidad de dominio con metodos de negocio
   */
  toDomain(model: PrismaModel): DomainEntity;

  /**
   * Convierte una entidad de dominio a datos para persistencia.
   * Se usa al ESCRIBIR datos a la base de datos.
   *
   * @param entity - Entidad de dominio
   * @returns Objeto parcial compatible con Prisma create/update
   */
  toPersistence(entity: DomainEntity): Partial<PrismaModel>;
}

/**
 * PrismaRepository<PrismaModel, DomainEntity>
 *
 * Clase base abstracta que implementa el patron Repository usando Prisma ORM.
 * Proporciona operaciones CRUD estandarizadas con las siguientes caracteristicas:
 *
 * ## Caracteristicas Principales
 *
 * - **Soft Delete Automatico**: Todos los metodos de lectura filtran `deletedAt = null`
 *   automaticamente, a menos que se especifique `includeDeleted: true`.
 *
 * - **Paginacion Integrada**: El metodo `findPaginated()` implementa paginacion
 *   con metadata completa (totalItems, totalPages, hasNext, hasPrevious).
 *
 * - **Mapeo Entidad-Modelo**: Los metodos abstractos `toEntity()` y `toPersistence()`
 *   fuerzan la conversion entre capas, manteniendo el dominio limpio.
 *
 * - **Manejo de Errores**: Lanza `EntityNotFoundException` cuando un registro
 *   no existe, facilitando respuestas HTTP 404 consistentes.
 *
 * ## Uso
 *
 * Para crear un repositorio concreto, extiende esta clase e implementa
 * los metodos abstractos:
 *
 * @example
 * ```typescript
 * @Injectable()
 * export class UserRepository extends PrismaRepository<User, UserEntity> {
 *   constructor(prisma: PrismaService) {
 *     super(prisma, 'user'); // 'user' = nombre del modelo en Prisma
 *   }
 *
 *   protected toEntity(model: User): UserEntity {
 *     return UserEntity.reconstitute({
 *       id: model.id,
 *       fullName: model.fullName,
 *       emailAddress: model.emailAddress,
 *       // ... mapear todos los campos
 *     });
 *   }
 *
 *   protected toPersistence(entity: UserEntity): Record<string, unknown> {
 *     return {
 *       fullName: entity.fullName,
 *       emailAddress: entity.emailAddress,
 *       // ... NO incluir 'id', 'createdAt', 'updatedAt'
 *     };
 *   }
 *
 *   // Metodos especificos del dominio
 *   async findByEmail(email: string): Promise<UserEntity | null> {
 *     return this.findOne({ emailAddress: email });
 *   }
 * }
 * ```
 *
 * @template PrismaModel - Tipo del modelo Prisma (ej: `User` de `@prisma/client`)
 * @template DomainEntity - Tipo de la entidad de dominio (ej: `UserEntity`)
 *
 * @see {@link EntityMapper} para el contrato de mapeo
 * @see {@link PaginatedResult} para la estructura de respuesta paginada
 */
export abstract class PrismaRepository<PrismaModel, DomainEntity> {
  /**
   * Crea una instancia del repositorio base.
   *
   * @param prisma - Instancia del servicio Prisma (inyectado por NestJS)
   * @param modelName - Nombre del modelo en Prisma (lowercase, ej: 'user', 'administrator')
   *                    Debe coincidir con el nombre usado en `prisma.user.findMany()`
   *
   * @example
   * ```typescript
   * constructor(prisma: PrismaService) {
   *   super(prisma, 'user');
   * }
   * ```
   */
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly modelName: string,
  ) {}

  /**
   * Acceso dinamico al modelo Prisma.
   *
   * Permite usar `this.model.findMany()` en lugar de `this.prisma.user.findMany()`.
   * El nombre del modelo se define en el constructor.
   *
   * @returns Delegate del modelo Prisma con todos sus metodos (findMany, create, etc.)
   *
   * @internal Este getter es para uso interno del repositorio
   */
  protected get model() {
    return (this.prisma as any)[this.modelName];
  }

  /**
   * Convierte un modelo Prisma a entidad de dominio.
   *
   * DEBE ser implementado por cada repositorio concreto.
   * Se invoca automaticamente en todos los metodos de lectura.
   *
   * @param model - Registro crudo de la base de datos
   * @returns Entidad de dominio con logica de negocio
   *
   * @example
   * ```typescript
   * protected toEntity(model: User): UserEntity {
   *   return UserEntity.reconstitute({
   *     id: model.id,
   *     fullName: model.fullName,
   *     emailAddress: model.emailAddress,
   *     password: model.password,
   *     online: model.online,
   *     language: model.language,
   *     createdAt: model.createdAt,
   *     updatedAt: model.updatedAt,
   *     deletedAt: model.deletedAt,
   *   });
   * }
   * ```
   */
  protected abstract toEntity(model: PrismaModel): DomainEntity;

  /**
   * Convierte una entidad de dominio a datos para persistencia.
   *
   * DEBE ser implementado por cada repositorio concreto.
   * Se invoca automaticamente en `create()`.
   *
   * **Importante**: NO incluir campos auto-generados como `id`, `createdAt`, `updatedAt`.
   *
   * @param entity - Entidad de dominio a persistir
   * @returns Objeto con los campos a guardar en la BD
   *
   * @example
   * ```typescript
   * protected toPersistence(entity: UserEntity): Record<string, unknown> {
   *   return {
   *     fullName: entity.fullName,
   *     emailAddress: entity.emailAddress,
   *     username: entity.username,
   *     password: entity.password,
   *     online: entity.online,
   *     language: entity.language,
   *   };
   * }
   * ```
   */
  protected abstract toPersistence(entity: DomainEntity): Record<string, unknown>;

  /**
   * Construye la condicion WHERE con filtro de Soft Delete.
   *
   * Por defecto, excluye registros donde `deletedAt` no es null.
   * Usa `options.includeDeleted = true` para incluir eliminados.
   *
   * @param where - Condiciones adicionales de busqueda
   * @param options - Opciones de consulta (includeDeleted, etc.)
   * @returns Objeto WHERE listo para Prisma
   *
   * @internal Metodo auxiliar para construir queries
   */
  protected buildWhereCondition(
    where: Record<string, unknown> = {},
    options?: FindOptions,
  ): Record<string, unknown> {
    const condition = { ...where };

    // Soft Delete: filtrar eliminados por defecto
    if (!options?.includeDeleted) {
      condition['deletedAt'] = null;
    }

    return condition;
  }

  /**
   * Construye el objeto orderBy para Prisma.
   *
   * @param sortBy - Campo por el cual ordenar
   * @param sortOrder - Direccion: 'asc' o 'desc'
   * @returns Objeto orderBy o undefined si no hay sortBy
   *
   * @internal Metodo auxiliar para construir queries
   */
  protected buildOrderBy(sortBy?: string, sortOrder?: 'asc' | 'desc'): Record<string, string> | undefined {
    if (!sortBy) return { createdAt: 'desc' };
    return { [sortBy]: sortOrder || 'asc' };
  }

  /**
   * Busca un registro por su ID.
   *
   * Automaticamente excluye registros soft-deleted a menos que
   * se especifique `includeDeleted: true`.
   *
   * @param id - UUID del registro
   * @param options - Opciones de consulta
   * @returns La entidad de dominio o null si no existe
   *
   * @example
   * ```typescript
   * // Buscar usuario activo
   * const user = await userRepo.findById('uuid-here');
   *
   * // Buscar incluyendo eliminados (para restore, audit, etc.)
   * const deleted = await userRepo.findById('uuid', { includeDeleted: true });
   * ```
   */
  async findById(id: string, options?: FindOptions): Promise<DomainEntity | null> {
    const where = this.buildWhereCondition({ id }, options);
    const result = await this.model.findFirst({ where });
    return result ? this.toEntity(result) : null;
  }

  /**
   * Obtiene todos los registros activos (no eliminados).
   *
   * **Advertencia**: En tablas grandes, usa `findPaginated()` en su lugar.
   *
   * @param options - Opciones de consulta
   * @returns Array de entidades de dominio
   *
   * @example
   * ```typescript
   * const allUsers = await userRepo.findAll();
   * const includingDeleted = await userRepo.findAll({ includeDeleted: true });
   * ```
   */
  async findAll(options?: FindOptions): Promise<DomainEntity[]> {
    const where = this.buildWhereCondition({}, options);
    const results = await this.model.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return results.map((r: PrismaModel) => this.toEntity(r));
  }

  /**
   * Busca registros con paginacion completa.
   *
   * Retorna datos + metadata de paginacion (totalItems, totalPages, etc.)
   * Ideal para endpoints de listado con paginacion.
   *
   * @param params - Parametros de paginacion (page, limit, sortBy, sortOrder)
   * @param options - Opciones de consulta
   * @returns Resultado paginado con data y meta
   *
   * @example
   * ```typescript
   * const result = await userRepo.findPaginated({ page: 1, limit: 10 });
   * // result.data = UserEntity[]
   * // result.meta = { currentPage: 1, totalItems: 100, totalPages: 10, ... }
   *
   * // Con ordenamiento
   * const sorted = await userRepo.findPaginated({
   *   page: 1,
   *   limit: 20,
   *   sortBy: 'fullName',
   *   sortOrder: 'asc'
   * });
   * ```
   */
  async findPaginated(
    params: PaginationParams,
    options?: FindOptions,
  ): Promise<PaginatedResult<DomainEntity>> {
    const page = Math.max(params.page || DEFAULT_PAGE, 1);
    const limit = Math.min(Math.max(params.limit || DEFAULT_LIMIT, 1), MAX_LIMIT);
    const skip = (page - 1) * limit;

    const where = this.buildWhereCondition({}, options);
    const orderBy = this.buildOrderBy(params.sortBy, params.sortOrder);

    const [data, totalItems] = await Promise.all([
      this.model.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      this.model.count({ where }),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: data.map((d: PrismaModel) => this.toEntity(d)),
      meta: {
        currentPage: page,
        itemsPerPage: limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  /**
   * Busca un registro por condicion arbitraria.
   *
   * @param where - Condiciones de busqueda (ej: `{ email: 'test@example.com' }`)
   * @param options - Opciones de consulta
   * @returns La entidad o null
   *
   * @example
   * ```typescript
   * const user = await userRepo.findOne({ emailAddress: 'test@example.com' });
   * const admin = await adminRepo.findOne({ username: 'admin', enabled: true });
   * ```
   */
  async findOne(where: Record<string, unknown>, options?: FindOptions): Promise<DomainEntity | null> {
    const condition = this.buildWhereCondition(where, options);
    const result = await this.model.findFirst({ where: condition });
    return result ? this.toEntity(result) : null;
  }

  /**
   * Busca multiples registros por condicion.
   *
   * @param where - Condiciones de busqueda
   * @param options - Opciones de consulta
   * @returns Array de entidades
   *
   * @example
   * ```typescript
   * const onlineUsers = await userRepo.findMany({ online: true });
   * const adminsActive = await adminRepo.findMany({ enabled: true });
   * ```
   */
  async findMany(where: Record<string, unknown>, options?: FindOptions): Promise<DomainEntity[]> {
    const condition = this.buildWhereCondition(where, options);
    const results = await this.model.findMany({
      where: condition,
      orderBy: { createdAt: 'desc' },
    });
    return results.map((r: PrismaModel) => this.toEntity(r));
  }

  /**
   * Crea un nuevo registro en la base de datos.
   *
   * Usa `toPersistence()` para convertir la entidad a datos de BD.
   *
   * @param entity - Entidad de dominio a persistir
   * @returns La entidad creada (con id generado)
   *
   * @example
   * ```typescript
   * const newUser = UserEntity.create({
   *   fullName: 'John Doe',
   *   emailAddress: 'john@example.com',
   *   // ...
   * });
   * const created = await userRepo.create(newUser);
   * console.log(created.id); // UUID generado
   * ```
   */
  async create(entity: DomainEntity): Promise<DomainEntity> {
    const data = this.toPersistence(entity);
    const created = await this.model.create({ data });
    return this.toEntity(created);
  }

  /**
   * Actualiza un registro existente.
   *
   * Lanza `EntityNotFoundException` si el registro no existe o esta eliminado.
   *
   * @param id - UUID del registro a actualizar
   * @param data - Campos a actualizar (parcial)
   * @returns La entidad actualizada
   * @throws {EntityNotFoundException} Si el registro no existe
   *
   * @example
   * ```typescript
   * const updated = await userRepo.update('uuid', {
   *   fullName: 'Jane Doe',
   *   online: true,
   * });
   * ```
   */
  async update(id: string, data: Record<string, unknown>): Promise<DomainEntity> {
    // Verificar existencia (soft delete aware)
    const existing = await this.findById(id);
    if (!existing) {
      throw new EntityNotFoundException(this.modelName, id);
    }

    const updated = await this.model.update({
      where: { id },
      data,
    });
    return this.toEntity(updated);
  }

  /**
   * Elimina un registro de forma logica (Soft Delete).
   *
   * NO borra el registro de la BD. Solo establece `deletedAt = NOW()`.
   * El registro seguira existiendo pero no aparecera en consultas normales.
   *
   * @param id - UUID del registro a eliminar
   * @returns La entidad marcada como eliminada
   * @throws {EntityNotFoundException} Si el registro no existe
   *
   * @example
   * ```typescript
   * await userRepo.softDelete('uuid-here');
   * // El usuario ya no aparece en findAll(), findById(), etc.
   * // Pero sigue en la BD para auditoria
   * ```
   */
  async softDelete(id: string): Promise<DomainEntity> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new EntityNotFoundException(this.modelName, id);
    }

    const deleted = await this.model.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return this.toEntity(deleted);
  }

  /**
   * Elimina un registro de forma permanente (Hard Delete).
   *
   * **ADVERTENCIA**: Esta operacion es IRREVERSIBLE.
   * Borra el registro fisicamente de la base de datos.
   * Puede fallar si hay foreign keys apuntando al registro.
   *
   * @param id - UUID del registro a eliminar permanentemente
   * @returns La entidad eliminada (ultimo estado antes de borrar)
   * @throws {EntityNotFoundException} Si el registro no existe
   *
   * @example
   * ```typescript
   * // Solo usar para limpieza de datos de prueba o GDPR
   * await userRepo.hardDelete('uuid-here');
   * ```
   */
  async hardDelete(id: string): Promise<DomainEntity> {
    const existing = await this.findById(id, { includeDeleted: true });
    if (!existing) {
      throw new EntityNotFoundException(this.modelName, id);
    }

    const deleted = await this.model.delete({ where: { id } });
    return this.toEntity(deleted);
  }

  /**
   * Restaura un registro previamente eliminado (soft delete).
   *
   * Establece `deletedAt = null`, haciendo el registro visible nuevamente.
   *
   * @param id - UUID del registro a restaurar
   * @returns La entidad restaurada
   * @throws {EntityNotFoundException} Si el registro no existe (ni siquiera eliminado)
   *
   * @example
   * ```typescript
   * // Restaurar usuario eliminado
   * const restored = await userRepo.restore('uuid-here');
   * // Ahora aparece en findAll(), findById(), etc.
   * ```
   */
  async restore(id: string): Promise<DomainEntity> {
    const existing = await this.findById(id, { includeDeleted: true });
    if (!existing) {
      throw new EntityNotFoundException(this.modelName, id);
    }

    const restored = await this.model.update({
      where: { id },
      data: { deletedAt: null },
    });
    return this.toEntity(restored);
  }

  /**
   * Cuenta registros que cumplen una condicion.
   *
   * @param where - Condiciones de busqueda (opcional)
   * @param options - Opciones de consulta
   * @returns Numero de registros
   *
   * @example
   * ```typescript
   * const totalUsers = await userRepo.count();
   * const onlineCount = await userRepo.count({ online: true });
   * const allIncludingDeleted = await userRepo.count({}, { includeDeleted: true });
   * ```
   */
  async count(where?: Record<string, unknown>, options?: FindOptions): Promise<number> {
    const condition = this.buildWhereCondition(where || {}, options);
    return this.model.count({ where: condition });
  }

  /**
   * Verifica si existe al menos un registro que cumpla la condicion.
   *
   * Mas eficiente que `findOne()` cuando solo necesitas saber si existe.
   *
   * @param where - Condiciones de busqueda
   * @param options - Opciones de consulta
   * @returns true si existe al menos un registro
   *
   * @example
   * ```typescript
   * const emailTaken = await userRepo.exists({ emailAddress: 'test@example.com' });
   * if (emailTaken) {
   *   throw new Error('Email already registered');
   * }
   * ```
   */
  async exists(where: Record<string, unknown>, options?: FindOptions): Promise<boolean> {
    const count = await this.count(where, options);
    return count > 0;
  }
}
