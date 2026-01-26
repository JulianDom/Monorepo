import { AdministratorEntity } from '@core/domain/entities';

/**
 * IAdministratorRepository - Puerto de Repositorio de Administrador
 *
 * Define el contrato que debe cumplir cualquier implementación
 * de persistencia de administradores.
 */
export interface IAdministratorRepository {
  findById(id: string): Promise<AdministratorEntity | null>;
  findByEmail(email: string): Promise<AdministratorEntity | null>;
  findByUsername(username: string): Promise<AdministratorEntity | null>;
  findByRefreshToken(refreshToken: string): Promise<AdministratorEntity | null>;
  findAll(page?: number, limit?: number, enabledOnly?: boolean): Promise<{ data: AdministratorEntity[]; total: number }>;
  findEnabled(): Promise<AdministratorEntity[]>;
  create(entity: AdministratorEntity): Promise<AdministratorEntity>;
  createWithRefreshToken(entity: AdministratorEntity, refreshToken: string): Promise<AdministratorEntity>;
  update(id: string, entity: Partial<AdministratorEntity>): Promise<AdministratorEntity>;
  updateRefreshToken(id: string, token: string | null): Promise<void>;
  updateRecoverPasswordID(id: string, recoverId: string | null): Promise<void>;
  enable(id: string): Promise<AdministratorEntity>;
  disable(id: string): Promise<AdministratorEntity>;
  /**
   * Verifica si existe un administrador con el email dado
   */
  existsByEmail(email: string): Promise<boolean>;
  /**
   * Verifica si existe un administrador con el username dado
   */
  existsByUsername(username: string): Promise<boolean>;
}

export const ADMINISTRATOR_REPOSITORY = Symbol('IAdministratorRepository');
