import { Injectable } from '@nestjs/common';
import { Administrator } from '@prisma/client';
import { PrismaService } from '@infra/database/prisma';
import { IAdministratorRepository } from '@core/application/ports/repositories';
import { AdministratorEntity, AdminModules } from '@core/domain/entities';
import { PrismaRepository } from './base.repository';
import { RefreshTokenService } from '@infra/security/authentication';

/**
 * AdministratorRepository - Implementación Prisma
 *
 * Extiende PrismaRepository para heredar operaciones CRUD base.
 * Solo implementa métodos específicos del dominio de administradores.
 */
@Injectable()
export class AdministratorRepository
  extends PrismaRepository<Administrator, AdministratorEntity>
  implements IAdministratorRepository {
  constructor(
    prisma: PrismaService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {
    super(prisma, 'administrator');
  }

  // ==================== Mappers ====================

  protected toEntity(model: Administrator): AdministratorEntity {
    return AdministratorEntity.reconstitute({
      id: model.id,
      fullName: model.fullName,
      emailAddress: model.emailAddress,
      username: model.username,
      password: model.password,
      enabled: model.enabled,
      refreshToken: model.refreshToken,
      recoverPasswordID: model.recoverPasswordID,
      modules: model.modules as AdminModules | null,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      deletedAt: model.deletedAt,
    });
  }

  protected toPersistence(entity: AdministratorEntity): Record<string, unknown> {
    const data = entity.toObject();
    return {
      fullName: data.fullName,
      emailAddress: data.emailAddress,
      username: data.username,
      password: data.password,
      enabled: data.enabled ?? true,
      modules: data.modules,
    };
  }

  // ==================== Domain-Specific Methods ====================

  async findByEmail(email: string): Promise<AdministratorEntity | null> {
    return this.findOne({ emailAddress: email });
  }

  async findByUsername(username: string): Promise<AdministratorEntity | null> {
    return this.findOne({ username });
  }



  // @ts-expect-error - Override with different signature to match IAdministratorRepository
  override async findAll(
    page = 1,
    limit = 10,
    enabledOnly = false,
  ): Promise<{ data: AdministratorEntity[]; total: number }> {
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
      data: data.map((d: Administrator) => this.toEntity(d)),
      total,
    };
  }

  async findEnabled(): Promise<AdministratorEntity[]> {
    return this.findMany({ enabled: true });
  }

  async delete(id: string): Promise<void> {
    await this.model.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        enabled: false,
        refreshToken: null,
      },
    });
  }

  async updateRefreshToken(id: string, token: string | null): Promise<void> {
    await this.model.update({
      where: { id },
      data: { refreshToken: token },
    });
  }

  async findByRefreshToken(refreshToken: string): Promise<AdministratorEntity | null> {
    console.log('=== findByRefreshToken DEBUG ===');
    console.log('Token recibido:', refreshToken.substring(0, 20) + '...');

    // Buscar todos los administradores con refresh token no nulo
    const admins = await this.model.findMany({
      where: {
        refreshToken: { not: null },
        deletedAt: null,
      },
    });

    console.log('Administradores con refresh token:', admins.length);

    // Verificar cada refresh token hasheado
    for (const admin of admins) {
      if (admin.refreshToken && await this.refreshTokenService.verifyToken(refreshToken, admin.refreshToken)) {
        console.log('Refresh token válido encontrado para admin:', admin.id);
        return this.toEntity(admin);
      }
    }

    console.log('Refresh token no válido');
    return null;
  }

  async updateRecoverPasswordID(id: string, recoverId: string | null): Promise<void> {
    await this.model.update({
      where: { id },
      data: { recoverPasswordID: recoverId },
    });
  }

  async createWithRefreshToken(
    entity: AdministratorEntity,
    hashedToken: string,
  ): Promise<AdministratorEntity> {
    const data = this.toPersistence(entity);

    const created = await this.prisma.$transaction(async (tx) => {
      return tx.administrator.create({
        data: {
          ...data,
          refreshToken: hashedToken,
        } as any,
      });
    });

    return this.toEntity(created);
  }

  async disable(id: string): Promise<AdministratorEntity> {
    const updated = await this.model.update({
      where: { id },
      data: {
        enabled: false,
        refreshToken: null, // Invalida el token de refresco
        updatedAt: new Date(),
      },
    });
    return this.toEntity(updated);
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.model.count({
      where: {
        emailAddress: email,
        deletedAt: null, // No contar eliminados
      },
    });
    return count > 0;
  }

  async enable(id: string): Promise<AdministratorEntity> {
    const updated = await this.model.update({
      where: { id },
      data: {
        enabled: true,
        updatedAt: new Date(),
      },
    });
    return this.toEntity(updated);
  }

  async existsByUsername(username: string): Promise<boolean> {
    return this.exists({ username });
  }
}
