'use client';

import { toast } from 'sonner';
import { useCallback } from 'react';

interface NotifyOptions {
  description?: string;
  duration?: number;
}

/**
 * Hook estandarizado para notificaciones
 * Centraliza todos los toasts de la aplicación
 *
 * @example
 * ```tsx
 * const { notify } = useNotify();
 *
 * notify.success('Usuario creado');
 * notify.error('No se pudo guardar');
 * notify.info('Procesando...');
 * ```
 */
export function useNotify() {
  const success = useCallback(
    (message: string, options?: NotifyOptions) => {
      toast.success(message, {
        description: options?.description,
        duration: options?.duration ?? 3000,
      });
    },
    []
  );

  const error = useCallback(
    (message: string, options?: NotifyOptions) => {
      toast.error(message, {
        description: options?.description,
        duration: options?.duration ?? 5000,
      });
    },
    []
  );

  const warning = useCallback(
    (message: string, options?: NotifyOptions) => {
      toast.warning(message, {
        description: options?.description,
        duration: options?.duration ?? 4000,
      });
    },
    []
  );

  const info = useCallback(
    (message: string, options?: NotifyOptions) => {
      toast.info(message, {
        description: options?.description,
        duration: options?.duration ?? 3000,
      });
    },
    []
  );

  const promise = useCallback(
    <T,>(
      promiseFn: Promise<T>,
      messages: {
        loading: string;
        success: string;
        error: string;
      }
    ) => {
      return toast.promise(promiseFn, messages);
    },
    []
  );

  return {
    notify: {
      success,
      error,
      warning,
      info,
      promise,
    },
  };
}

/**
 * Mensajes de éxito estandarizados por operación
 */
export const successMessages = {
  created: (entity: string) => `${entity} creado correctamente`,
  updated: (entity: string) => `${entity} actualizado correctamente`,
  deleted: (entity: string) => `${entity} eliminado correctamente`,
  saved: (entity: string) => `${entity} guardado correctamente`,
} as const;

/**
 * Mensajes de error estandarizados
 */
export const errorMessages = {
  generic: 'Ha ocurrido un error inesperado',
  network: 'Error de conexión. Verifica tu internet.',
  notFound: (entity: string) => `${entity} no encontrado`,
  unauthorized: 'No tienes permisos para esta acción',
  validation: 'Por favor, revisa los campos del formulario',
} as const;
