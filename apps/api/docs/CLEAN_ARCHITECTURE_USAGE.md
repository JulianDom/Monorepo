# 🏗️ Guía de Uso - Clean Architecture

Esta guía muestra cómo usar la arquitectura base implementada para crear nuevas features.

## 📁 Estructura de Archivos Creados

```
src/
├── @shared/
│   ├── types/
│   │   ├── pagination.types.ts      # Tipos de paginación
│   │   ├── response.types.ts        # Tipos de respuesta API
│   │   ├── entity.types.ts          # Tipos base de entidades
│   │   └── index.ts
│   ├── constants/
│   │   ├── error-codes.constant.ts  # Códigos de error
│   │   └── index.ts
│   └── exceptions/
│       ├── domain.exception.ts      # Excepciones personalizadas
│       └── index.ts
│
├── @core/
│   └── application/
│       ├── ports/
│       │   └── repositories/
│       │       ├── base.repository.interface.ts  # IBaseRepository<T>
│       │       └── index.ts
│       └── services/
│           ├── base.service.ts      # BaseService<T>
│           └── index.ts
│
├── @infra/
│   └── database/
│       └── repositories/
│           ├── base.repository.ts   # PrismaRepository<T>
│           └── index.ts
│
└── @presentation/
    └── filters/
        ├── global-exception.filter.ts  # GlobalExceptionFilter
        └── index.ts
```

---

## 🚀 Ejemplo: Crear un Módulo de Usuarios

### 1. Crear la Interfaz del Repositorio

```typescript
// src/@core/application/ports/repositories/user.repository.interface.ts
import { IBaseRepository } from './base.repository.interface';
import { User } from '@prisma/client';

export interface IUserRepository extends IBaseRepository<User> {
  findByEmail(email: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  updateOnlineStatus(id: string, online: boolean): Promise<User>;
}
```

### 2. Implementar el Repositorio

```typescript
// src/@infra/database/repositories/user.repository.ts
import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaRepository } from './base.repository';
import { PrismaService } from '../prisma/prisma.service';
import { IUserRepository } from '@core/application/ports';

@Injectable()
export class UserRepository
  extends PrismaRepository<User>
  implements IUserRepository
{
  constructor(prisma: PrismaService) {
    super(prisma, 'user'); // Nombre del modelo en Prisma
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({ emailAddress: email } as Partial<User>);
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.findOne({ username } as Partial<User>);
  }

  async updateOnlineStatus(id: string, online: boolean): Promise<User> {
    return this.update(id, { online } as Partial<User>);
  }
}
```

### 3. Crear el Servicio

```typescript
// src/@core/application/services/user.service.ts
import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { BaseService } from './base.service';
import { IUserRepository } from '../ports';
import {
  EntityDuplicatedException,
  BusinessValidationException,
} from '@shared/exceptions';
import * as bcrypt from 'bcrypt';

export interface CreateUserDto {
  fullName: string;
  emailAddress: string;
  username: string;
  password: string;
}

export interface UpdateUserDto {
  fullName?: string;
  language?: string;
  picture?: string;
}

@Injectable()
export class UserService extends BaseService<User, CreateUserDto, UpdateUserDto> {
  protected readonly entityName = 'User';

  constructor(private readonly userRepository: IUserRepository) {
    super(userRepository);
  }

  /**
   * Hook: Antes de crear usuario
   */
  protected async beforeCreate(data: CreateUserDto): Promise<CreateUserDto> {
    // Verificar email único
    const existingEmail = await this.userRepository.findByEmail(data.emailAddress);
    if (existingEmail) {
      throw new EntityDuplicatedException('User', 'email', data.emailAddress);
    }

    // Verificar username único
    const existingUsername = await this.userRepository.findByUsername(data.username);
    if (existingUsername) {
      throw new EntityDuplicatedException('User', 'username', data.username);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    return {
      ...data,
      password: hashedPassword,
    };
  }

  /**
   * Buscar por email
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  /**
   * Buscar por username
   */
  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findByUsername(username);
  }

  /**
   * Actualizar estado online
   */
  async setOnlineStatus(id: string, online: boolean): Promise<User> {
    return this.userRepository.updateOnlineStatus(id, online);
  }

  /**
   * Verificar credenciales
   */
  async validateCredentials(
    emailOrUsername: string,
    password: string,
  ): Promise<User | null> {
    const user =
      (await this.findByEmail(emailOrUsername)) ||
      (await this.findByUsername(emailOrUsername));

    if (!user) return null;

    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  }
}
```

