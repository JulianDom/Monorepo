'use client';

import { Search, Plus, Users, Pencil, UserX, UserCheck, Trash2, ArrowUpDown, ArrowUp, ArrowDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/shared/pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDataTable } from '@/hooks';
import type { PersistedOperativeUserProps } from '@framework/shared-types';

// ============================================
// TIPOS
// ============================================

export interface OperativeListProps {
  operatives: PersistedOperativeUserProps[];
  isLoading?: boolean;
  onCreate: () => void;
  onEdit: (operative: PersistedOperativeUserProps) => void;
  onToggleStatus: (operative: PersistedOperativeUserProps) => void;
  onDelete: (operative: PersistedOperativeUserProps) => void;
}

type OperativeFilter = 'all' | 'active' | 'inactive';

// ============================================
// COMPONENTE
// ============================================

export function OperativeList({
  operatives,
  isLoading,
  onCreate,
  onEdit,
  onToggleStatus,
  onDelete,
}: OperativeListProps) {
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
  } = useDataTable<PersistedOperativeUserProps, OperativeFilter>({
    data: operatives,
    searchFields: ['fullName', 'emailAddress', 'username'],
    defaultSort: { field: 'fullName', direction: 'asc' },
    filterOptions: { field: 'active' },
    defaultFilter: 'all',
    itemsPerPage: 10,
  });

  // Icono de ordenamiento
  const SortIcon = ({ field }: { field: keyof PersistedOperativeUserProps }) => {
    const direction = getSortIcon(field);
    if (direction === 'asc') return <ArrowUp className="h-4 w-4" />;
    if (direction === 'desc') return <ArrowDown className="h-4 w-4" />;
    return <ArrowUpDown className="h-4 w-4 opacity-50" />;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
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

      {/* Search */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, email o usuario"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
                    onClick={() => toggleSort('emailAddress')}
                    className="flex items-center gap-2 hover:text-foreground transition-colors"
                  >
                    Correo electrónico
                    <SortIcon field="emailAddress" />
                  </button>
                </TableHead>
                <TableHead className="hidden lg:table-cell">Usuario</TableHead>
                <TableHead>
                  <Select value={filter} onValueChange={(v) => setFilter(v as OperativeFilter)}>
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
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <UserX className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        {searchQuery || filter !== 'all'
                          ? 'No se encontraron usuarios operativos'
                          : 'No hay usuarios operativos registrados'}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((operative) => {
                  const isActive = operative.active !== false;
                  return (
                    <TableRow 
                      key={operative.id}
                      className="cursor-pointer"
                      onClick={() => onEdit(operative)}
                    >
                      <TableCell>
                        <div className="font-medium text-foreground">{operative.fullName}</div>
                      </TableCell>
                      <TableCell className="text-foreground">{operative.emailAddress}</TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">
                        {operative.username}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={isActive ? 'default' : 'secondary'}
                          className={
                            isActive
                              ? 'bg-green-600 text-white hover:bg-green-700 border-0'
                              : 'bg-muted text-muted-foreground hover:bg-muted border-0'
                          }
                        >
                          <span className="flex items-center gap-1">
                            {isActive ? (
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
                            onClick={(e: React.MouseEvent) => {
                              e.stopPropagation();
                              onEdit(operative);
                            }}
                            className="h-8 w-8 p-0 hover:bg-accent"
                            title="Editar"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e: React.MouseEvent) => {
                              e.stopPropagation();
                              onToggleStatus(operative);
                            }}
                            className="h-8 w-8 p-0 hover:bg-accent"
                            title={isActive ? 'Deshabilitar' : 'Habilitar'}
                          >
                            {isActive ? (
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
                              onDelete(operative);
                            }}
                            className="h-8 w-8 p-0 hover:bg-accent"
                            title="Eliminar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
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
