import { IBaseRepository } from '../ports';
import {
  PaginationParams,
  PaginatedResult,
  FindOptions,
} from '@shared/types';
import { EntityNotFoundException } from '@shared/exceptions';

/**
 * BaseService<T, CreateDto, UpdateDto>
 *
 * Clase base abstracta para servicios de aplicacion que proporciona
 * operaciones CRUD estandarizadas con hooks de ciclo de vida.
 *
 * ## Proposito
 *
 * Centraliza la logica comun de servicios (CRUD, validaciones, eventos)
 * evitando duplicacion y asegurando consistencia entre modulos.
 *
 * ## Caracteristicas Principales
 *
 * - **CRUD Completo**: findById, findAll, create, update, delete (soft y hard)
 * - **Paginacion**: Delegada al repositorio con metadata completa
 * - **Hooks de Ciclo de Vida**: beforeCreate, afterCreate, beforeUpdate, afterUpdate, etc.
 * - **Manejo de Errores**: Lanza `EntityNotFoundException` automaticamente
 * - **Soft Delete**: Por defecto usa eliminacion logica
 *
 * ## Uso
 *
 * Para crear un servicio concreto, extiende esta clase y define:
 * 1. `entityName`: Nombre de la entidad para mensajes de error
 * 2. Constructor con inyeccion del repositorio
 * 3. Metodos de dominio especificos (opcional)
 *
 * @example
 * ```typescript
 * @Injectable()
 * export class UserService extends BaseService<UserEntity, CreateUserDto, UpdateUserDto> {
 *   protected readonly entityName = 'User';
 *
 *   constructor(
 *     @Inject(USER_REPOSITORY) repository: IUserRepository,
 *   ) {
 *     super(repository);
 *   }
 *
 *   // Hook: Hashear password antes de crear
 *   protected async beforeCreate(data: CreateUserDto): Promise<CreateUserDto> {
 *     return {
 *       ...data,
 *       password: await bcrypt.hash(data.password, 12),
 *     };
 *   }
 *
 *   // Metodo de dominio especifico
 *   async findByEmail(email: string): Promise<UserEntity | null> {
 *     return this.repository.findOne({ emailAddress: email });
 *   }
 *
 *   async deactivate(id: string): Promise<UserEntity> {
 *     return this.update(id, { online: false });
 *   }
 * }
 * ```
 *
 * ## Hooks de Ciclo de Vida
 *
 * Los hooks permiten ejecutar logica antes/despues de operaciones:
 *
 * | Hook | Cuando se ejecuta | Caso de uso tipico |
 * |------|-------------------|-------------------|
 * | `beforeCreate` | Antes de persistir nueva entidad | Hashear password, generar slug |
 * | `afterCreate` | Despues de crear | Enviar email de bienvenida |
 * | `beforeUpdate` | Antes de actualizar | Validar campos, sanitizar |
 * | `afterUpdate` | Despues de actualizar | Invalidar cache |
 * | `beforeDelete` | Antes de eliminar | Verificar dependencias |
 * | `afterDelete` | Despues de eliminar | Audit log, limpiar archivos |
 *
 * @template T - Tipo de la entidad de dominio
 * @template CreateDto - DTO para creacion (default: Partial<T>)
 * @template UpdateDto - DTO para actualizacion (default: Partial<T>)
 *
 * @see {@link IBaseRepository} para el contrato del repositorio
 * @see {@link EntityNotFoundException} para el manejo de errores
 */
export abstract class BaseService<T, CreateDto = Partial<T>, UpdateDto = Partial<T>> {
  /**
   * Nombre de la entidad para mensajes de error.
   *
   * Se usa en `EntityNotFoundException` para indicar que tipo
   * de recurso no fue encontrado.
   *
   * @example
   * ```typescript
   * protected readonly entityName = 'User';
   * // Error: "User with id 'xxx' not found"
   * ```
   */
  protected abstract readonly entityName: string;

  /**
   * Crea una instancia del servicio base.
   *
   * @param repository - Repositorio que implementa IBaseRepository
   *                     Debe ser inyectado via constructor en la subclase
   *
   * @example
   * ```typescript
   * constructor(
   *   @Inject(USER_REPOSITORY) repository: IUserRepository,
   * ) {
   *   super(repository);
   * }
   * ```
   */
  constructor(protected readonly repository: IBaseRepository<T, CreateDto, UpdateDto>) {}

  // ==================== HOOKS DE CICLO DE VIDA ====================

