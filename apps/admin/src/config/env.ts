/**
 * Configuración de entorno centralizada
 *
 * Permite:
 * - Dev local → API local
 * - Dev local → API producción (NEXT_PUBLIC_API_ENV=production)
 * - Producción → API producción
 *
 * Variables de entorno requeridas en .env.local:
 * - NEXT_PUBLIC_API_URL_LOCAL=http://localhost:3000/api/v1
 * - NEXT_PUBLIC_API_URL_STAGING=https://staging-api.tudominio.com/api/v1
 * - NEXT_PUBLIC_API_URL_PRODUCTION=https://api.tudominio.com/api/v1
 * - NEXT_PUBLIC_API_ENV=local|staging|production (opcional, default: local en dev)
 */

type Environment = 'local' | 'staging' | 'production';

interface EnvConfig {
  apiUrl: string;
  appUrl: string;
  environment: Environment;
  isDev: boolean;
  isProd: boolean;
  isStaging: boolean;
  // Auth storage keys
  authTokenKey: string;
  authRefreshTokenKey: string;
  authUserKey: string;
  // Timeouts
  apiTimeout: number;
  /**
   * Bypass de autenticación para desarrollo de UI
   * Permite navegar sin login real cuando la API no está disponible
   * Activar con NEXT_PUBLIC_AUTH_BYPASS=true en .env.local
   * NUNCA activar en producción
   */
  authBypass: boolean;
}

function getEnvironment(): Environment {
  // 1. Si hay NEXT_PUBLIC_API_ENV, usarlo (permite override manual)
  const envOverride = process.env.NEXT_PUBLIC_API_ENV as Environment;
  if (envOverride && ['local', 'staging', 'production'].includes(envOverride)) {
    return envOverride;
  }

  // 2. Si estamos en producción de Vercel/build, usar production
  if (process.env.NODE_ENV === 'production') {
    return 'production';
  }

  // 3. Default: local para desarrollo
  return 'local';
}

function getApiUrl(env: Environment): string {
  // Prioridad 1: URL específica del entorno
  const urls: Record<Environment, string | undefined> = {
    local: process.env.NEXT_PUBLIC_API_URL_LOCAL,
    staging: process.env.NEXT_PUBLIC_API_URL_STAGING,
    production: process.env.NEXT_PUBLIC_API_URL_PRODUCTION,
  };

  if (urls[env]) {
    return urls[env]!;
  }

  // Prioridad 2: URL genérica (backwards compatible)
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  // Prioridad 3: Default por entorno
  // API corre en puerto 3000, Admin en 3001
  const defaults: Record<Environment, string> = {
    local: 'http://localhost:3000/api/v1',
    staging: 'https://staging-api.example.com/api/v1',
    production: 'https://api.example.com/api/v1',
  };

  return defaults[env];
}

function getAppUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  return 'http://localhost:3000';
}

function createEnvConfig(): EnvConfig {
  const environment = getEnvironment();

  // Auth bypass solo funciona en desarrollo local
  const authBypass =
    environment === 'local' && process.env.NEXT_PUBLIC_AUTH_BYPASS === 'true';

  return {
    apiUrl: getApiUrl(environment),
    appUrl: getAppUrl(),
    environment,
    isDev: environment === 'local',
    isProd: environment === 'production',
    isStaging: environment === 'staging',
    // Auth storage keys
    authTokenKey: 'access_token',
    authRefreshTokenKey: 'refresh_token',
    authUserKey: 'user',
    // Timeouts
    apiTimeout: 30000,
    // Auth bypass (solo desarrollo)
    authBypass,
  };
}

/**
 * Configuración de entorno - SINGLETON
 * Importar así: import { env } from '@/config'
 */
export const env = createEnvConfig();

/**
 * Helper para debug - muestra config actual en consola
 */
export function logEnvConfig(): void {
  if (typeof window !== 'undefined') {
    console.group('🔧 Environment Config');
    console.log('Environment:', env.environment);
    console.log('API URL:', env.apiUrl);
    console.log('App URL:', env.appUrl);
    console.groupEnd();
  }
}
