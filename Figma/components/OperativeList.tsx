import { useState } from 'react';
import { Search, Plus, Users, Pencil, UserX, UserCheck, Trash2, ArrowUpDown } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Pagination } from './Pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { toast } from 'sonner@2.0.3';
import type { Operative } from './OperativeManagement';

interface OperativeListProps {
  operatives: Operative[];
  onCreate: () => void;
  onEdit: (operative: Operative) => void;
  onToggleStatus: (operativeId: string) => void;
  onDelete: (operativeId: string) => void;
}

type FilterStatus = 'all' | 'active' | 'inactive';
type SortField = 'name' | 'email' | 'createdAt' | 'lastAccess';
type SortDirection = 'asc' | 'desc';

export function OperativeList({
  operatives,
  onCreate,
  onEdit,
  onToggleStatus,
  onDelete,
}: OperativeListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: 'toggle' | 'delete';
    operative: Operative | null;
  }>({ isOpen: false, type: 'toggle', operative: null });

  const itemsPerPage = 10;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  // Filtrar operativos
  const filteredOperatives = operatives.filter((op) => {
    const matchesSearch =
      op.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      op.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      op.phone?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      filterStatus === 'all' || op.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Ordenar operativos
  const sortedOperatives = [...filteredOperatives].sort((a, b) => {
    let aValue: string | undefined;
    let bValue: string | undefined;

    switch (sortField) {
      case 'name':
        aValue = a.name;
        bValue = b.name;
        break;
      case 'email':
        aValue = a.email;
        bValue = b.email;
        break;
      case 'createdAt':
        aValue = a.createdAt;
        bValue = b.createdAt;
        break;
      case 'lastAccess':
        aValue = a.lastAccess || '';
        bValue = b.lastAccess || '';
        break;
    }

    if (!aValue) return 1;
    if (!bValue) return -1;

    const comparison = aValue.localeCompare(bValue);
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  // Paginación
  const totalPages = Math.ceil(sortedOperatives.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOperatives = sortedOperatives.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const activeCount = operatives.filter((op) => op.status === 'active').length;

  const handleConfirmToggle = () => {
    if (confirmDialog.operative) {
      onToggleStatus(confirmDialog.operative.id);
      
      if (confirmDialog.operative.status === 'active') {
        toast.warning('Usuario deshabilitado', {
          description: `${confirmDialog.operative.name} ha sido deshabilitado y su sesión cerrada.`,
        });
      } else {
        toast.success('Usuario habilitado', {
          description: `${confirmDialog.operative.name} ha sido habilitado correctamente.`,
        });
      }
    }
    setConfirmDialog({ isOpen: false, type: 'toggle', operative: null });
  };

  const handleConfirmDelete = () => {
    if (confirmDialog.operative) {
      onDelete(confirmDialog.operative.id);
      toast.success('Usuario eliminado', {
        description: `${confirmDialog.operative.name} ha sido eliminado del sistema.`,
      });
    }
    setConfirmDialog({ isOpen: false, type: 'delete', operative: null });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <>
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 md:gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Users className="h-5 w-5 md:h-6 md:w-6" />
            </div>
            <div>
              <h3>Gestión de Usuarios Operativos</h3>
              <p className="text-muted-foreground text-sm">
                Administra los usuarios de campo que relevan precios
              </p>
            </div>
          </div>
          <Button onClick={onCreate} className="w-full md:w-auto gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Operativo
          </Button>
        </div>

        {/* Search and Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, email o teléfono"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10"
              />
            </div>
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
                      onClick={() => handleSort('name')}
                      className="flex items-center gap-2 hover:text-foreground transition-colors"
                    >
                      Nombre
                      <ArrowUpDown className="h-4 w-4 opacity-50" />
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      onClick={() => handleSort('email')}
                      className="flex items-center gap-2 hover:text-foreground transition-colors"
                    >
                      Correo electrónico
                      <ArrowUpDown className="h-4 w-4 opacity-50" />
                    </button>
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">Teléfono</TableHead>
                  {/* <TableHead className="hidden md:table-cell">
                    <button
                      onClick={() => handleSort('lastAccess')}
                      className="flex items-center gap-2 hover:text-foreground transition-colors"
                    >
                      Último acceso
                      <ArrowUpDown className="h-4 w-4 opacity-50" />
                    </button>
                  </TableHead> */}
                  <TableHead>
                    <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
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
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedOperatives.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <UserX className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          {searchQuery || filterStatus !== 'all'
                            ? 'No se encontraron usuarios operativos'
                            : 'No hay usuarios operativos registrados'}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedOperatives.map((operative) => (
                    <TableRow key={operative.id}>
                      <TableCell>
                        <div className="font-medium text-foreground">{operative.name}</div>
                      </TableCell>
                      <TableCell className="text-foreground">{operative.email}</TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">
                        {operative.phone || '-'}
                      </TableCell>
                      {/* <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                        {formatDate(operative.lastAccess)}
                      </TableCell> */}
                      <TableCell>
                        <Badge
                          variant={operative.status === 'active' ? 'default' : 'secondary'}
                          className={
                            operative.status === 'active'
                              ? 'bg-green-600 text-white hover:bg-green-700 border-0'
                              : 'bg-muted text-muted-foreground hover:bg-muted border-0'
                          }
                        >
                          <span className="flex items-center gap-1">
                            {operative.status === 'active' ? (
                              <>
                                <UserCheck className="h-3 w-3" />
                                Activo
                              </>
                            ) : (
                              <>
                                <UserX className="h-3 w-3" />
                                Inactivo
                              </>
                            )}
                          </span>
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(operative)}
                            className="h-8 w-8 p-0 hover:bg-accent"
                            title="Editar"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setConfirmDialog({
                                isOpen: true,
                                type: 'toggle',
                                operative,
                              })
                            }
                            className="h-8 w-8 p-0 hover:bg-accent"
                            title={operative.status === 'active' ? 'Deshabilitar' : 'Habilitar'}
                          >
                            {operative.status === 'active' ? (
                              <UserX className="h-4 w-4" />
                            ) : (
                              <UserCheck className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setConfirmDialog({
                                isOpen: true,
                                type: 'delete',
                                operative,
                              })
                            }
                            className="h-8 w-8 p-0 hover:bg-accent"
                            title="Eliminar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination */}
          {sortedOperatives.length > 0 && (
            <div className="border-t border-border px-4 md:px-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                totalItems={sortedOperatives.length}
              />
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Dialogs */}
      <AlertDialog
        open={confirmDialog.isOpen}
        onOpenChange={(isOpen) =>
          !isOpen && setConfirmDialog({ isOpen: false, type: 'toggle', operative: null })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog.type === 'toggle'
                ? confirmDialog.operative?.status === 'active'
                  ? '¿Deshabilitar usuario?'
                  : '¿Habilitar usuario?'
                : '¿Eliminar usuario?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.type === 'toggle' ? (
                confirmDialog.operative?.status === 'active' ? (
                  <>
                    Esta acción deshabilitará a{' '}
                    <strong>{confirmDialog.operative?.name}</strong> y cerrará
                    su sesión activa. El usuario no podrá acceder al sistema
                    hasta que sea habilitado nuevamente.
                  </>
                ) : (
                  <>
                    Esta acción habilitará a{' '}
                    <strong>{confirmDialog.operative?.name}</strong> y le
                    permitirá acceder al sistema nuevamente.
                  </>
                )
              ) : (
                <>
                  Esta acción eliminará permanentemente a{' '}
                  <strong>{confirmDialog.operative?.name}</strong> del sistema.
                  Esta acción no se puede deshacer.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={
                confirmDialog.type === 'toggle'
                  ? handleConfirmToggle
                  : handleConfirmDelete
              }
              className={
                confirmDialog.type === 'delete' || confirmDialog.operative?.status === 'active'
                  ? 'bg-destructive text-white hover:bg-destructive/90'
                  : ''
              }
            >
              {confirmDialog.type === 'toggle'
                ? confirmDialog.operative?.status === 'active'
                  ? 'Deshabilitar'
                  : 'Habilitar'
                : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}