/**
 * Parser de sort string a Prisma orderBy
 * Ejemplo: "-createdAt" -> { createdAt: 'desc' }
 * Ejemplo: "name" -> { name: 'asc' }
 */
export function parseSort<T extends string>(
  sort: string | undefined,
  allowedFields: T[],
  defaultSort: Record<string, 'asc' | 'desc'> = { createdAt: 'desc' },
): Record<string, 'asc' | 'desc'> {
  if (!sort) return defaultSort;

  const desc = sort.startsWith('-');
  const field = desc ? sort.slice(1) : sort;

  if (!allowedFields.includes(field as T)) {
    return defaultSort;
  }

  return { [field]: desc ? 'desc' : 'asc' };
}

/**
 * Construir where clause con soft delete automatico
 */
export function withSoftDelete<T extends Record<string, unknown>>(
  where: T,
  includeDeleted = false,
): T & { deletedAt: null } | T {
  if (includeDeleted) return where;
  return { ...where, deletedAt: null };
}

/**
 * Construir search condition para multiples campos
 */
export function buildSearchCondition(
  search: string | undefined,
  fields: string[],
): { OR: Record<string, { contains: string; mode: 'insensitive' }>[] } | undefined {
  if (!search || !search.trim()) return undefined;

  return {
    OR: fields.map((field) => ({
      [field]: { contains: search.trim(), mode: 'insensitive' as const },
    })),
  };
}

/**
 * Construir condicion de rango de fechas
 */
export function buildDateRangeCondition(
  field: string,
  dateFrom?: string,
  dateTo?: string,
): Record<string, { gte?: Date; lte?: Date }> | undefined {
  if (!dateFrom && !dateTo) return undefined;

  const condition: { gte?: Date; lte?: Date } = {};

  if (dateFrom) {
    condition.gte = new Date(dateFrom);
  }

  if (dateTo) {
    condition.lte = new Date(dateTo);
  }

  return { [field]: condition };
}

/**
 * Calcular skip para paginacion
 */
export function calculateSkip(page: number, limit: number): number {
  return (Math.max(page, 1) - 1) * limit;
}

/**
 * Normalizar limit con maximo
 */
export function normalizeLimit(limit: number, max = 100): number {
  return Math.min(Math.max(limit, 1), max);
}

/**
 * Verificar si un registro existe por ID (con soft delete)
 */
export async function existsById(
  model: { count: (args: { where: Record<string, unknown> }) => Promise<number> },
  id: string,
): Promise<boolean> {
  const count = await model.count({
    where: { id, deletedAt: null },
  });
  return count > 0;
}

/**
 * Verificar duplicado case-insensitive
 */
export async function existsDuplicate(
  model: { count: (args: { where: Record<string, unknown> }) => Promise<number> },
  fields: Record<string, string>,
  excludeId?: string,
): Promise<boolean> {
  const where: Record<string, unknown> = {
    deletedAt: null,
  };

  for (const [key, value] of Object.entries(fields)) {
    where[key] = { equals: value, mode: 'insensitive' };
  }

  if (excludeId) {
    where['id'] = { not: excludeId };
  }

  const count = await model.count({ where });
  return count > 0;
}
