/**
 * =============================================================================
 * FEATURE: Locations (Locales/Stores)
 * =============================================================================
 *
 * Módulo para gestión de locales/puntos de venta.
 * Usa el patrón de factories para generar servicio y hooks automáticamente.
 */
'use client';

import { createCrudServiceWithStatus, createCrudHooksWithStatus } from '@framework/shared-utils';
import { apiClient } from '@/lib/api-client';
import { ENDPOINTS } from '@/config';
import { toast } from 'sonner';
import type {
  Store,
  CreateStoreDTO,
  UpdateStoreDTO,
  StoreListParams,
} from '@framework/shared-types';

// =============================================================================
// SERVICIO
// =============================================================================

/**
 * Servicio CRUD para locales
 *
 * Métodos disponibles:
 * - storeService.list(params)           → GET    /stores
 * - storeService.getById(id)            → GET    /stores/:id
 * - storeService.create(data)           → POST   /stores
 * - storeService.update(id, data)       → PUT    /stores/:id
 * - storeService.delete(id)             → DELETE /stores/:id
 * - storeService.toggleStatus(id, data) → PATCH  /stores/:id/status
 */
export const storeService = createCrudServiceWithStatus<
  Store,
  CreateStoreDTO,
  UpdateStoreDTO,
  StoreListParams
>(apiClient, ENDPOINTS.STORES);

// =============================================================================
// HOOKS
// =============================================================================

/**
 * Hooks de React Query para locales
 *
 * Hooks generados:
 * - useStores()              → Lista de locales
 * - useStore(id)             → Detalle de un local
 * - useCreateStore()         → Crear local
 * - useUpdateStore()         → Actualizar local
 * - useDeleteStore()         → Eliminar local
 * - useToggleStoreStatus()   → Activar/desactivar local
 */
export const {
  keys: storeKeys,
  useList: useStores,
  useDetail: useStore,
  useCreate: useCreateStore,
  useUpdate: useUpdateStore,
  useDelete: useDeleteStore,
  useToggleStatus: useToggleStoreStatus,
} = createCrudHooksWithStatus('stores', storeService, toast, {
  entityName: 'Local',
  entityNamePlural: 'Locales',
});

// =============================================================================
// RE-EXPORTS
// =============================================================================

export type {
  Store,
  CreateStoreDTO,
  UpdateStoreDTO,
} from '@framework/shared-types';
