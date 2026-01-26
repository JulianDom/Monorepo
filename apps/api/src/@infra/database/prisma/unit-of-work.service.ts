import { Injectable } from '@nestjs/common';
import { PrismaService } from '@database/index';
import { IUnitOfWork } from '@core/application/ports/services';

/**
 * UnitOfWorkService - Implementación Prisma
 *
 * Implementa el patrón Unit of Work usando las transacciones de Prisma.
 * Permite ejecutar múltiples operaciones de forma atómica.
 *
 * Ejemplo de uso:
 * ```typescript
 * await this.unitOfWork.execute(async (tx) => {
 *   await tx.user.create({ data: userData });
 *   await tx.admin.update({ where: { id }, data: { refreshToken } });
 * });
 * ```
 */
@Injectable()
export class UnitOfWorkService implements IUnitOfWork {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Ejecuta operaciones dentro de una transacción Prisma.
   * Si cualquier operación falla, todas se revierten automáticamente.
   */
  async execute<T>(work: (transaction: typeof this.prisma) => Promise<T>): Promise<T> {
    return this.prisma.$transaction(async (tx) => {
      return work(tx as typeof this.prisma);
    });
  }
}
