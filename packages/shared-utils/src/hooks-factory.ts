'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { CrudService, PaginatedResponse, BaseListParams } from './service-factory';

/**
 * Configuración para los mensajes de toast
 */
export interface ToastConfig {
  /** Nombre de la entidad en singular (ej: "Producto") */
  entityName: string;
  /** Nombre de la entidad en plural (ej: "Productos") */
  entityNamePlural: string;
}

/**
 * Función de toast compatible con sonner
 */
export interface ToastFn {
  success: (message: string) => void;
  error: (message: string) => void;
  warning?: (message: string, options?: { description?: string }) => void;
}

/**
 * Query keys generadas para una entidad
 */
export interface QueryKeys<TListParams> {
  all: readonly [string];
  lists: () => readonly [string, 'list'];
  list: (params?: TListParams) => readonly [string, 'list', TListParams | undefined];
  details: () => readonly [string, 'detail'];
  detail: (id: string) => readonly [string, 'detail', string];
}

/**
 * Resultado del factory de hooks
 */
export interface CrudHooks<TEntity, TCreateDTO, TUpdateDTO, TListParams extends BaseListParams> {
  keys: QueryKeys<TListParams>;
  useList: (params?: TListParams) => ReturnType<typeof useQuery<PaginatedResponse<TEntity>>>;
  useDetail: (id: string) => ReturnType<typeof useQuery<TEntity>>;
  useCreate: () => ReturnType<typeof useMutation<TEntity, Error, TCreateDTO>>;
  useUpdate: () => ReturnType<typeof useMutation<TEntity, Error, { id: string; data: TUpdateDTO }>>;
  useDelete: () => ReturnType<typeof useMutation<void, Error, string>>;
}

/**
 * Hooks adicionales para entidades con toggle de estado
 */
export interface StatusHooks<TEntity> {
  useToggleStatus: () => ReturnType<typeof useMutation<TEntity, Error, { id: string; enable: boolean }>>;
}

/**
 * Crea query keys para una entidad
 */
export function createQueryKeys<TListParams>(
  entityKey: string
): QueryKeys<TListParams> {
  return {
    all: [entityKey] as const,
    lists: () => [entityKey, 'list'] as const,
    list: (params?: TListParams) => [entityKey, 'list', params] as const,
    details: () => [entityKey, 'detail'] as const,
    detail: (id: string) => [entityKey, 'detail', id] as const,
  };
}

/**
 * Crea hooks CRUD para una entidad
 *
 * @example
 * ```typescript
 * import { createCrudHooks } from '@framework/shared-utils';
 * import { toast } from 'sonner';
 * import { productService } from './product.service';
 *
 * export const {
 *   keys: productKeys,
 *   useList: useProducts,
 *   useDetail: useProduct,
 *   useCreate: useCreateProduct,
 *   useUpdate: useUpdateProduct,
 *   useDelete: useDeleteProduct,
 * } = createCrudHooks('products', productService, toast, {
 *   entityName: 'Producto',
 *   entityNamePlural: 'Productos',
 * });
 * ```
 */
export function createCrudHooks<
  TEntity,
  TCreateDTO,
  TUpdateDTO,
  TListParams extends BaseListParams = BaseListParams
>(
  entityKey: string,
  service: CrudService<TEntity, TCreateDTO, TUpdateDTO, TListParams>,
  toast: ToastFn,
  config: ToastConfig
): CrudHooks<TEntity, TCreateDTO, TUpdateDTO, TListParams> {
  const keys = createQueryKeys<TListParams>(entityKey);

  function useList(params?: TListParams) {
    return useQuery({
      queryKey: keys.list(params),
      queryFn: () => service.list(params),
    });
  }

  function useDetail(id: string) {
    return useQuery({
      queryKey: keys.detail(id),
      queryFn: () => service.getById(id),
      enabled: !!id,
    });
  }

  function useCreate() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (data: TCreateDTO) => service.create(data),
      onSuccess: () => {
        toast.success(`${config.entityName} creado exitosamente`);
        queryClient.invalidateQueries({ queryKey: keys.all });
      },
      onError: (error: Error) => {
        toast.error(error.message || `Error al crear ${config.entityName.toLowerCase()}`);
      },
    });
  }

  function useUpdate() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: TUpdateDTO }) =>
        service.update(id, data),
      onSuccess: () => {
        toast.success(`${config.entityName} actualizado exitosamente`);
        queryClient.invalidateQueries({ queryKey: keys.all });
      },
      onError: (error: Error) => {
        toast.error(error.message || `Error al actualizar ${config.entityName.toLowerCase()}`);
      },
    });
  }

  function useDelete() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (id: string) => service.delete(id),
      onSuccess: () => {
        toast.success(`${config.entityName} eliminado exitosamente`);
        queryClient.invalidateQueries({ queryKey: keys.all });
      },
      onError: (error: Error) => {
        toast.error(error.message || `Error al eliminar ${config.entityName.toLowerCase()}`);
      },
    });
  }

  return {
    keys,
    useList,
    useDetail,
    useCreate,
    useUpdate,
    useDelete,
  };
}

/**
 * Crea hooks CRUD con soporte para toggle de estado
 *
 * @example
 * ```typescript
 * export const {
 *   keys: adminKeys,
 *   useList: useAdmins,
 *   useToggleStatus: useToggleAdminStatus,
 *   ...rest
 * } = createCrudHooksWithStatus('admins', adminService, toast, {
 *   entityName: 'Administrador',
 *   entityNamePlural: 'Administradores',
 * });
 * ```
 */
export function createCrudHooksWithStatus<
  TEntity,
  TCreateDTO,
  TUpdateDTO,
  TListParams extends BaseListParams = BaseListParams
>(
  entityKey: string,
  service: CrudService<TEntity, TCreateDTO, TUpdateDTO, TListParams> & {
    toggleStatus: (id: string, data: { enable: boolean }) => Promise<TEntity>;
  },
  toast: ToastFn,
  config: ToastConfig
): CrudHooks<TEntity, TCreateDTO, TUpdateDTO, TListParams> & StatusHooks<TEntity> {
  const baseHooks = createCrudHooks(entityKey, service, toast, config);

  function useToggleStatus() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: ({ id, enable }: { id: string; enable: boolean }) =>
        service.toggleStatus(id, { enable }),
      onSuccess: (_, { enable }) => {
        const action = enable ? 'habilitado' : 'deshabilitado';
        if (toast.warning && !enable) {
          toast.warning(`${config.entityName} ${action}`, {
            description: `El ${config.entityName.toLowerCase()} ha sido ${action}.`,
          });
        } else {
          toast.success(`${config.entityName} ${action} exitosamente`);
        }
        queryClient.invalidateQueries({ queryKey: baseHooks.keys.all });
      },
      onError: (error: Error) => {
        toast.error(error.message || `Error al cambiar estado de ${config.entityName.toLowerCase()}`);
      },
    });
  }

  return {
    ...baseHooks,
    useToggleStatus,
  };
}
