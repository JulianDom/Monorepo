/**
 * Feature: Admins (Administradores)
 *
 * Este archivo centraliza el servicio y hooks para administradores
 * usando los factories de @framework/shared-utils
 *
 * MIGRADO desde patron manual a factory pattern para consistencia
 */
'use client';

import { createCrudServiceWithStatus, createCrudHooksWithStatus } from '@framework/shared-utils';
import { apiClient } from '@/lib/api-client';
import { ENDPOINTS } from '@/config';
import { toast } from 'sonner';
import type {
  Admin,
  CreateAdminDTO,
  UpdateAdminDTO,
  AdminListParams,
} from '@framework/shared-types';

// ============================================
// SERVICIO
// ============================================

/**
 * Servicio CRUD para administradores
 * Generado automaticamente con createCrudServiceWithStatus
 */
export const adminService = createCrudServiceWithStatus<
  Admin,
  CreateAdminDTO,
  UpdateAdminDTO,
  AdminListParams
>(apiClient, ENDPOINTS.ADMINS);

// ============================================
// HOOKS
// ============================================

/**
 * Hooks CRUD para administradores
 * Generados automaticamente con createCrudHooksWithStatus
 */
export const {
  keys: adminKeys,
  useList: useAdmins,
  useDetail: useAdmin,
  useCreate: useCreateAdmin,
  useUpdate: useUpdateAdmin,
  useDelete: useDeleteAdmin,
  useToggleStatus: useToggleAdminStatus,
} = createCrudHooksWithStatus('admins', adminService, toast, {
  entityName: 'Administrador',
  entityNamePlural: 'Administradores',
});

// ============================================
// RE-EXPORTS
// ============================================

/**
 * Re-exportamos solo los tipos que se usan actualmente.
 * Si necesitas tipos adicionales, importalos directamente de @framework/shared-types
 */
export type {
  Admin,
  CreateAdminDTO,
  UpdateAdminDTO,
} from '@framework/shared-types';
