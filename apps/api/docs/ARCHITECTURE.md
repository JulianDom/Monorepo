# ARCHITECTURE.md

## Arquitectura de Framework 1

Este documento explica el **como** y el **por que** de cada decision arquitectonica del framework.

---

## 1. Flujo de una Peticion HTTP

Cuando un cliente hace una peticion HTTP, esta atraviesa las siguientes capas:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENTE                                         │
│                         (Browser, Mobile App)                                │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼ HTTP Request
┌─────────────────────────────────────────────────────────────────────────────┐
│                            main.ts                                           │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐    │
│  │   Helmet    │→│     HPP     │→│ Compression │→│   ValidationPipe    │    │
│  │  (Security) │ │ (Params)    │ │   (gzip)    │ │ (class-validator)   │    │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        @presentation/controllers                             │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ AuthController                                                        │   │
│  │ ┌────────────┐    ┌─────────────┐    ┌──────────────────────────┐   │   │
│  │ │ JwtGuard   │ →  │ @Body() DTO │ →  │ LoginUseCase.execute()   │   │   │
│  │ │ (Passport) │    │ (Validated) │    │                          │   │   │
│  │ └────────────┘    └─────────────┘    └──────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      @core/application/use-cases                             │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ LoginUseCase                                                          │   │
│  │                                                                        │   │
│  │  1. Recibe LoginInput (email, password, actorType)                    │   │
│  │  2. Llama a IUserRepository.findByEmail()                             │   │
│  │  3. Llama a IPasswordHasher.compare()                                 │   │
│  │  4. Llama a ITokenGenerator.generateTokenPair()                       │   │
│  │  5. Retorna LoginOutput (actor + tokens)                              │   │
│  │                                                                        │   │
│  │  NOTA: Solo conoce INTERFACES (puertos), no implementaciones          │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      @infra/database/repositories                            │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ UserRepository implements IUserRepository                             │   │
│  │                                                                        │   │
│  │  findByEmail(email):                                                  │   │
│  │    1. prisma.user.findFirst({ where: { email, deletedAt: null }})    │   │
│  │    2. Mapea Prisma Model → Domain Entity                              │   │
│  │    3. Retorna UserEntity | null                                       │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              PostgreSQL                                      │
│                         (via Prisma Client)                                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Resumen del Flujo

1. **main.ts**: Middlewares globales (Helmet, HPP, CORS, Compression)
2. **Guards**: JwtAuthGuard verifica el token JWT
3. **Pipes**: ValidationPipe valida el DTO con class-validator
4. **Controller**: Recibe la peticion y delega al Use Case
5. **Use Case**: Orquesta la logica de negocio usando interfaces
6. **Repository**: Implementa la persistencia con Prisma
7. **Mapper**: Convierte Prisma Model ↔ Domain Entity
8. **Database**: PostgreSQL ejecuta la query

---

## 2. Capas de Abstraccion

### 2.1 PrismaRepository (Base Repository)

El `PrismaRepository<T, E>` es una clase abstracta generica que proporciona:

```typescript
abstract class PrismaRepository<T, E> {
  // T = Prisma Model (User, Administrator, etc.)
  // E = Domain Entity (UserEntity, AdministratorEntity, etc.)

  // Metodos CRUD con Soft Delete automatico
  findAll(page, limit)    // Filtra deletedAt: null automaticamente
  findById(id)            // Incluye check de soft delete
  create(entity)          // Usa toEntity() para mapear
  update(id, data)        // Actualiza solo campos proporcionados
  delete(id)              // Soft delete: SET deletedAt = NOW()

  // Metodos abstractos que cada repo debe implementar
  abstract toEntity(model: T): E      // Prisma → Domain
  abstract toPersistence(entity: E): Partial<T>  // Domain → Prisma
}
```

**Ventajas**:
- **DRY**: No repites logica de paginacion, soft delete en cada repo
- **Consistencia**: Todos los repos se comportan igual
- **Type Safety**: Genericos aseguran tipos correctos
- **Soft Delete automatico**: `deletedAt` se maneja internamente

### 2.2 BaseService

El `BaseService<T, R>` proporciona operaciones CRUD estandarizadas:

