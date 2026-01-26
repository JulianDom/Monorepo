import { EntityFilterConfig } from '@shared/types';
import { createFilterableField } from '@shared/utils';

/**
 * Configuración de filtros para la entidad Store
 */
export const STORE_FILTER_CONFIG: EntityFilterConfig = {
  filterableFields: [
    createFilterableField('name', 'string', { searchable: true }),
    createFilterableField('code', 'string', { searchable: true }),
    createFilterableField('address', 'string', { searchable: true }),
    createFilterableField('city', 'string'),
    createFilterableField('state', 'string'),
    createFilterableField('country', 'string'),
    createFilterableField('isActive', 'boolean'),
    createFilterableField('createdAt', 'date'),
  ],
  defaultSort: { field: 'name', order: 'asc' },
  searchFields: ['name', 'code', 'address'],
  maxLimit: 100,
};
