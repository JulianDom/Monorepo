import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ description: 'Current password', example: 'CurrentP@ss123' })
  @IsString()
  @IsNotEmpty()
  currentPassword!: string;

  @ApiProperty({ description: 'New password (min 8 characters)', example: 'NewSecureP@ss456' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  newPassword!: string;
}
