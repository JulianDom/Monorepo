'use client';

import { useInfiniteQuery, type QueryKey } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { PaginatedResponse } from '@/types';

interface UseInfiniteListOptions<TData> {
  /** Query key única */
  queryKey: QueryKey;
  /** Función para obtener datos (recibe pageParam) */
  queryFn: (params: { pageParam: number }) => Promise<PaginatedResponse<TData>>;
  /** Items por página */
  limit?: number;
  /** Habilitar query */
  enabled?: boolean;
}

/**
 * Hook para listas con scroll infinito
 *
 * @example
 * ```tsx
 * function ProductList() {
 *   const {
 *     items,
 *     isLoading,
 *     isFetchingNextPage,
 *     hasNextPage,
 *     loadMoreRef,
 *   } = useInfiniteList({
 *     queryKey: ['products', 'infinite'],
 *     queryFn: ({ pageParam }) =>
 *       productService.getAll({ page: pageParam, limit: 20 }),
 *   });
 *
 *   return (
 *     <div>
 *       {items.map((product) => (
 *         <ProductCard key={product.id} product={product} />
 *       ))}
 *
 *       {/* Elemento invisible que dispara la carga *\/}
 *       <div ref={loadMoreRef} />
 *
 *       {isFetchingNextPage && <Spinner />}
 *     </div>
 *   );
 * }
 * ```
 */
export function useInfiniteList<TData>({
  queryKey,
  queryFn,
  limit = 20,
  enabled = true,
}: UseInfiniteListOptions<TData>) {
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const query = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) => queryFn({ pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.meta.hasNextPage) {
        return lastPage.meta.currentPage + 1;
      }
      return undefined;
    },
    enabled,
  });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
  } = query;

  // Aplanar items de todas las páginas
  const items = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.data);
  }, [data?.pages]);

  // Total de items
  const totalItems = data?.pages[0]?.meta.totalItems ?? 0;

  // Intersection Observer para cargar más
  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  // Cargar más manualmente
  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return {
    items,
    totalItems,
    isLoading,
    isError,
    error,
    refetch,
    hasNextPage: hasNextPage ?? false,
    isFetchingNextPage,
    loadMore,
    loadMoreRef,
    // Meta de la última página
    currentPage: data?.pages[data.pages.length - 1]?.meta.currentPage ?? 1,
    totalPages: data?.pages[0]?.meta.totalPages ?? 0,
  };
}
