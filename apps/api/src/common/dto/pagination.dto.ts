import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsInt,
  Min,
  Max,
  IsString,
  IsBoolean,
  Matches,
  IsDateString,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

/**
 * DTO base para paginacion - UNICO archivo para toda la API
 */
export class BasePaginationDto {
  @ApiPropertyOptional({ default: 1, description: 'Page number' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 10, description: 'Items per page (max 100)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({ example: '-createdAt', description: 'Sort field (prefix with - for desc)' })
  @IsOptional()
  @IsString()
  @Matches(/^-?[a-zA-Z_]+$/, { message: 'Invalid sort format' })
  sort?: string;

  @ApiPropertyOptional({ description: 'Search query' })
  @IsOptional()
  @IsString()
  search?: string;
}

/**
 * DTO con filtro de estado activo
 */
export class BasePaginationWithStatusDto extends BasePaginationDto {
  @ApiPropertyOptional({ description: 'Filter only active records' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  activeOnly?: boolean;
}

/**
 * DTO con filtros de fecha
 */
export class BasePaginationWithDatesDto extends BasePaginationDto {
  @ApiPropertyOptional({ description: 'Filter from date (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({ description: 'Filter to date (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  dateTo?: string;
}

/**
 * DTO completo con estado y fechas
 */
export class BasePaginationFullDto extends BasePaginationWithStatusDto {
  @ApiPropertyOptional({ description: 'Filter from date (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({ description: 'Filter to date (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  dateTo?: string;
}

/**
 * Metadata de paginacion para respuestas
 */
export class PaginationMeta {
  @ApiProperty()
  page!: number;

  @ApiProperty()
  limit!: number;

  @ApiProperty()
  total!: number;

  @ApiProperty()
  totalPages!: number;

  @ApiProperty()
  hasNextPage!: boolean;

  @ApiProperty()
  hasPreviousPage!: boolean;
}

/**
 * Respuesta paginada generica
 */
export class PaginatedResponse<T> {
  data!: T[];
  meta!: PaginationMeta;
}

/**
 * Helper para construir respuesta paginada
 */
export function buildPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / limit);
  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}
