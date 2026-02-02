/**
 * =============================================================================
 * PAGINA DE PRODUCTOS - /dashboard/products
 * =============================================================================
 *
 * Esta es la página principal del módulo de productos.
 * Next.js App Router convierte este archivo en la ruta /dashboard/products
 *
 * FLUJO GENERAL:
 * 1. Usuario entra a /dashboard/products
 * 2. Se muestra la lista de productos (ProductList)
 * 3. Usuario puede: crear, editar, activar/desactivar productos
 * 4. Los cambios de vista se manejan con useState (viewMode)
 * 5. Los diálogos de confirmación usan el hook useConfirmAction
 */
'use client'; // OBLIGATORIO: Indica que este es un Client Component (usa hooks de React)

import { useState } from 'react';

// ============================================================================
// IMPORTS DE COMPONENTES
// ============================================================================
// Estos son los componentes visuales que se renderizan en la página
import { ProductList } from '@/features/products/components/ProductList';    // Tabla de productos
import { ProductForm } from '@/features/products/components/ProductForm';    // Formulario crear/editar
import { ProductImport } from '@/features/products/components/ProductImport'; // Importar desde Excel
import { ImportReport } from '@/features/products/components/ImportReport';   // Reporte post-importación
import { ConfirmDialog } from '@/components/ui/confirm-dialog';              // Diálogo de confirmación reutilizable

// ============================================================================
// IMPORTS DE HOOKS
// ============================================================================
// useConfirmAction: Maneja el estado del diálogo de confirmación (abrir/cerrar/confirmar)
// getConfirmDialogTexts: Genera los textos del diálogo según el tipo de acción
import { useConfirmAction, getConfirmDialogTexts } from '@/hooks';

// ============================================================================
// IMPORTS DEL FEATURE (SERVICIO + HOOKS + TIPOS)
// ============================================================================
// Estos vienen del archivo features/products/index.ts que usa los factories
// - useProducts: Hook para obtener la lista de productos (React Query)
// - useCreateProduct: Hook para crear un producto (mutation)
// - useUpdateProduct: Hook para actualizar un producto (mutation)
// - useToggleProductStatus: Hook para activar/desactivar (mutation)
// - Product, CreateProductDTO, UpdateProductDTO: Tipos TypeScript
import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useToggleProductStatus,
  type Product,
  type CreateProductDTO,
  type UpdateProductDTO,
} from '@/features/products';

// ============================================================================
// TIPOS LOCALES
// ============================================================================

/**
 * ProductView define las vistas posibles de esta página:
 * - 'list': Muestra la tabla de productos
 * - 'create': Muestra el formulario vacío para crear
 * - 'edit': Muestra el formulario con datos para editar
 * - 'import': Muestra la pantalla de importación Excel
 * - 'report': Muestra el reporte después de importar
 */
export type ProductView = 'list' | 'create' | 'edit' | 'import' | 'report';

/**
 * ImportResult: Resultado de una importación de Excel
 */
export type ImportResult = {
  total: number;       // Total de registros procesados
  exitosos: number;    // Cantidad exitosos
  errores: number;     // Cantidad con errores
  registros: ImportRecord[]; // Detalle de cada registro
};

export type ImportRecord = {
  linea: number;
  codigo: string;
  nombre: string;
  estado: 'exito' | 'error';
  mensaje?: string;
};

// ============================================================================
// COMPONENTE PRINCIPAL DE LA PÁGINA
// ============================================================================

/**
 * ProductsPage es el componente que Next.js renderiza cuando
 * el usuario navega a /dashboard/products
 *
 * Por convención de Next.js App Router, el archivo debe:
 * - Llamarse page.tsx
 * - Exportar un componente como default
 */
