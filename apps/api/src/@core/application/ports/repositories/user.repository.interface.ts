import { UserEntity } from '@core/domain/entities';

/**
 * Datos biométricos del usuario
 */
export interface BiometricData {
  biometricChallenge: string | null;
  registrationInfo: Record<string, any>[] | null;
}

/**
 * IUserRepository - Puerto de Repositorio de Usuario
 *
 * Define el contrato que debe cumplir cualquier implementación
 * de persistencia de usuarios.
 */
export interface IUserRepository {
  findById(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  findByUsername(username: string): Promise<UserEntity | null>;
  findAll(page?: number, limit?: number): Promise<{ data: UserEntity[]; total: number }>;
  create(entity: UserEntity): Promise<UserEntity>;
  update(id: string, entity: Partial<UserEntity>): Promise<UserEntity>;
  delete(id: string): Promise<void>;
  updateOnlineStatus(id: string, online: boolean): Promise<void>;
  updateBiometricChallenge(id: string, challenge: string | null): Promise<void>;
  updateRegistrationInfo(id: string, info: Record<string, any>[] | null): Promise<void>;
  getBiometricData(id: string): Promise<BiometricData | null>;
  updateBiometricData(
    id: string,
    data: { challenge?: string | null; registrationInfo?: Record<string, any>[] | null },
  ): Promise<void>;
}

export const USER_REPOSITORY = Symbol('IUserRepository');
