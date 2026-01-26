import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, Min, MaxLength, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @ApiProperty({ description: 'Product name', example: 'Aceite de Girasol' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @ApiPropertyOptional({ description: 'Product description', example: 'Aceite de girasol refinado' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Brand', example: 'Natura' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  brand?: string;

  @ApiProperty({ description: 'Product presentation', example: '1L' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  presentation!: string;

  @ApiProperty({ description: 'Price', example: 1500.5 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price!: number;
}
