/**
 * @framework/shared-utils
 *
 * Utilidades compartidas para el framework:
 * - Factories para crear servicios CRUD
 * - Factories para crear hooks de React Query
 */

// Service Factory
export {
  createCrudService,
  createCrudServiceWithStatus,
  type PaginatedResponse,
  type BaseListParams,
  type HttpClient,
  type CrudService,
  type ServiceOptions,
} from './service-factory';

// Hooks Factory
export {
  createCrudHooks,
  createCrudHooksWithStatus,
  createQueryKeys,
  type ToastConfig,
  type ToastFn,
  type QueryKeys,
  type CrudHooks,
  type StatusHooks,
} from './hooks-factory';
