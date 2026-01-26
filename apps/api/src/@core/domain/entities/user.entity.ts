import { BusinessValidationException } from '@shared/exceptions';

/**
 * UserEntity - Entidad de Dominio
 *
 * Representa un usuario del sistema con su lógica de negocio.
 * Esta clase es independiente de la infraestructura (Prisma, DB, etc.)
 *
 * Patrón de tipos:
 * - UserProps: Propiedades base sin id (para creación)
 * - PersistedUserProps: Propiedades con id requerido (desde BD)
 *
 * El getter `id` retorna string | undefined para permitir entidades nuevas,
 * pero se garantiza que después de persistir siempre tendrá id.
 */

/**
 * Propiedades base del usuario (sin id)
 */
export interface UserPropsBase {
  fullName: string;
  emailAddress: string;
  username: string;
  password: string;
  online?: boolean;
  language?: string;
  picture?: string | null;
  location?: { lat: number; lng: number } | null;
  biometricChallenge?: string | null;
  registrationInfo?: Record<string, any> | null;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

/**
 * Propiedades del usuario con id opcional (para compatibilidad)
 */
export interface UserProps extends UserPropsBase {
  id?: string;
}

/**
 * Propiedades del usuario persistido (id requerido)
 */
export interface PersistedUserProps extends UserPropsBase {
  id: string;
}

export class UserEntity {
  private props: UserProps;
  private _isPersisted: boolean;

  private constructor(props: UserProps, isPersisted: boolean = false) {
    this.props = props;
    this._isPersisted = isPersisted;
  }

  // ==================== Factory Methods ====================

  /**
   * Crea una nueva entidad de usuario (no persistida).
   * El id se asignará al guardar en el repositorio.
   */
  static create(props: Omit<UserPropsBase, 'createdAt' | 'updatedAt' | 'deletedAt'>): UserEntity {
    UserEntity.validateEmail(props.emailAddress);
    UserEntity.validateUsername(props.username);
    UserEntity.validatePassword(props.password);

    return new UserEntity(
      {
        ...props,
        online: props.online ?? false,
        language: props.language ?? 'es',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
      false,
    );
  }

  /**
   * Reconstituye una entidad desde la base de datos.
   * Debe incluir el id obligatoriamente.
   */
  static reconstitute(props: PersistedUserProps): UserEntity {
    return new UserEntity(props, true);
  }

  // ==================== State Checks ====================

  /**
   * Indica si la entidad fue persistida (tiene id de BD)
   */
  get isPersisted(): boolean {
    return this._isPersisted;
  }

  /**
   * Retorna el id de la entidad.
   * Para entidades persistidas, siempre existe.
   * Para entidades nuevas, es undefined hasta que se persista.
   */
  get id(): string | undefined {
    return this.props.id;
  }

  /**
   * Retorna el id garantizado.
   * Lanza error si la entidad no está persistida.
   * Usar cuando se necesita el id y se sabe que existe.
   */
  get persistedId(): string {
    if (!this.props.id) {
      throw new BusinessValidationException('Entity has not been persisted yet');
    }
    return this.props.id;
  }

  // ==================== Getters ====================

  get fullName(): string {
    return this.props.fullName;
  }

  get emailAddress(): string {
    return this.props.emailAddress;
  }

  get username(): string {
    return this.props.username;
  }

  get password(): string {
    return this.props.password;
  }

  get online(): boolean {
    return this.props.online ?? false;
  }

  get language(): string {
    return this.props.language ?? 'es';
  }

  get picture(): string | null {
    return this.props.picture ?? null;
  }

  get location(): { lat: number; lng: number } | null {
    return this.props.location ?? null;
  }

  get biometricChallenge(): string | null {
    return this.props.biometricChallenge ?? null;
  }

  get registrationInfo(): Record<string, any> | null {
    return this.props.registrationInfo ?? null;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  get deletedAt(): Date | null {
    return this.props.deletedAt ?? null;
  }

  get isDeleted(): boolean {
    return this.props.deletedAt !== null;
  }

  // ==================== Domain Methods ====================

  updateProfile(data: { fullName?: string; picture?: string; language?: string }): void {
    if (data.fullName) {
      this.props.fullName = data.fullName;
    }
    if (data.picture !== undefined) {
      this.props.picture = data.picture;
    }
    if (data.language) {
      this.props.language = data.language;
    }
    this.props.updatedAt = new Date();
  }

  updateLocation(location: { lat: number; lng: number }): void {
    this.props.location = location;
    this.props.updatedAt = new Date();
  }

  setOnline(status: boolean): void {
    this.props.online = status;
    this.props.updatedAt = new Date();
  }

  changePassword(newHashedPassword: string): void {
    this.props.password = newHashedPassword;
    this.props.updatedAt = new Date();
  }

  setBiometricChallenge(challenge: string | null): void {
    this.props.biometricChallenge = challenge;
    this.props.updatedAt = new Date();
  }

  setRegistrationInfo(info: Record<string, any> | null): void {
    this.props.registrationInfo = info;
    this.props.updatedAt = new Date();
  }

  softDelete(): void {
    if (this.props.deletedAt) {
      throw new BusinessValidationException('User is already deleted');
    }
    this.props.deletedAt = new Date();
    this.props.updatedAt = new Date();
  }

  restore(): void {
    if (!this.props.deletedAt) {
      throw new BusinessValidationException('User is not deleted');
    }
    this.props.deletedAt = null;
    this.props.updatedAt = new Date();
  }

  // ==================== Validation ====================

  private static validateEmail(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new BusinessValidationException('Invalid email format');
    }
  }

  private static validateUsername(username: string): void {
    if (username.length < 3 || username.length > 100) {
      throw new BusinessValidationException('Username must be between 3 and 100 characters');
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      throw new BusinessValidationException('Username can only contain letters, numbers and underscores');
    }
  }

  private static validatePassword(password: string): void {
    if (password.length < 8) {
      throw new BusinessValidationException('Password must be at least 8 characters');
    }
  }

  // ==================== Serialization ====================

  toObject(): UserProps {
    return { ...this.props };
  }

  toPrimitives(): Omit<UserProps, 'password'> {
    const { password, ...rest } = this.props;
    return rest;
  }
}