### 4. Crear DTOs de Presentación

```typescript
// src/@presentation/dto/user/create-user.dto.ts
import { ApiProperty } from '@nestjs/gger';
import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class CreateUserRequestDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  fullName: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  emailAddress: string;

  @ApiProperty({ example: 'johndoe' })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  username: string;

  @ApiProperty({ example: 'SecurePassword123!' })
  @IsString()
  @MinLength(8)
  password: string;
}
```

```typescript
// src/@presentation/dto/user/user-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { User } from '@prisma/client';

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  fullName: string;

  @ApiProperty()
  emailAddress: string;

  @ApiProperty()
  username: string;

  @ApiProperty()
  online: boolean;

  @ApiProperty()
  language: string;

  @ApiProperty({ nullable: true })
  picture: string | null;

  @ApiProperty()
  createdAt: Date;

  static fromEntity(user: User): UserResponseDto {
    return {
      id: user.id,
      fullName: user.fullName,
      emailAddress: user.emailAddress,
      username: user.username,
      online: user.online,
      language: user.language,
      picture: user.picture,
      createdAt: user.createdAt,
    };
  }
}
```

### 5. Crear el Controller

```typescript
// src/@presentation/controllers/user/user.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UserService } from '@core/application/services/user.service';
import { CreateUserRequestDto, UserResponseDto } from '@presentation/dto/user';
import { PaginationParams, PaginatedResult } from '@shared/types';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, type: UserResponseDto })
  async create(@Body() dto: CreateUserRequestDto): Promise<UserResponseDto> {
    const user = await this.userService.create(dto);
    return UserResponseDto.fromEntity(user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users with pagination' })
  async findAll(
    @Query() params: PaginationParams,
  ): Promise<PaginatedResult<UserResponseDto>> {
    const result = await this.userService.findPaginated(params);
    return {
      data: result.data.map(UserResponseDto.fromEntity),
      meta: result.meta,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<UserResponseDto> {
    const user = await this.userService.findById(id);
    return UserResponseDto.fromEntity(user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete user' })
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.userService.delete(id);
  }
}
```

### 6. Crear el Módulo

```typescript
// src/modules/user/user.module.ts
import { Module } from '@nestjs/common';
import { UserController } from '@presentation/controllers/user/user.controller';
import { UserService } from '@core/application/services/user.service';
import { UserRepository } from '@infra/database/repositories/user.repository';
import { PrismaModule } from '@infra/database/prisma';

@Module({
  imports: [PrismaModule],
  controllers: [UserController],
  providers: [
    UserService,
    UserRepository,
    {
      provide: 'IUserRepository',
      useClass: UserRepository,
    },
  ],
  exports: [UserService],
})
export class UserModule {}
```

---

## 📊 Características Implementadas

### IBaseRepository<T>

Interface genérica con métodos:
- `findById(id, options?)` - Buscar por ID
- `findAll(options?)` - Buscar todos
- `findPaginated(params, options?)` - Buscar con paginación
- `findOne(where, options?)` - Buscar uno por condición
- `findMany(where, options?)` - Buscar muchos por condición
- `create(data)` - Crear
- `createMany(data[])` - Crear múltiples
- `update(id, data)` - Actualizar
- `updateMany(where, data)` - Actualizar múltiples
- `delete(id)` - Soft delete
- `hardDelete(id)` - Eliminar permanentemente
- `restore(id)` - Restaurar eliminado
- `count(where?, options?)` - Contar
- `exists(where, options?)` - Verificar existencia

