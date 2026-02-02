/**
 * Constantes globales de la aplicación
 * Centraliza valores que se usan en múltiples lugares
 */

// ============================================
// APP
// ============================================
export const APP = {
  NAME: 'Admin Panel',
  DESCRIPTION: 'Panel de administración',
  VERSION: '1.0.0',
} as const;

// ============================================
// PAGINATION
// ============================================
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  LIMITS: [10, 25, 50, 100] as const,
  MAX_LIMIT: 100,
} as const;

// ============================================
// AUTH
// ============================================
export const AUTH = {
  TOKEN_KEY: 'access_token',
  REFRESH_TOKEN_KEY: 'refresh_token',
  USER_KEY: 'user',
  /** Tiempo antes de expiración para refrescar (5 min) */
  REFRESH_THRESHOLD_MS: 5 * 60 * 1000,
} as const;

// ============================================
// HTTP
// ============================================
export const HTTP = {
  TIMEOUT: 30000, // 30 segundos
  RETRY_ATTEMPTS: 1,
} as const;

// ============================================
// UI
// ============================================
export const UI = {
  DEBOUNCE_MS: 300,
  TOAST_DURATION: {
    SUCCESS: 3000,
    ERROR: 5000,
    WARNING: 4000,
    INFO: 3000,
  },
  ANIMATION_DURATION: 200,
} as const;

// ============================================
// ROUTES
// ============================================
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  // Agregar más rutas según necesidad
} as const;

// ============================================
// API ENDPOINTS (relativos a baseURL)
// ============================================
export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
  },
  USERS: '/users',
  ADMINS: '/administrators',
  PRODUCTS: '/products',
  STORES: '/stores',
  OPERATIVE_USERS: '/operative-users',
  PRICE_RECORDS: '/price-records',
  
  // Agregar más endpoints según necesidad
} as const;

// ============================================
// STORAGE KEYS
// ============================================
export const STORAGE_KEYS = {
  THEME: 'theme',
  SIDEBAR_COLLAPSED: 'sidebar_collapsed',
  TABLE_PAGE_SIZE: 'table_page_size',
} as const;

// ============================================
// DATE FORMATS
// ============================================
export const DATE_FORMATS = {
  DISPLAY: 'dd/MM/yyyy',
  DISPLAY_TIME: 'dd/MM/yyyy HH:mm',
  API: "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
  INPUT: 'yyyy-MM-dd',
} as const;

// ============================================
// ROLES
// ============================================
export const ROLES = {
  ADMIN: 'Administrador General',
  USER_ADMIN: 'Administrador de Usuarios',
  CONTENT_ADMIN: 'Administrador de Contenido',
  REPORTS_ADMIN: 'Administrador de Reportes',
  CONFIG_ADMIN: 'Administrador de Configuración',
  OPERATIVE: 'Operativo',
} as const;

export const ADMIN_ROLES = [
  ROLES.ADMIN,
  ROLES.USER_ADMIN,
  ROLES.CONTENT_ADMIN,
  ROLES.REPORTS_ADMIN,
  ROLES.CONFIG_ADMIN,
] as const;

// ============================================
// USER STATUS
// ============================================
export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
} as const;

export const FILTER_STATUS = {
  ALL: 'all',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  ENABLED: 'habilitado',
  DISABLED: 'deshabilitado',
} as const;

// ============================================
// VALIDATION
// ============================================
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 6,
  MIN_NAME_LENGTH: 3,
  MAX_NAME_LENGTH: 100,
  MAX_EMAIL_LENGTH: 255,
  PHONE_PATTERN: /^\+?[0-9\s\-()]+$/,
} as const;
