import { ThrottlerModuleOptions } from '@nestjs/throttler';

/**
 * Configuración de Rate Limiting
 *
 * Define múltiples limitadores para diferentes ventanas de tiempo:
 * - short: 10 requests por 1 segundo (protección contra bursts)
 * - medium: 100 requests por 10 segundos
 * - long: 1000 requests por minuto
 */
export const throttlerConfig: ThrottlerModuleOptions = {
  throttlers: [
    {
      name: 'short',
      ttl: 1000, // 1 segundo
      limit: 10, // 10 requests
    },
    {
      name: 'medium',
      ttl: 10000, // 10 segundos
      limit: 100, // 100 requests
    },
    {
      name: 'long',
      ttl: 60000, // 1 minuto
      limit: 1000, // 1000 requests
    },
  ],
};

/**
 * Configuración estricta para endpoints sensibles (auth, login, etc.)
 */
export const strictThrottlerConfig = {
  short: { ttl: 1000, limit: 3 },
  medium: { ttl: 60000, limit: 10 },
  long: { ttl: 3600000, limit: 100 }, // 1 hora
};
