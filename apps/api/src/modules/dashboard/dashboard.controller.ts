import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '@common/decorators';
import { RolesGuard } from '@common/guards';
import { ActorType } from '@common/types';
import { JwtAuthGuard } from '@infra/security/authentication';
import { DashboardService } from './dashboard.service';
import { DashboardStatsResponseDto } from './dto';

/**
 * Controller para endpoints del dashboard
 *
 * PATRÓN: Endpoints de agregación
 *
 * Este controller expone endpoints que consolidan información
 * de múltiples entidades para casos de uso específicos del frontend.
 *
 * A diferencia de los controllers CRUD que mapean 1:1 con entidades,
 * los endpoints de agregación combinan datos de múltiples fuentes
 * para optimizar el rendimiento y reducir la cantidad de llamadas HTTP.
 *
 * CUÁNDO USAR ESTE PATRÓN:
 * - Dashboard con métricas de múltiples entidades
 * - Reportes que combinan datos de varias tablas
 * - Vistas que requieren datos agregados o calculados
 * - Cualquier caso donde múltiples llamadas HTTP serían ineficientes
 */
@ApiTags('dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ActorType.ADMIN)
@ApiBearerAuth('JWT-auth')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /**
   * Obtiene estadísticas generales del sistema
   *
   * Retorna conteos de todas las entidades principales:
   * - Administradores (total y activos)
   * - Usuarios operativos (total y activos)
   * - Productos (total y activos)
   * - Locales (total y activos)
   * - Registros de precios (total y última fecha)
   */
  @Get('stats')
  @ApiOperation({
    summary: 'Obtener estadísticas del dashboard',
    description: 'Retorna métricas agregadas de todas las entidades del sistema',
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas del dashboard',
    type: DashboardStatsResponseDto,
  })
  async getStats(): Promise<DashboardStatsResponseDto> {
    return this.dashboardService.getStats();
  }
}
