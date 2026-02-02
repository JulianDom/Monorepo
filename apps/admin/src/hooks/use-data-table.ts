'use client';

import { useState, useMemo, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

// ============================================
// TIPOS
// ============================================

export type SortDirection = 'asc' | 'desc';

export interface SortConfig<T> {
  field: keyof T | null;
  direction: SortDirection;
}

export interface UseDataTableOptions<T, TFilter extends string = string> {
  /** Datos a procesar */
  data: T[];

  /** Campos en los que buscar (para search) */
  searchFields: (keyof T)[];

  /** Configuracion inicial de ordenamiento */
  defaultSort?: {
    field: keyof T;
    direction: SortDirection;
  };

  /** Items por pagina (default: 10) */
  itemsPerPage?: number;

  /** Sincronizar estado con URL query params (default: false) */
  syncWithUrl?: boolean;

  /** Filtro de estado (ej: 'all' | 'active' | 'inactive') */
  filterOptions?: {
    field: keyof T;
    activeValue?: unknown; // Valor que indica "activo" (default: true)
  };

  /** Valor inicial del filtro */
  defaultFilter?: TFilter;
}

export interface UseDataTableReturn<T, TFilter extends string = string> {
  // Datos procesados
  items: T[];
  filteredCount: number;
  totalCount: number;
  totalPages: number;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Sort
  sortConfig: SortConfig<T>;
  toggleSort: (field: keyof T) => void;
  getSortIcon: (field: keyof T) => 'asc' | 'desc' | null;

  // Filter
  filter: TFilter;
  setFilter: (filter: TFilter) => void;

  // Pagination
  currentPage: number;
  setCurrentPage: (page: number) => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  goToNextPage: () => void;
  goToPrevPage: () => void;
  canGoNext: boolean;
  canGoPrev: boolean;

  // Utilities
  resetAll: () => void;
  isEmpty: boolean;
  isFiltered: boolean;
}

// ============================================
// HOOK
// ============================================

/**
 * Hook reutilizable para manejo de tablas de datos
 *
 * Encapsula logica comun de:
 * - Busqueda (search)
 * - Filtrado (filter)
 * - Ordenamiento (sort)
 * - Paginacion (pagination)
 *
 * @example
 * ```tsx
 * const {
 *   items,
 *   searchQuery,
 *   setSearchQuery,
 *   toggleSort,
 *   currentPage,
 *   totalPages,
 * } = useDataTable({
 *   data: products,
 *   searchFields: ['name', 'code'],
 *   defaultSort: { field: 'name', direction: 'asc' },
 * });
 * ```
 */
export function useDataTable<T extends { id: string }, TFilter extends string = string>({
  data,
  searchFields,
  defaultSort,
  itemsPerPage = 10,
  syncWithUrl = false,
  filterOptions,
  defaultFilter = 'all' as TFilter,
}: UseDataTableOptions<T, TFilter>): UseDataTableReturn<T, TFilter> {
  // URL sync (opcional)
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Estado local
  const [searchQuery, setSearchQueryState] = useState(() => {
    if (syncWithUrl) {
      return searchParams.get('q') ?? '';
    }
    return '';
  });

  const [sortConfig, setSortConfig] = useState<SortConfig<T>>(() => ({
    field: defaultSort?.field ?? null,
    direction: defaultSort?.direction ?? 'asc',
  }));

  const [filter, setFilterState] = useState<TFilter>(() => {
    if (syncWithUrl) {
      return (searchParams.get('filter') as TFilter) ?? defaultFilter;
    }
    return defaultFilter;
  });

  const [currentPage, setCurrentPageState] = useState(() => {
    if (syncWithUrl) {
      const page = searchParams.get('page');
      return page ? parseInt(page, 10) : 1;
    }
    return 1;
  });

  // ============================================
  // URL SYNC HELPERS
  // ============================================

  const updateUrl = useCallback(
    (params: Record<string, string | null>) => {
      if (!syncWithUrl) return;

      const newParams = new URLSearchParams(searchParams.toString());

      Object.entries(params).forEach(([key, value]) => {
        if (value === null || value === '' || value === 'all' || value === '1') {
          newParams.delete(key);
        } else {
          newParams.set(key, value);
        }
      });

      const query = newParams.toString();
      router.replace(`${pathname}${query ? `?${query}` : ''}`, { scroll: false });
    },
    [syncWithUrl, searchParams, router, pathname]
  );

  // ============================================
  // SETTERS CON URL SYNC
  // ============================================

  const setSearchQuery = useCallback(
    (query: string) => {
      setSearchQueryState(query);
      setCurrentPageState(1); // Reset page on search
      updateUrl({ q: query, page: null });
    },
    [updateUrl]
  );

  const setFilter = useCallback(
    (newFilter: TFilter) => {
      setFilterState(newFilter);
      setCurrentPageState(1); // Reset page on filter
      updateUrl({ filter: newFilter, page: null });
    },
    [updateUrl]
  );

  const setCurrentPage = useCallback(
    (page: number) => {
      setCurrentPageState(page);
      updateUrl({ page: page.toString() });
    },
    [updateUrl]
  );

  // ============================================
  // SORT
  // ============================================

  const toggleSort = useCallback((field: keyof T) => {
    setSortConfig((prev) => {
      if (prev.field === field) {
        return {
          field,
          direction: prev.direction === 'asc' ? 'desc' : 'asc',
        };
      }
      return { field, direction: 'asc' };
    });
    setCurrentPageState(1); // Reset page on sort change
  }, []);

  const getSortIcon = useCallback(
    (field: keyof T): 'asc' | 'desc' | null => {
      if (sortConfig.field !== field) return null;
      return sortConfig.direction;
    },
    [sortConfig]
  );

  // ============================================
  // DATA PROCESSING
  // ============================================

  // 1. Filtrar por estado (active/inactive)
  const filteredByStatus = useMemo(() => {
    if (!filterOptions || filter === 'all') return data;

    const { field, activeValue = true } = filterOptions;

    return data.filter((item) => {
      const value = item[field];
      const isActive = value === activeValue || value === true;

      if (filter === 'active') return isActive;
      if (filter === 'inactive') return !isActive;
      return true;
    });
  }, [data, filter, filterOptions]);

  // 2. Filtrar por busqueda
  const filteredBySearch = useMemo(() => {
    if (!searchQuery.trim()) return filteredByStatus;

    const query = searchQuery.toLowerCase().trim();

    return filteredByStatus.filter((item) =>
      searchFields.some((field) => {
        const value = item[field];
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(query);
      })
    );
  }, [filteredByStatus, searchQuery, searchFields]);

  // 3. Ordenar
  const sorted = useMemo(() => {
    if (!sortConfig.field) return filteredBySearch;

    return [...filteredBySearch].sort((a, b) => {
      const aValue = a[sortConfig.field!];
      const bValue = b[sortConfig.field!];

      // Handle null/undefined
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      // Handle dates
      if (aValue instanceof Date && bValue instanceof Date) {
        const diff = aValue.getTime() - bValue.getTime();
        return sortConfig.direction === 'asc' ? diff : -diff;
      }

      // Handle strings/numbers
      const aStr = String(aValue);
      const bStr = String(bValue);
      const comparison = aStr.localeCompare(bStr, undefined, { numeric: true });

      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [filteredBySearch, sortConfig]);

  // 4. Paginar
  const totalPages = Math.max(1, Math.ceil(sorted.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginated = useMemo(() => {
    const start = (safeCurrentPage - 1) * itemsPerPage;
    return sorted.slice(start, start + itemsPerPage);
  }, [sorted, safeCurrentPage, itemsPerPage]);

  // ============================================
  // PAGINATION HELPERS
  // ============================================

  const canGoNext = safeCurrentPage < totalPages;
  const canGoPrev = safeCurrentPage > 1;

  const goToFirstPage = useCallback(() => setCurrentPage(1), [setCurrentPage]);
  const goToLastPage = useCallback(() => setCurrentPage(totalPages), [setCurrentPage, totalPages]);
  const goToNextPage = useCallback(() => {
    if (canGoNext) setCurrentPage(safeCurrentPage + 1);
  }, [canGoNext, safeCurrentPage, setCurrentPage]);
  const goToPrevPage = useCallback(() => {
    if (canGoPrev) setCurrentPage(safeCurrentPage - 1);
  }, [canGoPrev, safeCurrentPage, setCurrentPage]);

  // ============================================
  // UTILITIES
  // ============================================

  const resetAll = useCallback(() => {
    setSearchQueryState('');
    setFilterState(defaultFilter);
    setSortConfig({
      field: defaultSort?.field ?? null,
      direction: defaultSort?.direction ?? 'asc',
    });
    setCurrentPageState(1);
    if (syncWithUrl) {
      router.replace(pathname, { scroll: false });
    }
  }, [defaultFilter, defaultSort, syncWithUrl, router, pathname]);

  const isEmpty = data.length === 0;
  const isFiltered = searchQuery !== '' || filter !== 'all';

  // ============================================
  // RETURN
  // ============================================

  return {
    // Datos procesados
    items: paginated,
    filteredCount: sorted.length,
    totalCount: data.length,
    totalPages,

    // Search
    searchQuery,
    setSearchQuery,

    // Sort
    sortConfig,
    toggleSort,
    getSortIcon,

    // Filter
    filter,
    setFilter,

    // Pagination
    currentPage: safeCurrentPage,
    setCurrentPage,
    goToFirstPage,
    goToLastPage,
    goToNextPage,
    goToPrevPage,
    canGoNext,
    canGoPrev,

    // Utilities
    resetAll,
    isEmpty,
    isFiltered,
  };
}
