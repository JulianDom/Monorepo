import { Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload, TokenPair, ActorType } from '@shared/types';
import { ITokenGenerator } from '@core/application/ports/services';
import { v4 as uuidv4 } from 'uuid';

/**
 * TokenService
 *
 * Servicio para gestión de tokens JWT.
 * Implementa el puerto ITokenGenerator.
 */
@Injectable()
export class TokenService implements ITokenGenerator {
  private readonly accessTokenExpiration: string;
  private readonly refreshTokenExpiration: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.accessTokenExpiration = this.configService.get<string>('JWT_EXPIRATION', '1h');
    this.refreshTokenExpiration = this.configService.get<string>('JWT_REFRESH_EXPIRATION', '7d');
  }

  /**
   * Crea opciones de firma con expiresIn
   */
  private getSignOptions(expiresIn: string): JwtSignOptions {
    return { expiresIn } as JwtSignOptions;
  }

  /**
   * Implementa ITokenGenerator - genera par de tokens sincrónicamente
   */
  generateTokenPair(payload: { sub: string; email: string; username: string; type: ActorType }): TokenPair {
    const jwtPayload: Omit<JwtPayload, 'iat' | 'exp'> = {
      sub: payload.sub,
      email: payload.email,
      username: payload.username,
      type: payload.type,
    };

    const accessToken = this.jwtService.sign(
      jwtPayload as Record<string, unknown>,
      this.getSignOptions(this.accessTokenExpiration),
    );

    const refreshToken = this.jwtService.sign(
      { ...jwtPayload, tokenId: uuidv4() } as Record<string, unknown>,
      this.getSignOptions(this.refreshTokenExpiration),
    );

    return { accessToken, refreshToken };
  }

  /**
   * Genera access token async
   */
  async generateAccessTokenAsync(payload: Omit<JwtPayload, 'iat' | 'exp'>): Promise<string> {
    return this.jwtService.signAsync(
      payload as Record<string, unknown>,
      this.getSignOptions(this.accessTokenExpiration),
    );
  }

  /**
   * Genera refresh token async
   */
  async generateRefreshTokenAsync(payload: Omit<JwtPayload, 'iat' | 'exp'>): Promise<string> {
    return this.jwtService.signAsync(
      { ...payload, tokenId: uuidv4() } as Record<string, unknown>,
      this.getSignOptions(this.refreshTokenExpiration),
    );
  }

  /**
   * Verifica un token y retorna el payload
   */
  async verifyToken(token: string): Promise<JwtPayload> {
    return this.jwtService.verifyAsync<JwtPayload>(token);
  }

  /**
   * Decodifica un token sin verificar (para inspección)
   */
  decodeToken(token: string): JwtPayload | null {
    try {
      return this.jwtService.decode(token) as JwtPayload;
    } catch {
      return null;
    }
  }
}
