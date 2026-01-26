import { EntityFilterConfig } from '@shared/types';
import { createFilterableField } from '@shared/utils';

/**
 * Configuración de filtros para la entidad PriceRecord
 */
export const PRICE_RECORD_FILTER_CONFIG: EntityFilterConfig = {
  filterableFields: [
    createFilterableField('productId', 'uuid'),
    createFilterableField('storeId', 'uuid'),
    createFilterableField('operativeUserId', 'uuid'),
    createFilterableField('price', 'number'),
    createFilterableField('recordedAt', 'date'),
    createFilterableField('createdAt', 'date'),
  ],
  defaultSort: { field: 'recordedAt', order: 'desc' },
  searchFields: [],
  maxLimit: 100,
  allowedIncludes: ['product', 'store', 'operativeUser'],
};