```typescript
abstract class BaseService<T, R extends IBaseRepository<T>> {
  constructor(protected readonly repository: R) {}

  findAll(page, limit)     // Paginacion estandar
  findById(id)             // Con manejo de NotFoundException
  create(data)             // Delegado al repositorio
  update(id, data)         // Con verificacion de existencia
  delete(id)               // Soft delete
}
```

**Ventajas**:
- **Reutilizacion**: Logica CRUD no se repite
- **Excepciones**: `NotFoundException` automatico si no existe
- **Extensible**: Heredas y agregas metodos especificos

---

## 3. Patrones Implementados

### 3.1 Repository Pattern

**Que es**: Abstrae el acceso a datos detras de una interfaz.

**Como se implementa**:
```
@core/application/ports/repositories/
  └── user.repository.interface.ts  ← Interface (Puerto)

@infra/database/repositories/
  └── user.repository.ts            ← Implementacion (Adaptador)
```

**Por que**:
- El Use Case no sabe si usas Prisma, TypeORM, o MongoDB
- Puedes cambiar de base de datos sin tocar la logica de negocio
- Facilita testing con mocks

### 3.2 Mapper Pattern (Entity Mapping)

**Que es**: Convierte entre modelos de persistencia y entidades de dominio.

**Como se implementa**:
```typescript
// En cada repositorio
class UserRepository extends PrismaRepository<User, UserEntity> {

  // Prisma Model → Domain Entity
  protected toEntity(model: User): UserEntity {
    return UserEntity.reconstitute({
      id: model.id,
      fullName: model.fullName,
      emailAddress: model.emailAddress,
      // ... mapeo de campos
    });
  }

  // Domain Entity → Prisma Model
  protected toPersistence(entity: UserEntity): Partial<User> {
    return {
      fullName: entity.fullName,
      emailAddress: entity.emailAddress,
      // ... mapeo inverso
    };
  }
}
```

**Por que**:
- El dominio no depende de Prisma
- Puedes tener nombres de campos diferentes en DB vs Entidad
- La entidad tiene metodos de negocio, el modelo Prisma no

### 3.3 Polimorfismo en Conversaciones (Chat)

**El problema**: Una conversacion puede tener miembros que son `User` o `Administrator`.

**La solucion**: Tabla intermedia polimorfica:

```prisma
model ConversationMember {
  id             String     @id
  conversationId String
  memberId       String     // ID del User O Administrator
  memberType     MemberType // 'USER' | 'ADMIN'

  // Relaciones opcionales (solo una sera valida)
  user          User?          @relation(...)
  administrator Administrator? @relation(...)
}

enum MemberType {
  USER
  ADMIN
}
```

**Como funciona**:
1. Al agregar miembro: se guarda `memberId` + `memberType`
2. Al consultar: se hace JOIN con la tabla correcta segun `memberType`
3. En codigo: se usa un switch/if para cargar la relacion correcta

### 3.4 Soft Delete Pattern

**Que es**: En lugar de eliminar registros, se marca una fecha de eliminacion.

**Como se implementa**:
```prisma
model User {
  // ...
  deletedAt DateTime? @map("deleted_at")
}
```

```typescript
// En PrismaRepository.delete()
async delete(id: string): Promise<void> {
  await this.prisma.user.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}

// En findAll, findById, etc.
where: { deletedAt: null }  // Automatico en la clase base
```

**Por que**:
- Los datos nunca se pierden (auditoria, recuperacion)
- Las referencias FK no se rompen
- Puedes implementar "papelera" facilmente

### 3.5 Ports & Adapters (Hexagonal Architecture)

**Puertos** (en `@core/application/ports/`):
- Interfaces que definen QUE necesita el dominio
- Ejemplo: `IUserRepository`, `ITokenGenerator`, `IPasswordHasher`

**Adaptadores** (en `@infra/`):
- Implementaciones concretas de los puertos
- Ejemplo: `UserRepository`, `TokenService`, `BcryptService`

```
          ┌──────────────────────┐
          │     @core/domain     │  ← Logica de negocio PURA
          │     @core/application│  ← Use Cases + Puertos
          └──────────┬───────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
   ┌────▼────┐  ┌────▼────┐  ┌────▼────┐
   │ Prisma  │  │  Redis  │  │  HTTP   │
   │Adapter  │  │ Adapter │  │ Adapter │
   └─────────┘  └─────────┘  └─────────┘
       │             │            │
   PostgreSQL     Redis      Clients
```

