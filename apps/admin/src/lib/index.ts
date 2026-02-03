// HTTP Client
export { apiClient } from './api-client';

// Utilities
export { cn } from './utils';

// URL Search Params helpers
export {
  getSearchParam,
  getSearchParamNumber,
  getSearchParamBoolean,
  createSearchParams,
  updateSearchParams,
} from './search-params';

// Service Factory
export { createApiService, type CrudService } from './create-api-service';

// SEO
export { generatePageMetadata, rootMetadata } from './seo';
