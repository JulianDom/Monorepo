/**
 * Excepción base del dominio
 *
 * IMPORTANTE: Esta clase NO extiende HttpException para mantener
 * el dominio desacoplado de la capa de presentación HTTP.
 *
 * La conversión a respuestas HTTP se hace en DomainExceptionFilter
 */
export class DomainException extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly httpStatus: number = 400,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'DomainException';
    Object.setPrototypeOf(this, DomainException.prototype);
  }
}

/**
 * Entidad no encontrada
 */
export class EntityNotFoundException extends DomainException {
  constructor(entityName: string, id?: string) {
    super(
      'ENTITY_NOT_FOUND',
      id ? `${entityName} with id '${id}' not found` : `${entityName} not found`,
      404,
      { entityName, id },
    );
    this.name = 'EntityNotFoundException';
  }
}

/**
 * Entidad duplicada (unique constraint)
 */
export class EntityDuplicatedException extends DomainException {
  constructor(entityName: string, field: string, value?: string) {
    super(
      'ENTITY_DUPLICATED',
      `${entityName} with ${field}${value ? ` '${value}'` : ''} already exists`,
      409,
      { entityName, field, value },
    );
    this.name = 'EntityDuplicatedException';
  }
}

/**
 * Conflicto - Alias de EntityDuplicatedException para compatibilidad
 */
export class ConflictException extends DomainException {
  constructor(message: string, details?: Record<string, unknown>) {
    super('CONFLICT', message, 409, details);
    this.name = 'ConflictException';
  }
}

/**
 * Operación no permitida
 */
export class ForbiddenOperationException extends DomainException {
  constructor(message: string, details?: Record<string, unknown>) {
    super('FORBIDDEN_OPERATION', message, 403, details);
    this.name = 'ForbiddenOperationException';
  }
}

/**
 * Error de validación de negocio
 */
export class BusinessValidationException extends DomainException {
  constructor(message: string, details?: Record<string, unknown>) {
    super('BUSINESS_VALIDATION_ERROR', message, 422, details);
    this.name = 'BusinessValidationException';
  }
}

/**
 * Error de base de datos
 */
export class DatabaseException extends DomainException {
  constructor(message: string, details?: Record<string, unknown>) {
    super('DATABASE_ERROR', message, 500, details);
    this.name = 'DatabaseException';
  }
}

/**
 * Credenciales inválidas
 */
export class InvalidCredentialsException extends DomainException {
  constructor(message: string = 'Invalid credentials') {
    super('INVALID_CREDENTIALS', message, 401);
    this.name = 'InvalidCredentialsException';
  }
}

/**
 * Cuenta desactivada
 */
export class AccountDisabledException extends DomainException {
  constructor(message: string = 'Account is disabled') {
    super('ACCOUNT_DISABLED', message, 401);
    this.name = 'AccountDisabledException';
  }
}

/**
 * Token inválido o expirado
 */
export class InvalidTokenException extends DomainException {
  constructor(message: string = 'Invalid or expired token') {
    super('INVALID_TOKEN', message, 401);
    this.name = 'InvalidTokenException';
  }
}
