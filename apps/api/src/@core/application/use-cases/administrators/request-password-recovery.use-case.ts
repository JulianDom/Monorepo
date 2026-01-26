import { randomUUID } from 'crypto';
import { IAdministratorRepository } from '@core/application/ports/repositories';

export interface RequestPasswordRecoveryInput {
  email: string;
}

export interface RequestPasswordRecoveryOutput {
  message: string;
  recoveryId?: string; // Solo para desarrollo/testing
}

/**
 * RequestPasswordRecoveryUseCase
 *
 * Genera un ID de recuperación de contraseña.
 * En producción, este ID se enviaría por email.
 *
 * NOTA: No revela si el email existe o no (previene enumeración).
 */
export class RequestPasswordRecoveryUseCase {
  constructor(private readonly adminRepository: IAdministratorRepository) {}

  async execute(input: RequestPasswordRecoveryInput): Promise<RequestPasswordRecoveryOutput> {
    const admin = await this.adminRepository.findByEmail(input.email);

    // Siempre retornamos el mismo mensaje para prevenir enumeración de emails
    const message = 'If an account exists with this email, a recovery link will be sent';

    if (!admin || !admin.isActive) {
      return { message };
    }

    // Generar ID de recuperación
    const recoveryId = randomUUID();

    // Guardar el ID de recuperación
    await this.adminRepository.updateRecoverPasswordID(admin.id!, recoveryId);

    // TODO: En producción, enviar email con el link de recuperación
    // Por ahora retornamos el ID para testing
    return {
      message,
      recoveryId, // Remover en producción
    };
  }
}
