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
 *
 * HOOKS LEGACY (solo en _example/, no usar en nuevos features):
 * - useStandardTable: Reemplazado por useDataTable
 * - useStandardMutation: Reemplazado por factories (createCrudHooksWithStatus)
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

/**
 * @deprecated Usar useDataTable en su lugar
 * Solo se mantiene por compatibilidad con _example/
 */
export { useStandardTable } from './use-standard-table';

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
// MUTATIONS (patron actual: factories en cada feature)
// =============================================================================

/**
 * @deprecated Las mutations ahora se generan con createCrudHooksWithStatus
 * en cada feature (ej: useCreateProduct, useUpdateProduct).
 * Solo se mantiene por compatibilidad con _example/
 */
export {
  useStandardMutation,
  useCreateMutation,
  useUpdateMutation,
  useDeleteMutation,
} from './use-standard-mutation';

// =============================================================================
// NOTIFICACIONES
// =============================================================================

export { useNotify, successMessages, errorMessages } from './use-notify';

// =============================================================================
// FORMULARIOS
// =============================================================================

export { useStandardForm, type StandardForm } from './use-standard-form';

// =============================================================================
// OTROS HOOKS UTILES
// =============================================================================

// Theme
export { useTheme } from './use-theme';

// Permisos
export { usePermissions, type Role } from './use-permissions';

// Scroll infinito
export { useInfiniteList } from './use-infinite-list';

// Upload de archivos
export { useFileUpload } from './use-file-upload';

// Internacionalizacion
export { useTranslations, getTranslation } from './use-translations';
