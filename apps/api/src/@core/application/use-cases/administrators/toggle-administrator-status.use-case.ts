import { IAdministratorRepository } from '@core/application/ports/repositories';
import { EntityNotFoundException, BusinessValidationException } from '@shared/exceptions';

export interface ToggleAdministratorStatusInput {
  adminId: string;
  enable: boolean;
  requestingAdminId: string; // Admin que hace la solicitud
}

export interface ToggleAdministratorStatusOutput {
  id: string;
  fullName: string;
  email: string;
  username: string;
  enabled: boolean;
}

/**
 * ToggleAdministratorStatusUseCase
 *
 * Habilita o deshabilita un administrador.
 * Un administrador no puede deshabilitarse a sí mismo.
 */
export class ToggleAdministratorStatusUseCase {
  constructor(private readonly adminRepository: IAdministratorRepository) { }

  async execute(input: ToggleAdministratorStatusInput): Promise<ToggleAdministratorStatusOutput> {
    const admin = await this.adminRepository.findById(input.adminId);

    if (!admin) {
      throw new EntityNotFoundException('Administrator', input.adminId);
    }

    // Prevenir auto-deshabilitación
    if (input.adminId === input.requestingAdminId && !input.enable) {
      throw new BusinessValidationException('You cannot disable your own account');
    }

    // Cambiar estado
    if (input.enable) {
      if (!admin.enabled) {
        admin.enable();
      }
    } else {
      if (admin.enabled) {
        admin.disable();
      }
    }

    const updated = await this.adminRepository.update(admin.id!, {
      enabled: admin.enabled,
      refreshToken: admin.refreshToken,
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
