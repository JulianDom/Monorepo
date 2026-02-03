'use client';

import { useAuth } from '@/providers/auth-provider';
import { ROLES } from '@/config/constants';

export type Permission = 'admin' | 'user-admin' | 'content-admin' | 'reports-admin' | 'config-admin' | 'operative';

const rolePermissions: Record<string, Permission[]> = {
  [ROLES.ADMIN]: ['admin', 'user-admin', 'content-admin', 'reports-admin', 'config-admin'],
  [ROLES.USER_ADMIN]: ['user-admin'],
  [ROLES.CONTENT_ADMIN]: ['content-admin'],
  [ROLES.REPORTS_ADMIN]: ['reports-admin'],
  [ROLES.CONFIG_ADMIN]: ['config-admin'],
  [ROLES.OPERATIVE]: ['operative'],
};

/**
 * Hook para control de permisos basado en roles (RBAC)
 */
export function usePermissions() {
  const { user } = useAuth();

  /**
   * Verifica si el usuario tiene un permiso específico
   */
  const can = (permission: Permission): boolean => {
    if (!user || !user.role) return false;

    const userPermissions = rolePermissions[user.role] || [];
    return userPermissions.includes(permission);
  };

  /**
   * Verifica si el usuario tiene alguno de los permisos
   */
  const canAny = (permissions: Permission[]): boolean => {
    return permissions.some(permission => can(permission));
  };

  /**
   * Verifica si el usuario tiene todos los permisos
   */
  const canAll = (permissions: Permission[]): boolean => {
    return permissions.every(permission => can(permission));
  };

  /**
   * Verifica si el usuario es administrador
   */
  const isAdmin = (): boolean => {
    return can('admin');
  };

  /**
   * Verifica si el usuario es operativo
   */
  const isOperative = (): boolean => {
    return can('operative');
  };

  return {
    can,
    canAny,
    canAll,
    isAdmin,
    isOperative,
  };
}

/**
 * Ejemplo de uso:
 * 
 * function AdminPanel() {
 *   const { can, isAdmin } = usePermissions();
 * 
 *   if (!isAdmin()) {
 *     return <div>No tienes permisos para ver esta página</div>;
 *   }
 * 
 *   return (
 *     <div>
 *       {can('user-admin') && <UserManagement />}
 *       {can('content-admin') && <ContentManagement />}
 *     </div>
 *   );
 * }
 */
