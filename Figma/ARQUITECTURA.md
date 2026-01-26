# Arquitectura del Proyecto - Next.js App Router

## 📁 Estructura del Proyecto

```
src/
├── app/                    # App Router de Next.js
│   ├── layout.tsx          # Layout raíz con providers
│   ├── page.tsx            # Página principal (redirige a dashboard)
│   ├── login/              # Página de login
│   │   └── page.tsx
│   └── (dashboard)/        # Grupo de rutas protegidas
│       ├── layout.tsx      # Layout con autenticación
│       └── dashboard/      # Módulos del dashboard
│           ├── admins/     # Gestión de administradores
│           ├── operatives/ # Gestión de usuarios operativos
│           ├── products/   # Gestión de productos
│           ├── locations/  # Gestión de locales
│           └── prices/     # Visualización de precios
│
├── components/
│   ├── ui/                 # Componentes Shadcn UI
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── table.tsx
│   │   └── ...
│   └── shared/             # Componentes compartidos de negocio
│       ├── page-shell.tsx         # Layout de página
│       ├── query-cell.tsx         # Wrapper para estados de query
│       ├── dashboard-shell.tsx    # Shell del dashboard
│       └── can.tsx                # Control de permisos
│
├── config/
│   ├── env.ts              # Configuración de entorno
│   ├── constants.ts        # Constantes globales
│   ├── routes.ts           # Definición de rutas
│   └── index.ts            # Barrel export
│
├── features/               # Módulos de negocio
│   └── admins/
│       ├── components/     # Componentes del feature
│       ├── hooks/          # Hooks de React Query
│       │   ├── use-admins.ts
│       │   └── use-admin-mutations.ts
│       ├── services/       # Servicios de API
│       │   └── admin.service.ts
│       └── types.ts        # Tipos del módulo
│
├── hooks/                  # Hooks globales reutilizables
│   ├── use-standard-table.ts      # Tablas con URL state
│   ├── use-standard-mutation.ts   # Mutaciones con toast
│   ├── use-standard-form.ts       # Formularios con Zod
│   └── use-permissions.ts         # RBAC
│
├── lib/                    # Librerías y utilidades
│   ├── api-client.ts       # Cliente Axios configurado
│   ├── create-api-service.ts # Factory de servicios CRUD
│   ├── utils.ts            # Utilidades (cn, formatters, etc.)
│   └── search-params.ts    # Parsers de URL
│
├── providers/              # Providers de contexto
│   ├── auth-provider.tsx   # Contexto de autenticación
│   ├── query-provider.tsx  # TanStack Query
│   └── theme-provider.tsx  # Tema dark/light
│
├── types/                  # Tipos globales
│   ├── api.types.ts        # Tipos de respuestas API
│   └── auth.types.ts       # Tipos de autenticación
│
└── styles/
    └── globals.css         # Estilos globales y variables CSS
```

## 🏗️ Patrones de Arquitectura

### 1. **Separación por Features**

