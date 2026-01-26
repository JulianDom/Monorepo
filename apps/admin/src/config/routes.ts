/**
 * Configuración centralizada de rutas
 * Usado por middleware y navegación
 */

export const routes = {
  // Auth
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',

  // App
  home: '/',
  dashboard: '/dashboard',

  // Entities (ejemplo)
  users: {
    list: '/users',
    create: '/users/create',
    edit: (id: string) => `/users/${id}/edit`,
    detail: (id: string) => `/users/${id}`,
  },
} as const;

/**
 * Rutas que no requieren autenticación
 */
export const publicRoutes: string[] = [
  routes.login,
  routes.register,
  routes.forgotPassword,
  routes.resetPassword,
];

/**
 * Rutas de autenticación (redirigen a dashboard si ya está logueado)
 */
export const authRoutes: string[] = [routes.login, routes.register];

/**
 * Ruta por defecto después del login
 */
export const DEFAULT_LOGIN_REDIRECT = routes.dashboard;

/**
 * Ruta de login
 */
export const LOGIN_ROUTE = routes.login;
