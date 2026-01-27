/**
 * Definición centralizada de rutas de la aplicación
 */

export const ROUTES = {
  // Auth
  LOGIN: '/login',
  LOGOUT: '/logout',
  
  // Dashboard
  HOME: '/',
  DASHBOARD: '/dashboard',
  
  // Administradores
  ADMINS: '/dashboard/admins',
  ADMIN_CREATE: '/dashboard/admins/create',
  ADMIN_EDIT: (id: string) => `/dashboard/admins/${id}/edit`,
  
  // Usuarios Operativos
  OPERATIVES: '/dashboard/operatives',
  OPERATIVE_CREATE: '/dashboard/operatives/create',
  OPERATIVE_EDIT: (id: string) => `/dashboard/operatives/${id}/edit`,
  
  // Productos
  PRODUCTS: '/dashboard/products',
  PRODUCT_CREATE: '/dashboard/products/create',
  PRODUCT_EDIT: (id: string) => `/dashboard/products/${id}/edit`,
  PRODUCT_IMPORT: '/dashboard/products/import',
  
  // Locales
  LOCATIONS: '/dashboard/locations',
  LOCATION_CREATE: '/dashboard/locations/create',
  LOCATION_EDIT: (id: string) => `/dashboard/locations/${id}/edit`,
  LOCATION_IMPORT: '/dashboard/locations/import',
  
  // Precios
  PRICES: '/dashboard/prices',
  PRICE_DETAIL: (id: string) => `/dashboard/prices/${id}`,
} as const;

export type Routes = typeof ROUTES;

/**
 * Rutas públicas que no requieren autenticación
 */
export const PUBLIC_ROUTES = [
  ROUTES.LOGIN,
] as const;

/**
 * Rutas protegidas que requieren autenticación
 */
export const PROTECTED_ROUTES = [
  ROUTES.DASHBOARD,
  ROUTES.ADMINS,
  ROUTES.OPERATIVES,
  ROUTES.PRODUCTS,
  ROUTES.LOCATIONS,
  ROUTES.PRICES,
] as const;

/**
 * Navegación del sidebar
 */
export const NAVIGATION = [
  {
    title: 'Administradores',
    href: ROUTES.ADMINS,
    icon: 'ShieldCheck',
    description: 'Gestión de administradores del sistema',
  },
  {
    title: 'Usuarios Operativos',
    href: ROUTES.OPERATIVES,
    icon: 'Users',
    description: 'Gestión de usuarios operativos',
  },
  {
    title: 'Productos',
    href: ROUTES.PRODUCTS,
    icon: 'Package',
    description: 'Catálogo de productos',
  },
  {
    title: 'Locales',
    href: ROUTES.LOCATIONS,
    icon: 'MapPin',
    description: 'Puntos de venta',
  },
  {
    title: 'Visualización de Precios',
    href: ROUTES.PRICES,
    icon: 'DollarSign',
    description: 'Consulta de precios registrados',
  },
] as const;
