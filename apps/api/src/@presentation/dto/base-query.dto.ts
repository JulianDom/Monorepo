import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsInt,
  Min,
  Max,
  IsString,
  Matches,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT } from '@shared/types';

/**
 * BaseQueryDto - DTO base para queries con paginación, ordenamiento y búsqueda
 *
 * Uso desde el frontend:
 *
 * Paginación:
 *   GET /products?page=1&limit=20
 *
 * Ordenamiento:
 *   GET /products?sort=name           → ascendente por name
 *   GET /products?sort=-createdAt     → descendente por createdAt
 *   GET /products?sort=category,-name → múltiple: category asc, name desc
 *
 * Búsqueda:
 *   GET /products?search=coca cola
 *
 * Incluir relaciones:
 *   GET /price-records?include=product,store
 */
export class BaseQueryDto {
  @ApiPropertyOptional({
    description: 'Número de página (comienza en 1)',
    minimum: 1,
    default: DEFAULT_PAGE,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = DEFAULT_PAGE;

  @ApiPropertyOptional({
    description: 'Cantidad de items por página',
    minimum: 1,
    maximum: MAX_LIMIT,
    default: DEFAULT_LIMIT,
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_LIMIT)
  limit?: number = DEFAULT_LIMIT;

  @ApiPropertyOptional({
    description:
      'Ordenamiento. Prefijo "-" para descendente. Separar múltiples con coma. Ej: "-createdAt,name"',
    example: '-createdAt',
  })
  @IsOptional()
  @IsString()
  @Matches(/^-?[a-zA-Z_][a-zA-Z0-9_]*(,-?[a-zA-Z_][a-zA-Z0-9_]*)*$/, {
    message:
      'sort debe ser campos separados por coma, con prefijo "-" opcional para descendente',
  })
  sort?: string;

  @ApiPropertyOptional({
    description: 'Búsqueda global en campos configurados',
    example: 'coca cola',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Relaciones a incluir, separadas por coma',
    example: 'product,store',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.split(',').map((s) => s.trim()) : value))
  include?: string[];
}

/**
 * BaseQueryWithStatusDto - Extiende BaseQueryDto con filtro de estado activo
 *
 * Uso:
 *   GET /products?activeOnly=true
 *   GET /products?activeOnly=false (incluye inactivos)
 */
export class BaseQueryWithStatusDto extends BaseQueryDto {
  @ApiPropertyOptional({
    description: 'Filtrar solo registros activos',
    default: false,
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  activeOnly?: boolean = false;
}

/**
 * BaseQueryWithDatesDto - Extiende BaseQueryDto con filtros de rango de fechas
 *
 * Uso:
 *   GET /price-records?dateFrom=2024-01-01&dateTo=2024-12-31
 *   GET /price-records?dateFrom=2024-01-01T00:00:00Z
 */
export class BaseQueryWithDatesDto extends BaseQueryDto {
  @ApiPropertyOptional({
    description: 'Fecha desde (ISO 8601)',
    example: '2024-01-01',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/, {
    message: 'dateFrom debe ser formato ISO 8601 (YYYY-MM-DD o YYYY-MM-DDTHH:mm:ss)',
  })
  dateFrom?: string;

  @ApiPropertyOptional({
    description: 'Fecha hasta (ISO 8601)',
    example: '2024-12-31',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/, {
    message: 'dateTo debe ser formato ISO 8601 (YYYY-MM-DD o YYYY-MM-DDTHH:mm:ss)',
  })
  dateTo?: string;
}

/**
 * BaseQueryFullDto - Combina todos los filtros base
 */
export class BaseQueryFullDto extends BaseQueryDto {
  @ApiPropertyOptional({
    description: 'Filtrar solo registros activos',
    default: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  activeOnly?: boolean = false;

  @ApiPropertyOptional({
    description: 'Fecha desde (ISO 8601)',
    example: '2024-01-01',
  })
  @IsOptional()
  @IsString()
  dateFrom?: string;

  @ApiPropertyOptional({
    description: 'Fecha hasta (ISO 8601)',
    example: '2024-12-31',
  })
  @IsOptional()
  @IsString()
  dateTo?: string;
}
