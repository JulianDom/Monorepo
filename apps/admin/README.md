# Admin Panel - Documentacion

Panel de administracion construido con Next.js 16 (App Router) y un conjunto de herramientas estandarizadas para desarrollo eficiente.

## Tabla de Contenidos

- [Estructura del Proyecto](#estructura-del-proyecto)
- [Configuracion Inicial](#configuracion-inicial)
- [Arquitectura](#arquitectura)
- [Llamadas a API](#llamadas-a-api)
- [Formularios](#formularios)
- [Tablas con Filtros](#tablas-con-filtros)
- [Manejo de Errores](#manejo-de-errores)
- [Componentes Compartidos](#componentes-compartidos)
- [Autenticacion](#autenticacion)
- [Permisos (RBAC)](#permisos-rbac)
- [Tema (Dark Mode)](#tema-dark-mode)
- [Internacionalizacion](#internacionalizacion)
- [Ejemplo Completo](#ejemplo-completo)

---

## Estructura del Proyecto

```
src/
├── app/                    # App Router de Next.js
│   ├── layout.tsx          # Layout raiz con providers
│   ├── page.tsx            # Pagina principal
│   └── (dashboard)/        # Grupo de rutas protegidas
│
├── components/
│   ├── ui/                 # Componentes Shadcn UI
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── table.tsx
│   │   └── ...
│   └── shared/             # Componentes compartidos de negocio
│       ├── page-shell.tsx      # Layout de pagina
│       ├── query-cell.tsx      # Wrapper para estados de query
│       ├── data-table-shell.tsx # Wrapper para tablas
│       ├── form-field.tsx      # Campo de formulario
│       ├── confirm-dialog.tsx  # Dialogo de confirmacion
│       └── can.tsx             # Control de permisos
│
├── config/
│   ├── env.ts              # Configuracion de entorno
│   ├── constants.ts        # Constantes globales
│   ├── routes.ts           # Definicion de rutas
│   └── index.ts            # Barrel export
│
├── features/               # Modulos de negocio
│   └── users/
│       ├── components/     # Componentes del feature
│       ├── hooks/          # Hooks de React Query
│       └── services/       # Servicios de API
│
├── hooks/                  # Hooks globales
│   ├── use-standard-table.ts   # Tablas con URL state
│   ├── use-standard-mutation.ts # Mutaciones con toast
│   ├── use-standard-form.ts    # Formularios con Zod
│   ├── use-permissions.ts      # RBAC
│   └── ...
│
├── lib/
│   ├── api-client.ts       # Cliente Axios configurado
│   ├── create-api-service.ts # Factory de servicios CRUD
│   ├── utils.ts            # Utilidades (cn, etc.)
│   └── search-params.ts    # Parsers de URL
│
├── providers/
│   ├── auth-provider.tsx   # Contexto de autenticacion
│   ├── query-provider.tsx  # TanStack Query
│   └── theme-provider.tsx  # Tema dark/light
│
├── types/
│   ├── api.types.ts        # Tipos de respuestas API
│   └── auth.types.ts       # Tipos de autenticacion
│
├── i18n/                   # Internacionalizacion
│   └── locales/
│       ├── es.ts
│       └── en.ts
│
└── middleware.ts           # Middleware de autenticacion
```

---

## Configuracion Inicial

### 1. Variables de Entorno

Crear `.env.local`:

```env
# URLs de API por entorno
NEXT_PUBLIC_API_URL_LOCAL=http://localhost:3001/api
NEXT_PUBLIC_API_URL_STAGING=https://staging-api.tudominio.com/api
NEXT_PUBLIC_API_URL_PRODUCTION=https://api.tudominio.com/api

# Override de entorno (opcional)
# NEXT_PUBLIC_API_ENV=production   # Forzar produccion en desarrollo local
```

### 2. Instalar Dependencias

```bash
cd apps/admin
pnpm add @tanstack/react-query @tanstack/react-table nuqs axios sonner
pnpm add react-hook-form @hookform/resolvers zod
pnpm add next-themes lucide-react
pnpm add -D @types/node
```

### 3. Ejecutar en Desarrollo

```bash
# Desde la raiz del monorepo
pnpm admin:dev

# O desde apps/admin
pnpm dev
```

---

## Arquitectura

### Filosofia: Composicion sobre Herencia

A diferencia de frameworks como Angular o PHP donde se usa herencia de clases:

```php
// PHP tradicional
class UserController extends BaseController {
    public function index() {
        return $this->success($this->paginate(User::all()));
    }
}
```

En React/Next.js usamos **composicion con hooks**:

```tsx
// Next.js con hooks
function UsersPage() {
  const { data, isLoading } = useUsers();        // <- Equivalente a $this->paginate()
  const createUser = useCreateUser();            // <- Equivalente a $this->httpPost()
  const { notify } = useNotify();                // <- Equivalente a $this->showSuccess()

  return <QueryCell query={query}>{...}</QueryCell>;
}
```

### Ventajas de este enfoque

1. **Reutilizacion**: Los hooks se pueden combinar libremente
2. **Testeable**: Cada hook se puede testear aisladamente
3. **Type-safe**: TypeScript infiere todos los tipos
4. **Tree-shaking**: Solo se incluye el codigo que se usa

---

## Llamadas a API

### Cliente Axios Configurado

El cliente `apiClient` ya incluye:
- Base URL segun entorno
- Token Bearer automatico
- Manejo de errores con toast
- Refresh token automatico

```tsx
// src/lib/api-client.ts - Ya configurado
import { apiClient } from '@/lib';

// Uso directo (no recomendado para CRUD)
const response = await apiClient.get('/users');
const data = await apiClient.post('/users', { name: 'John' });
```

### Factory de Servicios CRUD

Para operaciones CRUD estandar, usar el factory:

```tsx
// src/features/users/services/user.service.ts
import { createApiService } from '@/lib/create-api-service';

// Definir tipos
interface User {
  id: string;
  name: string;
  email: string;
}

interface CreateUserDto {
  name: string;
  email: string;
  password: string;
}

interface UpdateUserDto {
  name?: string;
  email?: string;
}

// Crear servicio con UNA LINEA
export const userService = createApiService<User, CreateUserDto, UpdateUserDto>('/users');
```

El servicio incluye automaticamente:

```tsx
userService.getAll(params?)    // GET /users?page=1&limit=10
userService.getById(id)        // GET /users/:id
userService.create(data)       // POST /users
userService.update(id, data)   // PUT /users/:id
userService.patch(id, data)    // PATCH /users/:id
userService.delete(id)         // DELETE /users/:id
userService.customGet(path)    // GET /users/custom-endpoint
userService.customPost(path)   // POST /users/custom-endpoint
```

### Hooks de React Query

Crear hooks para cada entidad:

```tsx
// src/features/users/hooks/use-users.ts
'use client';

import { useQuery } from '@tanstack/react-query';
import { useCreateMutation, useUpdateMutation, useDeleteMutation } from '@/hooks';
import { useStandardTable } from '@/hooks';
import { userService } from '../services/user.service';

// Query keys centralizadas (importante para invalidacion)
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...userKeys.lists(), filters] as const,
  detail: (id: string) => [...userKeys.all, 'detail', id] as const,
};

/**
 * Hook para listar usuarios con filtros de URL
 */
export function useUsers() {
  const { filterParams, ...tableState } = useStandardTable();

  const query = useQuery({
    queryKey: userKeys.list(filterParams),
    queryFn: () => userService.getAll(filterParams),
  });

  return {
    ...query,
    ...tableState,      // search, setSearch, page, setPage, etc.
    filterParams,
  };
}

/**
 * Hook para crear usuario
 * - Muestra toast "Usuario creado correctamente" automaticamente
 * - Invalida la lista de usuarios para refrescar
 */
export function useCreateUser() {
  return useCreateMutation({
    mutationFn: (data) => userService.create(data),
    entityName: 'Usuario',
    invalidateKeys: [userKeys.lists()],
  });
}

/**
 * Hook para eliminar usuario
 */
export function useDeleteUser() {
  return useDeleteMutation({
    mutationFn: (id) => userService.delete(id),
    entityName: 'Usuario',
    invalidateKeys: [userKeys.lists()],
  });
}
```

### Uso en Componentes

```tsx
'use client';

function UsersPage() {
  // Listar con filtros automaticos en URL
  const { data, isLoading, search, setSearch, page, setPage } = useUsers();

  // Mutacion con toast automatico
  const deleteUser = useDeleteUser();

  const handleDelete = (id: string) => {
    deleteUser.mutate(id);
    // Toast "Usuario eliminado correctamente" aparece automaticamente
  };

  return (
    <div>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        // URL se actualiza: /users?search=john
      />

      {isLoading ? <Skeleton /> : (
        <ul>
          {data?.data.map(user => (
            <li key={user.id}>
              {user.name}
              <button onClick={() => handleDelete(user.id)}>
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

---

## Formularios

### Hook useStandardForm

Integra `react-hook-form` con `Zod`:

```tsx
'use client';

import { z } from 'zod';
import { useStandardForm } from '@/hooks';
import { FormField, FormFieldset, FormActions } from '@/components/shared';
import { Button } from '@/components/ui';

// 1. Definir schema de validacion
const userSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email invalido'),
  password: z.string().min(8, 'La contrasena debe tener al menos 8 caracteres'),
});

type UserFormData = z.infer<typeof userSchema>;

function CreateUserForm() {
  // 2. Crear instancia del formulario
  const form = useStandardForm<UserFormData>({
    schema: userSchema,
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const createUser = useCreateUser();

  // 3. Handler de submit
  const onSubmit = form.handleSubmit((data) => {
    createUser.mutate(data, {
      onSuccess: () => {
        form.resetForm();  // Limpiar formulario
      },
      onError: (error) => {
        // Setear errores del servidor en campos especificos
        if (error.response?.data?.error?.details) {
          form.setServerErrors(error.response.data.error.details);
        }
      },
    });
  });

  return (
    <form onSubmit={onSubmit}>
      <FormFieldset legend="Datos del Usuario">
        <FormField
          form={form}
          name="name"
          label="Nombre completo"
          placeholder="John Doe"
        />

        <FormField
          form={form}
          name="email"
          label="Correo electronico"
          type="email"
          placeholder="john@example.com"
        />

        <FormField
          form={form}
          name="password"
          label="Contrasena"
          type="password"
          description="Minimo 8 caracteres"
        />
      </FormFieldset>

      <FormActions>
        <Button type="button" variant="outline" onClick={() => form.resetForm()}>
          Cancelar
        </Button>
        <Button type="submit" disabled={form.isSubmitting}>
          {form.isSubmitting ? 'Guardando...' : 'Crear Usuario'}
        </Button>
      </FormActions>
    </form>
  );
}
```

### FormField con Componentes Personalizados

```tsx
// Select personalizado
<FormField form={form} name="role" label="Rol">
  {(field) => (
    <Select onValueChange={field.onChange} value={field.value}>
      <SelectTrigger>
        <SelectValue placeholder="Selecciona un rol" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="admin">Administrador</SelectItem>
        <SelectItem value="user">Usuario</SelectItem>
      </SelectContent>
    </Select>
  )}
</FormField>

// Textarea
<FormField form={form} name="description" label="Descripcion">
  {(field) => (
    <textarea
      {...field}
      className="w-full rounded-md border p-2"
      rows={4}
    />
  )}
</FormField>
```

---

## Tablas con Filtros

### Hook useStandardTable

Sincroniza automaticamente filtros, paginacion y ordenamiento con la URL:

```tsx
'use client';

import { useStandardTable } from '@/hooks';
import { DataTableShell } from '@/components/shared';

function UsersTable() {
  const {
    // Paginacion
    page,
    setPage,
    limit,
    setLimit,

    // Busqueda (con debounce automatico)
    search,
    setSearch,
    debouncedSearch,

    // Ordenamiento
    sortBy,
    setSortBy,
    sortOrder,
    toggleSortOrder,

    // Parametros listos para API
    filterParams,

    // Estado de transicion
    isPending,

    // Utilidades
    resetFilters,
  } = useStandardTable();

  // La URL se actualiza automaticamente:
  // /users?page=2&limit=25&search=john&sortBy=name&sortOrder=asc

  const { data, isLoading } = useQuery({
    queryKey: ['users', filterParams],
    queryFn: () => userService.getAll(filterParams),
  });

  return (
    <div>
      {/* Barra de busqueda */}
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar..."
      />

      {/* Tabla con datos */}
      <DataTableShell
        columns={columns}
        data={data?.data ?? []}
        pagination
        pageSize={limit}
      />

      {/* Paginacion personalizada (si no usas DataTableShell) */}
      <div>
        <button onClick={() => setPage(page - 1)} disabled={page === 1}>
          Anterior
        </button>
        <span>Pagina {page}</span>
        <button onClick={() => setPage(page + 1)}>
          Siguiente
        </button>
      </div>
    </div>
  );
}
```

### Definir Columnas de Tabla

```tsx
import { type ColumnDef } from '@tanstack/react-table';

const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'name',
    header: 'Nombre',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'createdAt',
    header: 'Fecha de creacion',
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
  },
  {
    accessorKey: 'status',
    header: 'Estado',
    cell: ({ row }) => (
      <span className={row.original.active ? 'text-green-600' : 'text-gray-400'}>
        {row.original.active ? 'Activo' : 'Inactivo'}
      </span>
    ),
  },
  {
    id: 'actions',
    header: 'Acciones',
    cell: ({ row }) => (
      <div className="flex gap-2">
        <Button variant="ghost" size="icon" onClick={() => handleEdit(row.original)}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => handleDelete(row.original.id)}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    ),
  },
];
```

---

## Manejo de Errores

### Errores Automaticos (Interceptor)

El `apiClient` maneja automaticamente los errores HTTP con toast:

| Codigo | Comportamiento |
|--------|----------------|
| 400 | Toast con mensaje de validacion |
| 401 | Intenta refresh token, si falla redirige a login |
| 403 | Toast "No tienes permisos para realizar esta accion" |
| 404 | Toast "Recurso no encontrado" |
| 409 | Toast "El registro ya existe" |
| 500+ | Toast con mensaje del servidor |
| Sin conexion | Toast "Error de conexion" |

**No necesitas manejar estos errores manualmente.** El interceptor lo hace por ti.

### Errores en Formularios

```tsx
const createUser = useCreateUser();

createUser.mutate(data, {
  onError: (error) => {
    // Error de validacion del servidor
    if (error.response?.status === 422) {
      const serverErrors = error.response.data.error.details;
      // { email: "Este email ya existe", name: "Campo requerido" }
      form.setServerErrors(serverErrors);
    }

    // Error general del formulario
    form.setFormError('No se pudo crear el usuario');
  },
});
```

### Componente QueryCell

Maneja estados de loading, error y success automaticamente:

```tsx
import { QueryCell } from '@/components/shared';

function UsersList() {
  const query = useUsers();

  return (
    <QueryCell query={query}>
      {(data) => (
        // Solo se renderiza cuando hay datos
        <ul>
          {data.data.map(user => (
            <li key={user.id}>{user.name}</li>
          ))}
        </ul>
      )}
    </QueryCell>
  );
}
```

**Estados que maneja:**
- **Loading**: Muestra skeletons
- **Error**: Muestra alerta con boton de "Reintentar"
- **Success**: Renderiza el children con los datos

### Error Boundary

Para errores no capturados:

```tsx
import { ErrorBoundary } from '@/components/shared';

function App() {
  return (
    <ErrorBoundary>
      <MyComponent />
    </ErrorBoundary>
  );
}
```

---

## Componentes Compartidos

### PageShell

Layout consistente para todas las paginas:

```tsx
import { PageShell } from '@/components/shared';

function UsersPage() {
  return (
    <PageShell
      title="Usuarios"
      description="Gestiona los usuarios del sistema"
      breadcrumbs={[
        { label: 'Dashboard', href: '/' },
        { label: 'Usuarios' },  // Sin href = pagina actual
      ]}
      actions={
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Crear Usuario
        </Button>
      }
    >
      {/* Contenido de la pagina */}
      <UsersTable />
    </PageShell>
  );
}
```

### ConfirmDialog

Dialogo de confirmacion reutilizable:

```tsx
import { useConfirm, confirmPresets } from '@/hooks';
import { ConfirmDialog } from '@/components/shared';

function DeleteButton({ userId }) {
  const { confirm, confirmState } = useConfirm();
  const deleteUser = useDeleteUser();

  const handleDelete = async () => {
    // confirmPresets incluye: delete, logout, unsavedChanges
    const confirmed = await confirm(confirmPresets.delete('Usuario'));

    if (confirmed) {
      deleteUser.mutate(userId);
    }
  };

  return (
    <>
      <Button onClick={handleDelete}>Eliminar</Button>
      <ConfirmDialog {...confirmState} />
    </>
  );
}

// Confirmacion personalizada
const confirmed = await confirm({
  title: 'Confirmar accion',
  description: 'Estas seguro de realizar esta accion?',
  confirmText: 'Si, continuar',
  cancelText: 'Cancelar',
  variant: 'warning', // 'danger' | 'warning' | 'info'
});
```

---

## Autenticacion

### AuthProvider

El `AuthProvider` maneja:
- Estado del usuario
- Login/Logout
- Refresh token
- Persistencia en localStorage

```tsx
// En cualquier componente
import { useAuth } from '@/providers';

function Header() {
  const { user, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Link href="/login">Iniciar Sesion</Link>;
  }

  return (
    <div>
      <span>Hola, {user.name}</span>
      <button onClick={logout}>Cerrar Sesion</button>
    </div>
  );
}
```

### Login

```tsx
import { useAuth } from '@/providers';

function LoginForm() {
  const { login } = useAuth();
  const form = useStandardForm({ schema: loginSchema, defaultValues: { email: '', password: '' }});

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await login(data.email, data.password);
      // Redirige automaticamente al dashboard
    } catch (error) {
      form.setFormError('Credenciales invalidas');
    }
  });

  return <form onSubmit={onSubmit}>...</form>;
}
```

### Middleware de Proteccion

El `middleware.ts` protege rutas automaticamente:

```tsx
// src/middleware.ts
// Rutas publicas: /login, /register, /forgot-password
// Rutas protegidas: todo lo demas

// Si el usuario no esta autenticado y accede a /dashboard:
// -> Redirige a /login

// Si el usuario esta autenticado y accede a /login:
// -> Redirige a /dashboard
```

---

## Permisos (RBAC)

### Hook usePermissions

```tsx
import { usePermissions } from '@/hooks';

function AdminPanel() {
  const { can, hasRole, isAdmin } = usePermissions();

  return (
    <div>
      {can('users.create') && (
        <Button>Crear Usuario</Button>
      )}

      {can('users.delete') && (
        <Button variant="destructive">Eliminar</Button>
      )}

      {hasRole('admin') && (
        <Link href="/admin/settings">Configuracion</Link>
      )}

      {isAdmin && (
        <div>Panel de Super Admin</div>
      )}
    </div>
  );
}
```

### Componentes Can/Cannot

```tsx
import { Can, Cannot } from '@/components/shared';

function UserActions() {
  return (
    <>
      <Can permission="users.edit">
        <Button>Editar</Button>
      </Can>

      <Cannot permission="users.delete">
        <span className="text-gray-400">Sin permisos para eliminar</span>
      </Cannot>

      {/* Multiples permisos */}
      <Can permissions={['users.edit', 'users.delete']} requireAll>
        <Button>Gestionar Usuario</Button>
      </Can>
    </>
  );
}
```

---

## Tema (Dark Mode)

### ThemeToggle

```tsx
import { ThemeToggle } from '@/components/shared';

function Header() {
  return (
    <header>
      <ThemeToggle />  {/* Boton con icono sol/luna */}
    </header>
  );
}
```

### useTheme

```tsx
import { useTheme } from '@/hooks';

function ThemeSelector() {
  const { theme, setTheme, systemTheme, resolvedTheme } = useTheme();

  return (
    <select value={theme} onChange={(e) => setTheme(e.target.value)}>
      <option value="system">Sistema</option>
      <option value="light">Claro</option>
      <option value="dark">Oscuro</option>
    </select>
  );
}
```

---

## Internacionalizacion

### Hook useTranslations

```tsx
import { useTranslations } from '@/hooks';

function MyComponent() {
  const { t } = useTranslations();

  return (
    <div>
      <h1>{t('common.welcome')}</h1>
      <p>{t('success.created', { entity: 'Usuario' })}</p>
      {/* -> "Usuario creado correctamente" */}
    </div>
  );
}
```

### Archivos de traduccion

```tsx
// src/i18n/locales/es.ts
export const es = {
  common: {
    welcome: 'Bienvenido',
    save: 'Guardar',
    cancel: 'Cancelar',
    delete: 'Eliminar',
  },
  success: {
    created: '{entity} creado correctamente',
    updated: '{entity} actualizado correctamente',
    deleted: '{entity} eliminado correctamente',
  },
  errors: {
    generic: 'Ha ocurrido un error',
    notFound: '{entity} no encontrado',
  },
};
```

---

## Ejemplo Completo

### Estructura del Feature

```
src/features/users/
├── components/
│   ├── users-page.tsx        # Pagina principal
│   ├── user-form.tsx         # Formulario de crear/editar
│   └── user-table-columns.tsx # Definicion de columnas
├── hooks/
│   └── use-users.ts          # Hooks de React Query
└── services/
    └── user.service.ts       # Servicio CRUD
```

### Servicio

```tsx
// services/user.service.ts
import { createApiService } from '@/lib';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: string;
}

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
}

export interface UpdateUserDto {
  name?: string;
  role?: 'admin' | 'user';
}

export const userService = createApiService<User, CreateUserDto, UpdateUserDto>('/users');
```

### Hooks

```tsx
// hooks/use-users.ts
'use client';

import { useQuery } from '@tanstack/react-query';
import { useStandardTable, useCreateMutation, useUpdateMutation, useDeleteMutation } from '@/hooks';
import { userService, type CreateUserDto, type UpdateUserDto } from '../services/user.service';

export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...userKeys.lists(), filters] as const,
  detail: (id: string) => [...userKeys.all, 'detail', id] as const,
};

export function useUsers() {
  const { filterParams, ...tableState } = useStandardTable();
  const query = useQuery({
    queryKey: userKeys.list(filterParams),
    queryFn: () => userService.getAll(filterParams),
  });
  return { ...query, ...tableState, filterParams };
}

export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => userService.getById(id),
    enabled: !!id,
  });
}

