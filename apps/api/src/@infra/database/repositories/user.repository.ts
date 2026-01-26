import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '@infra/database/prisma';
import { IUserRepository, BiometricData } from '@core/application/ports/repositories';
import { UserEntity } from '@core/domain/entities';
import { PrismaRepository } from './base.repository';

/**
 * UserRepository - Implementación Prisma
 *
 * Extiende PrismaRepository para heredar operaciones CRUD base.
 * Solo implementa métodos específicos del dominio de usuarios.
 */
@Injectable()
export class UserRepository
  extends PrismaRepository<User, UserEntity>
  implements IUserRepository
{
  constructor(prisma: PrismaService) {
    super(prisma, 'user');
  }

  // ==================== Mappers ====================

  protected toEntity(model: User): UserEntity {
    return UserEntity.reconstitute({
      id: model.id,
      fullName: model.fullName,
      emailAddress: model.emailAddress,
      username: model.username,
      password: model.password,
      online: model.online,
      language: model.language,
      picture: model.picture,
      location: model.location as { lat: number; lng: number } | null,
      biometricChallenge: model.biometricChallenge,
      registrationInfo: model.registrationInfo as Record<string, any> | null,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      deletedAt: model.deletedAt,
    });
  }

  protected toPersistence(entity: UserEntity): Record<string, unknown> {
    const data = entity.toObject();
    return {
      fullName: data.fullName,
      emailAddress: data.emailAddress,
      username: data.username,
      password: data.password,
      online: data.online ?? false,
      language: data.language ?? 'es',
      picture: data.picture,
      location: data.location,
      biometricChallenge: data.biometricChallenge,
      registrationInfo: data.registrationInfo,
    };
  }

  // ==================== Domain-Specific Methods ====================

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.findOne({ emailAddress: email });
  }

  async findByUsername(username: string): Promise<UserEntity | null> {
    return this.findOne({ username });
  }

  // @ts-expect-error - Override with different signature to match IUserRepository
  override async findAll(page = 1, limit = 10): Promise<{ data: UserEntity[]; total: number }> {
    const result = await super.findPaginated({ page, limit });
    return {
      data: result.data,
      total: result.meta.totalItems,
    };
  }

  async delete(id: string): Promise<void> {
    await this.softDelete(id);
  }

  async updateOnlineStatus(id: string, online: boolean): Promise<void> {
    await this.model.update({
      where: { id },
      data: { online },
    });
  }

  async updateBiometricChallenge(id: string, challenge: string | null): Promise<void> {
    await this.model.update({
      where: { id },
      data: { biometricChallenge: challenge },
    });
  }

  async updateRegistrationInfo(id: string, info: Record<string, any>[] | null): Promise<void> {
    await this.model.update({
      where: { id },
      data: { registrationInfo: info },
    });
  }

  async getBiometricData(id: string): Promise<BiometricData | null> {
    const user = await this.model.findUnique({
      where: { id },
      select: { biometricChallenge: true, registrationInfo: true },
    });

    if (!user) return null;

    return {
      biometricChallenge: user.biometricChallenge,
      registrationInfo: user.registrationInfo as Record<string, any>[] | null,
    };
  }

  async updateBiometricData(
    id: string,
    data: { challenge?: string | null; registrationInfo?: Record<string, any>[] | null },
  ): Promise<void> {
    const updateData: Record<string, unknown> = {};
    if (data.challenge !== undefined) {
      updateData['biometricChallenge'] = data.challenge;
    }
    if (data.registrationInfo !== undefined) {
      updateData['registrationInfo'] = data.registrationInfo;
    }

    await this.model.update({
      where: { id },
      data: updateData,
    });
  }
}
