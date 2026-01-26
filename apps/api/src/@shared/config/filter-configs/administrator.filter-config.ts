import { EntityFilterConfig } from '@shared/types';
import { createFilterableField } from '@shared/utils';

/**
 * Configuración de filtros para la entidad Administrator
 */
export const ADMINISTRATOR_FILTER_CONFIG: EntityFilterConfig = {
  filterableFields: [
    createFilterableField('fullName', 'string', { searchable: true }),
    createFilterableField('email', 'string', { searchable: true }),
    createFilterableField('username', 'string', { searchable: true }),
    createFilterableField('isEnabled', 'boolean'),
    createFilterableField('createdAt', 'date'),
  ],
  defaultSort: { field: 'createdAt', order: 'desc' },
  searchFields: ['fullName', 'email', 'username'],
  maxLimit: 100,
};
