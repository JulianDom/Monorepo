/**
 * =============================================================================
 * AUTH PROVIDER
 * =============================================================================
 *
 * Maneja el estado de autenticación de la aplicación.
 *
 * =============================================================================
 * ESTRATEGIA DE ALMACENAMIENTO
 * =============================================================================
 *
 * Usamos DOS mecanismos de almacenamiento por razones técnicas específicas:
 *
 * 1. localStorage (cliente):
 *    - access_token: Token JWT para autenticación
 *    - refresh_token: Token para renovar sesión
 *    - user: Datos del usuario logueado (JSON)
 *
 *    RAZÓN: localStorage es accesible solo en el cliente (browser).
 *    El apiClient lee el token de aquí para agregar el header Authorization.
 *
 * 2. Cookie (servidor + cliente):
 *    - access_token: Copia del token JWT
 *
 *    RAZÓN: El middleware de Next.js corre en el SERVIDOR y no puede
 *    leer localStorage. Necesita la cookie para validar autenticación
 *    antes de renderizar la página.
 *
 * FLUJO:
 * ```
 * Login → localStorage (token, user) + Cookie (token)
 *                ↓
 *         Cliente: apiClient lee localStorage para requests
 *         Servidor: middleware lee cookie para proteger rutas
 * ```
 *
 * ¿POR QUÉ NO USAR SOLO COOKIES?
 * - httpOnly cookies serían más seguras pero requieren que el servidor
 *   las establezca (no el cliente)
 * - Nuestra API devuelve tokens en el body, no en Set-Cookie headers
 * - Cambiar requeriría modificar el backend
 *
 * ¿POR QUÉ NO USAR SOLO LOCALSTORAGE?
 * - El middleware de Next.js no puede leerlo (corre en servidor)
 * - Sin middleware, las páginas protegidas harían flash de contenido
 *
 * =============================================================================
 * PROBLEMA RESUELTO: Pantalla en blanco al inicio
 * =============================================================================
 *
 * Esto ocurría cuando había una cookie `access_token` pero no había datos
 * en localStorage (por ejemplo, después de limpiar datos del navegador).
 * El middleware veía la cookie y permitía acceso, pero el AuthProvider
 * no tenía datos y mostraba pantalla en blanco.
 *
 * SOLUCIÓN: Verificar consistencia entre cookie y localStorage al cargar.
 * Si hay inconsistencia, limpiar todo y redirigir a login.
 *
 * =============================================================================
 * NOTA SOBRE sidebar.tsx (shadcn/ui)
 * =============================================================================
 *
 * El componente Sidebar de shadcn/ui usa una cookie separada (sidebar_state)
 * para guardar si está colapsado/expandido. Esto NO es para autenticación,
 * es para que el servidor pueda renderizar el estado correcto del sidebar
 * sin flash de contenido (SSR optimization). Es un patrón diferente.
 */
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { env, ROUTES, ENDPOINTS } from '@/config';
import { apiClient } from '@/lib';
import type {
  User,
  LoginCredentials,
  AuthContextValue,
  AuthResponse,
  LoginPayload,
} from '@/types/auth.types';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Sincroniza el token con una cookie para que el middleware pueda leerlo
 * Las cookies son accesibles en el servidor (middleware), localStorage no.
 */
function syncTokenCookie(token: string | null) {
  if (typeof document === 'undefined') return; // Guard para SSR

  if (token) {
    // Cookie válida por 30 días
    document.cookie = `access_token=${token}; path=/; max-age=2592000; samesite=lax`;
  } else {
    // Eliminar cookie
    document.cookie = 'access_token=; path=/; max-age=0';
  }
}

/**
 * Lee el valor de una cookie por nombre
 */
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null; // Guard para SSR

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() ?? null;
  }
  return null;
}

/**
 * Limpia todo el estado de autenticación (localStorage + cookie)
 */
