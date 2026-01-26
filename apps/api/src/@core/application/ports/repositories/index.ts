/**
 * Repository Interfaces (Ports)
 *
 * Interfaces para repositorios - contratos que la capa de infraestructura
 * debe implementar.
 *
 * NOTA: Products, Stores y PriceRecords fueron migrados a @modules/
 * y ya no necesitan estas interfaces.
 */

export * from './base.repository.interface';
export * from './user.repository.interface';
export * from './administrator.repository.interface';
export * from './operative-user.repository.interface';
export * from './chat.repository.interface';