Cada módulo de negocio (admins, products, etc.) tiene su propia carpeta en `features/` con:
- **components/**: Componentes específicos del módulo
- **hooks/**: Hooks de React Query para queries y mutations
- **services/**: Lógica de API
- **types.ts**: Tipos TypeScript del módulo

### 2. **Hooks Estandarizados**

#### `use-standard-table`
Maneja el estado de tablas con sincronización URL:
```tsx
const table = useStandardTable({
  defaultPageSize: 10,
  defaultSortField: 'name',
});

// Estado sincronizado con URL: page, pageSize, search, sortField, sortOrder, filters
```

#### `use-standard-mutation`
Mutaciones con toast y invalidación automática:
```tsx
const createUser = useStandardMutation({
  mutationFn: (data) => userService.create(data),
  successMessage: 'Usuario creado',
  invalidateQueries: ['users'],
});
```

#### `use-standard-form`
Formularios con validación Zod:
```tsx
const form = useStandardForm({
  schema: userSchema,
  defaultValues: { name: '', email: '' }
});
```

### 3. **Factory de Servicios CRUD**

Los servicios de API se crean usando un factory que proporciona operaciones CRUD estándar:

```tsx
const userService = createApiService<User>({
  endpoint: '/users',
});

// Métodos disponibles:
// - list(params)
// - getById(id)
// - create(data)
// - update(id, data)
// - delete(id)
```

### 4. **Componentes de Layout**

#### `PageShell`
Wrapper para páginas con título, descripción y acciones:
```tsx
<PageShell
  title="Usuarios"
  description="Gestión de usuarios del sistema"
  actions={<Button>Crear Usuario</Button>}
>
  <UserList />
</PageShell>
```

#### `QueryCell`
Maneja estados de carga, error y vacío:
```tsx
<QueryCell
  query={usersQuery}
  isEmpty={(data) => data.data.length === 0}
  emptyFallback={<EmptyState />}
>
  {(data) => <UserList users={data.data} />}
</QueryCell>
```

#### `Can`
Control de permisos basado en roles:
```tsx
<Can permission="admin">
  <AdminPanel />
</Can>
```

### 5. **Rutas Protegidas**

El grupo `(dashboard)` tiene su propio layout que:
- Verifica autenticación
- Redirige a login si no está autenticado
- Proporciona el shell del dashboard

```tsx
// src/app/(dashboard)/layout.tsx
export default function DashboardLayout({ children }) {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    redirect('/login');
  }
  
  return <DashboardShell>{children}</DashboardShell>;
}
```

## 🔧 Configuración

### Variables de Entorno

Configuradas en `src/config/env.ts`:
```typescript
export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL,
  authTokenKey: 'auth_token',
  isDevelopment: process.env.NODE_ENV === 'development',
};
```

### Constantes

Centralizadas en `src/config/constants.ts`:
```typescript
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
};

export const ROLES = {
  ADMIN: 'Administrador General',
  OPERATIVE: 'Operativo',
};
```

### Rutas

Definidas en `src/config/routes.ts`:
```typescript
export const ROUTES = {
  DASHBOARD: '/dashboard',
  ADMINS: '/dashboard/admins',
  ADMIN_CREATE: '/dashboard/admins/create',
  ADMIN_EDIT: (id: string) => `/dashboard/admins/${id}/edit`,
};
```

## 🎨 Sistema de Diseño

El sistema de diseño utiliza variables CSS definidas en `/styles/globals.css`:

```css
:root {
  --primary: ...;
  --border: ...;
  --radius: ...;
  /* etc */
}
```

Todos los componentes usan estas variables a través de Tailwind CSS:
```tsx
<div className="bg-primary text-primary-foreground rounded-lg border-border">
```

## 📦 Dependencias Principales

- **Next.js 14+**: Framework React con App Router
- **TanStack Query**: Gestión de estado servidor
- **React Hook Form + Zod**: Formularios y validación
- **Axios**: Cliente HTTP
- **Tailwind CSS**: Estilos
- **Shadcn UI**: Componentes base
- **Sonner**: Notificaciones toast

## 🚀 Flujo de Desarrollo

### Crear un nuevo módulo:

1. **Crear estructura en features/**
```
src/features/products/
├── components/
│   ├── product-list.tsx
│   └── product-form.tsx
├── hooks/
│   ├── use-products.ts
│   └── use-product-mutations.ts
├── services/
│   └── product.service.ts
└── types.ts
```

2. **Definir tipos**
```typescript
// types.ts
export interface Product {
  id: string;
  name: string;
  // ...
}
```

3. **Crear servicio**
```typescript
// services/product.service.ts
export const productService = createApiService<Product>({
  endpoint: '/products'
});
```

4. **Crear hooks**
```typescript
// hooks/use-products.ts
export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: () => productService.list(),
  });
}
```

5. **Crear página**
```typescript
// app/(dashboard)/dashboard/products/page.tsx
export default function ProductsPage() {
  const productsQuery = useProducts();
  
  return (
    <PageShell title="Productos">
      <QueryCell query={productsQuery}>
        {(data) => <ProductList products={data.data} />}
      </QueryCell>
    </PageShell>
  );
}
```

## ✅ Beneficios de esta Arquitectura

1. **Escalable**: Fácil agregar nuevos módulos
2. **Mantenible**: Código organizado y predecible
3. **Type-safe**: TypeScript en toda la aplicación
4. **DRY**: Hooks y utilidades reutilizables
5. **Testeable**: Separación clara de responsabilidades
6. **Performante**: Code-splitting automático con App Router
7. **Developer Experience**: Hot reload, TypeScript, auto-imports

## 📚 Próximos Pasos

1. Implementar API real y reemplazar mocks
2. Agregar tests unitarios y de integración
3. Implementar i18n completo
4. Agregar Storybook para componentes
5. Configurar CI/CD
6. Agregar logging y monitoreo
