# Framework 1

**Framework Empresarial con Clean Architecture + NestJS**

Un framework backend robusto, escalable y mantenible diseñado para aplicaciones empresariales de alto rendimiento. Implementa Clean Architecture (Arquitectura Hexagonal) con separación estricta de capas y principios SOLID.

---

## Stack Tecnologico

| Categoria | Tecnologia | Version | Proposito |
|-----------|------------|---------|-----------|
| **Framework** | NestJS | 11.1.11 | Framework modular con DI |
| **Lenguaje** | TypeScript | 5.9.3 | Tipado estatico estricto |
| **Runtime** | Node.js | 22 LTS | Motor JavaScript |
| **ORM** | Prisma | 7.2.0 | Type-safe database access |
| **Base de datos** | PostgreSQL | 17+ | DB relacional principal |
| **Cache/Queues** | Redis + BullMQ | 7 / 5.66 | Cache y colas async |
| **Auth** | Passport + JWT | 0.7 / 11.0 | Autenticacion JWT |
| **Biometria** | SimpleWebAuthn | 13.2.2 | WebAuthn/Passkeys |
| **WebSockets** | Socket.IO | 4.8.3 | Real-time bidireccional |
| **Pagos** | MercadoPago SDK | 2.11.0 | Integracion de pagos |
| **Maps** | Google Maps Services | 3.4.2 | Geocoding y distancias |
| **PDF** | pdfkit | 0.17.2 | Generacion de PDFs |
| **CSV** | fast-csv | 5.0.5 | Import/Export CSV |
| **Docs** | Swagger/OpenAPI | 11.2.4 | Documentacion API |

---

## Guia de Inicio Rapido

### Requisitos Previos

- Node.js v22.x LTS
- pnpm v9.x
- Docker y Docker Compose

### Instalacion

```bash
# 1. Clonar e instalar dependencias
git clone <repository-url>
cd "Framework 1"
pnpm install

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# 3. Iniciar servicios Docker (PostgreSQL + Redis)
docker-compose up -d

# 4. Generar cliente Prisma y ejecutar migraciones
pnpm prisma generate
pnpm prisma migrate dev

# 5. Iniciar en modo desarrollo
pnpm start:dev
```

### URLs de Acceso

| Servicio | URL |
|----------|-----|
| API REST | http://localhost:3000/api/v1 |
| Swagger Docs | http://localhost:3000/api/docs |
| WebSocket Chat | ws://localhost:3000/chat |
| Prisma Studio | http://localhost:5555 (pnpm prisma studio) |

---

## Estructura de Carpetas

```
src/
├── @core/                      # DOMINIO - Logica de negocio PURA
│   │                           # (Sin dependencias externas)
│   ├── domain/
│   │   └── entities/           # Entidades de dominio con reglas de negocio
│   │       ├── user.entity.ts
│   │       └── administrator.entity.ts
│   │
│   └── application/
│       ├── ports/              # PUERTOS - Contratos/Interfaces
│       │   ├── repositories/   # Interfaces de persistencia
│       │   └── services/       # Interfaces de servicios externos
│       ├── dto/                # DTOs de entrada/salida de Use Cases
│       └── use-cases/          # Casos de uso (logica de aplicacion)
│           ├── auth/           # Login, Register
│           └── chat/           # SendMessage, GetMessages
│
├── @infra/                     # INFRAESTRUCTURA - Implementaciones
│   │                           # (Adapta @core al mundo exterior)
│   ├── database/
│   │   ├── prisma/             # PrismaService, PrismaModule
│   │   └── repositories/       # Implementaciones de IRepository
│   │       ├── base.repository.ts    # Clase base con Soft Delete
│   │       ├── user.repository.ts
│   │       └── administrator.repository.ts
│   │
│   ├── providers/              # Servicios externos
│   │   ├── payments/           # MercadoPago SDK
│   │   ├── maps/               # Google Maps API
│   │   ├── notifications/      # Firebase FCM
│   │   └── files/              # PDF, CSV generation
│   │
│   ├── queues/                 # BullMQ + Redis
│   │   └── processors/         # Workers de colas
│   │
│   └── security/               # Autenticacion y seguridad
│       ├── authentication/     # JWT Strategy, Guards
│       ├── biometrics/         # WebAuthn/Passkeys
│       ├── encryption/         # Bcrypt, hashing
│       └── throttling/         # Rate limiting config
│
├── @presentation/              # PRESENTACION - API HTTP/WS
│   │                           # (Punto de entrada del usuario)
│   ├── controllers/            # REST Controllers
│   │   └── auth/               # AuthController, DTOs
│   ├── gateways/               # WebSocket Gateways
│   │   └── chat/               # ChatGateway, ChatService
│   ├── guards/                 # Guards de autorizacion
│   │   └── decorators/         # @Roles, @Public, @CurrentUser
│   ├── filters/                # Exception Filters
│   ├── interceptors/           # Transform, Logging
│   ├── pipes/                  # Validation Pipes
│   └── middlewares/            # Express Middlewares
│
├── @shared/                    # COMPARTIDO - Utilidades transversales
│   ├── config/                 # Configuraciones centralizadas
│   ├── constants/              # Constantes y enums
│   ├── types/                  # TypeScript types/interfaces
│   ├── exceptions/             # Excepciones de dominio
│   ├── utils/                  # Funciones helper
│   └── validators/             # Validadores custom
│
├── app.module.ts               # Modulo raiz
└── main.ts                     # Bootstrap con middlewares
```

