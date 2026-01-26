'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { PAGINATION } from '@/config/constants';
import { updateSearchParams, getSearchParam, getSearchParamNumber } from '@/lib/search-params';

export interface TableState {
  page: number;
  pageSize: number;
  search: string;
  sortField: string;
  sortOrder: 'asc' | 'desc';
  filters: Record<string, string>;
}

export interface UseStandardTableReturn extends TableState {
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setSearch: (search: string) => void;
  setSorting: (field: string, order?: 'asc' | 'desc') => void;
  setFilter: (key: string, value: string) => void;
  setFilters: (filters: Record<string, string>) => void;
  resetFilters: () => void;
  resetAll: () => void;
}

/**
 * Hook para manejar el estado de tablas con URL state
 * Sincroniza automáticamente filtros, búsqueda, paginación y ordenamiento con la URL
 */
export function useStandardTable(config?: {
  defaultPageSize?: number;
  defaultSortField?: string;
  defaultSortOrder?: 'asc' | 'desc';
}): UseStandardTableReturn {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Estado actual desde URL
  const currentState = useMemo<TableState>(() => ({
    page: getSearchParamNumber(searchParams, 'page', PAGINATION.DEFAULT_PAGE),
    pageSize: getSearchParamNumber(searchParams, 'pageSize', config?.defaultPageSize || PAGINATION.DEFAULT_PAGE_SIZE),
    search: getSearchParam(searchParams, 'search', ''),
    sortField: getSearchParam(searchParams, 'sortField', config?.defaultSortField || ''),
    sortOrder: (getSearchParam(searchParams, 'sortOrder', config?.defaultSortOrder || 'asc') as 'asc' | 'desc'),
    filters: Object.fromEntries(
      Array.from(searchParams.entries()).filter(([key]) => 
        !['page', 'pageSize', 'search', 'sortField', 'sortOrder'].includes(key)
      )
    ),
  }), [searchParams, config]);

  // Función helper para actualizar URL
  const updateUrl = useCallback((updates: Record<string, any>) => {
    const newParams = updateSearchParams(searchParams, updates);
    router.push(`${pathname}?${newParams.toString()}`, { scroll: false });
  }, [searchParams, router, pathname]);

  // Setters
  const setPage = useCallback((page: number) => {
    updateUrl({ page });
  }, [updateUrl]);

  const setPageSize = useCallback((pageSize: number) => {
    updateUrl({ pageSize, page: 1 }); // Reset a primera página
  }, [updateUrl]);

  const setSearch = useCallback((search: string) => {
    updateUrl({ search, page: 1 }); // Reset a primera página
  }, [updateUrl]);

  const setSorting = useCallback((field: string, order?: 'asc' | 'desc') => {
    const newOrder = order || (currentState.sortField === field && currentState.sortOrder === 'asc' ? 'desc' : 'asc');
    updateUrl({ sortField: field, sortOrder: newOrder, page: 1 });
  }, [updateUrl, currentState]);

  const setFilter = useCallback((key: string, value: string) => {
    updateUrl({ [key]: value, page: 1 }); // Reset a primera página
  }, [updateUrl]);

  const setFilters = useCallback((filters: Record<string, string>) => {
    updateUrl({ ...filters, page: 1 });
  }, [updateUrl]);

  const resetFilters = useCallback(() => {
    const updates: Record<string, any> = { page: 1 };
    Object.keys(currentState.filters).forEach(key => {
      updates[key] = undefined;
    });
    updateUrl(updates);
  }, [updateUrl, currentState.filters]);

  const resetAll = useCallback(() => {
    router.push(pathname);
  }, [router, pathname]);

  return {
    ...currentState,
    setPage,
    setPageSize,
    setSearch,
    setSorting,
    setFilter,
    setFilters,
    resetFilters,
    resetAll,
  };
}
