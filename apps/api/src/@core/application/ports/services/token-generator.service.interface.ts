import { ActorType, TokenPair, JwtPayload } from '@shared/types';

/**
 * Puerto para servicio de generación de tokens
 */
export interface ITokenGenerator {
  generateTokenPair(payload: {
    sub: string;
    email: string;
    username: string;
    type: ActorType;
  }): TokenPair;

  /**
   * Decodifica un token sin verificar (para inspección)
   */
  decodeToken(token: string): JwtPayload | null;
}

export const TOKEN_GENERATOR = Symbol('ITokenGenerator');
