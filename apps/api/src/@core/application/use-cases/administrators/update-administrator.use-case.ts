import { IAdministratorRepository } from '@core/application/ports/repositories';
import { AdminModules } from '@core/domain/entities';
import { EntityNotFoundException } from '@shared/exceptions';

export interface UpdateAdministratorInput {
  adminId: string;
  fullName?: string;
  modules?: AdminModules | null;
}

export interface UpdateAdministratorOutput {
  id: string;
  fullName: string;
  email: string;
  username: string;
  enabled: boolean;
  modules: AdminModules | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * UpdateAdministratorUseCase
 *
 * Actualiza los datos de un administrador.
 */
export class UpdateAdministratorUseCase {
  constructor(private readonly adminRepository: IAdministratorRepository) { }

  async execute(input: UpdateAdministratorInput): Promise<UpdateAdministratorOutput> {
    const admin = await this.adminRepository.findById(input.adminId);

    if (!admin) {
      throw new EntityNotFoundException('Administrator', input.adminId);
    }

    // Actualizar campos
    const updateData: Record<string, unknown> = {};

    if (input.fullName !== undefined) {
      admin.updateProfile({ fullName: input.fullName });
      updateData['fullName'] = input.fullName;
    }

    if (input.modules !== undefined) {
      if (input.modules) {
        admin.setModules(input.modules);
      }
      updateData['modules'] = input.modules;
    }

    const updated = await this.adminRepository.update(admin.id!, updateData);

    return {
      id: updated.id!,
      fullName: updated.fullName,
      email: updated.emailAddress,
      username: updated.username,
      enabled: updated.enabled,
      modules: updated.modules,
      createdAt: updated.createdAt!,
      updatedAt: updated.updatedAt!,
    };
  }
}
