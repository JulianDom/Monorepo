'use client';

import { useCallback, useMemo } from 'react';
import { useAuth } from '@/providers/auth-provider';

/**
 * Formato de permisos: "resource:action"
 * Ejemplos: "users:read", "users:create", "users:delete", "reports:export"
 */
type Permission = string;

/**
 * Roles predefinidos (extender según necesidad)
 */
export type Role = 'admin' | 'editor' | 'viewer' | string;

/**
 * Mapeo de roles a permisos
 * Configurar según la lógica de tu aplicación
 */
const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  admin: ['*'], // Todos los permisos
  editor: [
    'users:read',
    'users:create',
    'users:update',
    'products:read',
    'products:create',
    'products:update',
    'products:delete',
    'orders:read',
    'orders:update',
  ],
  viewer: [
    'users:read',
    'products:read',
    'orders:read',
    'reports:read',
  ],
};

/**
 * Hook para verificar permisos del usuario
 *
 * @example
 * ```tsx
 * function UserActions() {
 *   const { can, canAny, canAll } = usePermissions();
 *
 *   return (
 *     <div>
 *       {can('users:create') && <Button>Crear Usuario</Button>}
 *       {can('users:delete') && <Button variant="destructive">Eliminar</Button>}
 *     </div>
 *   );
 * }
 * ```
 */
export function usePermissions() {
  const { user, isAuthenticated } = useAuth();

  // Permisos del usuario (del servidor o derivados del rol)
  const userPermissions = useMemo(() => {
    if (!user) return [];

    // Si el usuario tiene permisos explícitos, usarlos
    if (user.permissions && user.permissions.length > 0) {
      return user.permissions;
    }

    // Si no, derivar del rol
    return ROLE_PERMISSIONS[user.role] || [];
  }, [user]);

  /**
   * Verificar si tiene un permiso específico
   */
  const can = useCallback(
    (permission: Permission): boolean => {
      if (!isAuthenticated || !user) return false;

      // Admin tiene todos los permisos
      if (userPermissions.includes('*')) return true;

      // Verificar permiso específico
      return userPermissions.includes(permission);
    },
    [isAuthenticated, user, userPermissions]
  );

  /**
   * Verificar si tiene al menos uno de los permisos
   */
  const canAny = useCallback(
    (permissions: Permission[]): boolean => {
      return permissions.some((p) => can(p));
    },
    [can]
  );

  /**
   * Verificar si tiene todos los permisos
   */
  const canAll = useCallback(
    (permissions: Permission[]): boolean => {
      return permissions.every((p) => can(p));
    },
    [can]
  );

  /**
   * Verificar si tiene un rol específico
   */
  const hasRole = useCallback(
    (role: Role): boolean => {
      if (!user) return false;
      return user.role === role;
    },
    [user]
  );

  /**
   * Verificar si tiene alguno de los roles
   */
  const hasAnyRole = useCallback(
    (roles: Role[]): boolean => {
      if (!user) return false;
      return roles.includes(user.role);
    },
    [user]
  );

  /**
   * Verificar si es admin
   */
  const isAdmin = useMemo(() => {
    return user?.role === 'admin' || userPermissions.includes('*');
  }, [user, userPermissions]);

  return {
    can,
    canAny,
    canAll,
    hasRole,
    hasAnyRole,
    isAdmin,
    permissions: userPermissions,
    role: user?.role,
  };
}