---

## 4. Reglas de Dependencia

### La Regla de Oro

```
@core/domain       →  NADA (capa mas interna)
@core/application  →  @core/domain, @shared
@infra             →  @core (implementa interfaces), @shared
@presentation      →  @core, @infra (inyeccion), @shared
@shared            →  NADA (utilidades puras)
```

### Violaciones Prohibidas

```typescript
// PROHIBIDO en @core/domain o @core/application:
import { PrismaService } from '@infra/database/prisma';
import { UserRepository } from '@infra/database/repositories';
import { AuthController } from '@presentation/controllers';

// CORRECTO en @core/application:
import { IUserRepository } from './ports/repositories';
import { UserEntity } from '@core/domain/entities';
```

### Inyeccion de Dependencias

NestJS resuelve las dependencias en tiempo de ejecucion:

```typescript
// En el modulo
@Module({
  providers: [
    {
      provide: USER_REPOSITORY,        // Symbol (token)
      useClass: UserRepository,        // Implementacion real
    },
  ],
})

// En el Use Case
@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,  // Solo la interface
  ) {}
}
```

---

## 5. Estructura de Excepciones

### Jerarquia

```
DomainException (base)
├── EntityNotFoundException
├── EntityDuplicatedException
├── InvalidCredentialsException
├── AccountDisabledException
├── ValidationException
└── BusinessRuleViolationException
```

### Flujo de Excepciones

```
Use Case throws DomainException
         │
         ▼
GlobalExceptionFilter catches all
         │
         ▼
Mapea a HTTP Response estandarizado:
{
  "success": false,
  "error": {
    "code": "ENTITY_NOT_FOUND",
    "message": "User not found",
    "details": { "id": "..." }
  },
  "timestamp": "2024-01-14T...",
  "path": "/api/v1/users/..."
}
```

---

## 6. Seguridad por Capas

| Capa | Responsabilidad |
|------|-----------------|
| **main.ts** | Helmet, HPP, CORS, Compression |
| **Guards** | JwtAuthGuard, RolesGuard, ThrottlerGuard |
| **Pipes** | ValidationPipe (whitelist, transform) |
| **Filters** | GlobalExceptionFilter (no expone internals) |
| **Services** | Bcrypt (cost 12), timing-safe comparisons |
| **Database** | Soft delete, audit logs, prepared statements |

---

## 7. Testing Strategy

### Unit Tests
- **Que probar**: Use Cases, Domain Entities, Services
- **Como**: Jest + mocks de repositorios

```typescript
describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  let mockUserRepo: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    mockUserRepo = { findByEmail: jest.fn() };
    useCase = new LoginUseCase(mockUserRepo, ...);
  });

  it('should throw InvalidCredentialsException for wrong password', async () => {
    mockUserRepo.findByEmail.mockResolvedValue(mockUser);
    await expect(useCase.execute({ ... }))
      .rejects.toThrow(InvalidCredentialsException);
  });
});
```

### Integration Tests
- **Que probar**: Repositories, Controllers
- **Como**: Jest + base de datos de test

### E2E Tests
- **Que probar**: Flujos completos
- **Como**: Supertest + app bootstrapped

---

## 8. Performance Considerations

### Database
- Indices en campos frecuentes (`email`, `username`, `deletedAt`)
- Paginacion obligatoria en listados
- Soft delete evita locks de DELETE

### Caching
- Redis para sesiones y cache de queries frecuentes
- BullMQ para tareas async (emails, notificaciones)

### API
- Compression gzip habilitado
- Rate limiting por IP (100 req/min)
- Validacion temprana con class-validator

---

## Conclusion

Framework 1 implementa Clean Architecture de forma pragmatica:

1. **Dominio puro**: Entidades con logica de negocio, sin dependencias
2. **Puertos y adaptadores**: Interfaces en core, implementaciones en infra
3. **Soft delete automatico**: En la clase base del repositorio
4. **Seguridad en capas**: Cada capa tiene su responsabilidad
5. **Type safety**: TypeScript estricto + Prisma + class-validator

El objetivo es un codigo **mantenible**, **testeable** y **extensible**.
