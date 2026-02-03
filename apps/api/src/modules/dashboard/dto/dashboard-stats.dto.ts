import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para las estadísticas del dashboard
 */
export class EntityStatsDto {
  @ApiProperty({ description: 'Total de registros', example: 100 })
  total!: number;

  @ApiProperty({ description: 'Registros activos/habilitados', example: 85 })
  active!: number;
}

export class PriceRecordStatsDto {
  @ApiProperty({ description: 'Total de registros de precios', example: 15000 })
  total!: number;

  @ApiProperty({ description: 'Fecha del último registro', example: '2026-02-03T10:30:00.000Z', nullable: true })
  lastRecordedAt!: Date | null;
}

export class DashboardStatsResponseDto {
  @ApiProperty({ description: 'Estadísticas de administradores', type: EntityStatsDto })
  admins!: EntityStatsDto;

  @ApiProperty({ description: 'Estadísticas de usuarios operativos', type: EntityStatsDto })
  operatives!: EntityStatsDto;

  @ApiProperty({ description: 'Estadísticas de productos', type: EntityStatsDto })
  products!: EntityStatsDto;

  @ApiProperty({ description: 'Estadísticas de locales', type: EntityStatsDto })
  stores!: EntityStatsDto;

  @ApiProperty({ description: 'Estadísticas de registros de precios', type: PriceRecordStatsDto })
  priceRecords!: PriceRecordStatsDto;
}