---

## Regla de Dependencias (Clean Architecture)

```
       ┌─────────────────────────────────────┐
       │         @presentation               │  HTTP/WS Layer
       │   (Controllers, Gateways, DTOs)     │
       └──────────────┬──────────────────────┘
                      │ depends on
                      ▼
       ┌─────────────────────────────────────┐
       │      @core/application              │  Application Layer
       │   (Use Cases, Ports/Interfaces)     │
       └──────────────┬──────────────────────┘
                      │ depends on
                      ▼
       ┌─────────────────────────────────────┐
       │        @core/domain                 │  Domain Layer
       │   (Entities, Business Rules)        │  (PURO - Sin dependencias)
       └─────────────────────────────────────┘

       ┌─────────────────────────────────────┐
       │          @infra                     │  Infrastructure Layer
       │   (Repositories, Providers)         │  (Implementa interfaces)
       └─────────────────────────────────────┘
                      │ implements
                      ▼
              Interfaces de @core
```

**REGLA DE ORO**: `@core` NUNCA importa de `@infra` ni de `@presentation`.

---

## Scripts Disponibles

```bash
# Desarrollo
pnpm start:dev          # Hot-reload
pnpm start:debug        # Debug con inspector

# Produccion
pnpm build              # Compilar TypeScript
pnpm start:prod         # Ejecutar build

# Testing
pnpm test               # Tests unitarios
pnpm test:watch         # Watch mode
pnpm test:cov           # Coverage report
pnpm test:e2e           # Tests End-to-End

# Calidad
pnpm lint               # ESLint
pnpm format             # Prettier
pnpm typecheck          # TypeScript check

# Base de Datos
pnpm prisma generate    # Generar cliente
pnpm prisma migrate dev # Crear migracion
pnpm prisma studio      # GUI para DB
pnpm prisma db push     # Sync schema (dev only)
```

---

## Variables de Entorno Criticas

| Variable | Descripcion | Ejemplo |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5434/db` |
| `REDIS_URL` | Redis connection string | `redis://localhost:6380` |
| `JWT_SECRET` | Clave secreta JWT (min 32 chars) | `your-super-secret-key...` |
| `JWT_EXPIRATION` | Tiempo de vida del access token | `1h` |
| `JWT_REFRESH_EXPIRATION` | Tiempo de vida del refresh token | `7d` |

Ver `.env.example` para la lista completa.

---

## Seguridad Implementada

| Capa | Proteccion | Configuracion |
|------|------------|---------------|
| HTTP Headers | Helmet | CSP, HSTS, X-Frame-Options |
| Parametros | HPP | Previene HTTP Parameter Pollution |
| Autenticacion | JWT + Passport | Access + Refresh tokens |
| Biometria | WebAuthn | Passkeys con SimpleWebAuthn |
| Passwords | bcrypt | Cost factor 12 |
| Rate Limiting | @nestjs/throttler | 100 req/min por IP |
| Validacion | class-validator | Whitelist + Transform |
| CORS | Configurado | Por origen permitido |
| Compresion | gzip | Response compression |

---

## Documentacion Adicional

- [ARCHITECTURE.md](./docs/ARCHITECTURE.md) - Arquitectura detallada y patrones
- [Swagger API](http://localhost:3000/api/docs) - Documentacion interactiva

---

## Licencia

MIT License - Cervak Team 2024
