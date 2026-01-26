import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail, MinLength, MaxLength, IsOptional, IsObject } from 'class-validator';

export class CreateAdministratorDto {
  @ApiProperty({ description: 'Full name', example: 'Jane Admin' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(255)
  fullName!: string;

  @ApiProperty({ description: 'Email address', example: 'jane@company.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ description: 'Username', example: 'jane_admin' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  username!: string;

  @ApiProperty({ description: 'Password (min 8 characters)', example: 'SecureP@ss123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password!: string;

  @ApiPropertyOptional({
    description: 'Modules and permissions',
    example: { products: { read: true, write: true, delete: false } }
  })
  @IsOptional()
  @IsObject()
  modules?: Record<string, { read: boolean; write: boolean; delete: boolean }>;
}
