'use client';

import { useRouter } from 'next/navigation';
import { useStandardMutation } from '@/hooks/use-standard-mutation';
import { adminService } from '../services/admin.service';
import { ROUTES } from '@/config';
import type { CreateAdminDTO, UpdateAdminDTO } from '../types';

/**
 * Hook para crear un administrador
 */
export function useCreateAdmin() {
  const router = useRouter();
  
  return useStandardMutation({
    mutationFn: (data: CreateAdminDTO) => adminService.create(data),
    successMessage: 'Administrador creado exitosamente',
    errorMessage: 'Error al crear el administrador',
    invalidateQueries: ['admins'],
    onSuccess: () => {
      router.push(ROUTES.ADMINS);
    },
  });
}

/**
 * Hook para actualizar un administrador
 */
export function useUpdateAdmin() {
  const router = useRouter();
  
  return useStandardMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAdminDTO }) =>
      adminService.update(id, data),
    successMessage: 'Administrador actualizado exitosamente',
    errorMessage: 'Error al actualizar el administrador',
    invalidateQueries: ['admins'],
    onSuccess: () => {
      router.push(ROUTES.ADMINS);
    },
  });
}

/**
 * Hook para eliminar un administrador
 */
export function useDeleteAdmin() {
  return useStandardMutation({
    mutationFn: (id: string) => adminService.delete(id),
    successMessage: 'Administrador eliminado exitosamente',
    errorMessage: 'Error al eliminar el administrador',
    invalidateQueries: ['admins'],
  });
}

/**
 * Hook para cambiar el estado de un administrador
 */
export function useToggleAdminStatus() {
  return useStandardMutation({
    mutationFn: (id: string) => adminService.update(id, { isActive: undefined } as any),
    successMessage: 'Estado actualizado exitosamente',
    errorMessage: 'Error al cambiar el estado',
    invalidateQueries: ['admins'],
  });
}
