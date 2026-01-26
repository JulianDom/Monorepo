import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { BaseQueryDto } from '@presentation/dto';

/**
 * AdministratorPaginationQueryDto
 *
 * DTO para filtrar y paginar administradores.
 * Extiende de BaseQueryDto que ya incluye:
 * - page, limit (paginación)
 * - sort (ordenamiento)
 * - search (búsqueda global)
 *
 * Ejemplos de uso:
 *   GET /administrators?page=1&limit=20
 *   GET /administrators?search=admin
 *   GET /administrators?enabledOnly=true&sort=fullName
 */
export class AdministratorPaginationQueryDto extends BaseQueryDto {
  @ApiPropertyOptional({
    description: 'Mostrar solo administradores habilitados',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  enabledOnly?: boolean;
}

// Re-exportar con alias para compatibilidad
export { AdministratorPaginationQueryDto as PaginationQueryDto };
