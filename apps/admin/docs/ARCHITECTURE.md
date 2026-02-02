# Framework Admin - Arquitectura y Guia de Desarrollo

## Indice

1. [Resumen de Arquitectura](#resumen-de-arquitectura)
2. [Estructura del Monorepo](#estructura-del-monorepo)
3. [Como Funciona Next.js App Router](#como-funciona-nextjs-app-router)
4. [Sistema de Features](#sistema-de-features)
5. [Factories: Reutilizacion de Codigo](#factories-reutilizacion-de-codigo)
6. [Guia Paso a Paso: Crear una Nueva Pagina CRUD](#guia-paso-a-paso-crear-una-nueva-pagina-crud)
7. [Convenciones y Mejores Practicas](#convenciones-y-mejores-practicas)
8. [Flujo de Datos](#flujo-de-datos)

---

## Resumen de Arquitectura

Este proyecto es un **monorepo** que contiene multiples aplicaciones y paquetes compartidos:

```
Framework_1/
├── apps/
│   ├── admin/          # Panel de administracion (Next.js 16)
│   └── api/            # Backend API (NestJS)
├── packages/
│   ├── shared-types/   # Tipos TypeScript compartidos
│   └── shared-utils/   # Factories para servicios y hooks
└── package.json        # Configuracion raiz (Turborepo + pnpm)
```

### Tecnologias Principales

| Capa | Tecnologia | Proposito |
|------|------------|-----------|
| Build | Turborepo + pnpm | Orquestacion de monorepo |
| Frontend | Next.js 16 (App Router) | Routing y SSR |
| UI | React 19 + Tailwind + Radix UI | Componentes |
| State | React Query v5 | Server state management |
| Forms | react-hook-form + Zod | Formularios y validacion |
| HTTP | Axios | Cliente HTTP |
| Backend | NestJS + Prisma | API REST |

---

## Estructura del Monorepo

### Packages Compartidos

#### `@framework/shared-types`
Contiene todos los tipos TypeScript compartidos entre apps:

```typescript
// Ejemplo de tipos
export interface Product {
  id: string;
  name: string;
  code: string;
  active: boolean;
  createdAt: Date;
}

export interface CreateProductDTO {
  name: string;
  code: string;
}
```

#### `@framework/shared-utils`
Contiene factories para generar servicios y hooks automaticamente:

```typescript
// Genera un servicio CRUD completo
createCrudServiceWithStatus(apiClient, endpoint)

// Genera todos los hooks de React Query
createCrudHooksWithStatus(key, service, toast, config)
```

### Como se Conectan

```
apps/admin/package.json:
  "@framework/shared-types": "workspace:*"
  "@framework/shared-utils": "workspace:*"
```

El `workspace:*` indica que son referencias locales dentro del monorepo.

---

## Como Funciona Next.js App Router

### Conceptos Clave

1. **Carpeta `app/`**: Define las rutas de la aplicacion
2. **`page.tsx`**: Hace que una carpeta sea una ruta publica
3. **`layout.tsx`**: UI compartida que envuelve las rutas hijas
4. **Route Groups `(nombre)`**: Organizan rutas sin afectar la URL

### Estructura de Rutas en Este Proyecto

```
src/app/
├── layout.tsx              # Layout raiz (providers globales)
├── (dashboard)/            # Grupo de rutas protegidas
│   ├── layout.tsx          # Layout del dashboard (sidebar, header)
│   └── dashboard/
│       ├── page.tsx        # /dashboard
│       ├── admins/
│       │   └── page.tsx    # /dashboard/admins
│       ├── products/
│       │   └── page.tsx    # /dashboard/products
│       └── operatives/
│           └── page.tsx    # /dashboard/operatives
└── login/
    └── page.tsx            # /login (ruta publica)
```

### Por que usamos `(dashboard)`?

El parentesis indica un **Route Group**:
- NO afecta la URL (no aparece `/dashboard` en la ruta)
- Permite tener un `layout.tsx` especifico para rutas protegidas
- Separa logicamente las rutas publicas de las privadas

### Archivos Especiales de Next.js

| Archivo | Funcion |
|---------|---------|
| `page.tsx` | Define el contenido de la ruta |
| `layout.tsx` | UI compartida (headers, sidebars) |
| `loading.tsx` | Skeleton mientras carga |
| `error.tsx` | UI de error |
| `not-found.tsx` | Pagina 404 |

---

## Sistema de Features

Cada modulo de negocio se organiza en la carpeta `features/`:

```
src/features/
├── products/           # Feature de productos
│   ├── index.ts        # Servicio + Hooks (usando factories)
│   └── components/
│       ├── ProductList.tsx
│       ├── ProductForm.tsx
│       └── ProductImport.tsx
├── operatives/         # Feature de operativos
│   ├── index.ts        # Servicio + Hooks
│   └── components/
│       ├── operative-list.tsx
│       └── operative-form.tsx
└── admins/             # Feature de admins (legacy, estructura manual)
    ├── components/
    ├── hooks/
    ├── services/
    └── types.ts
```

### Estructura Recomendada (Estandar)

```
features/mi-entidad/
├── index.ts              # Exporta servicio, hooks y tipos
└── components/
    ├── mi-entidad-list.tsx
    └── mi-entidad-form.tsx
```

---

## Factories: Reutilizacion de Codigo

### El Problema que Resuelven

Sin factories, cada feature necesita:
- Servicio manual (~60 lineas)
- Hooks manuales (~100 lineas)
- Query keys manuales (~15 lineas)

Con factories:
- Todo en ~30 lineas

### Como Funcionan

#### 1. `createCrudServiceWithStatus`

Genera automaticamente un servicio con estos metodos:

```typescript
const service = createCrudServiceWithStatus(apiClient, '/products');

// Metodos generados:
service.list(params)        // GET /products
service.getById(id)         // GET /products/:id
service.create(data)        // POST /products
service.update(id, data)    // PUT /products/:id
service.delete(id)          // DELETE /products/:id
service.toggleStatus(id, { enable })  // PATCH /products/:id/status
```

#### 2. `createCrudHooksWithStatus`

Genera automaticamente hooks de React Query:

```typescript
const {
  keys,           // Query keys para cache
  useList,        // Hook para listar
  useDetail,      // Hook para detalle
  useCreate,      // Hook para crear (mutation)
  useUpdate,      // Hook para actualizar (mutation)
  useDelete,      // Hook para eliminar (mutation)
  useToggleStatus // Hook para cambiar estado (mutation)
} = createCrudHooksWithStatus('products', service, toast, config);
```

### Ejemplo Completo de Feature

```typescript
// features/products/index.ts
'use client';

import { createCrudServiceWithStatus, createCrudHooksWithStatus } from '@framework/shared-utils';
import { apiClient } from '@/lib/api-client';
import { ENDPOINTS } from '@/config';
import { toast } from 'sonner';
import type {
  Product,
  CreateProductDTO,
  UpdateProductDTO,
  ProductListParams,
} from '@framework/shared-types';

// 1. Crear servicio
export const productService = createCrudServiceWithStatus<
  Product,
  CreateProductDTO,
  UpdateProductDTO,
  ProductListParams
>(apiClient, ENDPOINTS.PRODUCTS);

// 2. Crear hooks
export const {
  keys: productKeys,
  useList: useProducts,
  useDetail: useProduct,
  useCreate: useCreateProduct,
  useUpdate: useUpdateProduct,
  useDelete: useDeleteProduct,
  useToggleStatus: useToggleProductStatus,
} = createCrudHooksWithStatus('products', productService, toast, {
  entityName: 'Producto',
  entityNamePlural: 'Productos',
});

// 3. Re-exportar tipos
export type { Product, CreateProductDTO, UpdateProductDTO } from '@framework/shared-types';
```

---

## Guia Paso a Paso: Crear una Nueva Pagina CRUD

Esta guia te muestra como integrar una nueva maqueta paso a paso.

### Paso 1: Definir Tipos en shared-types

```typescript
// packages/shared-types/src/index.ts

// Tipo de la entidad (con id porque viene de la API)
export interface Category {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  createdAt: Date;
}

// DTO para crear
export interface CreateCategoryDTO {
  name: string;
  description?: string;
}

// DTO para actualizar
export interface UpdateCategoryDTO {
  name?: string;
  description?: string;
}
```

### Paso 2: Agregar Endpoint en config

```typescript
// apps/admin/src/config/constants.ts

export const ENDPOINTS = {
  // ... otros endpoints
  CATEGORIES: '/categories',
};
```

### Paso 3: Crear el Feature (index.ts)

```typescript
// apps/admin/src/features/categories/index.ts
'use client';

import { createCrudServiceWithStatus, createCrudHooksWithStatus } from '@framework/shared-utils';
import { apiClient } from '@/lib/api-client';
import { ENDPOINTS } from '@/config';
import { toast } from 'sonner';
import type { Category, CreateCategoryDTO, UpdateCategoryDTO } from '@framework/shared-types';

// Servicio CRUD
export const categoryService = createCrudServiceWithStatus<
  Category,
  CreateCategoryDTO,
  UpdateCategoryDTO
>(apiClient, ENDPOINTS.CATEGORIES);

// Hooks de React Query
export const {
  keys: categoryKeys,
  useList: useCategories,
  useDetail: useCategory,
  useCreate: useCreateCategory,
  useUpdate: useUpdateCategory,
  useDelete: useDeleteCategory,
  useToggleStatus: useToggleCategoryStatus,
} = createCrudHooksWithStatus('categories', categoryService, toast, {
  entityName: 'Categoria',
  entityNamePlural: 'Categorias',
});

// Re-exportar tipos
export type { Category, CreateCategoryDTO, UpdateCategoryDTO };
```

### Paso 4: Crear el Componente Lista (con useDataTable)

```typescript
// apps/admin/src/features/categories/components/CategoryList.tsx
'use client';

import { Search, Plus, Edit, Power, FolderTree, ArrowUpDown, ArrowUp, ArrowDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination } from '@/components/shared/pagination';
import { useDataTable } from '@/hooks';
import type { Category } from '@framework/shared-types';

interface CategoryListProps {
  categories: Category[];
  isLoading?: boolean;
  onCreate: () => void;
  onEdit: (category: Category) => void;
  onToggleStatus: (category: Category) => void;  // Recibe la entidad completa
}

type CategoryFilter = 'all' | 'active' | 'inactive';

export function CategoryList({
  categories,
  isLoading,
  onCreate,
  onEdit,
  onToggleStatus,
}: CategoryListProps) {
  // Hook useDataTable maneja busqueda, filtro, ordenamiento y paginacion
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
  } = useDataTable<Category, CategoryFilter>({
    data: categories,
    searchFields: ['name', 'description'],        // Campos donde buscar
    defaultSort: { field: 'name', direction: 'asc' },
    filterOptions: { field: 'active' },           // Campo booleano para filtrar
    defaultFilter: 'all',
    itemsPerPage: 10,
  });

  // Componente de icono de ordenamiento
  const SortIcon = ({ field }: { field: keyof Category }) => {
    const direction = getSortIcon(field);
    if (direction === 'asc') return <ArrowUp className="h-4 w-4" />;
    if (direction === 'desc') return <ArrowDown className="h-4 w-4" />;
    return <ArrowUpDown className="h-4 w-4 opacity-50" />;
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header con titulo e icono */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <FolderTree className="h-5 w-5 md:h-6 md:w-6" />
          </div>
          <div>
            <h3>Gestion de Categorias</h3>
            <p className="text-muted-foreground text-sm">Administra las categorias del sistema</p>
          </div>
        </div>
        <Button onClick={onCreate} className="w-full md:w-auto gap-2">
          <Plus className="h-4 w-4" />
          Nueva Categoria
        </Button>
      </div>

      {/* Busqueda */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o descripcion"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="rounded-lg border border-border bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <button onClick={() => toggleSort('name')} className="flex items-center gap-2">
                    Nombre <SortIcon field="name" />
                  </button>
                </TableHead>
                <TableHead>Descripcion</TableHead>
                <TableHead>
                  <Select value={filter} onValueChange={(v) => setFilter(v as CategoryFilter)}>
                    <SelectTrigger className="border-0 shadow-none p-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="active">Activos</SelectItem>
                      <SelectItem value="inactive">Inactivos</SelectItem>
                    </SelectContent>
                  </Select>
                </TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                    No se encontraron categorias
                  </TableCell>
                </TableRow>
              ) : (
                items.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>{category.description ?? '-'}</TableCell>
                    <TableCell>
                      <Badge variant={category.active ? 'default' : 'secondary'}>
                        {category.active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => onEdit(category)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => onToggleStatus(category)}>
                        <Power className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Paginacion */}
        {filteredCount > 0 && (
          <div className="border-t border-border px-4">
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
```

### Paso 5: Crear la Pagina (con useConfirmAction)

```typescript
// apps/admin/src/app/(dashboard)/dashboard/categories/page.tsx
'use client';

import { useState } from 'react';
import { CategoryList } from '@/features/categories/components/CategoryList';
import { CategoryForm } from '@/features/categories/components/CategoryForm';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useConfirmAction, getConfirmDialogTexts } from '@/hooks';
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useToggleCategoryStatus,
  type Category,
  type CreateCategoryDTO,
  type UpdateCategoryDTO,
} from '@/features/categories';

type ViewMode = 'list' | 'create' | 'edit';

export default function CategoriesPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // Hooks de React Query
  const { data, isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const toggleStatus = useToggleCategoryStatus();

  const categories = data?.data ?? [];

  // Hook para dialogo de confirmacion
  const {
    confirmState,
    requestToggle,
    cancel,
    confirm,
  } = useConfirmAction<Category>({
    onToggle: (id, currentActive) => {
      // IMPORTANTE: Siempre usar "enable", no el nombre del campo de la entidad
      toggleStatus.mutate({ id, enable: !currentActive });
    },
  });

  // Textos dinamicos para el dialogo
  const dialogTexts = getConfirmDialogTexts(
    confirmState.type,
    confirmState.item,
    'Categoria',                    // Nombre de la entidad
    (category) => category.name     // Como obtener el nombre a mostrar
  );

  // Handlers
  const handleCreate = () => {
    setSelectedCategory(null);
    setViewMode('create');
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setViewMode('edit');
  };

  const handleBack = () => {
    setSelectedCategory(null);
    setViewMode('list');
  };

  const handleSave = (data: CreateCategoryDTO | UpdateCategoryDTO) => {
    if (viewMode === 'create') {
      createCategory.mutate(data as CreateCategoryDTO, {
        onSuccess: handleBack,
      });
    } else if (selectedCategory) {
      updateCategory.mutate(
        { id: selectedCategory.id, data: data as UpdateCategoryDTO },
        { onSuccess: handleBack }
      );
    }
  };

  // Render condicional: Formulario o Lista
  if (viewMode !== 'list') {
    return (
      <CategoryForm
        category={selectedCategory}
        onSave={handleSave}
        onCancel={handleBack}
        isLoading={createCategory.isPending || updateCategory.isPending}
      />
    );
  }

  return (
    <>
      <CategoryList
        categories={categories}
        isLoading={isLoading}
        onCreate={handleCreate}
        onEdit={handleEdit}
        onToggleStatus={requestToggle}  // Usa requestToggle del hook
      />

      {/* Dialogo de confirmacion */}
      <ConfirmDialog
        isOpen={confirmState.isOpen}
        onClose={cancel}
        onConfirm={confirm}
        title={dialogTexts.title}
        description={dialogTexts.description}
        confirmText={dialogTexts.confirmText}
        variant={dialogTexts.isDestructive ? 'destructive' : 'default'}
      />
    </>
  );
}
```

### Resumen del Patron

```
1. Feature (index.ts)
   - Servicio + Hooks generados con factories
   - Re-exporta tipos

2. Lista (CategoryList.tsx)
   - Usa useDataTable para busqueda/filtro/sort/paginacion
   - Recibe callbacks para acciones (onCreate, onEdit, onToggleStatus)
   - El callback de toggle recibe la ENTIDAD COMPLETA

3. Pagina (page.tsx)
   - Maneja viewMode: 'list' | 'create' | 'edit'
   - Usa useConfirmAction para dialogos de confirmacion
   - Conecta lista con hooks de React Query
```

---

## Convenciones y Mejores Practicas

### Nombres de Archivos

| Tipo | Convencion | Ejemplo |
|------|------------|---------|
| Componentes | PascalCase o kebab-case | `ProductList.tsx` o `product-list.tsx` |
| Hooks | camelCase con prefijo `use` | `useProducts.ts` |
| Servicios | kebab-case con sufijo `.service` | `product.service.ts` |
| Tipos | PascalCase | `Product`, `CreateProductDTO` |

### Estructura de Imports

```typescript
// 1. React y librerias externas
import { useState } from 'react';
import { useForm } from 'react-hook-form';

// 2. Componentes UI compartidos
import { Button } from '@/components/ui/button';

// 3. Features y hooks
import { useProducts } from '@/features/products';

// 4. Tipos
import type { Product } from '@framework/shared-types';
```

### Patron de Pagina CRUD

Todas las paginas CRUD siguen el mismo patron:

1. **Estado de vista**: `viewMode: 'list' | 'create' | 'edit'`
2. **Estado de seleccion**: `selectedItem: Entity | null`
3. **Hooks de React Query**: useList, useCreate, useUpdate, useDelete, useToggleStatus
4. **Handlers**: handleCreate, handleEdit, handleSave, handleBack, handleDelete
5. **Render condicional**: Lista o Formulario segun viewMode

---

## Flujo de Datos

```
┌─────────────────────────────────────────────────────────────┐
│                         PAGINA                               │
│  page.tsx                                                    │
│  - useState para viewMode y selectedItem                     │
│  - Usa hooks de React Query                                  │
│  - Define handlers                                           │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    HOOKS (React Query)                       │
│  useList, useCreate, useUpdate, useDelete                    │
│  - Generados por createCrudHooksWithStatus                   │
│  - Manejan cache, loading, errores                           │
│  - Muestran toasts automaticamente                           │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                      SERVICIO                                │
│  productService.list(), productService.create(), etc.        │
│  - Generado por createCrudServiceWithStatus                  │
│  - Construye URLs y parametros                               │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                     API CLIENT                               │
│  apiClient.get(), apiClient.post(), etc.                     │
│  - Axios con interceptors                                    │
│  - Agrega Bearer token                                       │
│  - Maneja errores 401                                        │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                     API BACKEND                              │
│  NestJS en apps/api                                          │
│  - Endpoints REST                                            │
│  - Prisma para BD                                            │
└─────────────────────────────────────────────────────────────┘
```

---

## Hooks Reutilizables

El proyecto incluye hooks personalizados para reducir codigo duplicado.

### useDataTable

Hook para manejar tablas de datos con search, filter, sort y pagination.

```typescript
import { useDataTable } from '@/hooks';

const {
  items,           // Datos paginados y filtrados
  searchQuery,     // Query de busqueda actual
  setSearchQuery,  // Setter para busqueda
  toggleSort,      // Funcion para ordenar por campo
  filter,          // Filtro actual ('all' | 'active' | 'inactive')
  setFilter,       // Setter para filtro
  currentPage,     // Pagina actual
  totalPages,      // Total de paginas
  setCurrentPage,  // Setter para pagina
} = useDataTable({
  data: products,
  searchFields: ['name', 'code'],
  defaultSort: { field: 'name', direction: 'asc' },
  filterOptions: { field: 'active' },
  itemsPerPage: 10,
});
```

### useConfirmAction

Hook para manejar dialogos de confirmacion (toggle, delete).

```typescript
import { useConfirmAction, getConfirmDialogTexts } from '@/hooks';

const {
  confirmState,    // Estado del dialogo
  requestToggle,   // Abrir dialogo de toggle
  requestDelete,   // Abrir dialogo de delete
  cancel,          // Cerrar dialogo
  confirm,         // Confirmar accion
} = useConfirmAction({
  onToggle: (id, enabled) => toggleStatus.mutate({ id, enable: !enabled }),
  onDelete: (id) => deleteItem.mutate(id),
});

// Obtener textos segun tipo de accion
const dialogTexts = getConfirmDialogTexts(
  confirmState.type,
  confirmState.item,
  'Usuario',
  (item) => item.fullName
);
```

### Archivos de Next.js Especiales

El dashboard incluye archivos especiales de Next.js:

- `dashboard/loading.tsx` - Skeleton mientras carga la pagina
- `dashboard/error.tsx` - UI de error con boton de retry

---

## Problemas Conocidos y Como Resolverlos

### 1. Error: "A component is changing a controlled input to be uncontrolled"

**Causa**: El valor de un input cambia de un string definido a `undefined`.

**Ejemplo del problema:**
```typescript
// MAL - puede ser undefined si operative.name no existe
const [name, setName] = useState(operative?.name);
```

**Solucion**: SIEMPRE usar string vacio como valor por defecto:
```typescript
// BIEN - siempre es un string
const [name, setName] = useState(operative?.name ?? '');

// MEJOR - usar funcion helper para valores iniciales
const getInitialFormData = (entity: Entity | null) => ({
  name: entity?.name ?? '',
  email: entity?.email ?? '',
});

const [formData, setFormData] = useState(() => getInitialFormData(entity));

// Actualizar cuando cambia la entidad
useEffect(() => {
  setFormData(getInitialFormData(entity));
}, [entity]);
```

**Regla de oro**: En inputs controlados, el valor NUNCA debe ser `undefined`.

@see https://react.dev/reference/react-dom/components/input#controlling-an-input-with-a-state-variable

---

### 2. Error de tipos al importar desde packages

**Solucion**: Asegurar que el package este listado en `transpilePackages` de `next.config.ts`:

```typescript
const nextConfig: NextConfig = {
  transpilePackages: ['@framework/shared-utils'],
};
```

### 3. Hooks no funcionan (Error: Invalid hook call)

**Causa**: El archivo no tiene `'use client'` al inicio.
**Solucion**: Agregar `'use client';` en la primera linea.

### 4. React Query no actualiza la lista despues de crear/editar

**Causa**: El cache no se invalida.
**Solucion**: Los hooks generados por las factories ya invalidan el cache automaticamente con `queryClient.invalidateQueries()`.

### 5. Toggle status no funciona

**Causa**: El mutation espera `{ id, enable }` no solo el id.
**Solucion**:
```typescript
toggleStatus.mutate({ id: item.id, enable: !item.active });
```

### 6. Error de validacion: "activate must be a boolean value"

**Causa**: Desajuste de nombres de campos entre capas.

**Flujo de datos del toggle status:**
```
Pagina              Hook Factory         Service Factory        Backend API
{ id, enable }  ->  { id, enable }   ->  { activate }       ->  expects "activate"
     ^                    ^                   ^
   TU CODIGO         hooks-factory.ts    service-factory.ts
```

**Error comun**: Usar el nombre del campo de la entidad en lugar de `enable`:
```typescript
// MAL - usa el campo de la entidad (active, enabled, status, etc.)
toggleStatus.mutate({ id: item.id, active: !item.active });

// BIEN - siempre usar "enable" que es lo que espera el hook
toggleStatus.mutate({ id: item.id, enable: !item.active });
```

**Por que?**
- El hook factory define la interfaz: `{ id: string; enable: boolean }`
- El service factory mapea `enable` -> `activate` para el backend
- NO importa como se llame el campo en tu entidad (`active`, `enabled`, `status`)
- SIEMPRE debes usar `enable` al llamar al mutation

---

## Comandos Utiles

```bash
# Desarrollo (todos los apps)
pnpm dev

# Desarrollo (solo admin)
pnpm admin:dev

# Desarrollo (solo api)
pnpm api:dev

# Build
pnpm build

# Lint
pnpm lint
```
