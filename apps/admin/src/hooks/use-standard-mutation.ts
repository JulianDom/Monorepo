'use client';

import { useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { ApiError } from '@/types/api.types';

export interface StandardMutationOptions<TData, TVariables> extends Omit<UseMutationOptions<TData, ApiError, TVariables>, 'mutationFn'> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  successMessage?: string;
  errorMessage?: string;
  invalidateQueries?: string[];
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
}

/**
 * Hook para mutaciones estandarizadas con toast automático
 * Incluye manejo de errores, mensajes de éxito y invalidación de queries
 */
export function useStandardMutation<TData = any, TVariables = any>(
  options: StandardMutationOptions<TData, TVariables>
) {
  const queryClient = useQueryClient();
  
  const {
    mutationFn,
    successMessage,
    errorMessage,
    invalidateQueries = [],
    showSuccessToast = true,
    showErrorToast = true,
    onSuccess,
    onError,
    ...restOptions
  } = options;

  return useMutation<TData, ApiError, TVariables>({
    mutationFn,
    onSuccess: (data, variables, context) => {
      // Mostrar toast de éxito
      if (showSuccessToast && successMessage) {
        toast.success(successMessage);
      }

      // Invalidar queries relacionadas
      if (invalidateQueries.length > 0) {
        invalidateQueries.forEach(queryKey => {
          queryClient.invalidateQueries({ queryKey: [queryKey] });
        });
      }

      // Callback personalizado
      onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      // Mostrar toast de error
      if (showErrorToast) {
        const message = errorMessage || error.message || 'Ocurrió un error';
        toast.error(message);
        
        // Mostrar errores de validación si existen
        if (error.errors) {
          Object.entries(error.errors).forEach(([field, messages]) => {
            messages.forEach(msg => {
              toast.error(`${field}: ${msg}`);
            });
          });
        }
      }

      // Callback personalizado
      onError?.(error, variables, context);
    },
    ...restOptions,
  });
}

/**
 * Ejemplo de uso:
 * 
 * const createUser = useStandardMutation({
 *   mutationFn: (data) => userService.create(data),
 *   successMessage: 'Usuario creado exitosamente',
 *   errorMessage: 'Error al crear usuario',
 *   invalidateQueries: ['users'],
 *   onSuccess: () => {
 *     router.push('/users');
 *   }
 * });
 * 
 * // En el componente
 * <form onSubmit={(e) => {
 *   e.preventDefault();
 *   createUser.mutate(formData);
 * }}>
 */
