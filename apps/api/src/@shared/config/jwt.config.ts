import { ConfigService } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';

/**
 * JWT Configuration Helper
 *
 * Centralizes JWT secret validation to prevent insecure defaults in production.
 *
 * SECURITY: The application will fail to start if JWT_SECRET is not configured
 * in production environment.
 */

const DEV_FALLBACK_SECRET = 'dev-only-secret-do-not-use-in-production';

/**
 * Get JWT secret with proper validation.
 * Throws error in production if JWT_SECRET is not set.
 *
 * @param configService - NestJS ConfigService
 * @returns The JWT secret string
 * @throws Error if JWT_SECRET is not configured in production
 */
export function getJwtSecret(configService: ConfigService): string {
  const secret = configService.get<string>('JWT_SECRET');
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');

  if (!secret) {
    if (nodeEnv === 'production') {
      throw new Error(
        'CRITICAL: JWT_SECRET environment variable is required in production. ' +
          'The application cannot start without a secure secret.',
      );
    }

    // Only allow fallback in development
    console.warn(
      '⚠️  WARNING: JWT_SECRET not configured. Using development fallback. ' +
        'DO NOT use this in production!',
    );
    return DEV_FALLBACK_SECRET;
  }

  // Validate secret strength in production
  if (nodeEnv === 'production' && secret.length < 32) {
    throw new Error(
      'CRITICAL: JWT_SECRET must be at least 32 characters in production.',
    );
  }

  return secret;
}

/**
 * Get JWT configuration options for JwtModule.registerAsync
 */
export function getJwtModuleConfig(configService: ConfigService): JwtModuleOptions {
  const expiresIn = configService.get<string>('JWT_EXPIRATION', '1h');
  return {
    secret: getJwtSecret(configService),
    signOptions: {
      expiresIn: expiresIn as `${number}${'s' | 'm' | 'h' | 'd'}`,
      issuer: 'cervak-framework',
      audience: 'cervak-api',
    },
  };
}
