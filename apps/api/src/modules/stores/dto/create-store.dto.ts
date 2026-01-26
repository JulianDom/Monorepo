import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength, IsNotEmpty } from 'class-validator';

export class CreateStoreDto {
  @ApiProperty({ description: 'Store name', example: 'Supermercado Norte' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @ApiProperty({ description: 'Locality', example: 'Buenos Aires' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  locality!: string;

  @ApiPropertyOptional({ description: 'Zone', example: 'Centro' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  zone?: string;
}
