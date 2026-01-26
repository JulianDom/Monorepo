import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';

import { JwtStrategy } from './authentication/jwt.strategy';
import { JwtAuthGuard } from './authentication/jwt-auth.guard';
import { TokenService } from './authentication/token.service';
import { RefreshTokenService } from './authentication/refresh-token.service';
import { BiometricService } from './biometrics/biometric.service';
import { throttlerConfig } from './throttling/throttler.config';
import { PrismaModule } from '@infra/database/prisma';
import { getJwtModuleConfig } from '@shared/config';
import { USER_REPOSITORY } from '@core/application/ports/repositories';
import { UserRepository } from '@infra/database/repositories';

/**
 * AuthModule
 *
 * Módulo de seguridad que integra:
 * - JWT Authentication con Passport
 * - WebAuthn/Passkeys con SimpleWebAuthn
 * - Rate Limiting con Throttler
 *
 * Exporta los servicios y guards necesarios para proteger endpoints.
 */
@Module({
  imports: [
    PrismaModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => getJwtModuleConfig(configService),
    }),
    ThrottlerModule.forRoot(throttlerConfig),
  ],
  providers: [
    JwtStrategy,
    JwtAuthGuard,
    TokenService,
    RefreshTokenService,
    BiometricService,
    {
      provide: USER_REPOSITORY,
      useClass: UserRepository,
    },
  ],
  exports: [
    JwtStrategy,
    JwtAuthGuard,
    TokenService,
    RefreshTokenService,
    BiometricService,
    JwtModule,
    PassportModule,
    ThrottlerModule,
    USER_REPOSITORY,
  ],
})
export class AuthModule { }
