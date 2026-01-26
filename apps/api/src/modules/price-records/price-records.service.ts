import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import { PriceRecord, Prisma } from '@prisma/client';
import {
  CreatePriceRecordDto,
  PriceRecordQueryDto,
} from './dto';
import {
  buildPaginatedResponse,
  PaginatedResponse,
} from '@common/dto';
import {
  parseSort,
  calculateSkip,
  buildDateRangeCondition,
} from '@common/utils';

const SORTABLE_FIELDS = ['price', 'recordedAt', 'createdAt'] as const;

// Tipo con relaciones incluidas
type PriceRecordWithRelations = PriceRecord & {
  product: { id: string; name: string; presentation: string };
  store: { id: string; name: string; locality: string };
  operativeUser: { id: string; fullName: string };
};

@Injectable()
export class PriceRecordsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: PriceRecordQueryDto): Promise<PaginatedResponse<PriceRecordWithRelations>> {
    const {
      page = 1,
      limit = 10,
      sort,
      productId,
      storeId,
      operativeUserId,
      dateFrom,
      dateTo,
    } = query;

    const skip = calculateSkip(page, limit);
    const orderBy = parseSort(sort, [...SORTABLE_FIELDS], { recordedAt: 'desc' });

    const where: Prisma.PriceRecordWhereInput = {
      deletedAt: null,
      ...(productId && { productId }),
      ...(storeId && { storeId }),
      ...(operativeUserId && { operativeUserId }),
      ...buildDateRangeCondition('recordedAt', dateFrom, dateTo),
    };

    const [data, total] = await Promise.all([
      this.prisma.priceRecord.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          product: { select: { id: true, name: true, presentation: true } },
          store: { select: { id: true, name: true, locality: true } },
          operativeUser: { select: { id: true, fullName: true } },
        },
      }),
      this.prisma.priceRecord.count({ where }),
    ]);

    return buildPaginatedResponse(data as PriceRecordWithRelations[], total, page, limit);
  }

  async findById(id: string): Promise<PriceRecordWithRelations> {
    const record = await this.prisma.priceRecord.findFirst({
      where: { id, deletedAt: null },
      include: {
        product: { select: { id: true, name: true, presentation: true } },
        store: { select: { id: true, name: true, locality: true } },
        operativeUser: { select: { id: true, fullName: true } },
      },
    });

    if (!record) {
      throw new NotFoundException(`Price record with id '${id}' not found`);
    }

    return record as PriceRecordWithRelations;
  }

  async create(dto: CreatePriceRecordDto): Promise<PriceRecordWithRelations> {
    // Validar que el producto existe y está activo
    const product = await this.prisma.product.findFirst({
      where: { id: dto.productId, deletedAt: null },
    });
    if (!product) {
      throw new NotFoundException(`Product with id '${dto.productId}' not found`);
    }
    if (!product.active) {
      throw new BadRequestException('Cannot create price record for inactive product');
    }

    // Validar que el store existe y está activo
    const store = await this.prisma.store.findFirst({
      where: { id: dto.storeId, deletedAt: null },
    });
    if (!store) {
      throw new NotFoundException(`Store with id '${dto.storeId}' not found`);
    }
    if (!store.active) {
      throw new BadRequestException('Cannot create price record for inactive store');
    }

    // Validar que el usuario operativo existe y está habilitado
    const operativeUser = await this.prisma.operativeUser.findFirst({
      where: { id: dto.operativeUserId, deletedAt: null },
    });
    if (!operativeUser) {
      throw new NotFoundException(`Operative user with id '${dto.operativeUserId}' not found`);
    }
    if (!operativeUser.enabled) {
      throw new BadRequestException('Cannot create price record for disabled operative user');
    }

    const record = await this.prisma.priceRecord.create({
      data: {
        productId: dto.productId,
        storeId: dto.storeId,
        operativeUserId: dto.operativeUserId,
        price: dto.price,
        recordedAt: dto.recordedAt ? new Date(dto.recordedAt) : new Date(),
        notes: dto.notes,
        photoUrl: dto.photoUrl,
      },
      include: {
        product: { select: { id: true, name: true, presentation: true } },
        store: { select: { id: true, name: true, locality: true } },
        operativeUser: { select: { id: true, fullName: true } },
      },
    });

    return record as PriceRecordWithRelations;
  }

  async softDelete(id: string): Promise<void> {
    await this.findById(id);

    await this.prisma.priceRecord.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Obtiene el precio promedio de un producto
   */
  async getAveragePriceByProduct(productId: string): Promise<number | null> {
    const result = await this.prisma.priceRecord.aggregate({
      where: { productId, deletedAt: null },
      _avg: { price: true },
    });

    return result._avg.price ? Number(result._avg.price) : null;
  }

  /**
   * Obtiene el precio más reciente de un producto en un store
   */
  async getLatestPrice(productId: string, storeId: string): Promise<PriceRecord | null> {
    return this.prisma.priceRecord.findFirst({
      where: { productId, storeId, deletedAt: null },
      orderBy: { recordedAt: 'desc' },
    });
  }
}
