# Controllers

Esta carpeta contiene los **controladores REST** de la aplicación.

## Responsabilidades

Los controladores:
- Reciben requests HTTP
- Validan DTOs de entrada (usando ValidationPipe)
- Ejecutan casos de uso
- Retornan respuestas HTTP

## Estructura recomendada

```
controllers/
├── user/
│   ├── user.controller.ts
│   └── user.controller.spec.ts
├── auth/
│   ├── auth.controller.ts
│   └── auth.controller.spec.ts
└── health/
    └── health.controller.ts
```

## Ejemplo

```typescript
@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly findUserUseCase: FindUserUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, type: UserResponseDto })
  async create(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.createUserUseCase.execute(dto);
    return UserMapper.toResponse(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  async findOne(@Param('id') id: string): Promise<UserResponseDto> {
    const user = await this.findUserUseCase.execute(id);
    return UserMapper.toResponse(user);
  }
}
```

## Reglas

1. Los controladores **NO contienen lógica de negocio**
2. Los controladores **ejecutan casos de uso**
3. Los controladores usan **Guards** para autenticación/autorización
4. Los controladores usan **DTOs** con class-validator para validación
5. Los controladores están **documentados con Swagger** (@ApiTags, @ApiOperation, etc.)
