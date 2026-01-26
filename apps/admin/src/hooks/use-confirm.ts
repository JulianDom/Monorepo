'use client';

import { useState, useCallback } from 'react';

export interface ConfirmOptions {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
}

export interface ConfirmState extends ConfirmOptions {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const defaultOptions: ConfirmOptions = {
  title: '¿Estás seguro?',
  description: 'Esta acción no se puede deshacer.',
  confirmText: 'Confirmar',
  cancelText: 'Cancelar',
  variant: 'default',
};

/**
 * Hook para diálogos de confirmación
 *
 * @example
 * ```tsx
 * const { confirm, confirmState, ConfirmDialog } = useConfirm();
 *
 * const handleDelete = async () => {
 *   const confirmed = await confirm({
 *     title: '¿Eliminar usuario?',
 *     description: 'El usuario será eliminado permanentemente.',
 *     variant: 'destructive',
 *   });
 *
 *   if (confirmed) {
 *     deleteUser.mutate(userId);
 *   }
 * };
 *
 * return (
 *   <>
 *     <button onClick={handleDelete}>Eliminar</button>
 *     <ConfirmDialog {...confirmState} />
 *   </>
 * );
 * ```
 */
export function useConfirm() {
  const [confirmState, setConfirmState] = useState<ConfirmState>({
    ...defaultOptions,
    isOpen: false,
    onConfirm: () => {},
    onCancel: () => {},
  });

  const confirm = useCallback(
    (options: ConfirmOptions = {}): Promise<boolean> => {
      return new Promise((resolve) => {
        setConfirmState({
          ...defaultOptions,
          ...options,
          isOpen: true,
          onConfirm: () => {
            setConfirmState((prev) => ({ ...prev, isOpen: false }));
            resolve(true);
          },
          onCancel: () => {
            setConfirmState((prev) => ({ ...prev, isOpen: false }));
            resolve(false);
          },
        });
      });
    },
    []
  );

  const closeConfirm = useCallback(() => {
    setConfirmState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  return {
    confirm,
    confirmState,
    closeConfirm,
  };
}

/**
 * Presets de confirmación comunes
 */
export const confirmPresets = {
  delete: (entityName: string): ConfirmOptions => ({
    title: `¿Eliminar ${entityName}?`,
    description: `El ${entityName.toLowerCase()} será eliminado permanentemente. Esta acción no se puede deshacer.`,
    confirmText: 'Eliminar',
    cancelText: 'Cancelar',
    variant: 'destructive',
  }),

  unsavedChanges: (): ConfirmOptions => ({
    title: '¿Descartar cambios?',
    description: 'Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?',
    confirmText: 'Descartar',
    cancelText: 'Seguir editando',
    variant: 'destructive',
  }),

  logout: (): ConfirmOptions => ({
    title: '¿Cerrar sesión?',
    description: 'Serás redirigido a la página de inicio de sesión.',
    confirmText: 'Cerrar sesión',
    cancelText: 'Cancelar',
    variant: 'default',
  }),
};
