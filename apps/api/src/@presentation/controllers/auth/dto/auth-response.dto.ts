import { ApiProperty } from '@nestjs/swagger';
import { ActorType } from '@shared/types';

/**
 * ActorResponseDto
 *
 * DTO para representar el actor autenticado en la respuesta.
 */
export class ActorResponseDto {
  @ApiProperty({
    description: 'Actor ID',
    example: 'uuid-here',
  })
  id!: string;

  @ApiProperty({
    description: 'Email address',
    example: 'user@example.com',
  })
  email!: string;

  @ApiProperty({
    description: 'Username',
    example: 'johndoe',
  })
  username!: string;

  @ApiProperty({
    description: 'Full name',
    example: 'John Doe',
  })
  fullName!: string;

  @ApiProperty({
    description: 'Actor type',
    enum: ActorType,
    example: ActorType.USER,
  })
  type!: ActorType;
}

/**
 * AuthResponseDto
 *
 * DTO de respuesta para login y registro.
 * Incluye los datos del actor y los tokens de autenticación.
 */
export class AuthResponseDto {
  @ApiProperty({
    description: 'Authenticated actor information',
    type: ActorResponseDto,
  })
  actor!: ActorResponseDto;

  @ApiProperty({
    description: 'JWT Access Token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken!: string;

  @ApiProperty({
    description: 'JWT Refresh Token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken!: string;
}
