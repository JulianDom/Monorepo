# Templates para Nuevas Features

Esta carpeta contiene templates reutilizables para crear nuevas features CRUD.

## Archivos

| Archivo | Descripcion |
|---------|-------------|
| `index.template.ts` | Servicio y hooks usando factories |
| `page.template.tsx` | Pagina con patron CRUD estandar |

## Pasos para Crear una Nueva Feature

### 1. Definir Tipos (si no existen)

En `packages/shared-types/src/index.ts`:

```typescript
// Tipo de la entidad
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

// Parametros de lista
export interface CategoryListParams {
  page?: number;
  limit?: number;
  search?: string;
}
```

### 2. Agregar Endpoint

En `apps/admin/src/config/constants.ts`:

```typescript
export const ENDPOINTS = {
  // ...otros
  CATEGORIES: '/categories',
};
```

### 3. Crear Carpeta del Feature

```bash
mkdir -p apps/admin/src/features/categories/components
```

### 4. Copiar y Adaptar index.ts

```bash
cp apps/admin/src/features/_templates/index.template.ts \
   apps/admin/src/features/categories/index.ts
```

Editar y reemplazar:
- `__FEATURE_NAME__` -> `Categories`
- `__ENTITY__` -> `Category`
- `__ENTITY_KEY__` -> `categories`
- `__ENTITY_NAME_ES__` -> `Categoria`
- `__ENTITY_NAME_PLURAL_ES__` -> `Categorias`
- `__ENDPOINT__` -> `ENDPOINTS.CATEGORIES`

### 5. Crear Componentes

Crear los archivos:
- `apps/admin/src/features/categories/components/CategoryList.tsx`
- `apps/admin/src/features/categories/components/CategoryForm.tsx`

Puedes copiar de features existentes como `products` o `operatives` y adaptar.

### 6. Crear la Pagina

```bash
mkdir -p apps/admin/src/app/\(dashboard\)/dashboard/categories
cp apps/admin/src/features/_templates/page.template.tsx \
   apps/admin/src/app/\(dashboard\)/dashboard/categories/page.tsx
```

Editar y reemplazar los placeholders.

## Ejemplo Completo: Feature "Categories"

### index.ts

```typescript
'use client';

import { createCrudServiceWithStatus, createCrudHooksWithStatus } from '@framework/shared-utils';
import { apiClient } from '@/lib/api-client';
import { ENDPOINTS } from '@/config';
import { toast } from 'sonner';
import type {
  Category,
  CreateCategoryDTO,
  UpdateCategoryDTO,
  CategoryListParams,
} from '@framework/shared-types';

export const categoryService = createCrudServiceWithStatus<
  Category,
  CreateCategoryDTO,
  UpdateCategoryDTO,
  CategoryListParams
>(apiClient, ENDPOINTS.CATEGORIES);

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

export type { Category, CreateCategoryDTO, UpdateCategoryDTO };
```

## Convenciones de Nombres

| Concepto | Ejemplo |
|----------|---------|
| Carpeta feature | `categories` (plural, kebab-case) |
| Archivo index | `index.ts` |
| Componente List | `CategoryList.tsx` (PascalCase) |
| Componente Form | `CategoryForm.tsx` (PascalCase) |
| Hook useList | `useCategories` |
| Hook useCreate | `useCreateCategory` |
| Servicio | `categoryService` |
| Keys | `categoryKeys` |
