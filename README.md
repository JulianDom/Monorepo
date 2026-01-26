# Framework 1 - Monorepo

Monorepo para aplicaciones web empresariales usando **Turborepo** y **pnpm workspaces**.

## Estructura del Proyecto

```
Framework_1/
├── apps/
│   ├── admin/          # Panel de administración (Next.js 16)
│   └── api/            # Backend API 
├── packages/           # Paquetes compartidos (por configurar)
├── package.json        # Configuración raíz
├── pnpm-workspace.yaml # Definición de workspaces
└── turbo.json          # Configuración de Turborepo (opcional)
```

## Requisitos

- **Node.js** >= 18
- **pnpm** >= 8

## Instalación

```bash
# Clonar el repositorio
git clone <repo-url>
cd Framework_1

# Instalar dependencias de todos los workspaces
pnpm install
```

## Scripts Disponibles

Desde la raíz del monorepo:

```bash
# Desarrollo
pnpm dev              # Ejecutar todos los apps en modo desarrollo
pnpm admin:dev        # Solo el admin
pnpm api:dev          # Solo el API

# Build
pnpm build            # Build de todos los apps

# Linting
pnpm lint             # Lint de todos los apps
```

## Agregar Dependencias

```bash
# A un workspace específico (desde la raíz)
pnpm add <package> --filter admin
pnpm add <package> --filter api

# O desde dentro del directorio del app
cd apps/admin
pnpm add <package>

# Dependencia de desarrollo
pnpm add -D <package> --filter admin

# A todos los workspaces
pnpm add <package> -w
```

## Apps

### Admin (`apps/admin`)

Panel de administración construido con:
- **Next.js 16** (App Router)
- **TanStack Query v5** (Data Fetching)
- **TanStack React Table** (Tablas)
- **nuqs** (Estado en URL)
- **react-hook-form + Zod** (Formularios)
- **Tailwind CSS + Shadcn UI** (Estilos)

Ver [documentación completa del Admin](./apps/admin/README.md).

### API (`apps/api`)

Backend API

## Packages Compartidos

Los paquetes en `packages/` pueden ser compartidos entre apps:

```typescript
// Ejemplo de uso desde un app
import { someUtil } from '@framework/shared';
```

## Filosofía de Desarrollo

Este framework sigue el principio de **"Convención sobre Configuración"**:

1. **Estructura predefinida**: Cada feature sigue la misma estructura
2. **Hooks estandarizados**: Comportamientos comunes encapsulados
3. **Servicios factory**: CRUD en una línea de código
4. **URL como estado**: Filtros y paginación sincronizados con URL

## Convenciones

### Estructura de Features

```
src/features/
└── users/
    ├── components/     # Componentes de UI
    ├── hooks/          # Hooks de React Query
    ├── services/       # Servicios de API
    └── types/          # Tipos TypeScript (opcional)
```

### Nomenclatura

- **Hooks**: `use-<nombre>.ts` → `useNombre()`
- **Servicios**: `<entidad>.service.ts` → `entityService`
- **Componentes**: `PascalCase.tsx`
- **Tipos**: `<entidad>.types.ts` o en el mismo archivo

## Tecnologías Principales

| Categoría | Tecnología |
|-----------|------------|
| Build Tool | Turborepo |
| Package Manager | pnpm |
| Frontend Framework | Next.js 16 |
| Styling | Tailwind CSS |
| UI Components | Shadcn UI |
| State Management | TanStack Query |
| Forms | react-hook-form + Zod |
| HTTP Client | Axios |
| URL State | nuqs |
| Tables | TanStack React Table |

## Licencia

Privado - Todos los derechos reservados.
