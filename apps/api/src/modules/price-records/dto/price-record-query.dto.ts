import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
import { BasePaginationWithDatesDto } from '@common/dto';

export class PriceRecordQueryDto extends BasePaginationWithDatesDto {
  @ApiPropertyOptional({ description: 'Filter by product ID' })
  @IsOptional()
  @IsUUID()
  productId?: string;

  @ApiPropertyOptional({ description: 'Filter by store ID' })
  @IsOptional()
  @IsUUID()
  storeId?: string;

  @ApiPropertyOptional({ description: 'Filter by operative user ID' })
  @IsOptional()
  @IsUUID()
  operativeUserId?: string;
}
