# Ports (Puertos / Interfaces)

Esta carpeta contiene las **interfaces** que definen contratos entre la capa de aplicación y la infraestructura.

## ¿Qué es un Puerto?

Un puerto es una **interface** que define un contrato. La capa de aplicación depende de estas interfaces, y la capa de infraestructura las implementa. Esto es el principio de **Inversión de Dependencias** (DIP).

## Tipos de Puertos

### 1. **Repository Ports** (Persistencia)
Interfaces para acceso a datos.

```typescript
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<User>;
  delete(id: string): Promise<void>;
}
```

### 2. **Service Ports** (Servicios externos)
Interfaces para servicios de terceros.

```typescript
export interface IPaymentService {
  processPayment(amount: number, token: string): Promise<PaymentResult>;
  refund(transactionId: string): Promise<void>;
}

export interface IEmailService {
  sendEmail(to: string, subject: string, body: string): Promise<void>;
}
```

### 3. **Event Ports** (Eventos)
Interfaces para publicar/suscribir eventos.

```typescript
export interface IEventPublisher {
  publish(event: DomainEvent): Promise<void>;
}
```

## Estructura recomendada

```
ports/
├── repositories/
│   ├── user.repository.interface.ts
│   └── order.repository.interface.ts
├── services/
│   ├── email.service.interface.ts
│   ├── payment.service.interface.ts
│   └── notification.service.interface.ts
└── events/
    └── event-publisher.interface.ts
```

## Ventajas

✅ **Testeable**: Fácil de mockear en tests unitarios
✅ **Desacoplado**: La lógica de negocio no depende de implementaciones concretas
✅ **Flexible**: Puedes cambiar implementaciones sin tocar la lógica de negocio
✅ **Principio DIP**: Dependency Inversion Principle

## Ejemplo completo

```typescript
// Puerto (Interface)
export interface IUserRepository {
  save(user: User): Promise<User>;
}

// Caso de uso (depende del puerto)
export class CreateUserUseCase {
  constructor(private readonly userRepo: IUserRepository) {}

  async execute(data: CreateUserDto): Promise<User> {
    const user = new User(/* ... */);
    return await this.userRepo.save(user); // Usa la interface
  }
}

// Implementación en infraestructura (implementa el puerto)
@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private prisma: PrismaService) {}

  async save(user: User): Promise<User> {
    return await this.prisma.user.create({ data: user });
  }
}
```

## Reglas

1. Los puertos son **interfaces puras** (TypeScript interfaces)
2. Los puertos están en `@core/application/ports`
3. Las implementaciones están en `@infra`
4. Los casos de uso **dependen de puertos**, no de implementaciones