function clearAuthState() {
  localStorage.removeItem(env.authTokenKey);
  localStorage.removeItem(env.authRefreshTokenKey);
  localStorage.removeItem(env.authUserKey);
  syncTokenCookie(null);
}

/**
 * Convierte Actor de la API a User local
 */
function actorToUser(actor: AuthResponse['actor']): User {
  return {
    ...actor,
    lastLogin: new Date().toISOString(),
  };
}

// =============================================================================
// PROVIDER
// =============================================================================

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // =========================================================================
  // INICIALIZACIÓN: Cargar estado desde localStorage
  // =========================================================================
  useEffect(() => {
    const initAuth = () => {
      const storedToken = localStorage.getItem(env.authTokenKey);
      const storedUser = localStorage.getItem(env.authUserKey);
      const cookieToken = getCookie('access_token');

      // -----------------------------------------------------------------
      // CASO 1: Hay token y user en localStorage → sesión válida
      // -----------------------------------------------------------------
      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setToken(storedToken);
          setUser(parsedUser);

          // Asegurar que la cookie esté sincronizada
          if (cookieToken !== storedToken) {
            syncTokenCookie(storedToken);
          }

          setIsLoading(false);
          return;
        } catch {
          // Error al parsear JSON → datos corruptos → limpiar
          console.warn('[Auth] Error parsing stored user, clearing auth state');
          clearAuthState();
        }
      }

      // -----------------------------------------------------------------
      // CASO 2: Hay cookie pero NO hay localStorage → INCONSISTENCIA
      // Este es el bug de "pantalla en blanco"
      // El middleware permite acceso pero no hay datos para la app
      // -----------------------------------------------------------------
      if (cookieToken && (!storedToken || !storedUser)) {
        console.warn('[Auth] Cookie exists but localStorage is empty - clearing stale cookie');
        clearAuthState();

        // Si estamos en una ruta protegida, redirigir a login
        // Esto evita la "pantalla en blanco"
        if (pathname?.startsWith('/dashboard')) {
          router.replace(ROUTES.LOGIN);
        }

        setIsLoading(false);
        return;
      }

      // -----------------------------------------------------------------
      // CASO 3: No hay nada → estado inicial limpio
      // -----------------------------------------------------------------
      setIsLoading(false);
    };

    initAuth();
  }, [pathname, router]);

  // =========================================================================
  // LOGIN
  // =========================================================================
  const login = async (credentials: LoginCredentials) => {
    const payload: LoginPayload = {
      ...credentials,
      actorType: 'ADMIN',
    };

    const response = await apiClient.post<AuthResponse>(ENDPOINTS.AUTH.LOGIN, payload);
    const { actor, accessToken, refreshToken } = response;

    // Convertir y guardar
    const userFromApi = actorToUser(actor);

    localStorage.setItem(env.authTokenKey, accessToken);
    localStorage.setItem(env.authRefreshTokenKey, refreshToken);
    localStorage.setItem(env.authUserKey, JSON.stringify(userFromApi));
    syncTokenCookie(accessToken);

    setToken(accessToken);
    setUser(userFromApi);

    router.push(ROUTES.DASHBOARD);
  };

  // =========================================================================
  // LOGOUT
  // =========================================================================
  const logout = async () => {
    try {
      await apiClient.post(ENDPOINTS.AUTH.LOGOUT, { allSessions: false });
    } catch {
      // Ignorar errores (token expirado, etc.)
    } finally {
      clearAuthState();
      setToken(null);
      setUser(null);
      router.push(ROUTES.LOGIN);
    }
  };

  // =========================================================================
  // UPDATE USER
  // =========================================================================
  const updateUser = (updates: Partial<User>) => {
    if (!user) return;

    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem(env.authUserKey, JSON.stringify(updatedUser));
  };

  // =========================================================================
  // CONTEXT VALUE
  // =========================================================================
  const value: AuthContextValue = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// =============================================================================
// HOOK
// =============================================================================

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }

  return context;
}