### PrismaRepository<T>

Implementación base con:
- ✅ Filtro automático de `deletedAt != null`
- ✅ Paginación dinámica con límites
- ✅ Ordenamiento configurable
- ✅ Manejo de errores con excepciones personalizadas

### BaseService<T>

Servicio genérico con:
- ✅ CRUD completo
- ✅ Hooks: `beforeCreate`, `afterCreate`, `beforeUpdate`, `afterUpdate`, `beforeDelete`, `afterDelete`
- ✅ Métodos de búsqueda con excepciones automáticas

### GlobalExceptionFilter

Maneja:
- ✅ Errores de Prisma (P2002, P2025, P2003, P2011)
- ✅ Excepciones de dominio
- ✅ Excepciones HTTP de NestJS
- ✅ Errores de validación (class-validator)
- ✅ Errores no controlados
- ✅ Logging con sanitización de datos sensibles

---

## 🔧 Respuestas de Error Estandarizadas

### Entidad no encontrada (404)

```json
{
  "success": false,
  "error": {
    "code": "ENTITY_NOT_FOUND",
    "message": "User with id '123' not found",
    "details": { "entityName": "User", "id": "123" }
  },
  "timestamp": "2026-01-12T10:00:00.000Z",
  "path": "/users/123"
}
```

### Entidad duplicada (409)

```json
{
  "success": false,
  "error": {
    "code": "ENTITY_DUPLICATED",
    "message": "A record with this email already exists",
    "details": { "fields": ["email"] }
  },
  "timestamp": "2026-01-12T10:00:00.000Z",
  "path": "/users"
}
```

### Error de validación (400)

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "errors": [
        "email must be an email",
        "password must be at least 8 characters"
      ]
    }
  },
  "timestamp": "2026-01-12T10:00:00.000Z",
  "path": "/users"
}
```

---

## 📝 Paginación

### Request

```
GET /users?page=1&limit=10&sortBy=createdAt&sortOrder=desc
```

### Response

```json
{
  "data": [...],
  "meta": {
    "currentPage": 1,
    "itemsPerPage": 10,
    "totalItems": 100,
    "totalPages": 10,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

---

## ⚙️ Configuración de Path Aliases

Los imports usan path aliases configurados en `tsconfig.json`:

```typescript
import { IBaseRepository } from '@core/application/ports';
import { PrismaRepository } from '@infra/database/repositories';
import { GlobalExceptionFilter } from '@presentation/filters';
import { PaginatedResult } from '@shared/types';
import { EntityNotFoundException } from '@shared/exceptions';
import { ERROR_CODES } from '@shared/constants';
```

---

## 🎯 Flujo de una Request

```
1. Request HTTP
   ↓
2. GlobalExceptionFilter (captura errores)
   ↓
3. ValidationPipe (valida DTOs)
   ↓
4. Controller (recibe request)
   ↓
5. Service (lógica de negocio + hooks)
   ↓
6. Repository (acceso a datos + soft delete filter)
   ↓
7. PrismaService (ejecuta query)
   ↓
8. Response estandarizada
```

---

## 📚 Archivos de Referencia

- [base.repository.interface.ts](../src/@core/application/ports/repositories/base.repository.interface.ts)
- [base.repository.ts](../src/@infra/database/repositories/base.repository.ts)
- [base.service.ts](../src/@core/application/services/base.service.ts)
- [global-exception.filter.ts](../src/@presentation/filters/global-exception.filter.ts)
- [domain.exception.ts](../src/@shared/exceptions/domain.exception.ts)
- [pagination.types.ts](../src/@shared/types/pagination.types.ts)

---

**🎉 ¡Arquitectura base lista para usar!**
