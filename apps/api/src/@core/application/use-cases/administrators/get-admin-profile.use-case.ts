import { IAdministratorRepository } from '@core/application/ports/repositories';
import { EntityNotFoundException } from '@shared/exceptions';

export interface GetAdminProfileOutput {
  id: string;
  fullName: string;
  email: string;
  username: string;
  enabled: boolean;
  modules: Record<string, { read: boolean; write: boolean; delete: boolean }> | null;
  createdAt: Date;
}

/**
 * GetAdminProfileUseCase
 *
 * Obtiene el perfil del administrador autenticado.
 */
export class GetAdminProfileUseCase {
  constructor(private readonly adminRepository: IAdministratorRepository) {}

  async execute(adminId: string): Promise<GetAdminProfileOutput> {
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
    };
  }
}
