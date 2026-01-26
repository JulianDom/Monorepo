# Guía de Migración a la Nueva Estructura

## 📋 Resumen

Esta guía explica cómo migrar los componentes existentes a la nueva estructura Next.js App Router.

## 🗂️ Mapeo de Archivos

### Componentes UI (Ya están en su lugar)
```
/components/ui/* → /src/components/ui/*
```
✅ Estos componentes se mantienen igual, solo cambia la ruta de importación.

### Componentes de Features

#### Administradores
```
/components/AdminManagement.tsx    → ELIMINAR (lógica va a página)
/components/AdminList.tsx          → /src/features/admins/components/admin-list.tsx
/components/AdminForm.tsx          → /src/features/admins/components/admin-form.tsx
```

#### Usuarios Operativos
```
/components/OperativeManagement.tsx → ELIMINAR (lógica va a página)
/components/OperativeList.tsx       → /src/features/operatives/components/operative-list.tsx
/components/OperativeForm.tsx       → /src/features/operatives/components/operative-form.tsx
```

#### Productos
```
/components/ProductManagement.tsx           → ELIMINAR (lógica va a página)
/components/products/ProductList.tsx        → /src/features/products/components/product-list.tsx
/components/products/ProductForm.tsx        → /src/features/products/components/product-form.tsx
/components/products/ProductImport.tsx      → /src/features/products/components/product-import.tsx
/components/products/ImportReport.tsx       → /src/features/products/components/import-report.tsx
```

#### Locales
```
/components/LocationManagement.tsx              → ELIMINAR (lógica va a página)
/components/locations/LocationList.tsx          → /src/features/locations/components/location-list.tsx
/components/locations/LocationForm.tsx          → /src/features/locations/components/location-form.tsx
/components/locations/LocationImport.tsx        → /src/features/locations/components/location-import.tsx
/components/locations/LocationImportReport.tsx  → /src/features/locations/components/location-import-report.tsx
```

#### Precios
```
/components/PriceVisualization.tsx   → ELIMINAR (lógica va a página)
/components/prices/PriceList.tsx     → /src/features/prices/components/price-list.tsx
/components/prices/PriceDetail.tsx   → /src/features/prices/components/price-detail.tsx
```

### Componentes Compartidos
```
/components/Pagination.tsx    → /src/components/shared/pagination.tsx
/components/Sidebar.tsx       → INTEGRADO en /src/components/shared/dashboard-shell.tsx
/components/MobileSidebar.tsx → INTEGRADO en /src/components/shared/dashboard-shell.tsx
/components/LoginScreen.tsx   → /src/app/login/page.tsx
```

### Estilos
```
/styles/globals.css → /src/styles/globals.css
```

### App Principal
```
/App.tsx → ELIMINAR (reemplazado por App Router)
```

## 🔄 Pasos de Migración

### 1. Copiar Componentes UI
```bash
# Los componentes UI se mantienen tal cual
cp -r /components/ui /src/components/ui
```

### 2. Migrar Feature: Administradores

**Paso 2.1**: Crear estructura
```bash
mkdir -p src/features/admins/{components,hooks,services}
```

**Paso 2.2**: Mover componentes
```bash
# AdminList
mv /components/AdminList.tsx /src/features/admins/components/admin-list.tsx

# AdminForm  
mv /components/AdminForm.tsx /src/features/admins/components/admin-form.tsx
```

**Paso 2.3**: Actualizar imports en los componentes movidos

**Antes:**
```tsx
import { Button } from './ui/button';
import { Admin } from './AdminManagement';
```

**Después:**
```tsx
import { Button } from '@/components/ui/button';
import { Admin } from '../types';
```

**Paso 2.4**: Crear tipos
```tsx
// src/features/admins/types.ts
export interface Admin {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}
```

**Paso 2.5**: Crear servicio
```tsx
// src/features/admins/services/admin.service.ts
import { createApiService } from '@/lib/create-api-service';
import { Admin } from '../types';

export const adminService = createApiService<Admin>({
  endpoint: '/admins',
});
```

**Paso 2.6**: Crear hooks
```tsx
// src/features/admins/hooks/use-admins.ts
import { useQuery } from '@tanstack/react-query';
import { adminService } from '../services/admin.service';

export function useAdmins() {
  return useQuery({
    queryKey: ['admins'],
    queryFn: () => adminService.list(),
  });
}
```

**Paso 2.7**: Crear página
```tsx
// src/app/(dashboard)/dashboard/admins/page.tsx
'use client';

import { useAdmins } from '@/features/admins/hooks/use-admins';
import { AdminList } from '@/features/admins/components/admin-list';
import { PageShell } from '@/components/shared/page-shell';
import { QueryCell } from '@/components/shared/query-cell';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminsPage() {
  const router = useRouter();
  const adminsQuery = useAdmins();

  return (
    <PageShell
      title="Administradores"
      description="Gestión de administradores del sistema"
      actions={
        <Button onClick={() => router.push('/dashboard/admins/create')}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Administrador
        </Button>
      }
    >
      <QueryCell query={adminsQuery}>
        {(data) => <AdminList admins={data.data} />}
      </QueryCell>
    </PageShell>
  );
}
```

