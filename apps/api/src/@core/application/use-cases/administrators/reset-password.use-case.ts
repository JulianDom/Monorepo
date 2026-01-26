import { IAdministratorRepository } from '@core/application/ports/repositories';
import { IPasswordHasherService } from '@core/application/ports/services';
import { BusinessValidationException } from '@shared/exceptions';

export interface ResetPasswordInput {
  recoveryId: string;
  newPassword: string;
}

/**
 * ResetPasswordUseCase
 *
 * Restablece la contraseña usando el ID de recuperación.
 */
export class ResetPasswordUseCase {
  constructor(
    private readonly adminRepository: IAdministratorRepository,
    private readonly passwordHasher: IPasswordHasherService,
  ) {}

  async execute(input: ResetPasswordInput): Promise<void> {
    // Buscar admin por recovery ID (necesitamos buscar en todos los admins)
    const allAdmins = await this.adminRepository.findAll(1, 1000);
    const admin = allAdmins.data.find((a) => a.recoverPasswordID === input.recoveryId);

    if (!admin) {
      throw new BusinessValidationException('Invalid or expired recovery ID');
    }

    // Hashear nueva contraseña
    const hashedPassword = await this.passwordHasher.hash(input.newPassword);

    // Actualizar contraseña y limpiar recovery ID
    admin.changePassword(hashedPassword);

    await this.adminRepository.update(admin.id!, {
      password: admin.password,
      recoverPasswordID: null,
    });
  }
}
