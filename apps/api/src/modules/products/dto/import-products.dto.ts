import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsString, IsNumber, IsOptional, Min, MaxLength, ValidateNested, IsNotEmpty } from 'class-validator';

export class ImportProductDto {
  @ApiProperty({ example: 'Aceite de Girasol' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'Natura' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  brand?: string;

  @ApiProperty({ example: '1L' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  presentation!: string;

  @ApiProperty({ example: 1500.5 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price!: number;
}

export class ImportProductsDto {
  @ApiProperty({ type: [ImportProductDto], description: 'Array of products to import' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImportProductDto)
  products!: ImportProductDto[];
}

export class ImportProductsResponseDto {
  @ApiProperty({ description: 'Number of products created' })
  created!: number;

  @ApiProperty({ description: 'Number of products skipped (duplicates or errors)' })
  skipped!: number;

  @ApiProperty({ type: [String], description: 'Error messages' })
  errors!: string[];
}
