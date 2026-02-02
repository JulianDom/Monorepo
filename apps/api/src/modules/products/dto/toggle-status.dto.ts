import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class ToggleStatusDto {
  @ApiProperty({ description: 'Set to true to activate, false to deactivate' })
  @IsBoolean()
  activate!: boolean;
}

// Add validation logging
export class ToggleStatusDtoValidationLogger {
  static validate(dto: any) {
    console.log('🔍 [Backend] Toggle Status DTO received:', dto);
    console.log('🔍 [Backend] Expected field: "activate", Received fields:', Object.keys(dto));

    if ('enable' in dto) {
      console.warn('⚠️ [Backend] Field mismatch: received "enable" but expected "activate"');
    }

    if ('activate' in dto) {
      console.log('✅ [Backend] Correct field "activate" found with value:', dto.activate);
    }
  }
}
