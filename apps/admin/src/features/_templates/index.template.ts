/**
 * Feature: __FEATURE_NAME__
 *
 * INSTRUCCIONES:
 * 1. Copiar esta carpeta y renombrarla con el nombre de tu feature (ej: categories)
 * 2. Reemplazar todos los __PLACEHOLDERS__ con los valores correctos:
 *    - __FEATURE_NAME__ -> Nombre descriptivo (ej: Categories)
 *    - __ENTITY__ -> Nombre del tipo (ej: Category)
 *    - __ENTITY_KEY__ -> Key para React Query (ej: categories)
 *    - __ENTITY_NAME_ES__ -> Nombre en espanol singular (ej: Categoria)
 *    - __ENTITY_NAME_PLURAL_ES__ -> Nombre en espanol plural (ej: Categorias)
 *    - __ENDPOINT__ -> Constante del endpoint (ej: ENDPOINTS.CATEGORIES)
 * 3. Agregar los tipos en @framework/shared-types si no existen
 * 4. Agregar el endpoint en src/config/constants.ts
 * 5. Crear los componentes List y Form en la carpeta components/
 * 6. Crear la pagina en src/app/(dashboard)/dashboard/__feature__/page.tsx
 */
'use client';

import { createCrudServiceWithStatus, createCrudHooksWithStatus } from '@framework/shared-utils';
import { apiClient } from '@/lib/api-client';
import { ENDPOINTS } from '@/config';
import { toast } from 'sonner';
import type {
  __ENTITY__,
  Create__ENTITY__DTO,
  Update__ENTITY__DTO,
  __ENTITY__ListParams,
} from '@framework/shared-types';

// ============================================
// SERVICIO
// ============================================

/**
 * Servicio CRUD para __FEATURE_NAME__
 * Generado automaticamente con createCrudServiceWithStatus
 */
export const __entityKey__Service = createCrudServiceWithStatus<
  __ENTITY__,
  Create__ENTITY__DTO,
  Update__ENTITY__DTO,
  __ENTITY__ListParams
>(apiClient, __ENDPOINT__);

// ============================================
// HOOKS
// ============================================

/**
 * Hooks CRUD para __FEATURE_NAME__
 * Generados automaticamente con createCrudHooksWithStatus
 */
export const {
  keys: __entityKey__Keys,
  useList: use__ENTITY__s,
  useDetail: use__ENTITY__,
  useCreate: useCreate__ENTITY__,
  useUpdate: useUpdate__ENTITY__,
  useDelete: useDelete__ENTITY__,
  useToggleStatus: useToggle__ENTITY__Status,
} = createCrudHooksWithStatus('__ENTITY_KEY__', __entityKey__Service, toast, {
  entityName: '__ENTITY_NAME_ES__',
  entityNamePlural: '__ENTITY_NAME_PLURAL_ES__',
});

// ============================================
// RE-EXPORTS
// ============================================

export type {
  __ENTITY__,
  Create__ENTITY__DTO,
  Update__ENTITY__DTO,
  __ENTITY__ListParams,
} from '@framework/shared-types';
