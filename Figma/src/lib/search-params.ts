/**
 * Utilidades para manejar search params en la URL
 */

import { ReadonlyURLSearchParams } from 'next/navigation';

/**
 * Obtiene un parámetro de búsqueda como string
 */
export function getSearchParam(
  searchParams: ReadonlyURLSearchParams | URLSearchParams,
  key: string,
  defaultValue = ''
): string {
  return searchParams.get(key) || defaultValue;
}

/**
 * Obtiene un parámetro de búsqueda como número
 */
export function getSearchParamNumber(
  searchParams: ReadonlyURLSearchParams | URLSearchParams,
  key: string,
  defaultValue = 0
): number {
  const value = searchParams.get(key);
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Obtiene un parámetro de búsqueda como boolean
 */
export function getSearchParamBoolean(
  searchParams: ReadonlyURLSearchParams | URLSearchParams,
  key: string,
  defaultValue = false
): boolean {
  const value = searchParams.get(key);
  if (!value) return defaultValue;
  return value === 'true' || value === '1';
}

/**
 * Crea un objeto de parámetros de búsqueda
 */
export function createSearchParams(params: Record<string, any>): URLSearchParams {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value));
    }
  });
  
  return searchParams;
}

/**
 * Actualiza los search params manteniendo los existentes
 */
export function updateSearchParams(
  currentParams: ReadonlyURLSearchParams | URLSearchParams,
  updates: Record<string, any>
): URLSearchParams {
  const newParams = new URLSearchParams(currentParams.toString());
  
  Object.entries(updates).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      newParams.delete(key);
    } else {
      newParams.set(key, String(value));
    }
  });
  
  return newParams;
}
