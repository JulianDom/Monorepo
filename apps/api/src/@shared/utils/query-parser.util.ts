import {
  QueryParams,
  SortConfig,
  FilterOperator,
  ParsedFilters,
  EntityFilterConfig,
  FilterableFieldConfig,
  DEFAULT_SORT_FIELD,
  DEFAULT_SORT_ORDER,
} from '@shared/types';

/**
 * QueryParser - Utilidad para parsear y validar query params
 *
 * Convierte query params del frontend a formato utilizable por Prisma.
 */
export class QueryParser {
  /**
   * Parsea el string de ordenamiento a configuración de sort
   *
   * @example
   * parseSort('-createdAt,name') → [{ field: 'createdAt', order: 'desc' }, { field: 'name', order: 'asc' }]
   */
  static parseSort(
    sortString?: string,
    allowedFields?: string[],
    defaultSort?: SortConfig,
  ): SortConfig[] {
    if (!sortString) {
      return defaultSort ? [defaultSort] : [{ field: DEFAULT_SORT_FIELD, order: DEFAULT_SORT_ORDER }];
    }

    const sorts: SortConfig[] = [];
    const fields = sortString.split(',');

    for (const field of fields) {
      const trimmed = field.trim();
      if (!trimmed) continue;

      const isDesc = trimmed.startsWith('-');
      const fieldName = isDesc ? trimmed.slice(1) : trimmed;

      // Validar que el campo esté permitido
      if (allowedFields && !allowedFields.includes(fieldName)) {
        continue; // Ignorar campos no permitidos
      }

      sorts.push({
        field: fieldName,
        order: isDesc ? 'desc' : 'asc',
      });
    }

    return sorts.length > 0
      ? sorts
      : defaultSort
        ? [defaultSort]
        : [{ field: DEFAULT_SORT_FIELD, order: DEFAULT_SORT_ORDER }];
  }

  /**
   * Convierte SortConfig[] a formato Prisma orderBy
   *
   * @example
   * toPrismaOrderBy([{ field: 'createdAt', order: 'desc' }]) → [{ createdAt: 'desc' }]
   */
  static toPrismaOrderBy(sorts: SortConfig[]): Record<string, 'asc' | 'desc'>[] {
    return sorts.map((sort) => ({ [sort.field]: sort.order }));
  }

  /**
   * Parsea filtros con operadores desde query params
   *
   * @example
   * // Input: { 'price[gte]': '100', 'price[lte]': '500', 'category': 'bebidas' }
   * // Output: { price: { gte: 100, lte: 500 }, category: { eq: 'bebidas' } }
   */
  static parseFilters(
    queryParams: Record<string, unknown>,
    config?: EntityFilterConfig,
  ): ParsedFilters {
    const filters: ParsedFilters = {};
    const operatorRegex = /^([a-zA-Z_][a-zA-Z0-9_]*)\[([a-z]+)\]$/;

    for (const [key, value] of Object.entries(queryParams)) {
      // Ignorar campos de paginación/ordenamiento
      if (['page', 'limit', 'sort', 'search', 'include', 'select'].includes(key)) {
        continue;
      }

      const match = key.match(operatorRegex);

      if (match) {
        // Formato con operador: field[operator]=value
        const [, fieldMatch, operatorMatch] = match;
        const field = fieldMatch as string;
        const operator = operatorMatch as string;

        // Validar que el campo esté permitido
        if (config && !this.isFieldAllowed(field, operator as FilterOperator, config)) {
          continue;
        }

        if (!filters[field]) {
          filters[field] = {};
        }

        const typedValue = this.parseValue(value, field, config);
        (filters[field] as Record<string, unknown>)[operator] = typedValue;
      } else {
        // Formato simple: field=value (operador eq implícito)
        // Validar que el campo esté permitido
        if (config && !this.isFieldAllowed(key, 'eq', config)) {
          continue;
        }

        const typedValue = this.parseValue(value, key, config);
        filters[key] = { eq: typedValue };
      }
    }

    return filters;
  }

  /**
   * Convierte ParsedFilters a formato Prisma where
   */
  static toPrismaWhere(
    filters: ParsedFilters,
    config?: EntityFilterConfig,
  ): Record<string, unknown> {
    const where: Record<string, unknown> = {};

    for (const [field, conditions] of Object.entries(filters)) {
      const fieldConfig = config?.filterableFields.find((f) => f.field === field);
      const dbField = fieldConfig?.dbField || field;

      if (typeof conditions === 'object' && conditions !== null) {
        const prismaCondition: Record<string, unknown> = {};

        for (const [operator, value] of Object.entries(conditions as Record<string, unknown>)) {
          const prismaOp = this.operatorToPrisma(operator as FilterOperator, value);
          Object.assign(prismaCondition, prismaOp);
        }

        where[dbField] = prismaCondition;
      }
    }

    return where;
  }

