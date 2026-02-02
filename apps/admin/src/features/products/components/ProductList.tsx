/**
 * =============================================================================
 * COMPONENTE: ProductList
 * =============================================================================
 *
 * Este componente muestra la tabla de productos con:
 * - Búsqueda por texto
 * - Filtrado por estado (activo/inactivo)
 * - Ordenamiento por columnas
 * - Paginación
 *
 * PATRÓN DE DISEÑO:
 * - Es un componente "presentacional" (solo muestra datos)
 * - NO hace peticiones HTTP directamente
 * - Recibe datos y callbacks desde la página padre
 * - Usa el hook useDataTable para toda la lógica de tabla
 */
'use client';

// =============================================================================
// IMPORTS
// =============================================================================

/**
 * Iconos de Lucide React
 * - Plus: Botón crear
 * - Search: Input de búsqueda
 * - FileUp: Botón importar
 * - Edit: Botón editar fila
 * - Power: Botón activar/desactivar
 * - Package: Icono del header
 * - ArrowUpDown/Up/Down: Iconos de ordenamiento
 * - Loader2: Spinner de carga
 */
import {
  Plus,
  Search,
  FileUp,
  Edit,
  Power,
  Package,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Loader2,
} from 'lucide-react';

/**
 * Componentes UI de shadcn/ui
 * Estos son componentes reutilizables basados en Radix UI
 */
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

/**
 * Componente de paginación personalizado
 */
import { Pagination } from '@/components/shared/pagination';

/**
 * Hook personalizado que encapsula toda la lógica de:
 * - Búsqueda/filtrado
 * - Ordenamiento
 * - Paginación
 */
import { useDataTable } from '@/hooks';

/**
 * Tipo Product del paquete compartido
 * Contiene: id, name, brand, presentation, price, active, etc.
 */
import type { Product } from '@framework/shared-types';

// =============================================================================
// TIPOS
// =============================================================================

/**
 * Props que recibe el componente desde la página padre
 *
 * @property products - Array de productos a mostrar
 * @property isLoading - Si true, muestra skeleton/spinner
 * @property onCreateProduct - Callback cuando click en "Nuevo Producto"
 * @property onEditProduct - Callback cuando click en editar (recibe el producto)
 * @property onToggleActive - Callback cuando click en activar/desactivar (recibe el producto)
 * @property onImport - Callback cuando click en "Importar Excel"
 */
interface ProductListProps {
  products: Product[];
  isLoading?: boolean;
  onCreateProduct: () => void;
  onEditProduct: (product: Product) => void;
  onToggleActive: (product: Product) => void;
  onImport: () => void;
}

/**
 * Tipo para el filtro de estado
 * - 'all': Muestra todos
 * - 'active': Solo activos (active === true)
 * - 'inactive': Solo inactivos (active === false)
 */
type ProductFilter = 'all' | 'active' | 'inactive';

// =============================================================================
// COMPONENTE
// =============================================================================