export function useCreateUser() {
  return useCreateMutation<User, CreateUserDto>({
    mutationFn: userService.create,
    entityName: 'Usuario',
    invalidateKeys: [userKeys.lists()],
  });
}

export function useUpdateUser(id: string) {
  return useUpdateMutation<User, UpdateUserDto>({
    mutationFn: (data) => userService.update(id, data),
    entityName: 'Usuario',
    invalidateKeys: [userKeys.lists(), userKeys.detail(id)],
  });
}

export function useDeleteUser() {
  return useDeleteMutation<void, string>({
    mutationFn: userService.delete,
    entityName: 'Usuario',
    invalidateKeys: [userKeys.lists()],
  });
}
```

### Pagina Completa

```tsx
// components/users-page.tsx
'use client';

import { useState } from 'react';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import { type ColumnDef } from '@tanstack/react-table';
import { useUsers, useDeleteUser, type User } from '../hooks/use-users';
import { useConfirm, confirmPresets } from '@/hooks';
import {
  PageShell,
  QueryCell,
  DataTableShell,
  ConfirmDialog,
  Can,
} from '@/components/shared';
import { Button, Input } from '@/components/ui';
import { UserForm } from './user-form';

export function UsersPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const { data, isLoading, isError, error, refetch, search, setSearch } = useUsers();
  const deleteUser = useDeleteUser();
  const { confirm, confirmState } = useConfirm();

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };

  const handleDelete = async (user: User) => {
    const confirmed = await confirm(confirmPresets.delete('Usuario'));
    if (confirmed) {
      deleteUser.mutate(user.id);
    }
  };

  const columns: ColumnDef<User>[] = [
    { accessorKey: 'name', header: 'Nombre' },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'role', header: 'Rol' },
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Can permission="users.edit">
            <Button variant="ghost" size="icon" onClick={() => handleEdit(row.original)}>
              <Pencil className="h-4 w-4" />
            </Button>
          </Can>
          <Can permission="users.delete">
            <Button variant="ghost" size="icon" onClick={() => handleDelete(row.original)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </Can>
        </div>
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
          <Can permission="users.create">
            <Button onClick={() => { setEditingUser(null); setIsFormOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Usuario
            </Button>
          </Can>
        }
      >
        {/* Barra de busqueda */}
        <div className="mb-4 max-w-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar usuarios..."
              className="pl-10"
            />
          </div>
        </div>

        {/* Tabla */}
        <QueryCell query={{ data, isLoading, isError, error, refetch } as any}>
          {(response) => (
            <DataTableShell
              columns={columns}
              data={response.data}
              pagination
              pageSize={10}
              emptyMessage="No se encontraron usuarios"
            />
          )}
        </QueryCell>
      </PageShell>

      {/* Modal de formulario */}
      {isFormOpen && (
        <UserForm
          user={editingUser}
          onClose={() => setIsFormOpen(false)}
          onSuccess={() => setIsFormOpen(false)}
        />
      )}

      {/* Dialogo de confirmacion */}
      <ConfirmDialog {...confirmState} />
    </>
  );
}
```

---

## Resumen de Patrones

| Necesidad | Solucion |
|-----------|----------|
| Llamar API | `createApiService()` + `useQuery()` |
| Crear/Editar/Eliminar | `useCreateMutation()` / `useUpdateMutation()` / `useDeleteMutation()` |
| Formulario con validacion | `useStandardForm()` + `<FormField>` |
| Tabla con filtros | `useStandardTable()` + `<DataTableShell>` |
| Estados loading/error | `<QueryCell>` |
| Confirmacion | `useConfirm()` + `<ConfirmDialog>` |
| Layout de pagina | `<PageShell>` |
| Permisos | `usePermissions()` + `<Can>` |
| Tema | `useTheme()` + `<ThemeToggle>` |
| Traducciones | `useTranslations()` |

---

## Tips y Buenas Practicas

1. **Siempre usar los hooks estandarizados** - No reinventar la rueda
2. **Query keys centralizadas** - Facilita invalidacion
3. **Un service por entidad** - Usar el factory `createApiService`
4. **Tipos TypeScript** - Definir interfaces para todas las entidades
5. **Estructura de features** - Mantener componentes, hooks y services juntos
6. **URL como fuente de verdad** - Para filtros y paginacion
7. **No manejar errores manualmente** - El interceptor ya lo hace