  /**
   * Convierte un operador a formato Prisma
   */
  private static operatorToPrisma(
    operator: FilterOperator,
    value: unknown,
  ): Record<string, unknown> {
    switch (operator) {
      case 'eq':
        return { equals: value };
      case 'ne':
        return { not: value };
      case 'gt':
        return { gt: value };
      case 'gte':
        return { gte: value };
      case 'lt':
        return { lt: value };
      case 'lte':
        return { lte: value };
      case 'in':
        return { in: Array.isArray(value) ? value : String(value).split(',') };
      case 'nin':
        return { notIn: Array.isArray(value) ? value : String(value).split(',') };
      case 'contains':
        return { contains: value, mode: 'insensitive' };
      case 'startsWith':
        return { startsWith: value, mode: 'insensitive' };
      case 'endsWith':
        return { endsWith: value, mode: 'insensitive' };
      case 'isNull':
        return value === true || value === 'true' ? { equals: null } : { not: null };
      case 'isNotNull':
        return { not: null };
      default:
        return { equals: value };
    }
  }

  /**
   * Verifica si un campo y operador están permitidos
   */
  private static isFieldAllowed(
    field: string,
    operator: FilterOperator,
    config: EntityFilterConfig,
  ): boolean {
    const fieldConfig = config.filterableFields.find((f) => f.field === field);
    if (!fieldConfig) return false;
    return fieldConfig.allowedOperators.includes(operator);
  }

  /**
   * Parsea el valor al tipo correcto según la configuración
   */
  private static parseValue(
    value: unknown,
    field: string,
    config?: EntityFilterConfig,
  ): unknown {
    if (value === undefined || value === null) return value;

    const fieldConfig = config?.filterableFields.find((f) => f.field === field);
    if (!fieldConfig) return value;

    const stringValue = String(value);

    switch (fieldConfig.type) {
      case 'number':
        return Number(stringValue);
      case 'boolean':
        return stringValue === 'true' || stringValue === '1';
      case 'date':
        return new Date(stringValue);
      default:
        return stringValue;
    }
  }

  /**
   * Construye búsqueda OR para múltiples campos (search global)
   */
  static buildSearchCondition(
    search: string,
    searchFields: string[],
  ): Record<string, unknown> {
    if (!search || searchFields.length === 0) {
      return {};
    }

    return {
      OR: searchFields.map((field) => ({
        [field]: {
          contains: search,
          mode: 'insensitive',
        },
      })),
    };
  }

  /**
   * Parsea include string a array de strings
   */
  static parseInclude(
    includeParam?: string | string[],
    allowedIncludes?: string[],
  ): string[] {
    if (!includeParam) return [];

    const includes = Array.isArray(includeParam)
      ? includeParam
      : includeParam.split(',').map((s) => s.trim());

    if (!allowedIncludes) return includes;

    return includes.filter((include) => allowedIncludes.includes(include));
  }

  /**
   * Parsea include a formato Prisma (Record<string, boolean>)
   */
  static parseIncludeToPrisma(
    includeParam?: string | string[],
    allowedIncludes?: string[],
  ): Record<string, boolean> {
    const includes = this.parseInclude(includeParam, allowedIncludes);
    const result: Record<string, boolean> = {};

    for (const include of includes) {
      result[include] = true;
    }

    return result;
  }

  /**
   * Método principal: parsea todos los query params
   */
  static parse(
    queryParams: Record<string, unknown>,
    config?: EntityFilterConfig,
  ): QueryParams {
    const page = Number(queryParams['page']) || 1;
    const limit = Math.min(Number(queryParams['limit']) || 10, config?.maxLimit || 100);

    return {
      page,
      limit,
      sort: queryParams['sort'] as string,
      search: queryParams['search'] as string,
      filters: this.parseFilters(queryParams, config),
      include: this.parseInclude(queryParams['include'] as string, config?.allowedIncludes),
    };
  }
}

/**
 * Helper para crear configuración de campos filtrables rápidamente
 */
export function createFilterableField(
  field: string,
  type: FilterableFieldConfig['type'],
  options?: Partial<FilterableFieldConfig>,
): FilterableFieldConfig {
  const defaultOperators: Record<FilterableFieldConfig['type'], FilterOperator[]> = {
    string: ['eq', 'ne', 'contains', 'startsWith', 'endsWith', 'in', 'nin'],
    number: ['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'in', 'nin'],
    boolean: ['eq', 'ne'],
    date: ['eq', 'ne', 'gt', 'gte', 'lt', 'lte'],
    uuid: ['eq', 'ne', 'in', 'nin'],
  };

  return {
    field,
    type,
    allowedOperators: options?.allowedOperators || defaultOperators[type],
    sortable: options?.sortable ?? true,
    searchable: options?.searchable ?? type === 'string',
    dbField: options?.dbField,
  };
}
