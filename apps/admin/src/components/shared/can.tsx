'use client';

import { type ReactNode } from 'react';
import { usePermissions } from '@/hooks/use-permissions';

interface CanProps {
  /** Permiso requerido (ej: "users:create") */
  permission?: string;
  /** Lista de permisos (requiere al menos uno) */
  permissions?: string[];
  /** Requerir todos los permisos (default: false = al menos uno) */
  requireAll?: boolean;
  /** Rol requerido */
  role?: string;
  /** Lista de roles (requiere al menos uno) */
  roles?: string[];
  /** Contenido a mostrar si tiene permiso */
  children: ReactNode;
  /** Contenido alternativo si no tiene permiso */
  fallback?: ReactNode;
}

/**
 * Componente para renderizado condicional basado en permisos
 *
 * @example
 * ```tsx
 * // Permiso único
 * <Can permission="users:create">
 *   <Button>Crear Usuario</Button>
 * </Can>
 *
 * // Múltiples permisos (al menos uno)
 * <Can permissions={['users:update', 'users:delete']}>
 *   <ActionsMenu />
 * </Can>
 *
 * // Todos los permisos requeridos
 * <Can permissions={['reports:read', 'reports:export']} requireAll>
 *   <ExportButton />
 * </Can>
 *
 * // Por rol
 * <Can role="admin">
 *   <AdminPanel />
 * </Can>
 *
 * // Con fallback
 * <Can permission="users:delete" fallback={<DisabledButton />}>
 *   <DeleteButton />
 * </Can>
 * ```
 */
export function Can({
  permission,
  permissions,
  requireAll = false,
  role,
  roles,
  children,
  fallback = null,
}: CanProps) {
  const { can, canAny, canAll, hasRole, hasAnyRole } = usePermissions();

  let hasAccess = false;

  // Verificar por rol
  if (role) {
    hasAccess = hasRole(role);
  } else if (roles && roles.length > 0) {
    hasAccess = hasAnyRole(roles);
  }
  // Verificar por permiso
  else if (permission) {
    hasAccess = can(permission);
  } else if (permissions && permissions.length > 0) {
    hasAccess = requireAll ? canAll(permissions) : canAny(permissions);
  } else {
    // Sin restricciones, mostrar siempre
    hasAccess = true;
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}

/**
 * Componente inverso - muestra solo si NO tiene el permiso
 */
export function Cannot({
  permission,
  permissions,
  requireAll = false,
  role,
  roles,
  children,
}: Omit<CanProps, 'fallback'>) {
  return (
    <Can
      permission={permission}
      permissions={permissions}
      requireAll={requireAll}
      role={role}
      roles={roles}
      fallback={children}
    >
      {null}
    </Can>
  );
}
