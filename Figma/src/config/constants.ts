/**
 * Constantes globales de la aplicación
 */

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const;

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

export const TOAST_DURATION = {
  SUCCESS: 3000,
  ERROR: 5000,
  INFO: 4000,
} as const;

export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 6,
  MIN_NAME_LENGTH: 3,
  MAX_NAME_LENGTH: 100,
  MAX_EMAIL_LENGTH: 255,
  PHONE_PATTERN: /^\+?[0-9\s\-()]+$/,
} as const;

export const DATE_FORMATS = {
  DISPLAY: 'DD/MM/YYYY',
  DISPLAY_TIME: 'DD/MM/YYYY HH:mm',
  API: 'YYYY-MM-DD',
  API_TIME: 'YYYY-MM-DD HH:mm:ss',
} as const;
