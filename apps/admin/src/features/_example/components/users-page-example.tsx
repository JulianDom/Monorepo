'use client';

/**
 * EJEMPLO COMPLETO: Página de usuarios
 *
 * Este archivo muestra cómo usar todos los componentes y hooks
 * estandarizados para crear una página CRUD completa.
 *
 * EQUIVALENTE en otros frameworks:
 * - Angular: extends BaseComponent con this.showError(), this.httpPost()
 * - PHP/Laravel: extends Controller con $this->success(), $this->paginate()
 *
 * En Next.js usamos COMPOSICIÓN con hooks:
 * - useUsers()        → Lista con filtros automáticos en URL
 * - useCreateUser()   → Mutación con toast de éxito automático
 * - useConfirm()      → Diálogo de confirmación
 * - useNotify()       → Notificaciones manuales si se necesitan
 */

import { Plus, Search, Trash2 } from 'lucide-react';
import { useUsers, useDeleteUser } from '../hooks/use-users';
import { useConfirm, confirmPresets } from '@/hooks/use-confirm';
import { PageShell, QueryCell, DataTableShell, ConfirmDialog } from '@/components/shared';
import { Button } from '@/components/ui/button';
import type { ColumnDef } from '@tanstack/react-table';
import type { User } from '../services/user.service';

// Definición de columnas
const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'fullName',
    header: 'Nombre',
  },
  {
    accessorKey: 'emailAddress',
    header: 'Email',
  },
  {
    accessorKey: 'username',
    header: 'Usuario',
  },
  {
    accessorKey: 'online',
    header: 'Estado',
    cell: ({ row }) => (
      <span
        className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${
          row.original.online
            ? 'bg-green-100 text-green-700'
            : 'bg-gray-100 text-gray-700'
        }`}
      >
        {row.original.online ? 'Online' : 'Offline'}
      </span>
    ),
  },
];

export function UsersPageExample() {
  // ✅ Hook maestro: lista + filtros en URL + paginación
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    // Filtros sincronizados con URL
    search,
    setSearch,
    page,
    setPage,
    filterParams,
  } = useUsers();

  // ✅ Mutación con toast automático
  const deleteUser = useDeleteUser();

  // ✅ Diálogo de confirmación
  const { confirm, confirmState } = useConfirm();

  // Handler de eliminación con confirmación
  const handleDelete = async (user: User) => {
    const confirmed = await confirm(confirmPresets.delete('Usuario'));

    if (confirmed) {
      deleteUser.mutate(user.id);
    }
  };

  // Columnas con acciones
  const columnsWithActions: ColumnDef<User>[] = [
    ...columns,
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleDelete(row.original)}
          disabled={deleteUser.isPending}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      ),
    },
  ];

  return (
    <>
      <PageShell
        title="Usuarios"
        description="Gestiona los usuarios del sistema"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Usuarios' },
        ]}
        actions={
          <Button>
            <Plus className="h-4 w-4" />
            Crear Usuario
          </Button>
        }
      >
        {/* Barra de búsqueda */}
        <div className="mb-4 flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar usuarios..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-10 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          {/* El filtro 'search' se sincroniza automáticamente con la URL */}
          {/* URL: /users?page=1&limit=10&search=john */}
        </div>

        {/* Tabla con estados automáticos */}
        <QueryCell
          query={{ data, isLoading, isError, error, refetch } as any}
        >
          {(response) => (
            <DataTableShell
              columns={columnsWithActions}
              data={response.data}
              pagination
              pageSize={10}
              emptyMessage="No se encontraron usuarios"
            />
          )}
        </QueryCell>
      </PageShell>

      {/* Diálogo de confirmación */}
      <ConfirmDialog {...confirmState} />
    </>
  );
}

/**
 * RESUMEN DE PATRONES USADOS:
 *
 * 1. useUsers() - Hook que combina:
 *    - useQuery para fetching
 *    - useStandardTable para filtros en URL
 *    - Retorna todo junto: data, isLoading, search, setSearch, etc.
 *
 * 2. useDeleteUser() - Mutación que automáticamente:
 *    - Muestra toast de éxito "Usuario eliminado correctamente"
 *    - Invalida la lista de usuarios para refrescar
 *    - Maneja errores (el interceptor muestra el toast)
 *
 * 3. useConfirm() + confirmPresets.delete() - Confirmación estándar:
 *    - Diálogo reutilizable con presets comunes
 *    - Retorna Promise<boolean> para await
 *
 * 4. PageShell - Layout consistente:
 *    - Title, breadcrumbs, actions siempre en el mismo lugar
 *
 * 5. QueryCell - Manejo de estados:
 *    - Loading: skeletons
 *    - Error: alert con retry
 *    - Success: renderiza children
 *
 * RESULTADO:
 * - Código limpio y declarativo
 * - Comportamiento consistente en toda la app
 * - Sin repetición de lógica de errores/éxitos/loading
 */
