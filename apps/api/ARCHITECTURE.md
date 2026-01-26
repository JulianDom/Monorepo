# Arquitectura API - Guía de Migración

Esta documentación describe la arquitectura optimizada de la API y cómo migrar módulos de la arquitectura "Clean Architecture pesada" a la nueva arquitectura "NestJS idiomática".

---

## Problema Original

La arquitectura anterior requería **10-12 archivos** para agregar un campo a un modelo:

```
1. Entity (domain)
2. Repository Interface (port)
3. Repository Implementation (infra)
4. Create Use Case
5. Update Use Case
6. Get Use Case
7. List Use Case
8. Create DTO
9. Update DTO
10. Response DTO
11. Controller
12. Module
```

**Problemas identificados:**
- 36 use cases separados para operaciones CRUD básicas
- 6 entidades de dominio duplicando tipos de Prisma
- 8 interfaces de repositorio sin múltiples implementaciones
- 5 DTOs de paginación duplicados
- Validación en 3 capas (DTO, Entity, DB)

---

## Nueva Arquitectura

La nueva arquitectura reduce a **3-4 archivos** por módulo:

```
src/modules/{module}/
├── {module}.module.ts      # Módulo NestJS
├── {module}.service.ts     # Servicio (reemplaza use cases)
├── {module}.controller.ts  # Controlador REST
├── dto/                    # DTOs del módulo
│   ├── create-{module}.dto.ts
│   ├── update-{module}.dto.ts
│   ├── {module}-query.dto.ts
│   └── index.ts
└── index.ts
```

---

## Estructura de Carpetas

```
src/
├── common/                 # Código compartido
│   ├── dto/
│   │   └── pagination.dto.ts    # UN SOLO archivo de paginación
│   ├── utils/
│   │   └── prisma.utils.ts      # Helpers para Prisma
│   ├── decorators/
│   │   ├── roles.decorator.ts
│   │   ├── current-user.decorator.ts
│   │   └── public.decorator.ts
│   ├── guards/
│   │   └── roles.guard.ts
│   ├── filters/
│   │   └── global-exception.filter.ts
│   ├── types/
│   │   └── auth.types.ts
│   └── exceptions/
│       └── domain.exception.ts
│
├── database/               # Prisma
│   ├── prisma.service.ts
│   ├── prisma.module.ts
│   └── index.ts
│
├── modules/                # Módulos de negocio (nueva arquitectura)
│   ├── products/
│   ├── stores/
│   ├── operative-users/
│   └── price-records/
│
└── @infra/                 # Infraestructura legacy (migrar gradualmente)
    ├── security/
    └── database/
```

---

## Patrones de Código

### 1. Servicio (reemplaza Use Cases)

```typescript
// modules/products/products.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import { Product, Prisma } from '@prisma/client';  // Usar tipos de Prisma directamente
import { CreateProductDto, UpdateProductDto, ProductQueryDto } from './dto';
import { buildPaginatedResponse, PaginatedResponse } from '@common/dto';
import { parseSort, buildSearchCondition, calculateSkip } from '@common/utils';

// Definir campos permitidos como constantes
const SORTABLE_FIELDS = ['name', 'brand', 'price', 'createdAt'] as const;
const SEARCHABLE_FIELDS = ['name', 'description', 'brand'];

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  // Listar con paginación y filtros
  async findAll(query: ProductQueryDto): Promise<PaginatedResponse<Product>> {
    const { page = 1, limit = 10, sort, search, activeOnly } = query;

    const skip = calculateSkip(page, limit);
    const orderBy = parseSort(sort, [...SORTABLE_FIELDS]);

    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
      ...(activeOnly && { active: true }),
      ...buildSearchCondition(search, SEARCHABLE_FIELDS),
    };

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({ where, skip, take: limit, orderBy }),
      this.prisma.product.count({ where }),
    ]);

    return buildPaginatedResponse(data, total, page, limit);
  }

  // Obtener por ID
  async findById(id: string): Promise<Product> {
    const product = await this.prisma.product.findFirst({
      where: { id, deletedAt: null },
    });
    if (!product) {
      throw new NotFoundException(`Product with id '${id}' not found`);
    }
    return product;
  }

  // Crear
  async create(dto: CreateProductDto): Promise<Product> {
    const exists = await this.existsDuplicate(dto.name, dto.presentation);
    if (exists) {
      throw new ConflictException(`Product already exists`);
    }
    return this.prisma.product.create({
      data: { ...dto, active: true },
    });
  }

  // Actualizar
  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    await this.findById(id); // Verificar existencia
    return this.prisma.product.update({
      where: { id },
      data: dto,
    });
  }

  // Soft delete
  async softDelete(id: string): Promise<Product> {
    await this.findById(id);
    return this.prisma.product.update({
      where: { id },
      data: { deletedAt: new Date(), active: false },
    });
  }

  // Helper privado
  private async existsDuplicate(name: string, presentation: string, excludeId?: string): Promise<boolean> {
    const where: Prisma.ProductWhereInput = {
      name: { equals: name, mode: 'insensitive' },
      presentation: { equals: presentation, mode: 'insensitive' },
      deletedAt: null,
      ...(excludeId && { id: { not: excludeId } }),
    };
    return (await this.prisma.product.count({ where })) > 0;
  }
}
```

