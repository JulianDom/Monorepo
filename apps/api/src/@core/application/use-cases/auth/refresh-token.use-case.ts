import {
    IAdministratorRepository,
    IOperativeUserRepository,
} from '@core/application/ports/repositories';
import {
    IRefreshTokenService,
    ITokenGenerator,
} from '@core/application/ports/services';
import { ActorType } from '@shared/types';
import { RefreshTokenInput, RefreshTokenOutput } from '@core/application/dto';
import {
    DomainException,
    InvalidTokenException,
    AccountDisabledException,
} from '@shared/exceptions';

/**
 * RefreshTokenUseCase
 *
 * Caso de uso para renovación de tokens JWT.
 * Valida refresh token y genera nuevo par de tokens.
 */
export class RefreshTokenUseCase {
    constructor(
        private readonly adminRepository: IAdministratorRepository,
        private readonly operativeUserRepository: IOperativeUserRepository,
        private readonly refreshTokenService: IRefreshTokenService,
        private readonly tokenGenerator: ITokenGenerator,
    ) { }

    async execute(input: RefreshTokenInput): Promise<RefreshTokenOutput> {
        const { refreshToken, actorType } = input;

        console.log('=== REFRESH TOKEN DEBUG ===');
        console.log('Refresh token recibido:', refreshToken.substring(0, 20) + '...');
        console.log('Actor type (from input):', actorType);

        try {
            // Si no se especifica actorType, determinar desde el token
            if (!actorType) {
                console.log('Determinando actor type desde token...');
                // Usar el tokenGenerator para decodificar el token
                const decoded = this.tokenGenerator.decodeToken(refreshToken);
                const determinedActorType = decoded?.type || 'USER';
                console.log('Actor type determinado:', determinedActorType);

                if (determinedActorType === ActorType.USER) {
                    return this.refreshUserToken(refreshToken);
                } else if (determinedActorType === ActorType.ADMIN) {
                    return this.refreshAdminToken(refreshToken);
                }
            } else {
                // Si se especifica actorType, usarlo
                if (actorType === ActorType.USER) {
                    return this.refreshUserToken(refreshToken);
                } else if (actorType === ActorType.ADMIN) {
                    return this.refreshAdminToken(refreshToken);
                }
            }

            throw new DomainException('INVALID_ACTOR_TYPE', 'Invalid actor type', 400);
        } finally {
            console.log('========================');
        }
    }

    private async refreshUserToken(refreshToken: string): Promise<RefreshTokenOutput> {
        console.log('Buscando usuario operativo con refresh token...');

        // Buscar usuario por refresh token
        const user = await this.operativeUserRepository.findByRefreshToken(refreshToken);

        console.log('Usuario encontrado:', !!user);
        if (!user) {
            console.log('Refresh token no encontrado o inválido');
            throw new InvalidTokenException('Invalid refresh token');
        }

        if (!user.isActive) {
            console.log('Usuario inactivo');
            throw new AccountDisabledException('Account is disabled');
        }

        console.log('Generando nuevos tokens...');

        // Generar nuevo par de tokens
        const tokens = this.tokenGenerator.generateTokenPair({
            sub: user.id!,
            email: user.emailAddress,
            username: user.username,
            type: ActorType.USER,
        });

        // Hashear y actualizar refresh token (rotación)
        const newHashedRefreshToken = await this.refreshTokenService.hashToken(tokens.refreshToken);
        await this.operativeUserRepository.updateRefreshToken(user.id!, newHashedRefreshToken);

        console.log('Tokens renovados exitosamente');

        return {
            actor: {
                id: user.id!,
                email: user.emailAddress,
                username: user.username,
                fullName: user.fullName,
                type: ActorType.USER,
            },
            tokens,
        };
    }

    private async refreshAdminToken(refreshToken: string): Promise<RefreshTokenOutput> {
        console.log('Buscando administrador con refresh token...');

        // Buscar admin por refresh token
        const admin = await this.adminRepository.findByRefreshToken(refreshToken);

        console.log('Administrador encontrado:', !!admin);
        if (!admin) {
            console.log('Refresh token no encontrado o inválido');
            throw new InvalidTokenException('Invalid refresh token');
        }

        if (!admin.isActive) {
            console.log('Administrador inactivo');
            throw new AccountDisabledException('Account is disabled');
        }

        console.log('Generando nuevos tokens...');

        // Generar nuevo par de tokens
        const tokens = this.tokenGenerator.generateTokenPair({
            sub: admin.id!,
            email: admin.emailAddress,
            username: admin.username,
            type: ActorType.ADMIN,
        });

        // Hashear y actualizar refresh token (rotación)
        const newHashedRefreshToken = await this.refreshTokenService.hashToken(tokens.refreshToken);
        await this.adminRepository.updateRefreshToken(admin.id!, newHashedRefreshToken);

        console.log('Tokens renovados exitosamente');

        return {
            actor: {
                id: admin.id!,
                email: admin.emailAddress,
                username: admin.username,
                fullName: admin.fullName,
                type: ActorType.ADMIN,
            },
            tokens,
        };
    }
}
