import { EntityFilterConfig } from '@shared/types';
import { createFilterableField } from '@shared/utils';

/**
 * Configuración de filtros para la entidad OperativeUser
 */
export const OPERATIVE_USER_FILTER_CONFIG: EntityFilterConfig = {
  filterableFields: [
    createFilterableField('fullName', 'string', { searchable: true }),
    createFilterableField('email', 'string', { searchable: true }),
    createFilterableField('phoneNumber', 'string', { searchable: true }),
    createFilterableField('employeeCode', 'string', { searchable: true }),
    createFilterableField('isActive', 'boolean'),
    createFilterableField('createdById', 'uuid'),
    createFilterableField('createdAt', 'date'),
  ],
  defaultSort: { field: 'createdAt', order: 'desc' },
  searchFields: ['fullName', 'email', 'employeeCode'],
  maxLimit: 100,
};
