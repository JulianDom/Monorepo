/**
 * Re-export de @nestjs/throttler decoradores
 *
 * @SkipThrottle() - Omite rate limiting para el endpoint/controller
 * @Throttle() - Aplica configuración de throttle específica
 */
export { SkipThrottle, Throttle } from '@nestjs/throttler';
