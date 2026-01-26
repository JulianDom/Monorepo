import { EntityFilterConfig } from '@shared/types';
import { createFilterableField } from '@shared/utils';

/**
 * Configuración de filtros para la entidad Product
 *
 * Define qué campos son filtrables, con qué operadores,
 * y cuáles son buscables en el search global.
 */
export const PRODUCT_FILTER_CONFIG: EntityFilterConfig = {
  filterableFields: [
    createFilterableField('name', 'string', { searchable: true }),
    createFilterableField('sku', 'string', { searchable: true }),
    createFilterableField('barcode', 'string', { searchable: true }),
    createFilterableField('category', 'string'),
    createFilterableField('brand', 'string'),
    createFilterableField('presentation', 'string'),
    createFilterableField('unitPrice', 'number'),
    createFilterableField('isActive', 'boolean'),
    createFilterableField('createdAt', 'date'),
    createFilterableField('updatedAt', 'date'),
  ],
  defaultSort: { field: 'createdAt', order: 'desc' },
  searchFields: ['name', 'sku', 'barcode', 'description'],
  maxLimit: 100,
};
