import { BusinessValidationException } from '@shared/exceptions';

/**
 * AdministratorEntity - Entidad de Dominio
 *
 * Representa un administrador del sistema con su lógica de negocio.
 * Incluye gestión de permisos y módulos.
 *
 * Patrón de tipos:
 * - AdministratorPropsBase: Propiedades base sin id (para creación)
 * - PersistedAdministratorProps: Propiedades con id requerido (desde BD)
 */

export interface AdminModules {
  [module: string]: {
    read: boolean;
    write: boolean;
    delete: boolean;
  };
}

/**
 * Propiedades base del administrador (sin id)
 */
export interface AdministratorPropsBase {
  fullName: string;
  emailAddress: string;
  username: string;
  password: string;
  enabled?: boolean;
  refreshToken?: string | null;
  recoverPasswordID?: string | null;
  modules?: AdminModules | null;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

/**
 * Propiedades del administrador con id opcional (para compatibilidad)
 */
export interface AdministratorProps extends AdministratorPropsBase {
  id?: string;
}

/**
 * Propiedades del administrador persistido (id requerido)
 */
export interface PersistedAdministratorProps extends AdministratorPropsBase {
  id: string;
}

export class AdministratorEntity {
  private props: AdministratorProps;
  private _isPersisted: boolean;

  private constructor(props: AdministratorProps, isPersisted: boolean = false) {
    this.props = props;
    this._isPersisted = isPersisted;
  }

  // ==================== Factory Methods ====================

  /**
   * Crea una nueva entidad de administrador (no persistida).
   * El id se asignará al guardar en el repositorio.
   */
  static create(
    props: Omit<AdministratorPropsBase, 'createdAt' | 'updatedAt' | 'deletedAt'>,
  ): AdministratorEntity {
    AdministratorEntity.validateEmail(props.emailAddress);
    AdministratorEntity.validateUsername(props.username);
    AdministratorEntity.validatePassword(props.password);

    return new AdministratorEntity(
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
  static reconstitute(props: PersistedAdministratorProps): AdministratorEntity {
    return new AdministratorEntity(props, true);
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

  get enabled(): boolean {
    return this.props.enabled ?? true;
  }

  get refreshToken(): string | null {
    return this.props.refreshToken ?? null;
  }

  get recoverPasswordID(): string | null {
    return this.props.recoverPasswordID ?? null;
  }

  get modules(): AdminModules | null {
    return this.props.modules ?? null;
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

  updateProfile(data: { fullName?: string }): void {
    if (data.fullName) {
      this.props.fullName = data.fullName;
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

  enable(): void {
    if (this.props.enabled) {
      throw new BusinessValidationException('Administrator is already enabled');
    }
    this.props.enabled = true;
    this.props.updatedAt = new Date();
  }

  disable(): void {
    if (!this.props.enabled) {
      throw new BusinessValidationException('Administrator is already disabled');
    }
    this.props.enabled = false;
    this.props.refreshToken = null;
    this.props.updatedAt = new Date();
  }

  setModules(modules: AdminModules): void {
    this.props.modules = modules;
    this.props.updatedAt = new Date();
  }

  hasPermission(module: string, action: 'read' | 'write' | 'delete'): boolean {
    if (!this.props.modules) {
      return false;
    }
    const modulePermissions = this.props.modules[module];
    if (!modulePermissions) {
      return false;
    }
    return modulePermissions[action] === true;
  }

  grantPermission(module: string, action: 'read' | 'write' | 'delete'): void {
    if (!this.props.modules) {
      this.props.modules = {};
    }
    if (!this.props.modules[module]) {
      this.props.modules[module] = { read: false, write: false, delete: false };
    }
    this.props.modules[module][action] = true;
    this.props.updatedAt = new Date();
  }

  revokePermission(module: string, action: 'read' | 'write' | 'delete'): void {
    if (!this.props.modules || !this.props.modules[module]) {
      return;
    }
    this.props.modules[module][action] = false;
    this.props.updatedAt = new Date();
  }

  softDelete(): void {
    if (this.props.deletedAt) {
      throw new BusinessValidationException('Administrator is already deleted');
    }
    this.props.deletedAt = new Date();
    this.props.enabled = false;
    this.props.refreshToken = null;
    this.props.updatedAt = new Date();
  }

  restore(): void {
    if (!this.props.deletedAt) {
      throw new BusinessValidationException('Administrator is not deleted');
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

  toObject(): AdministratorProps {
    return { ...this.props };
  }

  toPrimitives(): Omit<AdministratorProps, 'password' | 'refreshToken' | 'recoverPasswordID'> {
    const { password, refreshToken, recoverPasswordID, ...rest } = this.props;
    return rest;
  }
}
