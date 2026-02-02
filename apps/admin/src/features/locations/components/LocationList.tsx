/**
 * =============================================================================
 * COMPONENTE: LocationList
 * =============================================================================
 *
 * Lista de locales con búsqueda, filtro, ordenamiento y paginación.
 * Campos según API: name, locality, zone?, active
 */
import { Plus, Search, FileUp, Edit, Power, MapPin, ArrowUpDown, ArrowUp, ArrowDown, MapPinOff } from 'lucide-react';
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
import { Pagination } from '@/components/shared/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { useDataTable } from '@/hooks';
import type { Store } from '@/features/locations';

// =============================================================================
// TIPOS
// =============================================================================

type StoreFilter = 'all' | 'active' | 'inactive';

interface LocationListProps {
  stores: Store[];
  isLoading?: boolean;
  onCreateStore: () => void;
  onEditStore: (store: Store) => void;
  onToggleStatus: (store: Store) => void;
  onImport: () => void;
}

// =============================================================================
// COMPONENTE
// =============================================================================

export function LocationList({
  stores,
  isLoading = false,
  onCreateStore,
  onEditStore,
  onToggleStatus,
  onImport,
}: LocationListProps) {
  // -------------------------------------------------------------------------
  // HOOK DE TABLA
  // -------------------------------------------------------------------------
  const {
    items,
    filteredCount,
    searchQuery,
    setSearchQuery,
    filter,
    setFilter,
    toggleSort,
    getSortIcon,
    currentPage,
    setCurrentPage,
    totalPages,
  } = useDataTable<Store, StoreFilter>({
    data: stores,
    searchFields: ['name', 'locality', 'zone'],
    defaultSort: { field: 'name', direction: 'asc' },
    filterOptions: { field: 'active' },
    defaultFilter: 'all',
    itemsPerPage: 10,
  });

  // -------------------------------------------------------------------------
  // HELPER: Icono de ordenamiento
  // -------------------------------------------------------------------------
  const renderSortIcon = (field: keyof Store) => {
    const icon = getSortIcon(field);
    if (icon === 'asc') return <ArrowUp className="h-4 w-4" />;
    if (icon === 'desc') return <ArrowDown className="h-4 w-4" />;
    return <ArrowUpDown className="h-4 w-4 opacity-50" />;
  };

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
        <div className="rounded-lg border border-border">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 border-b border-border last:border-0">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-16" />
            </div>
          ))}
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
      <div className="flex flex-col gap-3 md:gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <MapPin className="h-5 w-5 md:h-6 md:w-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Gestión de Locales</h3>
            <p className="text-muted-foreground text-sm">
              {filteredCount} de {stores.length} locales
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={onImport} variant="outline" className="flex-1 md:flex-none gap-2">
            <FileUp className="h-4 w-4" />
            <span className="hidden sm:inline">Importar Excel</span>
            <span className="sm:hidden">Importar</span>
          </Button>
          <Button onClick={onCreateStore} className="flex-1 md:flex-none gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Local
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, localidad o zona..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="md:col-span-2">
          <Select value={filter} onValueChange={(value) => setFilter(value as StoreFilter)}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="active">Activos</SelectItem>
              <SelectItem value="inactive">Inactivos</SelectItem>
            </SelectContent>
          </Select>
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
                    onClick={() => toggleSort('name')}
                    className="flex items-center gap-2 hover:text-foreground transition-colors"
                  >
                    Nombre
                    {renderSortIcon('name')}
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => toggleSort('locality')}
                    className="flex items-center gap-2 hover:text-foreground transition-colors"
                  >
                    Localidad
                    {renderSortIcon('locality')}
                  </button>
                </TableHead>
                <TableHead>Zona</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <MapPinOff className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">No se encontraron locales</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((store) => (
                  <TableRow 
                    key={store.id}
                    className="cursor-pointer"
                    onClick={() => onEditStore(store)}
                  >
                    <TableCell>
                      <span className="font-medium">{store.name}</span>
                    </TableCell>
                    <TableCell>{store.locality}</TableCell>
                    <TableCell>
                      <span className="text-muted-foreground">{store.zone || '-'}</span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={store.active ? 'default' : 'secondary'}
                        className={
                          store.active
                            ? 'bg-green-600 text-white hover:bg-green-700 border-0'
                            : 'bg-muted text-muted-foreground hover:bg-muted border-0'
                        }
                      >
                        {store.active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditStore(store);
                          }}
                          className="h-8 w-8 p-0"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleStatus(store);
                          }}
                          className="h-8 w-8 p-0"
                          title={store.active ? 'Desactivar' : 'Activar'}
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

        {/* Paginación */}
        {items.length > 0 && (
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
