import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import { Product, Prisma } from '@prisma/client';
import {
  CreateProductDto,
  UpdateProductDto,
  ProductQueryDto,
  ImportProductDto,
} from './dto';
import {
  buildPaginatedResponse,
  PaginatedResponse,
} from '@common/dto';
import {
  parseSort,
  buildSearchCondition,
  calculateSkip,
} from '@common/utils';

// Campos permitidos para ordenamiento
const SORTABLE_FIELDS = ['name', 'brand', 'price', 'createdAt', 'updatedAt'] as const;

// Campos donde buscar con search
const SEARCHABLE_FIELDS = ['name', 'description', 'brand', 'presentation'];

/**
 * ProductsService
 *
 * Servicio que maneja toda la logica de negocio de productos.
 * Reemplaza los 6 use cases anteriores:
 * - CreateProductUseCase
 * - UpdateProductUseCase
 * - GetProductUseCase
 * - ListProductsUseCase
 * - ToggleProductStatusUseCase
 * - ImportProductsFromExcelUseCase
 */
@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lista productos con paginacion y filtros
   */
  async findAll(query: ProductQueryDto): Promise<PaginatedResponse<Product>> {
    const {
      page = 1,
      limit = 10,
      sort,
      search,
      activeOnly,
      brand,
      minPrice,
      maxPrice,
    } = query;

    const skip = calculateSkip(page, limit);
    const orderBy = parseSort(sort, [...SORTABLE_FIELDS]);

    // Construir condiciones de busqueda
    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
      ...(activeOnly && { active: true }),
      ...(brand && { brand: { contains: brand, mode: 'insensitive' } }),
      ...(minPrice !== undefined && { price: { gte: minPrice } }),
      ...(maxPrice !== undefined && { price: { lte: maxPrice } }),
      ...buildSearchCondition(search, SEARCHABLE_FIELDS),
    };

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      this.prisma.product.count({ where }),
    ]);

    return buildPaginatedResponse(data, total, page, limit);
  }

  /**
   * Obtiene un producto por ID
   */
  async findById(id: string): Promise<Product> {
    const product = await this.prisma.product.findFirst({
      where: { id, deletedAt: null },
    });

    if (!product) {
      throw new NotFoundException(`Product with id '${id}' not found`);
    }

    return product;
  }

  /**
   * Crea un nuevo producto
   */
  async create(dto: CreateProductDto): Promise<Product> {
    // Verificar duplicado por nombre + presentacion
    const exists = await this.existsDuplicate(dto.name, dto.presentation);
    if (exists) {
      throw new ConflictException(
        `Product "${dto.name}" with presentation "${dto.presentation}" already exists`,
      );
    }

    return this.prisma.product.create({
      data: {
        name: dto.name,
        description: dto.description,
        brand: dto.brand,
        presentation: dto.presentation,
        price: dto.price,
        active: true,
      },
    });
  }

  /**
   * Actualiza un producto existente
   */
  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    const product = await this.findById(id);

    // Si cambia nombre o presentacion, verificar duplicado
    if (dto.name || dto.presentation) {
      const newName = dto.name ?? product.name;
      const newPresentation = dto.presentation ?? product.presentation;

      const exists = await this.existsDuplicate(newName, newPresentation, id);
      if (exists) {
        throw new ConflictException(
          `Product "${newName}" with presentation "${newPresentation}" already exists`,
        );
      }
    }

    return this.prisma.product.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.brand !== undefined && { brand: dto.brand }),
        ...(dto.presentation !== undefined && { presentation: dto.presentation }),
        ...(dto.price !== undefined && { price: dto.price }),
      },
    });
  }

  /**
   * Activa o desactiva un producto
   */
  async toggleStatus(id: string, activate: boolean): Promise<Product> {
    await this.findById(id); // Verifica existencia

    return this.prisma.product.update({
      where: { id },
      data: { active: activate },
    });
  }

  /**
   * Elimina un producto (soft delete)
   */
  async softDelete(id: string): Promise<Product> {
    await this.findById(id);

    return this.prisma.product.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        active: false,
      },
    });
  }

  /**
   * Importa productos desde datos de Excel
   */
  async importFromExcel(
    products: ImportProductDto[],
  ): Promise<{ created: number; skipped: number; errors: string[] }> {
    let created = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const dto of products) {
      try {
        // Verificar duplicado
        const exists = await this.existsDuplicate(dto.name, dto.presentation);
        if (exists) {
          skipped++;
          continue;
        }

        await this.prisma.product.create({
          data: {
            name: dto.name,
            description: dto.description,
            brand: dto.brand,
            presentation: dto.presentation,
            price: dto.price,
            active: true,
          },
        });
        created++;
      } catch (error) {
        skipped++;
        errors.push(`Failed to import "${dto.name}": ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return { created, skipped, errors };
  }

  /**
   * Busca productos por marca
   */
  async findByBrand(brand: string): Promise<Product[]> {
    return this.prisma.product.findMany({
      where: {
        brand: { contains: brand, mode: 'insensitive' },
        deletedAt: null,
      },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Obtiene solo productos activos
   */
  async findActive(): Promise<Product[]> {
    return this.prisma.product.findMany({
      where: {
        active: true,
        deletedAt: null,
      },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Verifica si existe un duplicado por nombre + presentacion
   */
  private async existsDuplicate(
    name: string,
    presentation: string,
    excludeId?: string,
  ): Promise<boolean> {
    const where: Prisma.ProductWhereInput = {
      name: { equals: name, mode: 'insensitive' },
      presentation: { equals: presentation, mode: 'insensitive' },
      deletedAt: null,
    };

    if (excludeId) {
      where.id = { not: excludeId };
    }

    const count = await this.prisma.product.count({ where });
    return count > 0;
  }
}
