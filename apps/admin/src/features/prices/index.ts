/**
 * =============================================================================
 * FEATURE: Prices (Relevamiento de Precios)
 * =============================================================================
 *
 * Módulo para visualización de relevamientos de precios.
 * Este módulo es READ-ONLY - los precios se registran desde la app móvil.
 *
 * Solo expone hooks de lectura (list, detail).
 */
'use client';

import { createCrudService, createCrudHooks } from '@framework/shared-utils';
import { apiClient } from '@/lib/api-client';
import { ENDPOINTS } from '@/config';
import { toast } from 'sonner';
import type {
  PriceRecord,
  CreatePriceRecordDTO,
  UpdatePriceRecordDTO,
  PriceRecordListParams,
} from '@framework/shared-types';

// =============================================================================
// SERVICIO
// =============================================================================

/**
 * Servicio para relevamientos de precio (solo lectura)
 *
 * Métodos disponibles:
 * - priceRecordService.list(params) → GET /price-records
 * - priceRecordService.getById(id)  → GET /price-records/:id
 */
export const priceRecordService = createCrudService<
  PriceRecord,
  CreatePriceRecordDTO,
  UpdatePriceRecordDTO,
  PriceRecordListParams
>(apiClient, ENDPOINTS.PRICE_RECORDS);

// =============================================================================
// HOOKS
// =============================================================================

/**
 * Hooks de React Query para relevamientos de precio
 *
 * Solo expone hooks de lectura:
 * - usePriceRecords() → Lista de relevamientos
 * - usePriceRecord(id) → Detalle de un relevamiento
 */
const generatedHooks = createCrudHooks('priceRecords', priceRecordService, toast, {
  entityName: 'Relevamiento',
  entityNamePlural: 'Relevamientos',
});

// Exportamos solo los hooks de lectura
export const priceRecordKeys = generatedHooks.keys;
export const usePriceRecords = generatedHooks.useList;
export const usePriceRecord = generatedHooks.useDetail;

// =============================================================================
// RE-EXPORTS
// =============================================================================

export type {
  PriceRecord,
  PriceRecordListParams,
} from '@framework/shared-types';
