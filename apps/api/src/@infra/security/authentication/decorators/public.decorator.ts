import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * @Public()
 *
 * Decorador para marcar rutas como públicas (no requieren autenticación).
 *
 * @example
 * @Public()
 * @Get('health')
 * health() { return 'OK'; }
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
