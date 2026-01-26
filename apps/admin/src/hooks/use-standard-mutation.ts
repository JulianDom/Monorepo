'use client';

import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from '@tanstack/react-query';
import { type AxiosError } from 'axios';
import { toast } from 'sonner';
import type { ApiErrorResponse } from '@/types';

type MutationOperation = 'create' | 'update' | 'delete' | 'custom';

interface StandardMutationOptions<TData, TVariables> {
  /** Función que ejecuta la mutación */
  mutationFn: (variables: TVariables) => Promise<TData>;

  /** Tipo de operación para mensajes automáticos */
  operation?: MutationOperation;

  /** Nombre de la entidad para mensajes (ej: "Usuario") */
  entityName?: string;

  /** Query keys a invalidar después del éxito */
  invalidateKeys?: unknown[][];

  /** Mensaje de éxito personalizado */
  successMessage?: string;

  /** Mensaje de error personalizado */
  errorMessage?: string;

  /** Mostrar toast de éxito (default: true) */
  showSuccessToast?: boolean;

  /** Mostrar toast de error (default: true - ya lo maneja el interceptor) */
  showErrorToast?: boolean;

  /** Callbacks adicionales */
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: AxiosError<ApiErrorResponse>, variables: TVariables) => void;
}

/**
 * Hook estandarizado para mutaciones (POST, PUT, DELETE)
 * Maneja automáticamente:
 * - Toasts de éxito/error
 * - Invalidación de queries
 * - Mensajes según tipo de operación
 *
 * @example
 * ```tsx
 * const createUser = useStandardMutation({
 *   mutationFn: (data) => apiClient.post('/users', data),
 *   operation: 'create',
 *   entityName: 'Usuario',
 *   invalidateKeys: [['users']],
 * });
 *
 * createUser.mutate({ name: 'John' });
 * ```
 */
export function useStandardMutation<TData = unknown, TVariables = unknown>({
  mutationFn,
  operation = 'custom',
  entityName = 'Registro',
  invalidateKeys = [],
  successMessage,
  errorMessage,
  showSuccessToast = true,
  showErrorToast = false, // El interceptor ya maneja errores
  onSuccess,
  onError,
}: StandardMutationOptions<TData, TVariables>) {
  const queryClient = useQueryClient();

  // Generar mensaje de éxito según operación
  const getSuccessMessage = (): string => {
    if (successMessage) return successMessage;

    switch (operation) {
      case 'create':
        return `${entityName} creado correctamente`;
      case 'update':
        return `${entityName} actualizado correctamente`;
      case 'delete':
        return `${entityName} eliminado correctamente`;
      default:
        return 'Operación realizada correctamente';
    }
  };

  const mutation = useMutation<TData, AxiosError<ApiErrorResponse>, TVariables>(
    {
      mutationFn,
      onSuccess: (data, variables) => {
        // Toast de éxito
        if (showSuccessToast) {
          toast.success(getSuccessMessage());
        }

        // Invalidar queries relacionadas
        invalidateKeys.forEach((key) => {
          queryClient.invalidateQueries({ queryKey: key });
        });

        // Callback personalizado
        onSuccess?.(data, variables);
      },
      onError: (error, variables) => {
        // Toast de error (solo si no lo maneja el interceptor)
        if (showErrorToast) {
          const message =
            errorMessage ||
            error.response?.data?.error?.message ||
            'Ha ocurrido un error';
          toast.error(message);
        }

        // Callback personalizado
        onError?.(error, variables);
      },
    }
  );

  return mutation;
}

/**
 * Hook para crear un registro
 */
export function useCreateMutation<TData = unknown, TVariables = unknown>(
  options: Omit<StandardMutationOptions<TData, TVariables>, 'operation'>
) {
  return useStandardMutation({ ...options, operation: 'create' });
}

/**
 * Hook para actualizar un registro
 */
export function useUpdateMutation<TData = unknown, TVariables = unknown>(
  options: Omit<StandardMutationOptions<TData, TVariables>, 'operation'>
) {
  return useStandardMutation({ ...options, operation: 'update' });
}

/**
 * Hook para eliminar un registro
 */
export function useDeleteMutation<TData = unknown, TVariables = unknown>(
  options: Omit<StandardMutationOptions<TData, TVariables>, 'operation'>
) {
  return useStandardMutation({ ...options, operation: 'delete' });
}
