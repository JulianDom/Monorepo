import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class ToggleStatusDto {
  @ApiProperty({ description: 'Set to true to activate, false to deactivate' })
  @IsBoolean()
  activate!: boolean;
}
