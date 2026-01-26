/**
 * Configuración de variables de entorno
 * Todas las variables de entorno deben ser validadas aquí
 */

const getEnvVar = (key: string, defaultValue?: string): string => {
  if (typeof window !== 'undefined') {
    // Cliente
    return (window as any).ENV?.[key] || defaultValue || '';
  }
  // Servidor
  return process.env[key] || defaultValue || '';
};

export const env = {
  // API
  apiUrl: getEnvVar('NEXT_PUBLIC_API_URL', 'http://localhost:3000/api'),
  apiTimeout: parseInt(getEnvVar('NEXT_PUBLIC_API_TIMEOUT', '30000')),
  
  // Auth
  authTokenKey: 'auth_token',
  authUserKey: 'auth_user',
  
  // App
  appName: 'Sistema de Relevamiento de Precios',
  appVersion: '1.0.0',
  
  // Features
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
} as const;

export type Env = typeof env;
