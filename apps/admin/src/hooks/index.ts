/**
 * =============================================================================
 * HOOKS INDEX
 * =============================================================================
 *
 * Punto de entrada centralizado para todos los hooks de la aplicacion.
 *
 * ARQUITECTURA ACTUAL:
 * Los features (admins, operatives, products) usan el patron de factories
 * (@framework/shared-utils) que genera servicios y hooks automaticamente.
 * Los hooks genericos de esta carpeta complementan ese patron.
 *
 * HOOKS RECOMENDADOS (patron actual):
 * - useDataTable: Para tablas con busqueda, filtro, sort, paginacion
 * - useConfirmAction: Para dialogos de confirmacion de acciones
 * - useDebounce: Para debounce de valores
 */

// =============================================================================
// UTILITIES (uso general)
// =============================================================================

export { useDebounce } from './use-debounce';

// =============================================================================
// TABLAS (patron actual: useDataTable)
// =============================================================================

/**
 * useDataTable - Hook principal para manejo de tablas
 *
 * Encapsula: busqueda, filtrado, ordenamiento, paginacion
 *
 * @example
 * const { items, searchQuery, setSearchQuery, toggleSort } = useDataTable({
 *   data: products,
 *   searchFields: ['name', 'code'],
 *   defaultSort: { field: 'name', direction: 'asc' },
 * });
 */
export {
  useDataTable,
  type SortDirection,
  type SortConfig,
  type UseDataTableOptions,
  type UseDataTableReturn,
} from './use-data-table';

// =============================================================================
// DIALOGOS DE CONFIRMACION (patron actual: useConfirmAction)
// =============================================================================

/**
 * useConfirmAction - Hook para dialogos de confirmacion
 *
 * Maneja el flujo: usuario click -> dialogo -> confirmar/cancelar -> accion
 *
 * @example
 * const { confirmState, requestToggle, cancel, confirm } = useConfirmAction({
 *   onToggle: (id, enabled) => toggleMutation.mutate({ id, enable: !enabled }),
 * });
 */
export {
  useConfirmAction,
  getConfirmDialogTexts,
  type ConfirmActionType,
  type ConfirmActionState,
  type UseConfirmActionReturn,
  type ConfirmDialogTexts,
} from './use-confirm-action';

/**
 * useConfirm - Hook legacy para confirmaciones simples
 * @deprecated Preferir useConfirmAction para nuevos features
 */
export { useConfirm, confirmPresets, type ConfirmState } from './use-confirm';

// =============================================================================
// NOTIFICACIONES
// =============================================================================

export { useNotify, successMessages, errorMessages } from './use-notify';

// =============================================================================
// OTROS HOOKS UTILES
// =============================================================================

// Theme
export { useTheme } from './use-theme';

// Permisos
export { usePermissions, type Permission } from './use-permissions';
