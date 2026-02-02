/**
 * =============================================================================
 * COMPONENTE: PriceList
 * =============================================================================
 *
 * Lista de relevamientos de precios (read-only).
 * Usa PriceRecord con relaciones según API.
 */
import { useState } from 'react';
import { TrendingUp, Filter, Eye, Search, Calendar, X, ArrowUpDown, ArrowUp, ArrowDown, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Pagination } from '@/components/shared/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import type { PriceRecord } from '@/features/prices';

// =============================================================================
// TIPOS
// =============================================================================

interface PriceListProps {
  priceRecords: PriceRecord[];
  isLoading?: boolean;
  onViewDetail: (record: PriceRecord) => void;
}

type SortField = 'recordedAt' | 'productName' | 'storeName' | 'operativeUserName' | 'price';
type SortOrder = 'asc' | 'desc';

// =============================================================================
// HELPERS
// =============================================================================

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
  }).format(value);
};

// Helpers para acceder a datos de relaciones
const getProductName = (record: PriceRecord) => record.product?.name ?? '-';
const getProductPresentation = (record: PriceRecord) => record.product?.presentation ?? '';
const getStoreName = (record: PriceRecord) => record.store?.name ?? '-';
const getStoreLocality = (record: PriceRecord) => record.store?.locality ?? '';
const getOperativeUserName = (record: PriceRecord) => record.operativeUser?.fullName ?? '-';

// =============================================================================
// COMPONENTE
// =============================================================================

