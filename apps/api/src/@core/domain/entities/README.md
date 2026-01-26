# Domain Entities

Esta carpeta contiene las **entidades de dominio** del sistema.

## ¿Qué es una entidad de dominio?

Las entidades son objetos que tienen:
- **Identidad única**: Se distinguen por su ID, no por sus atributos
- **Comportamiento de negocio**: Métodos que encapsulan reglas del dominio
- **Ciclo de vida**: Pueden cambiar de estado a lo largo del tiempo

## Características

- ✅ **Framework-agnostic**: No dependen de NestJS, Prisma u otros frameworks
- ✅ **Inmutabilidad cuando sea posible**: Favorecen datos inmutables
- ✅ **Validación interna**: Las entidades se auto-validan
- ✅ **Lógica de negocio**: Contienen las reglas del dominio

## Ejemplo

```typescript
export class User {
  constructor(
    private readonly id: string,
    private email: Email, // Value Object
    private name: string,
    private status: UserStatus,
  ) {}

  activate(): void {
    if (this.status === UserStatus.BANNED) {
      throw new Error('Cannot activate a banned user');
    }
    this.status = UserStatus.ACTIVE;
  }

  // Getters...
  getId(): string {
    return this.id;
  }
}
```

## Reglas

1. Las entidades NO deben tener decoradores de frameworks (@Entity, @Column, etc.)
2. Las entidades NO deben importar librerías de infraestructura
3. Las entidades SÍ deben contener lógica de negocio
4. Las entidades SÍ deben validarse a sí mismas