export default function ProductsPage() {
  // ==========================================================================
  // ESTADO LOCAL (useState)
  // ==========================================================================

  /**
   * currentView: Controla qué vista se muestra
   * - Inicia en 'list' (tabla de productos)
   * - Cambia a 'create'/'edit' cuando el usuario hace click en crear/editar
   */
  const [currentView, setCurrentView] = useState<ProductView>('list');

  /**
   * selectedProduct: Almacena el producto seleccionado para editar
   * - Es null cuando creamos uno nuevo
   * - Contiene el producto cuando editamos uno existente
   */
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  /**
   * importResult: Almacena el resultado de la última importación
   * - Se usa para mostrar el reporte después de importar
   */
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  // ==========================================================================
  // HOOKS DE REACT QUERY (Server State)
  // ==========================================================================
  // Estos hooks vienen del factory createCrudHooksWithStatus
  // Se encargan de: hacer peticiones HTTP, cachear datos, manejar loading/error

  /**
   * useProducts(): Obtiene la lista de productos
   * - data: Contiene { data: Product[], total: number, ... }
   * - isLoading: true mientras carga
   * - error: Contiene el error si falla
   * - Automáticamente cachea los datos y los refresca
   */
  const { data: productsData, isLoading } = useProducts();

  /**
   * useCreateProduct(): Mutation para crear productos
   * - createProduct.mutate(data): Ejecuta la petición POST
   * - createProduct.isPending: true mientras se envía
   * - Automáticamente invalida el cache al completar
   */
  const createProduct = useCreateProduct();

  /**
   * useUpdateProduct(): Mutation para actualizar productos
   * - updateProduct.mutate({ id, data }): Ejecuta PUT /products/:id
   */
  const updateProduct = useUpdateProduct();

  /**
   * useToggleProductStatus(): Mutation para activar/desactivar
   * - toggleStatus.mutate({ id, enable }): Ejecuta PATCH /products/:id/status
   * - IMPORTANTE: El parámetro se llama "enable", NO "active"
   */
  const toggleStatus = useToggleProductStatus();

  /**
   * Extraemos el array de productos de la respuesta
   * - Si no hay datos todavía, usamos array vacío
   * - El operador ?? es "nullish coalescing" (valor por defecto si es null/undefined)
   */
  const products = productsData?.data ?? [];

  // ==========================================================================
  // HOOK useConfirmAction (Diálogo de Confirmación)
  // ==========================================================================

  /**
   * useConfirmAction: Hook personalizado que maneja:
   * - El estado del diálogo (abierto/cerrado)
   * - El item seleccionado para la acción
   * - El tipo de acción (toggle/delete)
   *
   * Retorna:
   * - confirmState: Estado actual { isOpen, type, item }
   * - requestToggle: Función para abrir el diálogo de toggle
   * - cancel: Función para cerrar el diálogo
   * - confirm: Función para confirmar la acción
   */
  const {
    confirmState,
    requestToggle,
    cancel,
    confirm,
  } = useConfirmAction<Product>({
    /**
     * onToggle: Se ejecuta cuando el usuario confirma el toggle
     * @param id - ID del producto
     * @param currentActive - Estado actual (true = activo, false = inactivo)
     *
     * IMPORTANTE: Usamos "enable: !currentActive" para invertir el estado
     * El factory mapea "enable" → "activate" para el backend
     */
    onToggle: (id, currentActive) => {
      toggleStatus.mutate({ id, enable: !currentActive });
    },
  });

  /**
   * getConfirmDialogTexts: Genera los textos del diálogo dinámicamente
   * @param type - Tipo de acción ('toggle' | 'delete')
   * @param item - El producto seleccionado (o null)
   * @param entityName - Nombre de la entidad para los textos
   * @param getItemName - Función para obtener el nombre a mostrar
   *
   * Retorna: { title, description, confirmText, isDestructive }
   */
  const dialogTexts = getConfirmDialogTexts(
    confirmState.type,           // 'toggle' en este caso
    confirmState.item,           // El producto seleccionado
    'Producto',                  // "¿Desactivar Producto?"
    (product) => product.name    // Usa el nombre del producto en el mensaje
  );

  // ==========================================================================
  // HANDLERS (Funciones que manejan eventos)
  // ==========================================================================

  /**
   * handleCreateProduct: Abre el formulario vacío para crear
   */
  const handleCreateProduct = () => {
    setSelectedProduct(null);      // Sin producto seleccionado = crear nuevo
    setCurrentView('create');      // Cambia a vista de formulario
  };

  /**
   * handleEditProduct: Abre el formulario con datos para editar
   * @param product - El producto a editar
   */
  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);   // Guarda el producto a editar
    setCurrentView('edit');        // Cambia a vista de formulario
  };

  /**
   * handleSaveProduct: Guarda el producto (crear o actualizar)
   * @param data - Datos del formulario
   *
   * Determina si crear o actualizar según currentView
   */
  const handleSaveProduct = (data: CreateProductDTO | UpdateProductDTO) => {
    if (currentView === 'create') {
      // CREAR: POST /products
      createProduct.mutate(data as CreateProductDTO, {
        onSuccess: () => {
          // Después de crear exitosamente, volver a la lista
          setCurrentView('list');
          setSelectedProduct(null);
        },
      });
    } else if (currentView === 'edit' && selectedProduct) {
      // ACTUALIZAR: PUT /products/:id
      updateProduct.mutate(
        { id: selectedProduct.id, data: data as UpdateProductDTO },
        {
          onSuccess: () => {
            // Después de actualizar, volver a la lista
            setCurrentView('list');
            setSelectedProduct(null);
          },
        }
      );
    }
  };

  /**
   * handleImport: Abre la vista de importación
   */
  const handleImport = () => {
    setCurrentView('import');
  };

  /**
   * handleImportComplete: Después de importar, muestra el reporte
   * @param result - Resultado de la importación
   */
  const handleImportComplete = (result: ImportResult) => {
    setImportResult(result);
    setCurrentView('report');
  };

  /**
   * handleBackToList: Vuelve a la lista desde cualquier vista
   */
  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedProduct(null);
    setImportResult(null);
  };

  // ==========================================================================
  // RENDER (JSX)
  // ==========================================================================

  return (
    <>
      {/* ================================================================== */}
      {/* VISTA: LISTA DE PRODUCTOS */}
      {/* ================================================================== */}
      {currentView === 'list' && (
        <ProductList
          products={products}              // Array de productos a mostrar
          isLoading={isLoading}            // Muestra skeleton mientras carga
          onCreateProduct={handleCreateProduct}  // Click en "Nuevo Producto"
          onEditProduct={handleEditProduct}      // Click en botón editar
          onToggleActive={requestToggle}         // Click en botón activar/desactivar
          onImport={handleImport}                // Click en "Importar Excel"
        />
      )}

      {/* ================================================================== */}
      {/* VISTA: FORMULARIO (crear o editar) */}
      {/* ================================================================== */}
      {(currentView === 'create' || currentView === 'edit') && (
        <ProductForm
          product={selectedProduct}                                    // null = crear, objeto = editar
          onSave={handleSaveProduct}                                   // Guardar formulario
          onCancel={handleBackToList}                                  // Cancelar y volver
          isLoading={createProduct.isPending || updateProduct.isPending} // Deshabilitar mientras guarda
        />
      )}

      {/* ================================================================== */}
      {/* VISTA: IMPORTACIÓN */}
      {/* ================================================================== */}
      {currentView === 'import' && (
        <ProductImport
          onImportComplete={handleImportComplete}  // Cuando termina la importación
          onCancel={handleBackToList}              // Cancelar
        />
      )}

      {/* ================================================================== */}
      {/* VISTA: REPORTE DE IMPORTACIÓN */}
      {/* ================================================================== */}
      {currentView === 'report' && importResult && (
        <ImportReport
          result={importResult}      // Datos del reporte
          onBack={handleBackToList}  // Volver a la lista
        />
      )}

      {/* ================================================================== */}
      {/* DIÁLOGO DE CONFIRMACIÓN */}
      {/* ================================================================== */}
      {/* Este diálogo siempre está en el DOM pero solo se muestra cuando isOpen=true */}
      <ConfirmDialog
        isOpen={confirmState.isOpen}   // Controla si se muestra
        onClose={cancel}               // Cerrar sin confirmar
        onConfirm={confirm}            // Confirmar la acción
        title={dialogTexts.title}      // "¿Desactivar Producto?" o "¿Activar Producto?"
        description={dialogTexts.description}  // Mensaje explicativo
        confirmText={dialogTexts.confirmText}  // "Desactivar" o "Activar"
        variant={dialogTexts.isDestructive ? 'destructive' : 'default'} // Rojo si es destructivo
      />
    </>
  );
}
