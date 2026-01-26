import { BusinessValidationException } from '@shared/exceptions';

/**
 * OperativeUserEntity - Entidad de Dominio
 *
 * Representa un usuario operativo (personal operativo) del sistema.
 * Estos usuarios son creados y gestionados por administradores.
 *
 * Características:
 * - Alta con contraseña inicial
 * - Edición de datos
 * - Habilitar/deshabilitar con efecto inmediato
 * - No existe eliminación definitiva (soft delete)
 */

/**
 * Propiedades base del usuario operativo (sin id)
 */
export interface OperativeUserPropsBase {
  fullName: string;
  emailAddress: string;
  username: string;
  password: string;
  enabled?: boolean;
  refreshToken?: string | null;
  recoverPasswordID?: string | null;
  createdById?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

/**
 * Propiedades del usuario operativo con id opcional (para compatibilidad)
 */
export interface OperativeUserProps extends OperativeUserPropsBase {
  id?: string;
}

/**
 * Propiedades del usuario operativo persistido (id requerido)
 */
export interface PersistedOperativeUserProps extends OperativeUserPropsBase {
  id: string;
}

export class OperativeUserEntity {
  private props: OperativeUserProps;
  private _isPersisted: boolean;

  private constructor(props: OperativeUserProps, isPersisted: boolean = false) {
    this.props = props;
    this._isPersisted = isPersisted;
  }

  // ==================== Factory Methods ====================

  /**
   * Crea una nueva entidad de usuario operativo (no persistida).
   * El id se asignará al guardar en el repositorio.
   */
  static create(
    props: Omit<OperativeUserPropsBase, 'createdAt' | 'updatedAt' | 'deletedAt'>,
  ): OperativeUserEntity {
    OperativeUserEntity.validateEmail(props.emailAddress);
    OperativeUserEntity.validateUsername(props.username);
    OperativeUserEntity.validatePassword(props.password);

    return new OperativeUserEntity(
      {
        ...props,
        enabled: props.enabled ?? true,
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
  static reconstitute(props: PersistedOperativeUserProps): OperativeUserEntity {
    return new OperativeUserEntity(props, true);
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

  get enabled(): boolean {
    return this.props.enabled ?? true;
  }

  get refreshToken(): string | null {
    return this.props.refreshToken ?? null;
  }

  get recoverPasswordID(): string | null {
    return this.props.recoverPasswordID ?? null;
  }

  get createdById(): string | null {
    return this.props.createdById ?? null;
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

  get isActive(): boolean {
    return this.enabled && !this.isDeleted;
  }

  // ==================== Domain Methods ====================

  updateProfile(data: { fullName?: string; emailAddress?: string }): void {
    if (data.fullName) {
      this.props.fullName = data.fullName;
    }
    if (data.emailAddress) {
      OperativeUserEntity.validateEmail(data.emailAddress);
      this.props.emailAddress = data.emailAddress;
    }
    this.props.updatedAt = new Date();
  }

  changePassword(newHashedPassword: string): void {
    this.props.password = newHashedPassword;
    this.props.recoverPasswordID = null;
    this.props.updatedAt = new Date();
  }

  setRefreshToken(token: string | null): void {
    this.props.refreshToken = token;
    this.props.updatedAt = new Date();
  }

  setRecoverPasswordID(id: string | null): void {
    this.props.recoverPasswordID = id;
    this.props.updatedAt = new Date();
  }

  /**
   * Habilita el usuario operativo.
   * Efecto inmediato.
   */
  enable(): void {
    if (this.props.enabled) {
      throw new BusinessValidationException('Operative user is already enabled');
    }
    this.props.enabled = true;
    this.props.updatedAt = new Date();
  }

  /**
   * Deshabilita el usuario operativo.
   * Efecto inmediato: invalida el refresh token.
   */
  disable(): void {
    if (!this.props.enabled) {
      throw new BusinessValidationException('Operative user is already disabled');
    }
    this.props.enabled = false;
    this.props.refreshToken = null;
    this.props.updatedAt = new Date();
  }

  /**
   * Soft delete - No existe eliminación definitiva de usuarios operativos.
   */
  softDelete(): void {
    if (this.props.deletedAt) {
      throw new BusinessValidationException('Operative user is already deleted');
    }
    this.props.deletedAt = new Date();
    this.props.enabled = false;
    this.props.refreshToken = null;
    this.props.updatedAt = new Date();
  }

  restore(): void {
    if (!this.props.deletedAt) {
      throw new BusinessValidationException('Operative user is not deleted');
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
      throw new BusinessValidationException(
        'Username can only contain letters, numbers and underscores',
      );
    }
  }

  private static validatePassword(password: string): void {
    if (password.length < 8) {
      throw new BusinessValidationException('Password must be at least 8 characters');
    }
  }

  // ==================== Serialization ====================

  toObject(): OperativeUserProps {
    return { ...this.props };
  }

  toPrimitives(): Omit<OperativeUserProps, 'password' | 'refreshToken' | 'recoverPasswordID'> {
    const { password, refreshToken, recoverPasswordID, ...rest } = this.props;
    return rest;
  }
}
