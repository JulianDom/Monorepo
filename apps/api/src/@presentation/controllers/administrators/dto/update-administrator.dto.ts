import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength, IsOptional, IsObject } from 'class-validator';

export class UpdateAdministratorDto {
  @ApiPropertyOptional({ description: 'Full name', example: 'Jane Admin Updated' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  fullName?: string;

  @ApiPropertyOptional({
    description: 'Modules and permissions',
    example: { products: { read: true, write: true, delete: true } }
  })
  @IsOptional()
  @IsObject()
  modules?: Record<string, { read: boolean; write: boolean; delete: boolean }> | null;
}
