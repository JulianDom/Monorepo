'use client';

import { ShieldCheck, Search, Plus, Edit, UserX, UserCheck, ArrowUpDown, ArrowUp, ArrowDown, Loader2 } from 'lucide-react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination } from '@/components/shared/pagination';
import { useDataTable, useDebounce } from '@/hooks';
import type { Admin } from '../types';

// ============================================
// TIPOS
// ============================================

interface AdminListProps {
  admins: Admin[];
  isLoading?: boolean;
  onCreateAdmin: () => void;
  onEditAdmin: (admin: Admin) => void;
  onToggleStatus: (admin: Admin) => void;
}

type AdminFilter = 'all' | 'active' | 'inactive';

// ============================================
// COMPONENTE
// ============================================

export function AdminList({
  admins,
  isLoading,
  onCreateAdmin,
  onEditAdmin,
  onToggleStatus,
}: AdminListProps) {
  // Hook reutilizable para manejo de tabla
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
  } = useDataTable<Admin, AdminFilter>({
    data: admins,
    searchFields: ['fullName', 'email', 'username'],
    defaultSort: { field: 'fullName', direction: 'asc' },
    filterOptions: { field: 'enabled' },
    defaultFilter: 'all',
    itemsPerPage: 10,
  });

  // Debounce para la búsqueda
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  // Icono de ordenamiento
  const SortIcon = ({ field }: { field: keyof Admin }) => {
    const direction = getSortIcon(field);
    if (direction === 'asc') return <ArrowUp className="h-4 w-4" />;
    if (direction === 'desc') return <ArrowDown className="h-4 w-4" />;
    return <ArrowUpDown className="h-4 w-4 opacity-50" />;
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

      {/* Search */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, email o usuario"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
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
                    onClick={() => toggleSort('fullName')}
                    className="flex items-center gap-2 hover:text-foreground transition-colors"
                  >
                    Nombre
                    <SortIcon field="fullName" />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => toggleSort('email')}
                    className="flex items-center gap-2 hover:text-foreground transition-colors"
                  >
                    Correo electrónico
                    <SortIcon field="email" />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => toggleSort('username')}
                    className="flex items-center gap-2 hover:text-foreground transition-colors"
                  >
                    Usuario
                    <SortIcon field="username" />
                  </button>
                </TableHead>
                <TableHead>
                  <Select value={filter} onValueChange={(v) => setFilter(v as AdminFilter)}>
                    <SelectTrigger className="w-full border-0 shadow-none hover:bg-muted/50 focus:ring-0 h-auto p-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      <SelectItem value="active">Habilitados</SelectItem>
                      <SelectItem value="inactive">Deshabilitados</SelectItem>
                    </SelectContent>
                  </Select>
                </TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
                      <p className="text-muted-foreground">Cargando administradores...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <UserX className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        No se encontraron administradores
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((admin) => (
                  <TableRow 
                    key={admin.id}
                    className="cursor-pointer"
                    onClick={() => onEditAdmin(admin)}
                  >
                    <TableCell>
                      <div className="font-medium text-foreground">{admin.fullName}</div>
                    </TableCell>
                    <TableCell className="text-foreground">{admin.email}</TableCell>
                    <TableCell className="text-muted-foreground">{admin.username}</TableCell>
                    <TableCell>
                      <Badge
                        variant={admin.enabled ? 'default' : 'secondary'}
                        className={
                          admin.enabled
                            ? 'bg-green-600 text-white hover:bg-green-700 border-0'
                            : 'bg-muted text-muted-foreground hover:bg-muted border-0'
                        }
                      >
                        {admin.enabled ? (
                          <span className="flex items-center gap-1">
                            <UserCheck className="h-3 w-3" />
                            Habilitado
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <UserX className="h-3 w-3" />
                            Deshabilitado
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
                          title={admin.enabled ? 'Deshabilitar' : 'Habilitar'}
                        >
                          {admin.enabled ? (
                            <UserX className="h-4 w-4" />
                          ) : (
                            <UserCheck className="h-4 w-4" />
                          )}
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
