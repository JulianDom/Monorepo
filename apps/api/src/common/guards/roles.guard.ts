import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ActorType, AuthenticatedActor } from '@common/types';
import { ROLES_KEY } from '@common/decorators';

/**
 * RolesGuard
 *
 * Guard que verifica si el actor autenticado tiene el rol requerido.
 * Funciona tanto para Users como para Administrators.
 *
 * Uso:
 * 1. Aplicar @UseGuards(JwtAuthGuard, RolesGuard) al controller o metodo
 * 2. Usar @Roles(ActorType.ADMIN) para restringir acceso
 *
 * Si no se especifica @Roles(), el guard permite el acceso
 * (asume que solo se requiere autenticacion).
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Obtener roles requeridos del decorador
    const requiredRoles = this.reflector.getAllAndOverride<ActorType[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Si no hay roles requeridos, permitir acceso
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Obtener usuario autenticado del request
    const request = context.switchToHttp().getRequest();
    const actor: AuthenticatedActor | undefined = request.user;

    if (!actor) {
      throw new ForbiddenException('Authentication required');
    }

    // Verificar si el tipo de actor esta en los roles permitidos
    const hasRole = requiredRoles.includes(actor.type);

    if (!hasRole) {
      throw new ForbiddenException(
        `Access denied. Required roles: ${requiredRoles.join(', ')}. Your role: ${actor.type}`,
      );
    }

    return true;
  }
}
