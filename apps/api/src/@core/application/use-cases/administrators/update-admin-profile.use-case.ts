import { IAdministratorRepository } from '@core/application/ports/repositories';
import { EntityNotFoundException } from '@shared/exceptions';

export interface UpdateAdminProfileInput {
  adminId: string;
  fullName?: string;
}

export interface UpdateAdminProfileOutput {
  id: string;
  fullName: string;
  email: string;
  username: string;
  enabled: boolean;
}

/**
 * UpdateAdminProfileUseCase
 *
 * Actualiza el perfil del administrador autenticado.
 */
export class UpdateAdminProfileUseCase {
  constructor(private readonly adminRepository: IAdministratorRepository) { }

  async execute(input: UpdateAdminProfileInput): Promise<UpdateAdminProfileOutput> {
    const admin = await this.adminRepository.findById(input.adminId);

    if (!admin) {
      throw new EntityNotFoundException('Administrator', input.adminId);
    }

    if (input.fullName) {
      admin.updateProfile({ fullName: input.fullName });
    }

    const updated = await this.adminRepository.update(admin.id!, {
      fullName: admin.fullName,
    });

    return {
      id: updated.id!,
      fullName: updated.fullName,
      email: updated.emailAddress,
      username: updated.username,
      enabled: updated.enabled,
    };
  }
}