### 2. Controlador

```typescript
// modules/products/products.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseUUIDPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Product } from '@prisma/client';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto, ProductQueryDto } from './dto';
import { PaginatedResponse } from '@common/dto';
import { Roles } from '@common/decorators';
import { RolesGuard } from '@common/guards';
import { ActorType } from '@common/types';
import { JwtAuthGuard } from '@infra/security/authentication';

@ApiTags('products')
@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ActorType.ADMIN)
@ApiBearerAuth('JWT-auth')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'List products' })
  async findAll(@Query() query: ProductQueryDto): Promise<PaginatedResponse<Product>> {
    return this.productsService.findAll(query);
  }

  @Get(':id')
  async findById(@Param('id', ParseUUIDPipe) id: string): Promise<Product> {
    return this.productsService.findById(id);
  }

  @Post()
  async create(@Body() dto: CreateProductDto): Promise<Product> {
    return this.productsService.create(dto);
  }

  @Put(':id')
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateProductDto): Promise<Product> {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.productsService.softDelete(id);
  }
}
```

### 3. Módulo

```typescript
// modules/products/products.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { RolesGuard } from '@common/guards';
import { AuthModule } from '@infra/security/authentication';
import { getJwtModuleConfig } from '@shared/config';

@Module({
  imports: [
    AuthModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getJwtModuleConfig,
    }),
  ],
  controllers: [ProductsController],
  providers: [ProductsService, RolesGuard],
  exports: [ProductsService],
})
export class ProductsModule {}
```

### 4. DTOs

```typescript
// modules/products/dto/create-product.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, MinLength, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @ApiProperty({ example: 'Coca Cola' })
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiProperty({ example: '500ml' })
  @IsString()
  presentation!: string;

  @ApiProperty({ example: 1500.50 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price!: number;
}

// modules/products/dto/update-product.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {}

// modules/products/dto/product-query.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { BasePaginationWithStatusDto } from '@common/dto';

export class ProductQueryDto extends BasePaginationWithStatusDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;
}
```

---

## Componentes Comunes (common/)

### Paginación Unificada

```typescript
// common/dto/pagination.dto.ts - UN SOLO archivo para toda la API

export class BasePaginationDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  page?: number = 1;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100)
  limit?: number = 10;

  @IsOptional() @IsString() @Matches(/^-?[a-zA-Z_]+$/)
  sort?: string;

  @IsOptional() @IsString()
  search?: string;
}

export class BasePaginationWithStatusDto extends BasePaginationDto {
  @IsOptional() @Transform(({ value }) => value === 'true' || value === true) @IsBoolean()
  activeOnly?: boolean;
}

export function buildPaginatedResponse<T>(data: T[], total: number, page: number, limit: number) {
  const totalPages = Math.ceil(total / limit);
  return {
    data,
    meta: { page, limit, total, totalPages, hasNextPage: page < totalPages, hasPreviousPage: page > 1 },
  };
}
```

### Utilidades de Prisma

```typescript
// common/utils/prisma.utils.ts

// Parsear sort string a Prisma orderBy
export function parseSort<T extends string>(
  sort: string | undefined,
  allowedFields: T[],
  defaultSort = { createdAt: 'desc' as const },
) {
  if (!sort) return defaultSort;
  const desc = sort.startsWith('-');
  const field = desc ? sort.slice(1) : sort;
  if (!allowedFields.includes(field as T)) return defaultSort;
  return { [field]: desc ? 'desc' : 'asc' };
}

// Construir condición de búsqueda
export function buildSearchCondition(search: string | undefined, fields: string[]) {
  if (!search?.trim()) return undefined;
  return {
    OR: fields.map(field => ({ [field]: { contains: search.trim(), mode: 'insensitive' as const } })),
  };
}

// Calcular skip para paginación
export function calculateSkip(page: number, limit: number): number {
  return (Math.max(page, 1) - 1) * limit;
}
```

