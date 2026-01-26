'use client';

import { useQueryStates } from 'nuqs';
import { useCallback, useMemo, useTransition } from 'react';
import { tableSearchParams, type ApiFilterParams } from '@/lib/search-params';
import { useDebounce } from './use-debounce';

interface UseStandardTableOptions {
  /** Delay del debounce para search (default: 300ms) */
  debounceMs?: number;
  /** Límite por defecto de items por página */
  defaultLimit?: number;
}

interface UseStandardTableReturn {
  // Estado de paginación
  page: number;
  setPage: (page: number) => void;
  limit: number;
  setLimit: (limit: number) => void;

  // Estado de búsqueda
  search: string;
  setSearch: (search: string) => void;
  debouncedSearch: string;

  // Estado de ordenamiento
  sortBy: string;
  setSortBy: (sortBy: string) => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (order: 'asc' | 'desc') => void;
  toggleSortOrder: () => void;

  // Parámetros listos para API
  filterParams: ApiFilterParams;

  // Estado de transición (para loading states)
  isPending: boolean;

  // Utilidades
  resetFilters: () => void;
  goToFirstPage: () => void;
}

/**
 * Hook maestro para manejo de tablas sincronizadas con URL
 *
 * @example
 * ```tsx
 * const { filterParams, page, setPage, search, setSearch } = useStandardTable();
 *
 * const query = useQuery({
 *   queryKey: ['users', filterParams],
 *   queryFn: () => fetchUsers(filterParams),
 * });
 * ```
 */
export function useStandardTable(
  options: UseStandardTableOptions = {}
): UseStandardTableReturn {
  const { debounceMs = 300 } = options;

  const [isPending, startTransition] = useTransition();

  // Estado sincronizado con URL
  const [params, setParams] = useQueryStates(tableSearchParams, {
    history: 'push',
    shallow: false, // Permite que Server Components lean los params
    startTransition,
  });

  const { page, limit, search, sortBy, sortOrder } = params;

  // Search con debounce
  const debouncedSearch = useDebounce(search, debounceMs);

  // Setters individuales
  const setPage = useCallback(
    (newPage: number) => {
      setParams({ page: newPage });
    },
    [setParams]
  );

  const setLimit = useCallback(
    (newLimit: number) => {
      // Resetear a página 1 cuando cambia el límite
      setParams({ limit: newLimit, page: 1 });
    },
    [setParams]
  );

  const setSearch = useCallback(
    (newSearch: string) => {
      // Resetear a página 1 cuando cambia la búsqueda
      setParams({ search: newSearch, page: 1 });
    },
    [setParams]
  );

  const setSortBy = useCallback(
    (newSortBy: string) => {
      setParams({ sortBy: newSortBy });
    },
    [setParams]
  );

  const setSortOrder = useCallback(
    (newOrder: 'asc' | 'desc') => {
      setParams({ sortOrder: newOrder });
    },
    [setParams]
  );

  const toggleSortOrder = useCallback(() => {
    setParams({ sortOrder: sortOrder === 'asc' ? 'desc' : 'asc' });
  }, [setParams, sortOrder]);

  // Utilidades
  const resetFilters = useCallback(() => {
    setParams({
      page: 1,
      limit: 10,
      search: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  }, [setParams]);

  const goToFirstPage = useCallback(() => {
    setParams({ page: 1 });
  }, [setParams]);

  // Parámetros listos para enviar a la API
  const filterParams: ApiFilterParams = useMemo(
    () => ({
      page,
      limit,
      search: debouncedSearch || undefined, // No enviar string vacío
      sortBy,
      sortOrder,
    }),
    [page, limit, debouncedSearch, sortBy, sortOrder]
  );

  return {
    // Paginación
    page,
    setPage,
    limit,
    setLimit,

    // Búsqueda
    search,
    setSearch,
    debouncedSearch,

    // Ordenamiento
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    toggleSortOrder,

    // API params
    filterParams,

    // Estado
    isPending,

    // Utilidades
    resetFilters,
    goToFirstPage,
  };
}
