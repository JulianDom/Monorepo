import { useState } from 'react';
import { TrendingUp, Filter, Eye, AlertCircle, Loader2, Search, Calendar, X, ArrowUpDown, UserX } from 'lucide-react';
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
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Pagination } from '@/components/shared/pagination';
import { PriceRecord } from '@/app/(dashboard)/dashboard/prices/page';

interface PriceListProps {
  priceRecords: PriceRecord[];
  onViewDetail: (record: PriceRecord) => void;
}

type ViewState = 'loading' | 'empty' | 'error' | 'success';
type SortField = 'fecha' | 'productoNombre' | 'localNombre' | 'usuarioNombre' | 'precio';
type SortOrder = 'asc' | 'desc';

export function PriceList({ priceRecords, onViewDetail }: PriceListProps) {
  const [viewState] = useState<ViewState>('success');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('fecha');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const itemsPerPage = 10;
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedUser, setSelectedUser] = useState('');

  // Extract unique values for filters
  const uniqueLocations = Array.from(new Set(priceRecords.map(r => r.localNombre))).sort();
  const uniqueProducts = Array.from(new Set(priceRecords.map(r => r.productoNombre))).sort();
  const uniqueUsers = Array.from(new Set(priceRecords.map(r => r.usuarioNombre))).sort();

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder(field === 'fecha' || field === 'precio' ? 'desc' : 'asc');
    }
    setCurrentPage(1);
  };

  // Filter records
  const filteredRecords = priceRecords.filter(record => {
    const matchesSearch = 
      record.productoNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.productoCodigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.localNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.usuarioNombre.toLowerCase().includes(searchTerm.toLowerCase());

    const recordDate = new Date(record.fecha);
    const matchesDateFrom = !dateFrom || recordDate >= new Date(dateFrom);
    const matchesDateTo = !dateTo || recordDate <= new Date(dateTo + 'T23:59:59');
    
    const matchesLocation = !selectedLocation || record.localNombre === selectedLocation;
    const matchesProduct = !selectedProduct || record.productoNombre === selectedProduct;
    const matchesUser = !selectedUser || record.usuarioNombre === selectedUser;

    return matchesSearch && matchesDateFrom && matchesDateTo && matchesLocation && matchesProduct && matchesUser;
  });

  // Sort records
  const sortedRecords = [...filteredRecords].sort((a, b) => {
    let aValue: any = a[sortField as keyof PriceRecord];
    let bValue: any = b[sortField as keyof PriceRecord];

    if (sortField === 'fecha') {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    } else if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Paginate
  const totalPages = Math.ceil(sortedRecords.length / itemsPerPage);
  const paginatedRecords = sortedRecords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const activeFiltersCount = [dateFrom, dateTo, selectedLocation, selectedProduct, selectedUser].filter(Boolean).length;

  const handleClearFilters = () => {
    setDateFrom('');
    setDateTo('');
    setSelectedLocation('');
    setSelectedProduct('');
    setSelectedUser('');
    setSearchTerm('');
    setCurrentPage(1);
  };

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

  // Calculate statistics
  const totalRecords = filteredRecords.length;
  const averagePrice = totalRecords > 0 
    ? (filteredRecords.reduce((sum, r) => sum + r.precio, 0) / totalRecords).toFixed(2)
    : '0.00';
  const minPrice = totalRecords > 0 
    ? Math.min(...filteredRecords.map(r => r.precio)).toFixed(2)
    : '0.00';
  const maxPrice = totalRecords > 0 
    ? Math.max(...filteredRecords.map(r => r.precio)).toFixed(2)
    : '0.00';

  // Loading State
  if (viewState === 'loading') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary p-3">
            <TrendingUp className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-foreground">Visualización de Precios</h1>
            <p className="text-muted-foreground" style={{ fontSize: 'var(--text-base)' }}>
              Consulta los relevamientos de precios del sistema
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-12">
          <div className="flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <div className="text-center">
              <p className="font-medium text-foreground" style={{ fontSize: 'var(--text-base)' }}>
                Cargando relevamientos
              </p>
              <p className="text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                Por favor, espera un momento...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (viewState === 'error') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary p-3">
            <TrendingUp className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-foreground">Visualización de Precios</h1>
            <p className="text-muted-foreground" style={{ fontSize: 'var(--text-base)' }}>
              Consulta los relevamientos de precios del sistema
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-border border-l-4 border-l-destructive bg-destructive/5 p-6">
          <div className="flex gap-3">
            <AlertCircle className="h-6 w-6 text-destructive flex-shrink-0" />
            <div className="space-y-2 flex-1">
              <p className="font-medium text-foreground" style={{ fontSize: 'var(--text-base)' }}>
                Error al cargar los datos
              </p>
              <p className="text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                Ocurrió un error técnico al intentar cargar los relevamientos de precios. Por favor, intenta nuevamente más tarde.
              </p>
              <Button variant="outline" className="mt-4">
                Reintentar
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Empty State
  if (viewState === 'empty' || (viewState === 'success' && filteredRecords.length === 0 && activeFiltersCount === 0 && !searchTerm)) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary p-3">
            <TrendingUp className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-foreground">Visualización de Precios</h1>
            <p className="text-muted-foreground" style={{ fontSize: 'var(--text-base)' }}>
              Consulta los relevamientos de precios del sistema
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-12">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <div className="rounded-full bg-muted p-4">
              <TrendingUp className="h-12 w-12 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <p className="font-medium text-foreground" style={{ fontSize: 'var(--text-lg)' }}>
                No hay relevamientos de precios
              </p>
              <p className="text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                Los relevamientos de precios realizados por los usuarios operativos aparecerán aquí.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <TrendingUp className="h-5 w-5 md:h-6 md:w-6" />
        </div>
        <div>
          <h3>Visualización de Precios</h3>
          <p className="text-muted-foreground text-sm">
            Consulta los relevamientos de precios del sistema
          </p>
        </div>
      </div>

      {/* Search and Filter Toggle */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar por producto, local o usuario"
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

          {/* Filters Panel */}
          {showFilters && (
            <div className="space-y-4 border-t border-border pt-4">
              <div className="flex items-center justify-between">
                <p className="font-medium text-foreground" style={{ fontSize: 'var(--text-base)' }}>
                  Filtros avanzados
                </p>
                {activeFiltersCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={handleClearFilters} className="gap-2">
                    <X className="h-4 w-4" />
                    Limpiar filtros
                  </Button>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="dateFrom">
                    <Calendar className="inline h-4 w-4 mr-1" />
                    Fecha desde
                  </Label>
                  <Input
                    id="dateFrom"
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateTo">
                    <Calendar className="inline h-4 w-4 mr-1" />
                    Fecha hasta
                  </Label>
                  <Input
                    id="dateTo"
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Local</Label>
                  <SearchableSelect
                    options={uniqueLocations}
                    value={selectedLocation}
                    onChange={setSelectedLocation}
                    placeholder="Todos los locales"
                    emptyText="No se encontraron locales"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="product">Producto</Label>
                  <SearchableSelect
                    options={uniqueProducts}
                    value={selectedProduct}
                    onChange={setSelectedProduct}
                    placeholder="Todos los productos"
                    emptyText="No se encontraron productos"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="user">Usuario</Label>
                  <SearchableSelect
                    options={uniqueUsers}
                    value={selectedUser}
                    onChange={setSelectedUser}
                    placeholder="Todos los usuarios"
                    emptyText="No se encontraron usuarios"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="text-2xl font-semibold text-foreground">
            {totalRecords}
          </div>
          <div className="text-sm text-muted-foreground">Total Relevamientos</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="text-2xl font-semibold text-foreground">
            ${averagePrice}
          </div>
          <div className="text-sm text-muted-foreground">Precio Promedio</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="text-2xl font-semibold text-green-600">
            ${minPrice}
          </div>
          <div className="text-sm text-muted-foreground">Precio Mínimo</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="text-2xl font-semibold text-destructive">
            ${maxPrice}
          </div>
          <div className="text-sm text-muted-foreground">Precio Máximo</div>
        </div>
      </div>

      {/* No Results */}
      {filteredRecords.length === 0 && (activeFiltersCount > 0 || searchTerm) && (
        <div className="rounded-lg border border-border bg-card p-12">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <div className="rounded-full bg-muted p-4">
              <Search className="h-12 w-12 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <p className="font-medium text-foreground" style={{ fontSize: 'var(--text-lg)' }}>
                No se encontraron resultados
              </p>
              <p className="text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                Intenta ajustar los filtros o el término de búsqueda.
              </p>
            </div>
            <Button variant="outline" onClick={handleClearFilters}>
              Limpiar filtros
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      {filteredRecords.length > 0 && (
        <div className="rounded-lg border border-border bg-card">
          <div className="overflow-x-auto">
            <Table className="lg:min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <button
                      onClick={() => handleSort('fecha')}
                      className="flex items-center gap-2 hover:text-foreground transition-colors"
                    >
                      Fecha
                      <ArrowUpDown className="h-4 w-4 opacity-50" />
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      onClick={() => handleSort('productoNombre')}
                      className="flex items-center gap-2 hover:text-foreground transition-colors"
                    >
                      Producto
                      <ArrowUpDown className="h-4 w-4 opacity-50" />
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      onClick={() => handleSort('localNombre')}
                      className="flex items-center gap-2 hover:text-foreground transition-colors"
                    >
                      Local
                      <ArrowUpDown className="h-4 w-4 opacity-50" />
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      onClick={() => handleSort('usuarioNombre')}
                      className="flex items-center gap-2 hover:text-foreground transition-colors"
                    >
                      Usuario
                      <ArrowUpDown className="h-4 w-4 opacity-50" />
                    </button>
                  </TableHead>
                  <TableHead className="text-right">
                    <button
                      onClick={() => handleSort('precio')}
                      className="flex items-center gap-2 hover:text-foreground transition-colors ml-auto"
                    >
                      Precio
                      <ArrowUpDown className="h-4 w-4 opacity-50" />
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
                        <UserX className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          No se encontraron relevamientos
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDate(record.fecha)}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-foreground">{record.productoNombre}</div>
                          <div className="text-muted-foreground text-sm">{record.productoCodigo}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-foreground">{record.localNombre}</div>
                          <div className="text-muted-foreground text-sm">{record.localCodigo}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-foreground">{record.usuarioNombre}</TableCell>
                      <TableCell className="text-right">
                        <span className="font-semibold text-foreground" style={{ fontSize: 'var(--text-lg)' }}>
                          ${record.precio.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewDetail(record)}
                          className="h-8 w-8 p-0 hover:bg-accent"
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
          
          {/* Pagination */}
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
      )}
    </div>
  );
}