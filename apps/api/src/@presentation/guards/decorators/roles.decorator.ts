import { SetMetadata } from '@nestjs/common';
import { ActorType } from '@shared/types';

export const ROLES_KEY = 'roles';

/**
 * Decorador @Roles()
 *
 * Define qué tipos de actor pueden acceder a un endpoint.
 * Funciona en conjunto con RolesGuard.
 *
 * @example
 * // Solo administradores
 * @Roles(ActorType.ADMIN)
 *
 * // Solo usuarios
 * @Roles(ActorType.USER)
 *
 * // Ambos pueden acceder
 * @Roles(ActorType.USER, ActorType.ADMIN)
 */
export const Roles = (...roles: ActorType[]) => SetMetadata(ROLES_KEY, roles);
