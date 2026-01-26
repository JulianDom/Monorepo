import {
  IUserRepository,
  IAdministratorRepository,
} from '@core/application/ports/repositories';
import {
  IRefreshTokenService,
  IPasswordHasherService,
  ITokenGenerator,
} from '@core/application/ports/services';
import { UserEntity, AdministratorEntity } from '@core/domain/entities';
import { ActorType } from '@shared/types';
import {
  RegisterUserInput,
  RegisterAdminInput,
  RegisterOutput,
} from '@core/application/dto';
import { EntityDuplicatedException } from '@shared/exceptions';

/**
 * RegisterUseCase
 *
 * Caso de uso para registro de usuarios y administradores.
 * Contiene la lógica de negocio: validar unicidad, hashear password, crear entidad.
 */
export class RegisterUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly adminRepository: IAdministratorRepository,
    private readonly passwordHasher: IPasswordHasherService,
    private readonly tokenGenerator: ITokenGenerator,
    private readonly refreshTokenService: IRefreshTokenService,
  ) {}

  async registerUser(input: RegisterUserInput): Promise<RegisterOutput> {
    const { fullName, email, username, password, language } = input;

    // 1. Verificar que el email no exista
    const existingByEmail = await this.userRepository.findByEmail(email);
    if (existingByEmail) {
      throw new EntityDuplicatedException('User', 'email', email);
    }

    // 2. Verificar que el username no exista
    const existingByUsername = await this.userRepository.findByUsername(username);
    if (existingByUsername) {
      throw new EntityDuplicatedException('User', 'username', username);
    }

    // 3. Hashear password
    const hashedPassword = await this.passwordHasher.hash(password);

    // 4. Crear entidad de dominio (valida reglas de negocio)
    const userEntity = UserEntity.create({
      fullName,
      emailAddress: email,
      username,
      password: hashedPassword,
      language: language || 'es',
    });

    // 5. Persistir en repositorio
    const createdUser = await this.userRepository.create(userEntity);

    // 6. Generar tokens
    const tokens = this.tokenGenerator.generateTokenPair({
      sub: createdUser.id!,
      email: createdUser.emailAddress,
      username: createdUser.username,
      type: ActorType.USER,
    });

    // 7. Retornar resultado
    return {
      actor: {
        id: createdUser.id!,
        email: createdUser.emailAddress,
        username: createdUser.username,
        fullName: createdUser.fullName,
        type: ActorType.USER,
      },
      tokens,
    };
  }

  async registerAdmin(input: RegisterAdminInput): Promise<RegisterOutput> {
    const { fullName, email, username, password } = input;

    // 1. Verificar que el email no exista
    const existingByEmail = await this.adminRepository.findByEmail(email);
    if (existingByEmail) {
      throw new EntityDuplicatedException('Administrator', 'email', email);
    }

    // 2. Verificar que el username no exista
    const existingByUsername = await this.adminRepository.findByUsername(username);
    if (existingByUsername) {
      throw new EntityDuplicatedException('Administrator', 'username', username);
    }

    // 3. Hashear password
    const hashedPassword = await this.passwordHasher.hash(password);

    // 4. Crear entidad de dominio
    const adminEntity = AdministratorEntity.create({
      fullName,
      emailAddress: email,
      username,
      password: hashedPassword,
    });

    // 5. Generar tokens preliminares para obtener el refresh token a hashear
    const preliminaryTokens = this.tokenGenerator.generateTokenPair({
      sub: 'pending', // Se regenerará con el ID real
      email: adminEntity.emailAddress,
      username: adminEntity.username,
      type: ActorType.ADMIN,
    });

    // 6. Hashear refresh token
    const hashedRefreshToken = await this.refreshTokenService.hashToken(preliminaryTokens.refreshToken);

    // 7. Crear admin con refresh token en una sola transacción atómica
    const createdAdmin = await this.adminRepository.createWithRefreshToken(adminEntity, hashedRefreshToken);

    // 8. Generar tokens finales con el ID real
    const tokens = this.tokenGenerator.generateTokenPair({
      sub: createdAdmin.id!,
      email: createdAdmin.emailAddress,
      username: createdAdmin.username,
      type: ActorType.ADMIN,
    });

    // 9. Retornar resultado
    return {
      actor: {
        id: createdAdmin.id!,
        email: createdAdmin.emailAddress,
        username: createdAdmin.username,
        fullName: createdAdmin.fullName,
        type: ActorType.ADMIN,
      },
      tokens,
    };
  }
}
