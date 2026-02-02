'use client';

import { useState, useCallback } from 'react';

// ============================================
// TIPOS
// ============================================

export type ConfirmActionType = 'toggle' | 'delete' | 'custom';

export interface ConfirmActionState<T> {
  isOpen: boolean;
  type: ConfirmActionType;
  item: T | null;
  customData?: Record<string, unknown>;
}

export interface UseConfirmActionOptions {
  /** Callback cuando se confirma toggle (habilitar/deshabilitar) */
  onToggle?: (id: string, currentEnabled: boolean) => void;

  /** Callback cuando se confirma delete */
  onDelete?: (id: string) => void;

  /** Callback generico para acciones custom */
  onCustom?: (id: string, data?: Record<string, unknown>) => void;
}

export interface UseConfirmActionReturn<T extends { id: string }> {
  // Estado
  confirmState: ConfirmActionState<T>;
  isOpen: boolean;

  // Acciones para abrir dialogo
  requestToggle: (item: T) => void;
  requestDelete: (item: T) => void;
  requestCustom: (item: T, customData?: Record<string, unknown>) => void;

  // Acciones para cerrar/confirmar
  cancel: () => void;
  confirm: () => void;

  // Helpers
  getDialogProps: () => {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
  };
}

// ============================================
// ESTADO INICIAL
// ============================================

const initialState = <T>(): ConfirmActionState<T> => ({
  isOpen: false,
  type: 'toggle',
  item: null,
  customData: undefined,
});

// ============================================
// HOOK
// ============================================

/**
 * Hook para manejar dialogos de confirmacion de acciones
 *
 * Simplifica el patron comun de:
 * 1. Usuario hace click en accion (toggle, delete, etc.)
 * 2. Se muestra dialogo de confirmacion
 * 3. Usuario confirma o cancela
 * 4. Se ejecuta la accion
 *
 * @example
 * ```tsx
 * const {
 *   confirmState,
 *   requestToggle,
 *   requestDelete,
 *   cancel,
 *   confirm,
 * } = useConfirmAction({
 *   onToggle: (id, enabled) => toggleStatus.mutate({ id, enable: !enabled }),
 *   onDelete: (id) => deleteItem.mutate(id),
 * });
 *
 * // En el JSX:
 * <Button onClick={() => requestToggle(item)}>Toggle</Button>
 * <Button onClick={() => requestDelete(item)}>Delete</Button>
 *
 * <AlertDialog open={confirmState.isOpen} onOpenChange={(open) => !open && cancel()}>
 *   ...
 *   <AlertDialogAction onClick={confirm}>Confirmar</AlertDialogAction>
 * </AlertDialog>
 * ```
 */
export function useConfirmAction<T extends { id: string; enabled?: boolean; active?: boolean }>({
  onToggle,
  onDelete,
  onCustom,
}: UseConfirmActionOptions): UseConfirmActionReturn<T> {
  const [confirmState, setConfirmState] = useState<ConfirmActionState<T>>(initialState);

  // ============================================
  // REQUEST ACTIONS (abrir dialogo)
  // ============================================

  const requestToggle = useCallback((item: T) => {
    setConfirmState({
      isOpen: true,
      type: 'toggle',
      item,
    });
  }, []);

  const requestDelete = useCallback((item: T) => {
    setConfirmState({
      isOpen: true,
      type: 'delete',
      item,
    });
  }, []);

  const requestCustom = useCallback((item: T, customData?: Record<string, unknown>) => {
    setConfirmState({
      isOpen: true,
      type: 'custom',
      item,
      customData,
    });
  }, []);

  // ============================================
  // CONFIRM/CANCEL ACTIONS
  // ============================================

  const cancel = useCallback(() => {
    setConfirmState(initialState());
  }, []);

  const confirm = useCallback(() => {
    const { item, type, customData } = confirmState;
    if (!item) return;

    switch (type) {
      case 'toggle':
        if (onToggle) {
          // Soporta tanto 'enabled' como 'active'
          const currentEnabled = item.enabled ?? item.active ?? false;
          onToggle(item.id, currentEnabled);
        }
        break;

      case 'delete':
        if (onDelete) {
          onDelete(item.id);
        }
        break;

      case 'custom':
        if (onCustom) {
          onCustom(item.id, customData);
        }
        break;
    }

    setConfirmState(initialState());
  }, [confirmState, onToggle, onDelete, onCustom]);

  // ============================================
  // HELPERS
  // ============================================

  const getDialogProps = useCallback(
    () => ({
      isOpen: confirmState.isOpen,
      onClose: cancel,
      onConfirm: confirm,
    }),
    [confirmState.isOpen, cancel, confirm]
  );

  // ============================================
  // RETURN
  // ============================================

  return {
    confirmState,
    isOpen: confirmState.isOpen,

    requestToggle,
    requestDelete,
    requestCustom,

    cancel,
    confirm,

    getDialogProps,
  };
}

// ============================================
// HELPERS PARA TEXTOS DE DIALOGO
// ============================================

export interface ConfirmDialogTexts {
  title: string;
  description: string;
  confirmText: string;
  isDestructive: boolean;
}

/**
 * Genera textos para el dialogo segun el tipo de accion
 */
export function getConfirmDialogTexts<T extends { enabled?: boolean; active?: boolean }>(
  type: ConfirmActionType,
  item: T | null,
  entityName: string,
  getItemName: (item: T) => string
): ConfirmDialogTexts {
  if (!item) {
    return {
      title: '',
      description: '',
      confirmText: '',
      isDestructive: false,
    };
  }

  const name = getItemName(item);
  const isCurrentlyEnabled = item.enabled ?? item.active ?? false;

  switch (type) {
    case 'toggle':
      if (isCurrentlyEnabled) {
        return {
          title: `¿Deshabilitar ${entityName}?`,
          description: `Esta accion deshabilitara a ${name}. No podra acceder al sistema hasta que sea habilitado nuevamente.`,
          confirmText: 'Deshabilitar',
          isDestructive: true,
        };
      }
      return {
        title: `¿Habilitar ${entityName}?`,
        description: `Esta accion habilitara a ${name}. Podra acceder al sistema nuevamente.`,
        confirmText: 'Habilitar',
        isDestructive: false,
      };

    case 'delete':
      return {
        title: `¿Eliminar ${entityName}?`,
        description: `Esta accion eliminara permanentemente a ${name}. Esta accion no se puede deshacer.`,
        confirmText: 'Eliminar',
        isDestructive: true,
      };

    default:
      return {
        title: 'Confirmar accion',
        description: `¿Estas seguro que deseas continuar con esta accion?`,
        confirmText: 'Confirmar',
        isDestructive: false,
      };
  }
}