  /**
   * Hook ejecutado ANTES de crear una entidad.
   *
   * Permite modificar los datos antes de persistir.
   * Por defecto retorna los datos sin modificar.
   *
   * @param data - Datos de creacion originales
   * @returns Datos procesados para persistir
   *
   * @example
   * ```typescript
   * // Hashear password antes de crear usuario
   * protected async beforeCreate(data: CreateUserDto): Promise<CreateUserDto> {
   *   return {
   *     ...data,
   *     password: await bcrypt.hash(data.password, 12),
   *     username: data.username.toLowerCase(),
   *   };
   * }
   * ```
   */
  protected async beforeCreate(data: CreateDto): Promise<CreateDto> {
    return data;
  }

  /**
   * Hook ejecutado DESPUES de crear una entidad.
   *
   * Ideal para efectos secundarios como enviar notificaciones,
   * crear registros relacionados, etc.
   *
   * @param _entity - Entidad recien creada (con id)
   *
   * @example
   * ```typescript
   * // Enviar email de bienvenida
   * protected async afterCreate(entity: UserEntity): Promise<void> {
   *   await this.emailService.sendWelcome(entity.emailAddress);
   *   await this.auditLog.log('user.created', entity.id);
   * }
   * ```
   */
  protected async afterCreate(_entity: T): Promise<void> {
    // Override en subclases si es necesario
  }

  /**
   * Hook ejecutado ANTES de actualizar una entidad.
   *
   * Permite validar o modificar los datos antes de persistir.
   * La entidad ya fue verificada que existe.
   *
   * @param _id - ID de la entidad a actualizar
   * @param data - Datos de actualizacion
   * @returns Datos procesados para persistir
   *
   * @example
   * ```typescript
   * // Validar que no se cambie el email a uno existente
   * protected async beforeUpdate(id: string, data: UpdateUserDto): Promise<UpdateUserDto> {
   *   if (data.emailAddress) {
   *     const existing = await this.repository.findOne({ emailAddress: data.emailAddress });
   *     if (existing && existing.id !== id) {
   *       throw new BusinessRuleViolationException('Email already in use');
   *     }
   *   }
   *   return data;
   * }
   * ```
   */
  protected async beforeUpdate(_id: string, data: UpdateDto): Promise<UpdateDto> {
    return data;
  }

  /**
   * Hook ejecutado DESPUES de actualizar una entidad.
   *
   * Ideal para invalidar caches, notificar cambios, etc.
   *
   * @param _entity - Entidad actualizada
   *
   * @example
   * ```typescript
   * // Invalidar cache del usuario
   * protected async afterUpdate(entity: UserEntity): Promise<void> {
   *   await this.cacheService.del(`user:${entity.id}`);
   *   await this.auditLog.log('user.updated', entity.id);
   * }
   * ```
   */
  protected async afterUpdate(_entity: T): Promise<void> {
    // Override en subclases si es necesario
  }

  /**
   * Hook ejecutado ANTES de eliminar una entidad.
   *
   * Ideal para verificar dependencias o permisos.
   * Si lanza excepcion, la eliminacion se cancela.
   *
   * @param _id - ID de la entidad a eliminar
   *
   * @example
   * ```typescript
   * // Verificar que el usuario no tenga ordenes pendientes
   * protected async beforeDelete(id: string): Promise<void> {
   *   const pendingOrders = await this.orderRepo.count({ userId: id, status: 'pending' });
   *   if (pendingOrders > 0) {
   *     throw new BusinessRuleViolationException('Cannot delete user with pending orders');
   *   }
   * }
   * ```
   */
  protected async beforeDelete(_id: string): Promise<void> {
    // Override en subclases si es necesario
  }

  /**
   * Hook ejecutado DESPUES de eliminar una entidad.
   *
   * Ideal para limpiar recursos relacionados.
   *
   * @param _entity - Entidad eliminada
   *
   * @example
   * ```typescript
   * // Eliminar archivos del usuario
   * protected async afterDelete(entity: UserEntity): Promise<void> {
   *   if (entity.picture) {
   *     await this.fileStorage.delete(entity.picture);
   *   }
   *   await this.auditLog.log('user.deleted', entity.id);
   * }
   * ```
   */
  protected async afterDelete(_entity: T): Promise<void> {
    // Override en subclases si es necesario
  }

  // ==================== OPERACIONES DE LECTURA ====================

  /**
   * Busca una entidad por su ID.
   *
   * Lanza `EntityNotFoundException` si no existe.
   * Use `findByIdOrNull()` si necesita manejar el caso null.
   *
   * @param id - UUID de la entidad
   * @param options - Opciones de consulta (includeDeleted, etc.)
   * @returns La entidad encontrada
   * @throws {EntityNotFoundException} Si no existe o esta eliminada
   *
   * @example
   * ```typescript
   * try {
   *   const user = await userService.findById('uuid-here');
   *   console.log(user.fullName);
   * } catch (e) {
   *   // EntityNotFoundException: User with id 'uuid-here' not found
   * }
   * ```
   */
  async findById(id: string, options?: FindOptions): Promise<T> {
    const entity = await this.repository.findById(id, options);
    if (!entity) {
      throw new EntityNotFoundException(this.entityName, id);
    }
    return entity;
  }