export function PriceList({
  priceRecords,
  isLoading = false,
  onViewDetail,
}: PriceListProps) {
  // -------------------------------------------------------------------------
  // ESTADO
  // -------------------------------------------------------------------------
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('recordedAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const itemsPerPage = 10;

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedStore, setSelectedStore] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState('all');

  // Valores únicos para filtros
  const uniqueStores = Array.from(new Set(priceRecords.map(r => r.store?.name).filter(Boolean))).sort();
  const uniqueProducts = Array.from(new Set(priceRecords.map(r => r.product?.name).filter(Boolean))).sort();

  // -------------------------------------------------------------------------
  // HANDLERS
  // -------------------------------------------------------------------------
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder(field === 'recordedAt' || field === 'price' ? 'desc' : 'asc');
    }
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setDateFrom('');
    setDateTo('');
    setSelectedStore('all');
    setSelectedProduct('all');
    setSearchTerm('');
    setCurrentPage(1);
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4 opacity-50" />;
    return sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  // -------------------------------------------------------------------------
  // FILTRADO Y ORDENAMIENTO
  // -------------------------------------------------------------------------
  const filteredRecords = priceRecords.filter(record => {
    const productName = getProductName(record).toLowerCase();
    const storeName = getStoreName(record).toLowerCase();
    const userName = getOperativeUserName(record).toLowerCase();
    const searchLower = searchTerm.toLowerCase();

    const matchesSearch =
      productName.includes(searchLower) ||
      storeName.includes(searchLower) ||
      userName.includes(searchLower);

    const recordDate = new Date(record.recordedAt);
    const matchesDateFrom = !dateFrom || recordDate >= new Date(dateFrom);
    const matchesDateTo = !dateTo || recordDate <= new Date(dateTo + 'T23:59:59');

    const matchesStore = selectedStore === 'all' || record.store?.name === selectedStore;
    const matchesProduct = selectedProduct === 'all' || record.product?.name === selectedProduct;

    return matchesSearch && matchesDateFrom && matchesDateTo && matchesStore && matchesProduct;
  });

  const sortedRecords = [...filteredRecords].sort((a, b) => {
    let aValue: string | number = '';
    let bValue: string | number = '';

    switch (sortField) {
      case 'recordedAt':
        aValue = new Date(a.recordedAt).getTime();
        bValue = new Date(b.recordedAt).getTime();
        break;
      case 'price':
        aValue = a.price;
        bValue = b.price;
        break;
      case 'productName':
        aValue = getProductName(a).toLowerCase();
        bValue = getProductName(b).toLowerCase();
        break;
      case 'storeName':
        aValue = getStoreName(a).toLowerCase();
        bValue = getStoreName(b).toLowerCase();
        break;
      case 'operativeUserName':
        aValue = getOperativeUserName(a).toLowerCase();
        bValue = getOperativeUserName(b).toLowerCase();
        break;
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    }
    return aValue < bValue ? 1 : -1;
  });

  // Paginación
  const totalPages = Math.ceil(sortedRecords.length / itemsPerPage);
  const paginatedRecords = sortedRecords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const activeFiltersCount = [dateFrom, dateTo, selectedStore !== 'all' ? selectedStore : '', selectedProduct !== 'all' ? selectedProduct : ''].filter(Boolean).length;

  // Estadísticas
  const totalRecords = filteredRecords.length;
  const averagePrice = totalRecords > 0
    ? filteredRecords.reduce((sum, r) => sum + r.price, 0) / totalRecords
    : 0;
  const minPrice = totalRecords > 0
    ? Math.min(...filteredRecords.map(r => r.price))
    : 0;
  const maxPrice = totalRecords > 0
    ? Math.max(...filteredRecords.map(r => r.price))
    : 0;

  // -------------------------------------------------------------------------
  // LOADING STATE
  // -------------------------------------------------------------------------
  if (isLoading) {
    return (
      <div className="space-y-4 md:space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 md:h-12 md:w-12 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
        <div className="rounded-lg border border-border">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 border-b border-border last:border-0">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // EMPTY STATE
  // -------------------------------------------------------------------------
  if (priceRecords.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <TrendingUp className="h-5 w-5 md:h-6 md:w-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Visualización de Precios</h3>
            <p className="text-muted-foreground text-sm">Consulta los relevamientos de precios</p>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-12">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <div className="rounded-full bg-muted p-4">
              <TrendingUp className="h-12 w-12 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <p className="font-medium text-lg">No hay relevamientos de precios</p>
              <p className="text-muted-foreground text-sm">
                Los relevamientos de precios realizados por los usuarios operativos aparecerán aquí.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // RENDER
  // -------------------------------------------------------------------------
  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <TrendingUp className="h-5 w-5 md:h-6 md:w-6" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Visualización de Precios</h3>
          <p className="text-muted-foreground text-sm">
            {filteredRecords.length} de {priceRecords.length} relevamientos
          </p>
        </div>
      </div>

      {/* Búsqueda y Filtros */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar por producto, local o usuario..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant={showFilters ? 'default' : 'outline'}
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Filtros
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </div>

          {/* Panel de Filtros */}
          {showFilters && (
            <div className="space-y-4 border-t border-border pt-4">
              <div className="flex items-center justify-between">
                <p className="font-medium">Filtros avanzados</p>
                {activeFiltersCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={handleClearFilters} className="gap-2">
                    <X className="h-4 w-4" />
                    Limpiar filtros
                  </Button>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <Label>
                    <Calendar className="inline h-4 w-4 mr-1" />
                    Fecha desde
                  </Label>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>
                    <Calendar className="inline h-4 w-4 mr-1" />
                    Fecha hasta
                  </Label>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Local</Label>
                  <Select value={selectedStore} onValueChange={setSelectedStore}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los locales" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los locales</SelectItem>
                      {uniqueStores.map((store) => (
                        <SelectItem key={store} value={store!}>{store}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Producto</Label>
                  <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los productos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los productos</SelectItem>
                      {uniqueProducts.map((product) => (
                        <SelectItem key={product} value={product!}>{product}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="text-2xl font-semibold">{totalRecords}</div>
          <div className="text-sm text-muted-foreground">Total Relevamientos</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="text-2xl font-semibold">{formatCurrency(averagePrice)}</div>
          <div className="text-sm text-muted-foreground">Precio Promedio</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="text-2xl font-semibold text-green-600">{formatCurrency(minPrice)}</div>
          <div className="text-sm text-muted-foreground">Precio Mínimo</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="text-2xl font-semibold text-destructive">{formatCurrency(maxPrice)}</div>
          <div className="text-sm text-muted-foreground">Precio Máximo</div>
        </div>
      </div>

      {/* Tabla */}
      <div className="rounded-lg border border-border bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <button
                    onClick={() => handleSort('recordedAt')}
                    className="flex items-center gap-2 hover:text-foreground transition-colors"
                  >
                    Fecha
                    {renderSortIcon('recordedAt')}
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort('productName')}
                    className="flex items-center gap-2 hover:text-foreground transition-colors"
                  >
                    Producto
                    {renderSortIcon('productName')}
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort('storeName')}
                    className="flex items-center gap-2 hover:text-foreground transition-colors"
                  >
                    Local
                    {renderSortIcon('storeName')}
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort('operativeUserName')}
                    className="flex items-center gap-2 hover:text-foreground transition-colors"
                  >
                    Usuario
                    {renderSortIcon('operativeUserName')}
                  </button>
                </TableHead>
                <TableHead className="text-right">
                  <button
                    onClick={() => handleSort('price')}
                    className="flex items-center gap-2 hover:text-foreground transition-colors ml-auto"
                  >
                    Precio
                    {renderSortIcon('price')}
                  </button>
                </TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <DollarSign className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">No se encontraron relevamientos</p>
                      {activeFiltersCount > 0 && (
                        <Button variant="outline" size="sm" onClick={handleClearFilters}>
                          Limpiar filtros
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedRecords.map((record) => (
                  <TableRow 
                    key={record.id}
                    className="cursor-pointer"
                    onClick={() => onViewDetail(record)}
                  >
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDate(record.recordedAt)}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{getProductName(record)}</div>
                        {getProductPresentation(record) && (
                          <div className="text-muted-foreground text-sm">{getProductPresentation(record)}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div>{getStoreName(record)}</div>
                        {getStoreLocality(record) && (
                          <div className="text-muted-foreground text-sm">{getStoreLocality(record)}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getOperativeUserName(record)}</TableCell>
                    <TableCell className="text-right">
                      <span className="font-semibold text-lg">{formatCurrency(record.price)}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewDetail(record);
                        }}
                        className="h-8 w-8 p-0"
                        title="Ver detalle"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Paginación */}
        {sortedRecords.length > 0 && (
          <div className="border-t border-border px-4 md:px-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              totalItems={sortedRecords.length}
            />
          </div>
        )}
      </div>
    </div>
  );
}
