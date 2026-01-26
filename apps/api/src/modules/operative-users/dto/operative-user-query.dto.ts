import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { BasePaginationDto } from '@common/dto';

export class OperativeUserQueryDto extends BasePaginationDto {
  @ApiPropertyOptional({ description: 'Filter only enabled users' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  enabledOnly?: boolean;
}
