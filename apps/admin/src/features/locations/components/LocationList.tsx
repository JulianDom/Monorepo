import { useState } from 'react';
import { Plus, Search, FileUp, Edit, Power, MapPin, ArrowUpDown, UserX } from 'lucide-react';
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
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Location } from '@/app/(dashboard)/dashboard/locations/page';
import { Pagination } from '@/components/shared/pagination';
import { cn } from '@/components/ui/utils';
import { toast } from 'sonner';

interface LocationListProps {
  locations: Location[];
  onCreateLocation: () => void;
  onEditLocation: (location: Location) => void;
  onToggleEnabled: (locationId: string) => void;
  onImport: () => void;
}

type SortField = 'codigo' | 'nombre' | 'ciudad' | 'provincia';
type SortOrder = 'asc' | 'desc';

export function LocationList({
  locations,
  onCreateLocation,
  onEditLocation,
  onToggleEnabled,
  onImport,
}: LocationListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [confirmDisable, setConfirmDisable] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortField, setSortField] = useState<SortField>('nombre');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    setCurrentPage(1);
  };

  // Filter locations
  const filteredLocations = locations.filter(location => {
    const matchesSearch = 
      location.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.ciudad.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.provincia.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.direccion.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = 
      selectedStatus === '' || 
      selectedStatus === 'todos' ||
      (selectedStatus === 'habilitado' && location.habilitado) ||
      (selectedStatus === 'deshabilitado' && !location.habilitado);

    return matchesSearch && matchesStatus;
  });

  // Sort locations
  const sortedLocations = [...filteredLocations].sort((a, b) => {
    let comparison = 0;
    
    if (sortField === 'codigo') {
      comparison = a.codigo.localeCompare(b.codigo);
    } else if (sortField === 'nombre') {
      comparison = a.nombre.localeCompare(b.nombre);
    } else if (sortField === 'ciudad') {
      comparison = a.ciudad.localeCompare(b.ciudad);
    } else if (sortField === 'provincia') {
      comparison = a.provincia.localeCompare(b.provincia);
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Pagination
  const totalPages = Math.ceil(sortedLocations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLocations = sortedLocations.slice(startIndex, startIndex + itemsPerPage);

  const enabledCount = locations.filter(l => l.habilitado).length;
  const totalCount = locations.length;

  const handleToggle = (location: Location) => {
    if (location.habilitado && !confirmDisable) {
      setConfirmDisable(location.id);
      setTimeout(() => setConfirmDisable(null), 5000);
      return;
    }

    onToggleEnabled(location.id);
    setConfirmDisable(null);
    
    toast.success(
      location.habilitado ? 'Local deshabilitado' : 'Local habilitado',
      {
        description: location.habilitado 
          ? `El local "${location.nombre}" ha sido deshabilitado.`
          : `El local "${location.nombre}" ha sido habilitado.`,
      }
    );
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <MapPin className="h-5 w-5 md:h-6 md:w-6" />
          </div>
          <div>
            <h3>Gestión de Locales</h3>
            <p className="text-muted-foreground text-sm">
              Administra los puntos de venta del sistema
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={onImport} variant="outline" className="flex-1 md:flex-none gap-2">
            <FileUp className="h-4 w-4" />
            <span className="hidden sm:inline">Importar Excel</span>
            <span className="sm:hidden">Importar</span>
          </Button>
          <Button onClick={onCreateLocation} className="flex-1 md:flex-none gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Local
          </Button>
        </div>
      </div>

      {/* Search and Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por código, nombre o ubicación"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="md:col-span-2">
          <SearchableSelect
            value={selectedStatus}
            onChange={(value) => handleStatusChange(value)}
            options={[
              { value: '', label: 'Todos' },
              { value: 'habilitado', label: 'Habilitados' },
              { value: 'deshabilitado', label: 'Deshabilitados' },
            ]}
            placeholder="Filtrar por estado"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card">
        <div className="overflow-x-auto">
          <Table className="lg:min-w-full">
            <TableHeader>
              <TableRow>
                <TableHead>
                  <button
                    onClick={() => handleSort('codigo')}
                    className="flex items-center gap-2 hover:text-foreground transition-colors"
                  >
                    Código
                    <ArrowUpDown className="h-4 w-4 opacity-50" />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort('nombre')}
                    className="flex items-center gap-2 hover:text-foreground transition-colors"
                  >
                    Nombre
                    <ArrowUpDown className="h-4 w-4 opacity-50" />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort('ciudad')}
                    className="flex items-center gap-2 hover:text-foreground transition-colors"
                  >
                    Ubicación
                    <ArrowUpDown className="h-4 w-4 opacity-50" />
                  </button>
                </TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedLocations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <UserX className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        No se encontraron locales
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedLocations.map((location) => (
                  <TableRow key={location.id}>
                    <TableCell>
                      <div className="font-medium text-foreground">{location.codigo}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-foreground">{location.nombre}</div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-foreground">{location.direccion}</div>
                        <div className="text-muted-foreground text-sm">
                          {location.ciudad}, {location.provincia}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-foreground">{location.telefono}</div>
                        {location.email && (
                          <div className="text-muted-foreground text-sm">{location.email}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={location.habilitado ? 'default' : 'secondary'}
                        className={
                          location.habilitado
                            ? 'bg-green-600 text-white hover:bg-green-700 border-0'
                            : 'bg-muted text-muted-foreground hover:bg-muted border-0'
                        }
                      >
                        {location.habilitado ? 'Habilitado' : 'Deshabilitado'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditLocation(location)}
                          className="h-8 w-8 p-0 hover:bg-accent"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {confirmDisable === location.id ? (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggle(location)}
                              className="h-8 w-8 p-0 hover:bg-accent"
                              title="Confirmar"
                            >
                              <Power className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setConfirmDisable(null)}
                              className="h-8 w-8 p-0 hover:bg-accent"
                              title="Cancelar"
                            >
                              <Power className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggle(location)}
                            className="h-8 w-8 p-0 hover:bg-accent"
                            title={location.habilitado ? 'Deshabilitar' : 'Habilitar'}
                          >
                            <Power className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Pagination */}
        {sortedLocations.length > 0 && (
          <div className="border-t border-border px-4 md:px-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              totalItems={sortedLocations.length}
            />
          </div>
        )}
      </div>
    </div>
  );
}