  /**
   * Busca una entidad por ID, retornando null si no existe.
   *
   * Alternativa a `findById()` cuando quieres manejar el caso null
   * sin excepciones.
   *
   * @param id - UUID de la entidad
   * @param options - Opciones de consulta
   * @returns La entidad o null
   *
   * @example
   * ```typescript
   * const user = await userService.findByIdOrNull('uuid-here');
   * if (!user) {
   *   // Manejar caso de no existir
   * }
   * ```
   */
  async findByIdOrNull(id: string, options?: FindOptions): Promise<T | null> {
    return this.repository.findById(id, options);
  }

  /**
   * Obtiene todas las entidades activas.
   *
   * **Advertencia**: En tablas grandes, usa `findPaginated()`.
   *
   * @param options - Opciones de consulta
   * @returns Array de entidades
   *
   * @example
   * ```typescript
   * const allUsers = await userService.findAll();
   * const includingDeleted = await userService.findAll({ includeDeleted: true });
   * ```
   */
  async findAll(options?: FindOptions): Promise<T[]> {
    return this.repository.findAll(options);
  }

  /**
   * Busca entidades con paginacion.
   *
   * Retorna datos + metadata de paginacion.
   *
   * @param params - Parametros de paginacion (page, limit, sortBy, sortOrder)
   * @param options - Opciones de consulta
   * @returns Resultado paginado con data y meta
   *
   * @example
   * ```typescript
   * const result = await userService.findPaginated({ page: 1, limit: 10 });
   * // result.data = UserEntity[]
   * // result.meta = { currentPage, totalItems, totalPages, hasNextPage, ... }
   * ```
   */
  async findPaginated(
    params: PaginationParams,
    options?: FindOptions,
  ): Promise<PaginatedResult<T>> {
    return this.repository.findPaginated(params, options);
  }

  /**
   * Busca una entidad por condicion.
   *
   * @param where - Condiciones de busqueda
   * @param options - Opciones de consulta
   * @returns La entidad o null
   *
   * @example
   * ```typescript
   * const user = await userService.findOne({ emailAddress: 'test@example.com' });
   * ```
   */
  async findOne(where: Partial<T>, options?: FindOptions): Promise<T | null> {
    return this.repository.findOne(where, options);
  }

  /**
   * Busca multiples entidades por condicion.
   *
   * @param where - Condiciones de busqueda
   * @param options - Opciones de consulta
   * @returns Array de entidades
   *
   * @example
   * ```typescript
   * const onlineUsers = await userService.findMany({ online: true });
   * ```
   */
  async findMany(where: Partial<T>, options?: FindOptions): Promise<T[]> {
    return this.repository.findMany(where, options);
  }

  // ==================== OPERACIONES DE ESCRITURA ====================

  /**
   * Crea una nueva entidad.
   *
   * Ejecuta `beforeCreate()` y `afterCreate()` hooks.
   *
   * @param data - Datos de creacion (CreateDto)
   * @returns La entidad creada (con id generado)
   *
   * @example
   * ```typescript
   * const newUser = await userService.create({
   *   fullName: 'John Doe',
   *   emailAddress: 'john@example.com',
   *   password: 'SecureP@ss123',
   * });
   * console.log(newUser.id); // UUID generado
   * ```
   */
  async create(data: CreateDto): Promise<T> {
    const processedData = await this.beforeCreate(data);
    const entity = await this.repository.create(processedData);
    await this.afterCreate(entity);
    return entity;
  }

  /**
   * Crea multiples entidades en batch.
   *
   * Ejecuta `beforeCreate()` para cada item.
   * **Nota**: No ejecuta `afterCreate()` para performance.
   *
   * @param data - Array de datos de creacion
   * @returns Numero de entidades creadas
   *
   * @example
   * ```typescript
   * const count = await userService.createMany([
   *   { fullName: 'User 1', ... },
   *   { fullName: 'User 2', ... },
   * ]);
   * console.log(`Created ${count} users`);
   * ```
   */
  async createMany(data: CreateDto[]): Promise<number> {
    const processedData = await Promise.all(
      data.map((item) => this.beforeCreate(item)),
    );
    return this.repository.createMany(processedData);
  }