---

## Guía de Migración

### Paso 1: Crear estructura de carpetas

```bash
mkdir -p src/common/{dto,utils,decorators,guards,filters,types,exceptions}
mkdir -p src/database
mkdir -p src/modules
```

### Paso 2: Crear componentes comunes

1. Copiar `common/dto/pagination.dto.ts`
2. Copiar `common/utils/prisma.utils.ts`
3. Copiar decorators, guards, filters según necesidad

### Paso 3: Migrar PrismaService

```typescript
// database/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Database connected');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Database disconnected');
  }
}

// database/prisma.module.ts
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

### Paso 4: Migrar módulo por módulo

Para cada módulo (ej: Products):

1. **Crear carpeta:** `src/modules/products/`

2. **Crear Service** consolidando todos los use cases:
   - `CreateProductUseCase` → `create()`
   - `UpdateProductUseCase` → `update()`
   - `GetProductUseCase` → `findById()`
   - `ListProductsUseCase` → `findAll()`
   - `DeleteProductUseCase` → `softDelete()`

3. **Crear Controller** simplificado

4. **Crear DTOs** (reusar `BasePaginationDto`)

5. **Crear Module**

6. **Actualizar app.module.ts:**
   ```typescript
   import { ProductsModule } from '@modules/products';

   @Module({
     imports: [
       PrismaModule,
       ProductsModule,  // Nuevo módulo
       // ... otros módulos
     ],
   })
   export class AppModule {}
   ```

### Paso 5: Eliminar código viejo

Una vez verificado que funciona:

```bash
# Eliminar use cases
rm -rf src/@core/application/use-cases/products/

# Eliminar controllers viejos
rm -rf src/@presentation/controllers/products/

# Eliminar repositorio e interface
rm src/@infra/database/repositories/product.repository.ts
rm src/@core/application/ports/repositories/product.repository.interface.ts

# Eliminar entidad
rm src/@core/domain/entities/product.entity.ts
```

### Paso 6: Actualizar index.ts

Remover exports de archivos eliminados en:
- `@core/application/use-cases/index.ts`
- `@infra/database/repositories/index.ts`
- `@core/application/ports/repositories/index.ts`
- `@core/domain/entities/index.ts`

---

## Configuración de TypeScript

```json
// tsconfig.json - paths
{
  "compilerOptions": {
    "paths": {
      "@modules/*": ["src/modules/*"],
      "@common/*": ["src/common/*"],
      "@database/*": ["src/database/*"],
      "@infra/*": ["src/@infra/*"],
      "@shared/*": ["src/@shared/*"]
    }
  }
}
```

---

## Checklist de Migración

- [ ] Crear `common/dto/pagination.dto.ts`
- [ ] Crear `common/utils/prisma.utils.ts`
- [ ] Crear `database/prisma.service.ts` y `prisma.module.ts`
- [ ] Actualizar `tsconfig.json` con nuevos paths
- [ ] Crear módulo en `modules/{nombre}/`
- [ ] Crear service consolidando use cases
- [ ] Crear controller simplificado
- [ ] Crear DTOs extendiendo `BasePaginationDto`
- [ ] Registrar módulo en `app.module.ts`
- [ ] Probar endpoints
- [ ] Eliminar código viejo
- [ ] Actualizar index.ts

---

## Beneficios

| Aspecto | Antes | Después |
|---------|-------|---------|
| Archivos por módulo | 10-12 | 3-4 |
| Agregar un campo | 6+ archivos | 1-2 archivos |
| Paginación DTOs | 5 duplicados | 1 compartido |
| Use Cases por CRUD | 5-7 | 0 (en service) |
| Entidades de dominio | Duplican Prisma | Usan Prisma directo |
| Curva de aprendizaje | Alta | Baja (NestJS estándar) |

---

## Módulos Pendientes de Migración

Los siguientes módulos aún usan la arquitectura vieja y pueden migrarse gradualmente:

- `Administrators` - Más complejo por permisos por módulo
- `Auth` - Incluye WebAuthn/biometría
- `Chat` - WebSockets con lógica específica

Estos módulos mantienen:
- `UserEntity`, `AdministratorEntity`, `OperativeUserEntity`
- Repositorios correspondientes
- Use cases de auth y chat