### 3. Repetir para otros features

Seguir el mismo patrón para:
- Operatives
- Products
- Locations
- Prices

## 🎯 Refactorizaciones Necesarias

### AdminList Component

**Antes (con estado local):**
```tsx
export function AdminList({ admins, onCreateAdmin, ... }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Lógica de filtrado y paginación local
}
```

**Después (con URL state):**
```tsx
'use client';

import { useStandardTable } from '@/hooks/use-standard-table';
import { useRouter } from 'next/navigation';

export function AdminList({ admins }) {
  const router = useRouter();
  const table = useStandardTable({
    defaultPageSize: 10,
    defaultSortField: 'name',
  });

  // Estado viene de URL: table.page, table.search, etc.
  
  const handleCreate = () => router.push('/dashboard/admins/create');
  const handleEdit = (admin) => router.push(`/dashboard/admins/${admin.id}/edit`);
}
```

### AdminForm Component

**Antes (con callbacks):**
```tsx
export function AdminForm({ mode, initialData, onSave, onCancel }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };
}
```

**Después (con mutations):**
```tsx
'use client';

import { useCreateAdmin, useUpdateAdmin } from '@/features/admins/hooks/use-admin-mutations';
import { useStandardForm } from '@/hooks/use-standard-form';
import { adminSchema } from '../schemas';

export function AdminForm({ mode, initialData }) {
  const createAdmin = useCreateAdmin();
  const updateAdmin = useUpdateAdmin();
  
  const form = useStandardForm({
    schema: adminSchema,
    defaultValues: initialData || {},
  });

  const onSubmit = form.handleSubmit((data) => {
    if (mode === 'create') {
      createAdmin.mutate(data);
    } else {
      updateAdmin.mutate({ id: initialData.id, data });
    }
  });

  return <form onSubmit={onSubmit}>...</form>;
}
```

## 📦 Instalación de Nuevas Dependencias

```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
npm install react-hook-form @hookform/resolvers zod
npm install axios
npm install next-themes
npm install sonner
```

## ⚙️ Configuración de Next.js

**next.config.js:**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
}

module.exports = nextConfig;
```

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

## 🧪 Testing de la Migración

### 1. Verificar Rutas
- [ ] `/login` - Página de login funciona
- [ ] `/dashboard` - Dashboard principal carga
- [ ] `/dashboard/admins` - Lista de administradores
- [ ] `/dashboard/admins/create` - Formulario de creación
- [ ] `/dashboard/admins/:id/edit` - Formulario de edición

### 2. Verificar Funcionalidades
- [ ] Login funciona
- [ ] Logout funciona
- [ ] Navegación entre páginas
- [ ] Filtros de tabla persisten en URL
- [ ] Paginación funciona
- [ ] Ordenamiento funciona
- [ ] Formularios validan correctamente
- [ ] Toasts aparecen en acciones
- [ ] Control de permisos funciona

### 3. Verificar Estilos
- [ ] Variables CSS se aplican correctamente
- [ ] Responsive funciona
- [ ] Dark mode (si está implementado)
- [ ] Iconos cargan correctamente

## 🚀 Orden Recomendado de Migración

1. ✅ **Setup inicial** (Ya hecho)
   - Estructura de carpetas
   - Config files
   - Providers
   - Hooks globales

2. **Componentes UI** (Copiar tal cual)
   - /src/components/ui/*

3. **Componentes Shared** (Crear/Migrar)
   - PageShell
   - QueryCell
   - DashboardShell
   - Can

4. **Feature por Feature**
   - Admins (empezar aquí)
   - Operatives
   - Products
   - Locations
   - Prices

5. **Testing y Refinamiento**
   - Verificar cada módulo
   - Ajustar estilos
   - Optimizar rendimiento

## 💡 Tips

1. **Migra de a un feature por vez** - No intentes migrar todo de una vez
2. **Mantén ambas versiones** - Hasta estar seguro que la nueva funciona
3. **Usa Git branches** - Una branch por feature migrado
4. **Testea constantemente** - Después de cada cambio
5. **Documenta cambios** - Especialmente las decisiones de diseño

## ❓ FAQ

**P: ¿Puedo mantener la estructura antigua?**
R: Sí, pero perderás los beneficios de Next.js App Router, URL state, y la arquitectura escalable.

**P: ¿Debo migrar el mock data también?**
R: Sí, mueve los datos mock a archivos en cada feature: `src/features/admins/mocks/admin.mocks.ts`

**P: ¿Cómo manejo las imágenes?**
R: Mueve a `/public/` y usa Next.js Image component.

**P: ¿Qué pasa con los tipos compartidos?**
R: Van a `/src/types/` si son globales, o dentro de cada feature si son específicos.
