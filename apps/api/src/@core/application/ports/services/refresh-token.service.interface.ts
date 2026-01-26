/**
 * IRefreshTokenService - Puerto para manejo seguro de refresh tokens
 *
 * Los refresh tokens son secrets de larga duración. Deben almacenarse
 * hasheados para proteger contra filtraciones de base de datos.
 */
export interface IRefreshTokenService {
  /**
   * Genera un hash del refresh token para almacenamiento seguro
   * @param token - El refresh token JWT completo
   * @returns Hash del token (no reversible)
   */
  hashToken(token: string): Promise<string>;

  /**
   * Verifica si un token coincide con el hash almacenado
   * @param token - El refresh token enviado por el cliente
   * @param storedHash - El hash almacenado en la base de datos
   * @returns true si coinciden
   */
  verifyToken(token: string, storedHash: string): Promise<boolean>;
}

export const REFRESH_TOKEN_SERVICE = Symbol('IRefreshTokenService');
