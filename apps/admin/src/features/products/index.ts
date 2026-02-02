/**
 * =============================================================================
 * FEATURE: Products
 * =============================================================================
 *
 * Este archivo es el "punto de entrada" del módulo de productos.
 * Centraliza TODO lo necesario para trabajar con productos:
 * - Servicio HTTP (CRUD)
 * - Hooks de React Query
 * - Tipos TypeScript
 *
 * PATRÓN: Feature Module
 * En lugar de tener archivos separados (services/, hooks/, types/),
 * usamos factories que generan todo automáticamente.
 *
 * VENTAJAS:
 * - Menos código (~30 líneas vs ~200 líneas manual)
 * - Consistencia entre features
 * - Mantenimiento centralizado
 *
 * USO:
 * ```typescript
 * import {
 *   useProducts,
 *   useCreateProduct,
 *   useToggleProductStatus,
 *   type Product,
 * } from '@/features/products';
 * ```
 */
'use client'; // Necesario porque usa hooks de React

// =============================================================================
// IMPORTS
// =============================================================================

/**
 * Factories del paquete compartido @framework/shared-utils
 *
 * createCrudServiceWithStatus: Genera un servicio con métodos CRUD + toggle
 * createCrudHooksWithStatus: Genera hooks de React Query para el servicio
 */
import { createCrudServiceWithStatus, createCrudHooksWithStatus } from '@framework/shared-utils';

/**
 * Cliente HTTP configurado con:
 * - Base URL de la API
 * - Interceptor que agrega el token Bearer
 * - Manejo de errores 401
 */
import { apiClient } from '@/lib/api-client';

/**
 * Endpoints de la API definidos centralmente
 * ENDPOINTS.PRODUCTS = '/products'
 */
import { ENDPOINTS } from '@/config';

/**
 * Librería para mostrar notificaciones toast
 * Los hooks la usan para mostrar mensajes de éxito/error
 */
import { toast } from 'sonner';

/**
 * Tipos TypeScript del paquete compartido
 *
 * Product: La entidad completa (id, name, price, active, etc.)
 * CreateProductDTO: Datos para crear (sin id, sin timestamps)
 * UpdateProductDTO: Datos para actualizar (todos opcionales)
 * ProductListParams: Parámetros de query (page, limit, search)
 */
import type {
  Product,
  CreateProductDTO,
  UpdateProductDTO,
  ProductListParams,
} from '@framework/shared-types';

// =============================================================================
// SERVICIO
// =============================================================================

/**
 * productService: Objeto con métodos para comunicarse con la API
 *
 * GENERADO POR: createCrudServiceWithStatus(apiClient, endpoint)
 *
 * MÉTODOS DISPONIBLES:
 * - productService.list(params)           → GET    /products
 * - productService.getById(id)            → GET    /products/:id
 * - productService.create(data)           → POST   /products
 * - productService.update(id, data)       → PUT    /products/:id
 * - productService.delete(id)             → DELETE /products/:id
 * - productService.toggleStatus(id, data) → PATCH  /products/:id/status
 *
 * TIPOS GENÉRICOS:
 * - Product: Tipo de la entidad (lo que retorna la API)
 * - CreateProductDTO: Tipo para crear
 * - UpdateProductDTO: Tipo para actualizar
 * - ProductListParams: Tipo para parámetros de lista
 */
export const productService = createCrudServiceWithStatus<
  Product,
  CreateProductDTO,
  UpdateProductDTO,
  ProductListParams
>(apiClient, ENDPOINTS.PRODUCTS);

// =============================================================================
// HOOKS
// =============================================================================

/**
 * Hooks de React Query para productos
 *
 * GENERADOS POR: createCrudHooksWithStatus(key, service, toast, config)
 *
 * PARÁMETROS:
 * - 'products': Key para el cache de React Query
 * - productService: El servicio que creamos arriba
 * - toast: Función para mostrar notificaciones
 * - config: Configuración de mensajes
 *
 * HOOKS GENERADOS:
 *
 * 1. useProducts() - Query para listar
 *    const { data, isLoading, error } = useProducts();
 *    // data.data = Product[]
 *
 * 2. useProduct(id) - Query para detalle
 *    const { data, isLoading } = useProduct('123');
 *
 * 3. useCreateProduct() - Mutation para crear
 *    const create = useCreateProduct();
 *    create.mutate(productData);
 *
 * 4. useUpdateProduct() - Mutation para actualizar
 *    const update = useUpdateProduct();
 *    update.mutate({ id: '123', data: productData });
 *
 * 5. useDeleteProduct() - Mutation para eliminar
 *    const delete = useDeleteProduct();
 *    delete.mutate('123');
 *
 * 6. useToggleProductStatus() - Mutation para activar/desactivar
 *    const toggle = useToggleProductStatus();
 *    toggle.mutate({ id: '123', enable: true });
 *
 * FEATURES AUTOMÁTICAS:
 * - Cache inteligente (no recarga si ya tiene datos)
 * - Invalidación automática (recarga lista después de mutación)
 * - Toasts automáticos de éxito/error
 * - Estados de loading/error
 */
export const {
  keys: productKeys,                    // Query keys para cache manual
  useList: useProducts,                 // Hook para listar
  useDetail: useProduct,                // Hook para detalle
  useCreate: useCreateProduct,          // Hook para crear
  useUpdate: useUpdateProduct,          // Hook para actualizar
  useDelete: useDeleteProduct,          // Hook para eliminar
  useToggleStatus: useToggleProductStatus, // Hook para toggle status
} = createCrudHooksWithStatus('products', productService, toast, {
  entityName: 'Producto',        // Singular para mensajes: "Producto creado"
  entityNamePlural: 'Productos', // Plural para mensajes: "Productos cargados"
});

// =============================================================================
// RE-EXPORTS
// =============================================================================

/**
 * Re-exportamos solo los tipos que se usan actualmente.
 * Si necesitas tipos adicionales, importalos directamente de @framework/shared-types
 *
 * EJEMPLO:
 * ```typescript
 * import { useProducts, type Product } from '@/features/products';
 * ```
 */
export type {
  Product,
  CreateProductDTO,
  UpdateProductDTO,
} from '@framework/shared-types';
