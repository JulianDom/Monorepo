'use client';

import { useQuery } from '@tanstack/react-query';
import { adminService } from '../services/admin.service';
import type { ListParams } from '@/types/api.types';

/**
 * Hook para obtener la lista de administradores
 */
export function useAdmins(params?: ListParams) {
  return useQuery({
    queryKey: ['admins', params],
    queryFn: () => adminService.list(params),
  });
}

/**
 * Hook para obtener un administrador por ID
 */
export function useAdmin(id: string) {
  return useQuery({
    queryKey: ['admins', id],
    queryFn: () => adminService.getById(id),
    enabled: !!id,
  });
}
