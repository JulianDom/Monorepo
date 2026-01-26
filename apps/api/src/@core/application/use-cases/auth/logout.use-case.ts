import {
    IAdministratorRepository,
    IOperativeUserRepository,
} from '@core/application/ports/repositories';
import {
    DomainException,
} from '@shared/exceptions';
import { ActorType } from '@shared/types';
import { LogoutInput, LogoutOutput } from '@core/application/dto';

/**
 * LogoutUseCase
 *
 * Caso de uso para cierre de sesión seguro.
 * Invalida tokens y opcionalmente todas las sesiones del usuario.
 */
export class LogoutUseCase {
    constructor(
        private readonly adminRepository: IAdministratorRepository,
        private readonly operativeUserRepository: IOperativeUserRepository,
    ) { }

    async execute(input: LogoutInput): Promise<LogoutOutput> {
        const { userId, actorType, allSessions } = input;

        console.log('=== LOGOUT DEBUG ===');
        console.log('User ID:', userId);
        console.log('Actor Type:', actorType);
        console.log('All Sessions:', allSessions);

        try {
            if (actorType === ActorType.USER) {
                console.log('Procesando logout para USER...');
                const user = await this.operativeUserRepository.findById(userId);
                console.log('Usuario encontrado:', !!user);
                console.log('Refresh token antes de logout:', user?.refreshToken?.substring(0, 20) + '...');

                if (!user?.id) {
                    throw new DomainException('USER_NOT_FOUND', 'Usuario no encontrado', 404);
                }

                await this.operativeUserRepository.updateRefreshToken(user.id, null);
                console.log('Refresh token actualizado a null');

                return {
                    message: allSessions
                        ? 'Todas las sesiones cerradas correctamente'
                        : 'Sesión cerrada correctamente',
                    sessionsInvalidated: allSessions ? 1 : 0
                };
            }
            if (actorType === ActorType.ADMIN) {
                console.log('Procesando logout para ADMIN...');
                const admin = await this.adminRepository.findById(userId);
                console.log('Administrador encontrado:', !!admin);
                console.log('Refresh token antes de logout:', admin?.refreshToken?.substring(0, 20) + '...');

                if (!admin?.id) {
                    throw new DomainException('ADMIN_NOT_FOUND', 'Administrador no encontrado', 404);
                }

                await this.adminRepository.updateRefreshToken(admin.id, null);
                console.log('Refresh token actualizado a null');

                return {
                    message: allSessions
                        ? 'Todas las sesiones de administrador cerradas'
                        : 'Sesión de administrador cerrada',
                    sessionsInvalidated: allSessions ? 1 : 0
                };
            }
            throw new DomainException('INVALID_ACTOR_TYPE', 'Tipo de usuario no válido', 400);
        } catch (error) {
            console.error('Error en LogoutUseCase:', error);
            throw error;
        } finally {
            console.log('========================');
        }
    }
}