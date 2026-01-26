import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, IsEnum } from 'class-validator';
import { ActorType } from '@shared/types';

/**
 * LoginDto
 *
 * DTO de entrada para el endpoint de login.
 * Valida email, password y tipo de actor.
 */
export class LoginDto {
  @ApiProperty({
    description: 'Email address',
    example: 'user@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({
    description: 'Password',
    example: 'SecureP@ssw0rd',
  })
  @IsString()
  @IsNotEmpty()
  password!: string;

  @ApiProperty({
    description: 'Type of actor (USER or ADMIN)',
    enum: ActorType,
    example: ActorType.USER,
  })
  @IsEnum(ActorType)
  actorType!: ActorType;
}
