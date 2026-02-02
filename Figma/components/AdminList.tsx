import { ShieldCheck, Search, Plus, Edit, Trash2, UserX, UserCheck, ArrowUpDown } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Admin } from './AdminManagement';
import { Pagination } from './Pagination';

interface AdminListProps {
  admins: Admin[];
  onCreateAdmin: () => void;
  onEditAdmin: (admin: Admin) => void;
  onToggleStatus: (admin: Admin) => void;
  onDeleteAdmin: (admin: Admin) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: 'all' | 'active' | 'inactive';
  onStatusFilterChange: (value: 'all' | 'active' | 'inactive') => void;
}

type SortField = 'name' | 'email' | 'role' | 'lastLogin';
type SortOrder = 'asc' | 'desc';

export function AdminList({
  admins,
  onCreateAdmin,
  onEditAdmin,
  onToggleStatus,
  onDeleteAdmin,
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}: AdminListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortField, setSortField] = useState<SortField>('name');
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

  const filteredAdmins = admins.filter((admin) => {
    const matchesSearch =
      admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.role.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && admin.isActive) ||
      (statusFilter === 'inactive' && !admin.isActive);

    return matchesSearch && matchesStatus;
  });

  // Sort admins
  const sortedAdmins = [...filteredAdmins].sort((a, b) => {
    let comparison = 0;
    
    if (sortField === 'name') {
      comparison = a.name.localeCompare(b.name);
    } else if (sortField === 'email') {
      comparison = a.email.localeCompare(b.email);
    } else if (sortField === 'role') {
      comparison = a.role.localeCompare(b.role);
    } else if (sortField === 'lastLogin') {
      const aDate = a.lastLogin ? new Date(a.lastLogin).getTime() : 0;
      const bDate = b.lastLogin ? new Date(b.lastLogin).getTime() : 0;
      comparison = aDate - bDate;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Pagination
  const totalPages = Math.ceil(sortedAdmins.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAdmins = sortedAdmins.slice(startIndex, startIndex + itemsPerPage);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Nunca';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Hace menos de 1 hora';
    if (diffInHours < 24) return `Hace ${diffInHours} horas`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Hace 1 día';
    if (diffInDays < 7) return `Hace ${diffInDays} días`;
    
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ShieldCheck className="h-5 w-5 md:h-6 md:w-6" />
          </div>
          <div>
            <h3>Gestión de Administradores</h3>
            <p className="text-muted-foreground text-sm">
              Administra las cuentas con acceso al panel
            </p>
          </div>
        </div>
        <Button onClick={onCreateAdmin} className="w-full md:w-auto gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Administrador
        </Button>
      </div>

      {/* Search and Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, email o rol"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
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
                {/* <TableHead>
                  <button
                    onClick={() => handleSort('role')}
                    className="flex items-center gap-2 hover:text-foreground transition-colors"
                  >
                    Rol
                    <ArrowUpDown className="h-4 w-4 opacity-50" />
                  </button>
                </TableHead> 
                <TableHead>
                  <button
                    onClick={() => handleSort('lastLogin')}
                    className="flex items-center gap-2 hover:text-foreground transition-colors"
                  >
                    Último acceso
                    <ArrowUpDown className="h-4 w-4 opacity-50" />
                  </button>
                </TableHead>*/}
                <TableHead>
                  <Select value={statusFilter} onValueChange={onStatusFilterChange}>
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
              {paginatedAdmins.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <UserX className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        No se encontraron administradores
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedAdmins.map((admin) => (
                  <TableRow 
                    key={admin.id}
                    className="cursor-pointer"
                    onClick={() => onEditAdmin(admin)}
                  >
                    <TableCell>
                      <div className="font-medium text-foreground">{admin.name}</div>
                    </TableCell>
                    <TableCell className="text-foreground">{admin.email}</TableCell>
                    {/* <TableCell className="text-foreground">{admin.role}</TableCell> 
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDate(admin.lastLogin)}
                    </TableCell> */}
                    <TableCell>
                      <Badge
                        variant={admin.isActive ? 'default' : 'secondary'}
                        className={
                          admin.isActive
                            ? 'bg-green-600 text-white hover:bg-green-700 border-0'
                            : 'bg-muted text-muted-foreground hover:bg-muted border-0'
                        }
                      >
                        {admin.isActive ? (
                          <span className="flex items-center gap-1">
                            <UserCheck className="h-3 w-3" />
                            Activo
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <UserX className="h-3 w-3" />
                            Inactivo
                          </span>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            onEditAdmin(admin);
                          }}
                          className="h-8 w-8 p-0 hover:bg-accent"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            onToggleStatus(admin);
                          }}
                          className="h-8 w-8 p-0 hover:bg-accent"
                          title={admin.isActive ? 'Deshabilitar' : 'Habilitar'}
                        >
                          {admin.isActive ? (
                            <UserX className="h-4 w-4" />
                          ) : (
                            <UserCheck className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            onDeleteAdmin(admin);
                          }}
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
        {sortedAdmins.length > 0 && (
          <div className="border-t border-border px-4 md:px-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              totalItems={sortedAdmins.length}
            />
          </div>
        )}
      </div>
    </div>
  );
}