/**
 * Puerto para servicio de hash de passwords
 *
 * Interfaz unificada para operaciones de hashing y verificación de passwords.
 * Usado tanto en login (compare) como en registro (hash).
 */
export interface IPasswordHasherService {
  /**
   * Hashea una contraseña en texto plano
   */
  hash(plainPassword: string): Promise<string>;

  /**
   * Compara una contraseña en texto plano con un hash
   */
  compare(plainPassword: string, hashedPassword: string): Promise<boolean>;
}

export const PASSWORD_HASHER_SERVICE = Symbol('IPasswordHasherService');
