/**
 * =============================================================================
 * FEATURE: Dashboard
 * =============================================================================
 *
 * Módulo para estadísticas del dashboard.
 * Consume el endpoint de agregación /dashboard/stats del backend.
 *
 * PATRÓN: Endpoint de agregación
 * En lugar de hacer múltiples llamadas desde el frontend,
 * el backend proporciona un endpoint que consolida toda la información
 * necesaria en una única respuesta optimizada.
 */
'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { ENDPOINTS } from '@/config';

// =============================================================================
// TYPES
// =============================================================================

interface EntityStats {
  total: number;
  active: number;
}

interface PriceRecordStats {
  total: number;
  lastRecordedAt: string | null;
}

export interface DashboardStats {
  admins: EntityStats;
  operatives: EntityStats;
  products: EntityStats;
  stores: EntityStats;
  priceRecords: PriceRecordStats;
}

// =============================================================================
// QUERY KEYS
// =============================================================================

export const dashboardKeys = {
  all: ['dashboard'] as const,
  stats: () => [...dashboardKeys.all, 'stats'] as const,
};

// =============================================================================
// SERVICE
// =============================================================================

/**
 * Servicio para el dashboard
 *
 * Consume el endpoint de agregación que devuelve todas las
 * estadísticas en una sola llamada.
 */
export const dashboardService = {
  /**
   * Obtiene estadísticas del dashboard
   * GET /dashboard/stats
   */
  async getStats(): Promise<DashboardStats> {
    return apiClient.get<DashboardStats>(ENDPOINTS.DASHBOARD.STATS);
  },
};

// =============================================================================
// HOOKS
// =============================================================================

/**
 * Hook para obtener estadísticas del dashboard
 *
 * Usa el endpoint de agregación del backend que devuelve:
 * - Administradores (total y activos)
 * - Usuarios operativos (total y activos)
 * - Productos (total y activos)
 * - Locales (total y activos)
 * - Registros de precios (total y última fecha)
 *
 * VENTAJAS de usar endpoint de agregación:
 * - Una sola llamada HTTP en lugar de múltiples
 * - Mejor rendimiento (menos latencia de red)
 * - Consultas optimizadas en el backend (Promise.all en DB)
 * - Menor carga en el servidor (una request vs muchas)
 */
export function useDashboardStats() {
  return useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: dashboardService.getStats,
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
  });
}
