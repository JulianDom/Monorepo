import { IAdministratorRepository } from '@core/application/ports/repositories';
import { IPasswordHasherService } from '@core/application/ports/services';
import { EntityNotFoundException, InvalidCredentialsException } from '@shared/exceptions';

export interface ChangeAdminPasswordInput {
  adminId: string;
  currentPassword: string;
  newPassword: string;
}

/**
 * ChangeAdminPasswordUseCase
 *
 * Permite al administrador cambiar su contraseña.
 * Requiere la contraseña actual para verificación.
 */
export class ChangeAdminPasswordUseCase {
  constructor(
    private readonly adminRepository: IAdministratorRepository,
    private readonly passwordHasher: IPasswordHasherService,
  ) {}

  async execute(input: ChangeAdminPasswordInput): Promise<void> {
    const admin = await this.adminRepository.findById(input.adminId);

    if (!admin) {
      throw new EntityNotFoundException('Administrator', input.adminId);
    }

    // Verificar contraseña actual
    const isCurrentPasswordValid = await this.passwordHasher.compare(
      input.currentPassword,
      admin.password,
    );

    if (!isCurrentPasswordValid) {
      throw new InvalidCredentialsException('Current password is incorrect');
    }

    // Hashear y actualizar nueva contraseña
    const newHashedPassword = await this.passwordHasher.hash(input.newPassword);
    admin.changePassword(newHashedPassword);

    await this.adminRepository.update(admin.id!, {
      password: admin.password,
      recoverPasswordID: null,
    });
  }
}
