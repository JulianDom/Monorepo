import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { IRefreshTokenService } from '@core/application/ports/services';

/**
 * RefreshTokenService
 *
 * Implementación segura para manejo de refresh tokens.
 *
 * Usa SHA-256 para hashear tokens porque:
 * - Los refresh tokens ya son valores aleatorios de alta entropía (JWTs)
 * - No necesitan bcrypt (diseñado para passwords de baja entropía)
 * - SHA-256 es más rápido y suficientemente seguro para este caso
 *
 * NOTA: Si un atacante tiene el hash y el secret JWT, no puede
 * reconstruir el token porque SHA-256 no es reversible.
 */
@Injectable()
export class RefreshTokenService implements IRefreshTokenService {
  /**
   * Hashea un refresh token para almacenamiento seguro
   */
  async hashToken(token: string): Promise<string> {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Verifica si un token coincide con el hash almacenado
   * Usa comparación de tiempo constante para prevenir timing attacks
   */
  async verifyToken(token: string, storedHash: string): Promise<boolean> {
    const tokenHash = await this.hashToken(token);
    // Comparación de tiempo constante
    return crypto.timingSafeEqual(
      Buffer.from(tokenHash, 'hex'),
      Buffer.from(storedHash, 'hex'),
    );
  }
}
