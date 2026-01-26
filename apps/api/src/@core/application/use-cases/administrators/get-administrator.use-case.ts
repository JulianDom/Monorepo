import { IAdministratorRepository } from '@core/application/ports/repositories';
import { EntityNotFoundException } from '@shared/exceptions';

export interface GetAdministratorOutput {
  id: string;
  fullName: string;
  email: string;
  username: string;
  enabled: boolean;
  modules: Record<string, { read: boolean; write: boolean; delete: boolean }> | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * GetAdministratorUseCase
 *
 * Obtiene los detalles de un administrador por ID.
 */
export class GetAdministratorUseCase {
  constructor(private readonly adminRepository: IAdministratorRepository) {}

  async execute(adminId: string): Promise<GetAdministratorOutput> {
    const admin = await this.adminRepository.findById(adminId);

    if (!admin) {
      throw new EntityNotFoundException('Administrator', adminId);
    }

    return {
      id: admin.id!,
      fullName: admin.fullName,
      email: admin.emailAddress,
      username: admin.username,
      enabled: admin.enabled,
      modules: admin.modules,
      createdAt: admin.createdAt!,
      updatedAt: admin.updatedAt!,
    };
  }
}
