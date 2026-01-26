import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { BasePaginationWithStatusDto } from '@common/dto';

export class StoreQueryDto extends BasePaginationWithStatusDto {
  @ApiPropertyOptional({ description: 'Filter by locality' })
  @IsOptional()
  @IsString()
  locality?: string;

  @ApiPropertyOptional({ description: 'Filter by zone' })
  @IsOptional()
  @IsString()
  zone?: string;
}
