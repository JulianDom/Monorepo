import {
  IAdministratorRepository,
  IOperativeUserRepository,
} from '@core/application/ports/repositories';
import {
  IRefreshTokenService,
  IPasswordHasherService,
  ITokenGenerator,
} from '@core/application/ports/services';
import { ActorType } from '@shared/types';
import { LoginInput, LoginOutput } from '@core/application/dto';
import {
  DomainException,
  InvalidCredentialsException,
  AccountDisabledException,
} from '@shared/exceptions';

/**
 * Hash dummy para comparación cuando el usuario no existe.
 * Esto previene timing attacks: siempre ejecutamos bcrypt.compare()
 * independientemente de si el usuario existe o no.
 *
 * El hash corresponde a una contraseña aleatoria que nunca coincidirá.
 * Generado con: bcrypt.hashSync('$timing-attack-prevention-dummy$', 12)
 */
const DUMMY_PASSWORD_HASH = '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.VTtYL.qYjfqjKe';

/**
 * LoginUseCase
 *
 * Caso de uso para autenticación de usuarios y administradores.
 * Contiene la lógica de negocio: validar existencia, comparar passwords, generar tokens.
 *
 * Principios:
 * - No conoce la infraestructura (Prisma, bcrypt, JWT)
 * - Usa puertos (interfaces) para dependencias externas
 * - Retorna DTOs, no entidades de dominio
 *
 * SECURITY: Previene timing attacks ejecutando siempre bcrypt.compare()
 */
export class LoginUseCase {
  constructor(
    private readonly adminRepository: IAdministratorRepository,
    private readonly operativeUserRepository: IOperativeUserRepository,
    private readonly passwordHasher: IPasswordHasherService,
    private readonly tokenGenerator: ITokenGenerator,
    private readonly refreshTokenService: IRefreshTokenService,
  ) { }

  async execute(input: LoginInput): Promise<LoginOutput> {
    const { email, password, actorType } = input;

    if (actorType === ActorType.USER) {
      return this.loginUser(email, password);
    } else if (actorType === ActorType.ADMIN) {
      return this.loginAdmin(email, password);
    }

    throw new DomainException('INVALID_ACTOR_TYPE', 'Invalid actor type', 400);
  }

  private async loginUser(email: string, password: string): Promise<LoginOutput> {
    console.log('=== LOGIN USER DEBUG ===');
    console.log('Email recibido:', email);
    console.log('Password recibido:', password);

    // 1. Buscar usuario operativo por email
    const user = await this.operativeUserRepository.findByEmail(email);

    console.log('Usuario operativo encontrado:', !!user);
    if (user) {
      console.log('Usuario ID:', user.id);
      console.log('Usuario email:', user.emailAddress);
      console.log('Usuario username:', user.username);
      console.log('Usuario password hash (primeros 20 chars):', user.password?.substring(0, 20) + '...');
    }

    // 2. SECURITY: Siempre comparar password para prevenir timing attacks
    // Si el usuario no existe, comparamos contra un hash dummy
    // Esto asegura que el tiempo de respuesta sea constante
    const passwordToCompare = user?.password || DUMMY_PASSWORD_HASH;
    console.log('Password a comparar (primeros 20 chars):', passwordToCompare.substring(0, 20) + '...');
    console.log('Es dummy hash?', passwordToCompare === DUMMY_PASSWORD_HASH);

    const isPasswordValid = await this.passwordHasher.compare(password, passwordToCompare);
    console.log('Password válido?:', isPasswordValid);
    console.log('========================');

    // 3. Verificar todas las condiciones de error (después de la comparación)
    if (!user || !isPasswordValid) {
      throw new InvalidCredentialsException();
    }

    // 4. Verificar que esté activo y no eliminado
    if (!user.isActive) {
      throw new AccountDisabledException('Account is disabled');
    }

    // 5. Generar tokens
    const tokens = this.tokenGenerator.generateTokenPair({
      sub: user.id!,
      email: user.emailAddress,
      username: user.username,
      type: ActorType.USER,
    });

    // 6. Retornar resultado
    return {
      actor: {
        id: user.id!,
        email: user.emailAddress,
        username: user.username,
        fullName: user.fullName,
        type: ActorType.USER,
      },
      tokens,
    };
  }

  private async loginAdmin(email: string, password: string): Promise<LoginOutput> {
    // 1. Buscar admin por email
    const admin = await this.adminRepository.findByEmail(email);

    // 2. SECURITY: Siempre comparar password para prevenir timing attacks
    // Si el admin no existe, comparamos contra un hash dummy
    // Esto asegura que el tiempo de respuesta sea constante
    const passwordToCompare = admin?.password || DUMMY_PASSWORD_HASH;
    const isPasswordValid = await this.passwordHasher.compare(password, passwordToCompare);

    // 3. Verificar todas las condiciones de error (después de la comparación)
    if (!admin || !isPasswordValid) {
      throw new InvalidCredentialsException();
    }

    // 4. Verificar que esté activo
    if (!admin.isActive) {
      throw new AccountDisabledException();
    }

    // 5. Generar tokens
    const tokens = this.tokenGenerator.generateTokenPair({
      sub: admin.id!,
      email: admin.emailAddress,
      username: admin.username,
      type: ActorType.ADMIN,
    });

    // 6. Hashear y guardar refresh token en admin (nunca guardamos el token en texto plano)
    const hashedRefreshToken = await this.refreshTokenService.hashToken(tokens.refreshToken);
    await this.adminRepository.updateRefreshToken(admin.id!, hashedRefreshToken);

    // 7. Retornar resultado
    return {
      actor: {
        id: admin.id!,
        email: admin.emailAddress,
        username: admin.username,
        fullName: admin.fullName,
        type: ActorType.ADMIN,
      },
      tokens,
    };
  }
}