  /**
   * Actualiza una entidad existente.
   *
   * Verifica que existe antes de actualizar.
   * Ejecuta `beforeUpdate()` y `afterUpdate()` hooks.
   *
   * @param id - UUID de la entidad
   * @param data - Campos a actualizar (UpdateDto)
   * @returns La entidad actualizada
   * @throws {EntityNotFoundException} Si no existe
   *
   * @example
   * ```typescript
   * const updated = await userService.update('uuid', {
   *   fullName: 'Jane Doe',
   *   online: true,
   * });
   * ```
   */
  async update(id: string, data: UpdateDto): Promise<T> {
    // Verificar que existe (lanza EntityNotFoundException si no)
    await this.findById(id);

    const processedData = await this.beforeUpdate(id, data);
    const entity = await this.repository.update(id, processedData);
    await this.afterUpdate(entity);
    return entity;
  }

  /**
   * Actualiza multiples entidades que coincidan con la condicion.
   *
   * **Nota**: No ejecuta hooks para performance.
   *
   * @param where - Condiciones de busqueda
   * @param data - Campos a actualizar
   * @returns Numero de entidades actualizadas
   *
   * @example
   * ```typescript
   * // Marcar todos los usuarios como offline
   * const count = await userService.updateMany({ online: true }, { online: false });
   * ```
   */
  async updateMany(where: Partial<T>, data: UpdateDto): Promise<number> {
    return this.repository.updateMany(where, data);
  }

  // ==================== OPERACIONES DE ELIMINACION ====================

  /**
   * Elimina una entidad de forma logica (Soft Delete).
   *
   * NO borra el registro de la BD, solo marca `deletedAt = NOW()`.
   * Ejecuta `beforeDelete()` y `afterDelete()` hooks.
   *
   * @param id - UUID de la entidad
   * @returns La entidad marcada como eliminada
   * @throws {EntityNotFoundException} Si no existe
   *
   * @example
   * ```typescript
   * await userService.delete('uuid-here');
   * // El usuario ya no aparece en findAll(), pero existe en BD
   * ```
   */
  async delete(id: string): Promise<T> {
    await this.beforeDelete(id);
    const entity = await this.repository.delete(id);
    await this.afterDelete(entity);
    return entity;
  }

  /**
   * Elimina una entidad de forma permanente (Hard Delete).
   *
   * **ADVERTENCIA**: Esta operacion es IRREVERSIBLE.
   * Borra el registro fisicamente de la base de datos.
   *
   * @param id - UUID de la entidad
   * @returns La entidad eliminada (ultimo estado)
   * @throws {EntityNotFoundException} Si no existe
   *
   * @example
   * ```typescript
   * // Solo usar para GDPR o limpieza de datos de prueba
   * await userService.hardDelete('uuid-here');
   * ```
   */
  async hardDelete(id: string): Promise<T> {
    await this.beforeDelete(id);
    const entity = await this.repository.hardDelete(id);
    await this.afterDelete(entity);
    return entity;
  }

  /**
   * Restaura una entidad previamente eliminada (soft delete).
   *
   * Establece `deletedAt = null`.
   *
   * @param id - UUID de la entidad
   * @returns La entidad restaurada
   * @throws {EntityNotFoundException} Si no existe (ni eliminada)
   *
   * @example
   * ```typescript
   * const restored = await userService.restore('uuid-here');
   * // Ahora aparece en findAll() nuevamente
   * ```
   */
  async restore(id: string): Promise<T> {
    return this.repository.restore(id);
  }

  // ==================== OPERACIONES DE CONTEO ====================

  /**
   * Cuenta entidades que cumplen una condicion.
   *
   * @param where - Condiciones de busqueda (opcional)
   * @param options - Opciones de consulta
   * @returns Numero de entidades
   *
   * @example
   * ```typescript
   * const total = await userService.count();
   * const online = await userService.count({ online: true });
   * ```
   */
  async count(where?: Partial<T>, options?: FindOptions): Promise<number> {
    return this.repository.count(where, options);
  }

  /**
   * Verifica si existe al menos una entidad que cumpla la condicion.
   *
   * Mas eficiente que `findOne()` cuando solo necesitas saber si existe.
   *
   * @param where - Condiciones de busqueda
   * @param options - Opciones de consulta
   * @returns true si existe al menos una entidad
   *
   * @example
   * ```typescript
   * const emailTaken = await userService.exists({ emailAddress: 'test@example.com' });
   * if (emailTaken) {
   *   throw new Error('Email already registered');
   * }
   * ```
   */
  async exists(where: Partial<T>, options?: FindOptions): Promise<boolean> {
    return this.repository.exists(where, options);
  }
}
