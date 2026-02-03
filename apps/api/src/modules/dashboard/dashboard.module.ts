import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { RolesGuard } from '@common/guards';
import { AuthModule } from '@infra/security/authentication';
import { getJwtModuleConfig } from '@shared/config';

/**
 * Módulo del Dashboard
 *
 * Proporciona endpoints de agregación para el dashboard del frontend.
 *
 * PATRÓN: Módulo de agregación
 *
 * A diferencia de los módulos CRUD que gestionan una entidad,
 * este módulo agrega datos de múltiples entidades para
 * proporcionar vistas consolidadas.
 *
 * ESTRUCTURA:
 * - Controller: Define endpoints de consulta (GET only)
 * - Service: Ejecuta consultas de agregación optimizadas
 * - DTOs: Define la estructura de respuesta
 *
 * NOTA: Este módulo es de solo lectura. No tiene operaciones
 * de escritura ya que los datos se gestionan en sus módulos respectivos.
 */
@Module({
  imports: [
    AuthModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getJwtModuleConfig,
    }),
  ],
  controllers: [DashboardController],
  providers: [
    DashboardService,
    RolesGuard,
  ],
  exports: [DashboardService],
})
export class DashboardModule {}
