/**
 * Domain Entities
 *
 * Las entidades son objetos con identidad única que encapsulan
 * las reglas de negocio fundamentales del dominio.
 *
 * NOTA: Products, Stores y PriceRecords fueron migrados a @modules/
 * y ahora usan tipos de Prisma directamente.
 */

export * from './user.entity';
export * from './administrator.entity';
export * from './operative-user.entity';
