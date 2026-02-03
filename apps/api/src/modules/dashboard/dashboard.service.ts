import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { DashboardStatsResponseDto } from './dto';

/**
 * Servicio para estadísticas del dashboard
 *
 * Este servicio agrega datos de múltiples entidades para
 * proporcionar métricas generales del sistema en una sola llamada.
 *
 * PATRÓN: Endpoint de agregación
 * En lugar de hacer múltiples llamadas desde el frontend,
 * este endpoint consolida toda la información necesaria
 * para el dashboard en una única respuesta optimizada.
 */
@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Obtiene todas las estadísticas del dashboard
   *
   * Ejecuta todas las consultas en paralelo para optimizar el tiempo de respuesta.
   * Cada consulta cuenta registros no eliminados (soft delete).
   */
  async getStats(): Promise<DashboardStatsResponseDto> {
    const [
      // Administradores
      adminsTotal,
      adminsActive,
      // Usuarios operativos
      operativesTotal,
      operativesActive,
      // Productos
      productsTotal,
      productsActive,
      // Locales
      storesTotal,
      storesActive,
      // Registros de precios
      priceRecordsTotal,
      lastPriceRecord,
    ] = await Promise.all([
      // Admins
      this.prisma.administrator.count({
        where: { deletedAt: null },
      }),
      this.prisma.administrator.count({
        where: { deletedAt: null, enabled: true },
      }),

      // Operatives
      this.prisma.operativeUser.count({
        where: { deletedAt: null },
      }),
      this.prisma.operativeUser.count({
        where: { deletedAt: null, enabled: true },
      }),

      // Products
      this.prisma.product.count({
        where: { deletedAt: null },
      }),
      this.prisma.product.count({
        where: { deletedAt: null, active: true },
      }),

      // Stores
      this.prisma.store.count({
        where: { deletedAt: null },
      }),
      this.prisma.store.count({
        where: { deletedAt: null, active: true },
      }),

      // Price Records
      this.prisma.priceRecord.count({
        where: { deletedAt: null },
      }),
      this.prisma.priceRecord.findFirst({
        where: { deletedAt: null },
        orderBy: { recordedAt: 'desc' },
        select: { recordedAt: true },
      }),
    ]);

    return {
      admins: {
        total: adminsTotal,
        active: adminsActive,
      },
      operatives: {
        total: operativesTotal,
        active: operativesActive,
      },
      products: {
        total: productsTotal,
        active: productsActive,
      },
      stores: {
        total: storesTotal,
        active: storesActive,
      },
      priceRecords: {
        total: priceRecordsTotal,
        lastRecordedAt: lastPriceRecord?.recordedAt ?? null,
      },
    };
  }
}
