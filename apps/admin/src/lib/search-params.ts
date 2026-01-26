import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from 'nuqs/server';

/**
 * Parsers estándar para parámetros de tabla
 * Utilizados tanto en cliente (useQueryStates) como servidor (searchParamsCache)
 */
export const tableSearchParams = {
  // Paginación
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),

  // Búsqueda
  search: parseAsString.withDefault(''),

  // Ordenamiento
  sortBy: parseAsString.withDefault('createdAt'),
  sortOrder: parseAsStringEnum(['asc', 'desc'] as const).withDefault('desc'),
};

/**
 * Cache de parámetros para Server Components (Next.js 16)
 * Uso: const { page, limit, search } = await searchParamsCache.parse(searchParams)
 */
export const searchParamsCache = createSearchParamsCache(tableSearchParams);

/**
 * Tipo inferido de los parámetros de tabla
 */
export type TableSearchParams = {
  page: number;
  limit: number;
  search: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
};

/**
 * Parámetros para enviar a la API
 */
export type ApiFilterParams = {
  page: number;
  limit: number;
  search?: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
};
