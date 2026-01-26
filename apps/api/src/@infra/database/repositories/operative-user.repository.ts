import { Injectable } from '@nestjs/common';
import { OperativeUser } from '@prisma/client';
import { PrismaService } from '@infra/database/prisma';
import { IOperativeUserRepository } from '@core/application/ports/repositories';
import { OperativeUserEntity } from '@core/domain/entities';
import { PrismaRepository } from './base.repository';

/**
 * OperativeUserRepository - Implementación Prisma
 *
 * Extiende PrismaRepository para heredar operaciones CRUD base.
 * Implementa métodos específicos para gestión de usuarios operativos.
 */
@Injectable()
export class OperativeUserRepository
  extends PrismaRepository<OperativeUser, OperativeUserEntity>
  implements IOperativeUserRepository {
  constructor(prisma: PrismaService) {
    super(prisma, 'operativeUser');
  }

  // ==================== Mappers ====================

  protected toEntity(model: OperativeUser): OperativeUserEntity {
    return OperativeUserEntity.reconstitute({
      id: model.id,
      fullName: model.fullName,
      emailAddress: model.emailAddress,
      username: model.username,
      password: model.password,
      enabled: model.enabled,
      refreshToken: model.refreshToken,
      recoverPasswordID: model.recoverPasswordID,
      createdById: model.createdById,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      deletedAt: model.deletedAt,
    });
  }

  protected toPersistence(entity: OperativeUserEntity): Record<string, unknown> {
    const data = entity.toObject();
    return {
      fullName: data.fullName,
      emailAddress: data.emailAddress,
      username: data.username,
      password: data.password,
      enabled: data.enabled ?? true,
      createdById: data.createdById,
    };
  }

  // ==================== Domain-Specific Methods ====================

  async findByEmail(email: string): Promise<OperativeUserEntity | null> {
    return this.findOne({ emailAddress: email });
  }

  async findByUsername(username: string): Promise<OperativeUserEntity | null> {
    return this.findOne({ username });
  }

 async findByToken(token: string): Promise<OperativeUserEntity | null> {
  const user = await this.prisma.operativeUser.findFirst({
    where: { refreshToken: token },
  });
  return user ? this.toEntity(user) : null;
}

async invalidateSession(token: string): Promise<void> {
  await this.prisma.operativeUser.updateMany({
    where: { refreshToken: token },
    data: { refreshToken: null },
  });
}

async invalidateAllSessions(userId: string): Promise<void> {
  await this.prisma.operativeUser.updateMany({
    where: { 
      id: userId,
    },
    data: { refreshToken: null },
  });
}

  // @ts-expect-error - Override with different signature to match IOperativeUserRepository
  override async findAll(
    page = 1,
    limit = 10,
    enabledOnly = false,
  ): Promise<{ data: OperativeUserEntity[]; total: number }> {
    const skip = (page - 1) * limit;
    const whereCondition: Record<string, unknown> = { deletedAt: null };

    if (enabledOnly) {
      whereCondition['enabled'] = true;
    }

    const [data, total] = await Promise.all([
      this.model.findMany({
        where: whereCondition,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.model.count({ where: whereCondition }),
    ]);

    return {
      data: data.map((d: OperativeUser) => this.toEntity(d)),
      total,
    };
  }

  async findEnabled(): Promise<OperativeUserEntity[]> {
    return this.findMany({ enabled: true });
  }

  async findByCreatedBy(adminId: string): Promise<OperativeUserEntity[]> {
    return this.findMany({ createdById: adminId });
  }

  async updateRefreshToken(id: string, token: string | null): Promise<void> {
    await this.model.update({
      where: { id },
      data: { refreshToken: token },
    });
  }

  async updateRecoverPasswordID(id: string, recoverId: string | null): Promise<void> {
    await this.model.update({
      where: { id },
      data: { recoverPasswordID: recoverId },
    });
  }

  async enable(id: string): Promise<OperativeUserEntity> {
    const updated = await this.model.update({
      where: { id },
      data: { enabled: true },
    });
    return this.toEntity(updated);
  }

  async disable(id: string): Promise<OperativeUserEntity> {
    const updated = await this.model.update({
      where: { id },
      data: {
        enabled: false,
        refreshToken: null,
      },
    });
    return this.toEntity(updated);
  }

  async findByRefreshToken(refreshToken: string): Promise<OperativeUserEntity | null> {
    const user = await this.model.findFirst({
      where: {
        refreshToken,
        deletedAt: null,
      },
    });

    return user ? this.toEntity(user) : null;
  }

  async existsByEmail(email: string): Promise<boolean> {
    return this.exists({ emailAddress: email });
  }

  async existsByUsername(username: string): Promise<boolean> {
    return this.exists({ username });
  }
}