export function ProductList({
  products,
  isLoading,
  onCreateProduct,
  onEditProduct,
  onToggleActive,
  onImport,
}: ProductListProps) {
  // ===========================================================================
  // HOOK useDataTable
  // ===========================================================================
  /**
   * Este hook encapsula TODA la lógica de manejo de tabla:
   *
   * CONFIGURACIÓN (lo que le pasamos):
   * - data: El array de productos
   * - searchFields: En qué campos buscar texto
   * - defaultSort: Ordenamiento inicial
   * - filterOptions: Campo booleano para filtrar
   * - defaultFilter: Filtro inicial
   * - itemsPerPage: Cuántos items por página
   *
   * RETORNO (lo que nos da):
   * - items: Array de productos YA filtrados, ordenados y paginados
   * - filteredCount: Total de items después de filtrar (para paginación)
   * - searchQuery/setSearchQuery: Estado de búsqueda
   * - filter/setFilter: Estado del filtro
   * - toggleSort: Función para cambiar ordenamiento
   * - getSortIcon: Función que retorna la dirección actual de un campo
   * - currentPage/setCurrentPage: Estado de paginación
   * - totalPages: Total de páginas calculado
   */
  const {
    items,              // Productos listos para mostrar (ya procesados)
    filteredCount,      // Total después de filtrar (antes de paginar)
    searchQuery,        // Texto de búsqueda actual
    setSearchQuery,     // Función para cambiar búsqueda
    filter,             // Filtro actual ('all' | 'active' | 'inactive')
    setFilter,          // Función para cambiar filtro
    toggleSort,         // Función: toggleSort('name') alterna asc/desc
    getSortIcon,        // Función: getSortIcon('name') retorna 'asc'|'desc'|null
    currentPage,        // Página actual (1, 2, 3...)
    setCurrentPage,     // Función para cambiar página
    totalPages,         // Total de páginas calculado
  } = useDataTable<Product, ProductFilter>({
    data: products,                              // Los productos que vienen de props
    searchFields: ['name', 'brand', 'presentation'], // Buscar en estos campos
    defaultSort: { field: 'name', direction: 'asc' }, // Ordenar por nombre inicial
    filterOptions: { field: 'active' },          // Filtrar por campo 'active'
    defaultFilter: 'all',                        // Mostrar todos inicialmente
    itemsPerPage: 10,                            // 10 productos por página
  });

  // ===========================================================================
  // COMPONENTE AUXILIAR: SortIcon
  // ===========================================================================
  /**
   * Componente que muestra el icono de ordenamiento según el estado
   *
   * @param field - El campo de la columna
   * @returns Icono correspondiente:
   *   - ArrowUp si está ordenado ascendente
   *   - ArrowDown si está ordenado descendente
   *   - ArrowUpDown (opaco) si no está ordenado por este campo
   */
  const SortIcon = ({ field }: { field: keyof Product }) => {
    const direction = getSortIcon(field);
    if (direction === 'asc') return <ArrowUp className="h-4 w-4" />;
    if (direction === 'desc') return <ArrowDown className="h-4 w-4" />;
    return <ArrowUpDown className="h-4 w-4 opacity-50" />;
  };

  // ===========================================================================
  // RENDER
  // ===========================================================================
  return (
    <div className="space-y-4 md:space-y-6">
      {/* ===================================================================== */}
      {/* HEADER: Título + Botones de acción */}
      {/* ===================================================================== */}
      <div className="flex flex-col gap-3 md:gap-4 md:flex-row md:items-center md:justify-between">
        {/* Icono y título */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Package className="h-5 w-5 md:h-6 md:w-6" />
          </div>
          <div>
            <h3>Gestión de Productos</h3>
            <p className="text-muted-foreground text-sm">
              Administra el catálogo de productos del sistema
            </p>
          </div>
        </div>

        {/* Botones: Importar y Crear */}
        <div className="flex gap-2">
          <Button onClick={onImport} variant="outline" className="flex-1 md:flex-none gap-2">
            <FileUp className="h-4 w-4" />
            <span className="hidden sm:inline">Importar Excel</span>
            <span className="sm:hidden">Importar</span>
          </Button>
          <Button onClick={onCreateProduct} className="flex-1 md:flex-none gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Producto
          </Button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* BARRA DE BÚSQUEDA */}
      {/* ===================================================================== */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="relative">
            {/* Icono de búsqueda (decorativo) */}
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            {/* Input controlado: value viene del hook, onChange actualiza el hook */}
            <Input
              placeholder="Buscar por nombre, marca o presentación"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* TABLA */}
      {/* ===================================================================== */}
      <div className="rounded-lg border border-border bg-card">
        <div className="overflow-x-auto">
          <Table className="lg:min-w-full">
            {/* ============================================================= */}
            {/* HEADER DE LA TABLA */}
            {/* ============================================================= */}
            <TableHeader>
              <TableRow>
                {/* Columna: Nombre (ordenable) */}
                <TableHead>
                  <button
                    onClick={() => toggleSort('name')}
                    className="flex items-center gap-2 hover:text-foreground transition-colors"
                  >
                    Nombre
                    <SortIcon field="name" />
                  </button>
                </TableHead>

                {/* Columna: Marca (ordenable) */}
                <TableHead>
                  <button
                    onClick={() => toggleSort('brand')}
                    className="flex items-center gap-2 hover:text-foreground transition-colors"
                  >
                    Marca
                    <SortIcon field="brand" />
                  </button>
                </TableHead>

                {/* Columna: Presentación (ordenable) */}
                <TableHead>
                  <button
                    onClick={() => toggleSort('presentation')}
                    className="flex items-center gap-2 hover:text-foreground transition-colors"
                  >
                    Presentación
                    <SortIcon field="presentation" />
                  </button>
                </TableHead>

                {/* Columna: Precio (ordenable) */}
                <TableHead>
                  <button
                    onClick={() => toggleSort('price')}
                    className="flex items-center gap-2 hover:text-foreground transition-colors"
                  >
                    Precio
                    <SortIcon field="price" />
                  </button>
                </TableHead>

                {/* Columna: Estado (filtrable con Select) */}
                <TableHead>
                  <Select value={filter} onValueChange={(v) => setFilter(v as ProductFilter)}>
                    <SelectTrigger className="w-full border-0 shadow-none hover:bg-muted/50 focus:ring-0 h-auto p-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      <SelectItem value="active">Activos</SelectItem>
                      <SelectItem value="inactive">Inactivos</SelectItem>
                    </SelectContent>
                  </Select>
                </TableHead>

                {/* Columna: Acciones */}
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>

            {/* ============================================================= */}
            {/* BODY DE LA TABLA */}
            {/* ============================================================= */}
            <TableBody>
              {/* Estado: Cargando */}
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
                      <p className="text-muted-foreground">Cargando productos...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                /* Estado: Sin resultados */
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Package className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">No se encontraron productos</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                /* Estado: Con datos - Mapear cada producto a una fila */
                items.map((product) => (
                  <TableRow 
                    key={product.id}
                    className="cursor-pointer"
                    onClick={() => onEditProduct(product)}
                  >
                    {/* Celda: Nombre + Descripción */}
                    <TableCell>
                      <div className="font-medium text-foreground">{product.name}</div>
                      {product.description && (
                        <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {product.description}
                        </div>
                      )}
                    </TableCell>

                    {/* Celda: Marca */}
                    <TableCell className="text-foreground">{product.brand ?? '-'}</TableCell>

                    {/* Celda: Presentación */}
                    <TableCell className="text-foreground">{product.presentation}</TableCell>

                    {/* Celda: Precio (formateado) */}
                    <TableCell className="text-foreground font-medium">
                      ${product.price.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </TableCell>

                    {/* Celda: Badge de estado */}
                    <TableCell>
                      <Badge
                        variant={product.active ? 'default' : 'secondary'}
                        className={
                          product.active
                            ? 'bg-green-600 text-white hover:bg-green-700 border-0'
                            : 'bg-muted text-muted-foreground hover:bg-muted border-0'
                        }
                      >
                        {product.active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>

                    {/* Celda: Botones de acción */}
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {/* Botón Editar: Llama a onEditProduct con el producto */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditProduct(product);
                          }}
                          className="h-8 w-8 p-0 hover:bg-accent"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>

                        {/* Botón Toggle: Llama a onToggleActive con el producto */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleActive(product);
                          }}
                          className="h-8 w-8 p-0 hover:bg-accent"
                          title={product.active ? 'Desactivar' : 'Activar'}
                        >
                          <Power className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* ================================================================= */}
        {/* PAGINACIÓN */}
        {/* ================================================================= */}
        {filteredCount > 0 && (
          <div className="border-t border-border px-4 md:px-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={10}
              totalItems={filteredCount}
            />
          </div>
        )}
      </div>
    </div>
  );
}
