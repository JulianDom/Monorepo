import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload, AuthenticatedActor, ActorType } from '@shared/types';
import { PrismaService } from '@infra/database/prisma';
import { getJwtSecret } from '@shared/config';

/**
 * JwtStrategy
 *
 * Estrategia de autenticación JWT para Passport.
 * Valida tokens y carga el actor (User o Administrator).
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: getJwtSecret(configService),
    });
  }

  /**
   * Valida el payload del token JWT
   */
  async validate(payload: JwtPayload): Promise<AuthenticatedActor> {
    const { sub: id, type } = payload;

    console.log('=== JWT STRATEGY DEBUG ===');
    console.log('Payload:', payload);
    console.log('ID:', id);
    console.log('Type:', type);

    try {
      // Verificar que el actor existe y no está eliminado
      if (type === ActorType.USER) {
        console.log('Buscando usuario operativo en operative_users...');
        const user = await this.prisma.operativeUser.findFirst({
          where: { id, deletedAt: null },
        });

        console.log('Usuario operativo encontrado:', !!user);
        if (user) {
          console.log('User ID:', user.id);
          console.log('User email:', user.emailAddress);
          console.log('User enabled:', user.enabled);
        }

        if (!user) {
          console.log('Usuario operativo no encontrado o eliminado');
          throw new UnauthorizedException('User not found or deactivated');
        }

        return {
          id: user.id,
          email: user.emailAddress,
          username: user.username,
          type: ActorType.USER,
        };
      }

      if (type === ActorType.ADMIN) {
        const admin = await this.prisma.administrator.findFirst({
          where: { id, deletedAt: null, enabled: true },
        });

        console.log('Administrador encontrado:', !!admin);
        if (admin) {
          console.log('Admin ID:', admin.id);
          console.log('Admin email:', admin.emailAddress);
          console.log('Admin enabled:', admin.enabled);
          console.log('Admin refresh token:', admin.refreshToken?.substring(0, 20) + '...');
        }

        if (!admin) {
          console.log('Administrador no encontrado o deshabilitado');
          throw new UnauthorizedException('Administrator not found or disabled');
        }

        // Opcional: Verificar que tenga refresh token (sesión activa)
        if (!admin.refreshToken) {
          console.log('Administrador no tiene refresh token - sesión inválida');
          throw new UnauthorizedException('No active session found');
        }

        return {
          id: admin.id,
          email: admin.emailAddress,
          username: admin.username,
          type: ActorType.ADMIN,
        };
      }

      throw new UnauthorizedException('Invalid token type');
    } finally {
      console.log('========================');
    }
  }
}
