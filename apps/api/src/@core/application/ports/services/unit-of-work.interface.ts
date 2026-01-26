/**
 * IUnitOfWork - Puerto para manejo de transacciones
 *
 * Patrón Unit of Work que permite ejecutar operaciones de forma atómica.
 * La implementación concreta maneja los detalles de la transacción (Prisma, TypeORM, etc.)
 *
 * Uso en Use Cases:
 * ```typescript
 * await this.unitOfWork.execute(async (tx) => {
 *   const user = await this.userRepository.create(entity, tx);
 *   await this.adminRepository.updateRefreshToken(id, token, tx);
 * });
 * ```
 */
export interface IUnitOfWork {
  /**
   * Ejecuta una función dentro de una transacción.
   * Si la función lanza una excepción, la transacción se revierte automáticamente.
   *
   * @param work - Función que contiene las operaciones a ejecutar
   * @returns El resultado de la función
   */
  execute<T>(work: (transaction: unknown) => Promise<T>): Promise<T>;
}

export const UNIT_OF_WORK = Symbol('IUnitOfWork');
