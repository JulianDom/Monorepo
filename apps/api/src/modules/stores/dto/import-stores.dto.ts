import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsString, IsOptional, MaxLength, ValidateNested, IsNotEmpty } from 'class-validator';

export class ImportStoreDto {
  @ApiProperty({ example: 'Supermercado Norte' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @ApiProperty({ example: 'Buenos Aires' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  locality!: string;

  @ApiPropertyOptional({ example: 'Centro' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  zone?: string;
}

export class ImportStoresDto {
  @ApiProperty({ type: [ImportStoreDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImportStoreDto)
  stores!: ImportStoreDto[];
}

export class ImportStoresResponseDto {
  @ApiProperty()
  created!: number;

  @ApiProperty()
  skipped!: number;

  @ApiProperty({ type: [String] })
  errors!: string[];
}
