'use client';

/**
 * EJEMPLO: Hooks de usuarios
 * Muestra cómo crear hooks reutilizables para una entidad
 */

import { useQuery } from '@tanstack/react-query';
import {
  useCreateMutation,
  useUpdateMutation,
  useDeleteMutation,
} from '@/hooks/use-standard-mutation';
import { useStandardTable } from '@/hooks/use-standard-table';
import {
  userService,
  type CreateUserDto,
  type UpdateUserDto,
} from '../services/user.service';

// Query keys centralizadas
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) =>
    [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

/**
 * Hook para listar usuarios con filtros de URL
 */
export function useUsers() {
  const { filterParams, ...tableState } = useStandardTable();

  const query = useQuery({
    queryKey: userKeys.list(filterParams),
    queryFn: () => userService.getAll(filterParams),
  });

  return {
    ...query,
    ...tableState,
    filterParams,
  };
}

/**
 * Hook para obtener un usuario por ID
 */
export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => userService.getById(id),
    enabled: !!id,
  });
}

/**
 * Hook para crear usuario
 */
export function useCreateUser() {
  return useCreateMutation<unknown, CreateUserDto>({
    mutationFn: (data) => userService.create(data),
    entityName: 'Usuario',
    invalidateKeys: [userKeys.lists()],
  });
}

/**
 * Hook para actualizar usuario
 */
export function useUpdateUser(id: string) {
  return useUpdateMutation<unknown, UpdateUserDto>({
    mutationFn: (data) => userService.update(id, data),
    entityName: 'Usuario',
    invalidateKeys: [userKeys.lists(), userKeys.detail(id)],
  });
}

/**
 * Hook para eliminar usuario
 */
export function useDeleteUser() {
  return useDeleteMutation<unknown, string>({
    mutationFn: (id) => userService.delete(id),
    entityName: 'Usuario',
    invalidateKeys: [userKeys.lists()],
  });
}
