import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import { Store, Prisma } from '@prisma/client';
import {
  CreateStoreDto,
  UpdateStoreDto,
  StoreQueryDto,
  ImportStoreDto,
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

const SORTABLE_FIELDS = ['name', 'locality', 'zone', 'createdAt', 'updatedAt'] as const;
const SEARCHABLE_FIELDS = ['name', 'locality', 'zone'];

@Injectable()
export class StoresService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: StoreQueryDto): Promise<PaginatedResponse<Store>> {
    const { page = 1, limit = 10, sort, search, activeOnly, locality, zone } = query;

    const skip = calculateSkip(page, limit);
    const orderBy = parseSort(sort, [...SORTABLE_FIELDS]);

    const where: Prisma.StoreWhereInput = {
      deletedAt: null,
      ...(activeOnly && { active: true }),
      ...(locality && { locality: { contains: locality, mode: 'insensitive' } }),
      ...(zone && { zone: { contains: zone, mode: 'insensitive' } }),
      ...buildSearchCondition(search, SEARCHABLE_FIELDS),
    };

    const [data, total] = await Promise.all([
      this.prisma.store.findMany({ where, skip, take: limit, orderBy }),
      this.prisma.store.count({ where }),
    ]);

    return buildPaginatedResponse(data, total, page, limit);
  }

  async findById(id: string): Promise<Store> {
    const store = await this.prisma.store.findFirst({
      where: { id, deletedAt: null },
    });

    if (!store) {
      throw new NotFoundException(`Store with id '${id}' not found`);
    }

    return store;
  }

  async create(dto: CreateStoreDto): Promise<Store> {
    const exists = await this.existsDuplicate(dto.name, dto.locality);
    if (exists) {
      throw new ConflictException(
        `Store "${dto.name}" in locality "${dto.locality}" already exists`,
      );
    }

    return this.prisma.store.create({
      data: {
        name: dto.name,
        locality: dto.locality,
        zone: dto.zone,
        active: true,
      },
    });
  }

  async update(id: string, dto: UpdateStoreDto): Promise<Store> {
    const store = await this.findById(id);

    if (dto.name || dto.locality) {
      const newName = dto.name ?? store.name;
      const newLocality = dto.locality ?? store.locality;

      const exists = await this.existsDuplicate(newName, newLocality, id);
      if (exists) {
        throw new ConflictException(
          `Store "${newName}" in locality "${newLocality}" already exists`,
        );
      }
    }

    return this.prisma.store.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.locality !== undefined && { locality: dto.locality }),
        ...(dto.zone !== undefined && { zone: dto.zone }),
      },
    });
  }

  async toggleStatus(id: string, activate: boolean): Promise<Store> {
    await this.findById(id);
    return this.prisma.store.update({
      where: { id },
      data: { active: activate },
    });
  }

  async softDelete(id: string): Promise<Store> {
    await this.findById(id);
    return this.prisma.store.update({
      where: { id },
      data: { deletedAt: new Date(), active: false },
    });
  }

  async importFromExcel(
    stores: ImportStoreDto[],
  ): Promise<{ created: number; skipped: number; errors: string[] }> {
    let created = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const dto of stores) {
      try {
        const exists = await this.existsDuplicate(dto.name, dto.locality);
        if (exists) {
          skipped++;
          continue;
        }

        await this.prisma.store.create({
          data: {
            name: dto.name,
            locality: dto.locality,
            zone: dto.zone,
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

  private async existsDuplicate(
    name: string,
    locality: string,
    excludeId?: string,
  ): Promise<boolean> {
    const where: Prisma.StoreWhereInput = {
      name: { equals: name, mode: 'insensitive' },
      locality: { equals: locality, mode: 'insensitive' },
      deletedAt: null,
    };

    if (excludeId) {
      where.id = { not: excludeId };
    }

    const count = await this.prisma.store.count({ where });
    return count > 0;
  }
}
