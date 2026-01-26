import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Rutas públicas que no requieren autenticación
 */
const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password'];

/**
 * Rutas de autenticación (redirigir a dashboard si ya está logueado)
 */
const AUTH_ROUTES = ['/login', '/register'];

/**
 * Prefijos de rutas que siempre son públicas
 */
const PUBLIC_PREFIXES = ['/api', '/_next', '/favicon.ico', '/images', '/fonts'];

/**
 * Middleware de autenticación para Next.js 16
 *
 * Flujo:
 * 1. Si es ruta pública/estática → permitir
 * 2. Si no hay token y ruta protegida → redirigir a login
 * 3. Si hay token y ruta de auth → redirigir a dashboard
 * 4. Si hay token y ruta protegida → permitir
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Rutas estáticas y API siempre permitidas
  if (PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  // 2. Obtener token de cookies (más seguro que localStorage para middleware)
  const token = request.cookies.get('access_token')?.value;

  // 3. Es ruta pública?
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
  const isAuthRoute = AUTH_ROUTES.includes(pathname);

  // 4. Usuario no autenticado intentando acceder a ruta protegida
  if (!token && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url);
    // Guardar URL original para redirigir después del login
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 5. Usuario autenticado intentando acceder a rutas de auth (login/register)
  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 6. Permitir acceso
  return NextResponse.next();
}

/**
 * Configuración del matcher
 * Excluye automáticamente archivos estáticos
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
