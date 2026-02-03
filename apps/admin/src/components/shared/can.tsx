'use client';

import { ReactNode } from 'react';
import { usePermissions, Permission } from '@/hooks/use-permissions';

interface CanProps {
  permission: Permission | Permission[];
  fallback?: ReactNode;
  children: ReactNode;
  requireAll?: boolean;
}

/**
 * Componente para control de permisos
 * Renderiza children solo si el usuario tiene los permisos necesarios
 */
export function Can({ permission, fallback = null, children, requireAll = false }: CanProps) {
  const { can, canAny, canAll } = usePermissions();

  const hasPermission = Array.isArray(permission)
    ? requireAll
      ? canAll(permission)
      : canAny(permission)
    : can(permission);

  return <>{hasPermission ? children : fallback}</>;
}

/**
 * Componente inverso de Can
 * Renderiza children solo si el usuario NO tiene los permisos
 */
export function Cannot({ permission, fallback = null, children, requireAll = false }: CanProps) {
  const { can, canAny, canAll } = usePermissions();

  const hasPermission = Array.isArray(permission)
    ? requireAll
      ? canAll(permission)
      : canAny(permission)
    : can(permission);

  return <>{!hasPermission ? children : fallback}</>;
}

/**
 * Ejemplo de uso:
 * 
 * // Renderizar solo para admins
 * <Can permission="admin">
 *   <AdminPanel />
 * </Can>
 * 
 * // Renderizar para usuarios con alguno de estos permisos
 * <Can permission={['user-admin', 'content-admin']}>
 *   <ManagementPanel />
 * </Can>
 * 
 * // Renderizar con fallback
 * <Can permission="admin" fallback={<NoPermission />}>
 *   <AdminPanel />
 * </Can>
 * 
 * // Requerir todos los permisos
 * <Can permission={['admin', 'user-admin']} requireAll>
 *   <SuperAdminPanel />
 * </Can>
 */
