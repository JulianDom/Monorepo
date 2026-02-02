/**
 * Feature: Operatives (Usuarios Operativos)
 *
 * Este archivo centraliza el servicio y hooks para usuarios operativos
 * usando los factories de @framework/shared-utils
 */
'use client';

import { createCrudServiceWithStatus, createCrudHooksWithStatus } from '@framework/shared-utils';
import { apiClient } from '@/lib/api-client';
import { ENDPOINTS } from '@/config';
import { toast } from 'sonner';
import type {
  PersistedOperativeUserProps,
  CreateOperativeUserDTO,
  UpdateOperativeUserDTO,
  OperativeUserListParams,
} from '@framework/shared-types';

// ============================================
// SERVICIO
// ============================================

/**
 * Servicio CRUD para usuarios operativos
 * Generado automaticamente con createCrudServiceWithStatus
 *
 * NOTA: Usamos PersistedOperativeUserProps (con id) porque
 * los datos que vienen de la API siempre incluyen el id
 */
export const operativeService = createCrudServiceWithStatus<
  PersistedOperativeUserProps,
  CreateOperativeUserDTO,
  UpdateOperativeUserDTO,
  OperativeUserListParams
>(apiClient, ENDPOINTS.OPERATIVE_USERS);

// ============================================
// HOOKS
// ============================================

/**
 * Hooks CRUD para usuarios operativos
 * Generados automaticamente con createCrudHooksWithStatus
 */
export const {
  keys: operativeKeys,
  useList: useOperatives,
  useDetail: useOperative,
  useCreate: useCreateOperative,
  useUpdate: useUpdateOperative,
  useDelete: useDeleteOperative,
  useToggleStatus: useToggleOperativeStatus,
} = createCrudHooksWithStatus('operatives', operativeService, toast, {
  entityName: 'Operativo',
  entityNamePlural: 'Operativos',
});

// ============================================
// RE-EXPORTS
// ============================================

// Re-exportar tipos para conveniencia
export type {
  PersistedOperativeUserProps,
  CreateOperativeUserDTO,
  UpdateOperativeUserDTO,
  OperativeUserListParams,
} from '@framework/shared-types';
