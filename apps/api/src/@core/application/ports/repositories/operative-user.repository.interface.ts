import { OperativeUserEntity } from '@core/domain/entities';

/**
 * IOperativeUserRepository - Puerto de Repositorio de Usuario Operativo
 *
 * Define el contrato que debe cumplir cualquier implementación
 * de persistencia de usuarios operativos.
 */
export interface IOperativeUserRepository {
  findById(id: string): Promise<OperativeUserEntity | null>;
  findByEmail(email: string): Promise<OperativeUserEntity | null>;
  findByUsername(username: string): Promise<OperativeUserEntity | null>;
  findByRefreshToken(refreshToken: string): Promise<OperativeUserEntity | null>;
  findAll(page?: number, limit?: number, enabledOnly?: boolean): Promise<{ data: OperativeUserEntity[]; total: number }>;
  findEnabled(): Promise<OperativeUserEntity[]>;
  findByCreatedBy(adminId: string): Promise<OperativeUserEntity[]>;
  create(entity: OperativeUserEntity): Promise<OperativeUserEntity>;
  update(id: string, entity: Partial<OperativeUserEntity>): Promise<OperativeUserEntity>;
  updateRefreshToken(id: string, token: string | null): Promise<void>;
  updateRecoverPasswordID(id: string, id_: string | null): Promise<void>;
  enable(id: string): Promise<OperativeUserEntity>;
  disable(id: string): Promise<OperativeUserEntity>;
  /**
   * Verifica si existe un usuario operativo con el email dado
   */
  existsByEmail(email: string): Promise<boolean>;
  /**
   * Verifica si existe un usuario operativo con el username dado
   */
  existsByUsername(username: string): Promise<boolean>;
}

export const OPERATIVE_USER_REPOSITORY = Symbol('IOperativeUserRepository');
