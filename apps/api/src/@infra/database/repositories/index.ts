/**
 * @infra/database/repositories
 *
 * Implementaciones concretas de los repositorios usando Prisma.
 *
 * NOTA: Products, Stores y PriceRecords fueron migrados a @modules/
 * y ya no usan estos repositorios.
 */

export * from './base.repository';
export * from './user.repository';
export * from './administrator.repository';
export * from './operative-user.repository';
export * from './chat.repository';
