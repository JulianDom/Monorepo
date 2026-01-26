import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsUUID, IsDateString, Min, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePriceRecordDto {
  @ApiProperty({ description: 'Product ID' })
  @IsUUID()
  productId!: string;

  @ApiProperty({ description: 'Store ID' })
  @IsUUID()
  storeId!: string;

  @ApiProperty({ description: 'Operative user ID who recorded the price' })
  @IsUUID()
  operativeUserId!: string;

  @ApiProperty({ description: 'Recorded price', example: 1500.5 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price!: number;

  @ApiPropertyOptional({ description: 'Date when price was recorded (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  recordedAt?: string;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Photo URL of the price tag' })
  @IsOptional()
  @IsUrl()
  photoUrl?: string;
}
