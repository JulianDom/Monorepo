# Use Cases (Casos de Uso)

Esta carpeta contiene los **casos de uso** de la aplicación.

## ¿Qué es un caso de uso?

Un caso de uso representa una **acción específica** que un usuario (o sistema) puede realizar en la aplicación. Orquesta la lógica de negocio utilizando entidades, value objects y repositorios.

## Características

- ✅ **Un caso de uso = Una acción**: Cada caso de uso hace una cosa específica
- ✅ **Independiente de frameworks**: No depende de NestJS directamente
- ✅ **Usa puertos (interfaces)**: Se comunica con infraestructura vía interfaces
- ✅ **Contiene lógica de aplicación**: Orquesta el flujo, no la lógica de negocio

## Estructura recomendada

```
use-cases/
├── user/
│   ├── create-user.use-case.ts
│   ├── update-user.use-case.ts
│   ├── delete-user.use-case.ts
│   └── find-user.use-case.ts
└── auth/
    ├── login.use-case.ts
    └── register.use-case.ts
```

## Ejemplo

```typescript
export class CreateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository, // Puerto/Interface
    private readonly passwordHasher: IPasswordHasher,
  ) {}

  async execute(data: CreateUserDto): Promise<User> {
    // 1. Validar que el email no exista
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    // 2. Hash de contraseña
    const hashedPassword = await this.passwordHasher.hash(data.password);

    // 3. Crear entidad de dominio
    const user = new User(
      uuidv4(),
      new Email(data.email),
      data.name,
      hashedPassword,
      UserStatus.ACTIVE,
    );

    // 4. Persistir
    return await this.userRepository.save(user);
  }
}
```

## Reglas

1. Un caso de uso hace **una sola cosa**
2. Los casos de uso **no dependen de implementaciones**, solo de interfaces (puertos)
3. Los casos de uso **orquestan**, no contienen lógica de negocio compleja (esa va en entidades)
4. Los casos de uso pueden **llamar a otros casos de uso** si es necesario
