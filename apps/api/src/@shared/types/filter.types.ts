/**
 * Tipos para Sistema de Filtros Moderno
 *
 * Soporta operadores avanzados para filtrado desde el frontend.
 *
 * Uso desde el frontend:
 * GET /products?search=coca&category=bebidas&price[gte]=100&price[lte]=500&sort=-createdAt
 *
 * Operadores soportados:
 * - eq: igual (default)
 * - ne: no igual
 * - gt: mayor que
 * - gte: mayor o igual
 * - lt: menor que
 * - lte: menor o igual
 * - in: en lista (value1,value2,value3)
 * - nin: no en lista
 * - contains: contiene (case insensitive)
 * - startsWith: empieza con
 * - endsWith: termina con
 */

// Operadores de filtro disponibles
export type FilterOperator =
  | 'eq'       // equals
  | 'ne'       // not equals
  | 'gt'       // greater than
  | 'gte'      // greater than or equal
  | 'lt'       // less than
  | 'lte'      // less than or equal
  | 'in'       // in array
  | 'nin'      // not in array
  | 'contains' // contains string (case insensitive)
  | 'startsWith'
  | 'endsWith'
  | 'isNull'   // is null
  | 'isNotNull'; // is not null

// Filtro individual con operador
export interface FilterCondition<T = unknown> {
  field: string;
  operator: FilterOperator;
  value: T;
}

// Filtros parseados desde query params
export interface ParsedFilters {
  [field: string]: {
    [operator in FilterOperator]?: unknown;
  } | unknown; // unknown para valores simples sin operador (eq implícito)
}

// Parámetros de query completos
export interface QueryParams {
  // Paginación
  page?: number;
  limit?: number;

  // Ordenamiento (puede ser string o array)
  // Formato: "field" o "-field" para desc, o "field:asc", "field:desc"
  sort?: string | string[];

  // Búsqueda global
  search?: string;

  // Filtros específicos por campo
  filters?: ParsedFilters;

  // Campos a incluir/expandir (relaciones)
  include?: string[];

  // Campos a seleccionar
  select?: string[];
}

// Configuración de ordenamiento parseada
export interface SortConfig {
  field: string;
  order: 'asc' | 'desc';
}

// Resultado paginado extendido con info de filtros
export interface QueryResult<T> {
  data: T[];
  meta: {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  // Opcional: incluir los filtros aplicados en la respuesta
  appliedFilters?: {
    search?: string;
    filters?: ParsedFilters;
    sort?: SortConfig[];
  };
}

// Configuración de campos filtrables por entidad
export interface FilterableFieldConfig {
  // Nombre del campo
  field: string;
  // Operadores permitidos para este campo
  allowedOperators: FilterOperator[];
  // Tipo del campo (para validación)
  type: 'string' | 'number' | 'boolean' | 'date' | 'uuid';
  // Si es ordenable
  sortable?: boolean;
  // Si es buscable (para search global)
  searchable?: boolean;
  // Campo real en la base de datos (si difiere del nombre expuesto)
  dbField?: string;
}

// Definición de filtros permitidos por entidad
export interface EntityFilterConfig {
  // Campos filtrables
  filterableFields: FilterableFieldConfig[];
  // Campo de ordenamiento por defecto
  defaultSort?: SortConfig;
  // Campos en los que busca el "search" global
  searchFields?: string[];
  // Límite máximo de resultados
  maxLimit?: number;
  // Relaciones que se pueden incluir
  allowedIncludes?: string[];
}

// Helper type para crear filtros tipados por entidad
export type EntityFilters<T> = {
  [K in keyof T]?: T[K] | {
    eq?: T[K];
    ne?: T[K];
    gt?: T[K];
    gte?: T[K];
    lt?: T[K];
    lte?: T[K];
    in?: T[K][];
    nin?: T[K][];
    contains?: string;
    startsWith?: string;
    endsWith?: string;
  };
};

// Constantes
export const DEFAULT_SORT_ORDER: 'asc' | 'desc' = 'desc';
export const DEFAULT_SORT_FIELD = 'createdAt';
