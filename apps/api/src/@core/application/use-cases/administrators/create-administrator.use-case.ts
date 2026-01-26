import { IAdministratorRepository } from '@core/application/ports/repositories';
import { IPasswordHasherService } from '@core/application/ports/services';
import { AdministratorEntity, AdminModules } from '@core/domain/entities';
import { ConflictException } from '@shared/exceptions';

export interface CreateAdministratorInput {
  fullName: string;
  email: string;
  username: string;
  password: string;
  modules?: AdminModules;
}

export interface CreateAdministratorOutput {
  id: string;
  fullName: string;
  email: string;
  username: string;
  enabled: boolean;
}

/**
 * CreateAdministratorUseCase
 *
 * Crea un nuevo administrador.
 */
export class CreateAdministratorUseCase {
  constructor(
    private readonly adminRepository: IAdministratorRepository,
    private readonly passwordHasher: IPasswordHasherService,
  ) {}

  async execute(input: CreateAdministratorInput): Promise<CreateAdministratorOutput> {
    // Verificar que no exista email duplicado
    const existingByEmail = await this.adminRepository.findByEmail(input.email);
    if (existingByEmail) {
      throw new ConflictException('An administrator with this email already exists');
    }

    // Verificar que no exista username duplicado
    const existingByUsername = await this.adminRepository.findByUsername(input.username);
    if (existingByUsername) {
      throw new ConflictException('An administrator with this username already exists');
    }

    // Hashear contraseña
    const hashedPassword = await this.passwordHasher.hash(input.password);

    // Crear entidad
    const admin = AdministratorEntity.create({
      fullName: input.fullName,
      emailAddress: input.email,
      username: input.username,
      password: hashedPassword,
      enabled: true,
      modules: input.modules ?? null,
    });

    // Persistir
    const created = await this.adminRepository.create(admin);

    return {
      id: created.id!,
      fullName: created.fullName,
      email: created.emailAddress,
      username: created.username,
      enabled: created.enabled,
    };
  }
}
