# Repository Implementations

Esta carpeta contiene las **implementaciones concretas** de los repositorios usando Prisma ORM.

## Estructura

Los repositorios implementan las interfaces definidas en `@core/application/ports/repositories`.

## Ejemplo

```typescript
// Interface en @core/application/ports/repositories/user.repository.interface.ts
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<User>;
}

// Implementación en @infra/database/repositories/user.repository.ts
@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    const userDb = await this.prisma.user.findUnique({ where: { id } });
    if (!userDb) return null;

    // Mapear de modelo Prisma a entidad de dominio
    return this.toDomain(userDb);
  }

  async save(user: User): Promise<User> {
    const data = this.toPrisma(user);
    const saved = await this.prisma.user.create({ data });
    return this.toDomain(saved);
  }

  private toDomain(prismaUser: PrismaUser): User {
    // Mapeo de Prisma a entidad de dominio
  }

  private toPrisma(user: User): PrismaUserCreateInput {
    // Mapeo de entidad de dominio a Prisma
  }
}
```

## Reglas

1. Los repositorios **implementan interfaces** de `@core/application/ports`
2. Los repositorios **usan PrismaService** para acceso a BD
3. Los repositorios **mapean** entre modelos Prisma y entidades de dominio
4. Los repositorios **NO contienen lógica de negocio**
