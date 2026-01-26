import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail, MinLength } from 'class-validator';

export class RequestPasswordRecoveryDto {
  @ApiProperty({ description: 'Email address', example: 'admin@company.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;
}

export class ResetPasswordDto {
  @ApiProperty({ description: 'Recovery ID received by email' })
  @IsString()
  @IsNotEmpty()
  recoveryId!: string;

  @ApiProperty({ description: 'New password (min 8 characters)', example: 'NewSecureP@ss123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  newPassword!: string;
}

export class PasswordRecoveryResponseDto {
  @ApiProperty({ description: 'Response message' })
  message!: string;

  @ApiProperty({ description: 'Recovery ID (only in dev mode)', required: false })
  recoveryId?: string;
}
