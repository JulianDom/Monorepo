import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { AdministratorsController } from './administrators.controller';
import {
  GetAdminProfileUseCase,
  UpdateAdminProfileUseCase,
  ChangeAdminPasswordUseCase,
  ListAdministratorsUseCase,
  GetAdministratorUseCase,
  CreateAdministratorUseCase,
  UpdateAdministratorUseCase,
  ToggleAdministratorStatusUseCase,
  RequestPasswordRecoveryUseCase,
  ResetPasswordUseCase,
} from '@core/application/use-cases/administrators';
import {
  ADMINISTRATOR_REPOSITORY,
  IAdministratorRepository,
} from '@core/application/ports/repositories';
import {
  PASSWORD_HASHER_SERVICE,
  IPasswordHasherService,
  REFRESH_TOKEN_SERVICE,
} from '@core/application/ports/services';
import { AdministratorRepository } from '@infra/database/repositories';
import { PasswordHasherService } from '@infra/security/encryption';
import { RefreshTokenService } from '@infra/security/authentication';
import { PrismaService } from '@infra/database/prisma';
import { PrismaModule } from '@infra/database/prisma';
import { AuthModule } from '@infra/security/auth.module';
import { RolesGuard } from '@presentation/guards';
import { getJwtModuleConfig } from '@shared/config';

/**
 * AdministratorsPresentationModule
 *
 * Épica 4: Gestión de Usuario (Administrador)
 */
@Module({
  imports: [
    PrismaModule,
    AuthModule,
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => getJwtModuleConfig(configService),
      inject: [ConfigService],
    }),
  ],
  controllers: [AdministratorsController],
  providers: [
    RolesGuard,

    // Repository
    {
      provide: ADMINISTRATOR_REPOSITORY,
      useFactory: (prisma: PrismaService, refreshTokenService: RefreshTokenService) =>
        new AdministratorRepository(prisma, refreshTokenService),
      inject: [PrismaService, RefreshTokenService],
    },

    // Services
    {
      provide: PASSWORD_HASHER_SERVICE,
      useClass: PasswordHasherService,
    },
    {
      provide: REFRESH_TOKEN_SERVICE,
      useClass: RefreshTokenService,
    },

    // Use Cases
    {
      provide: GetAdminProfileUseCase,
      useFactory: (adminRepo: IAdministratorRepository) => new GetAdminProfileUseCase(adminRepo),
      inject: [ADMINISTRATOR_REPOSITORY],
    },
    {
      provide: UpdateAdminProfileUseCase,
      useFactory: (adminRepo: IAdministratorRepository) => new UpdateAdminProfileUseCase(adminRepo),
      inject: [ADMINISTRATOR_REPOSITORY],
    },
    {
      provide: ChangeAdminPasswordUseCase,
      useFactory: (adminRepo: IAdministratorRepository, passwordHasher: IPasswordHasherService) =>
        new ChangeAdminPasswordUseCase(adminRepo, passwordHasher),
      inject: [ADMINISTRATOR_REPOSITORY, PASSWORD_HASHER_SERVICE],
    },
    {
      provide: ListAdministratorsUseCase,
      useFactory: (adminRepo: IAdministratorRepository) => new ListAdministratorsUseCase(adminRepo),
      inject: [ADMINISTRATOR_REPOSITORY],
    },
    {
      provide: GetAdministratorUseCase,
      useFactory: (adminRepo: IAdministratorRepository) => new GetAdministratorUseCase(adminRepo),
      inject: [ADMINISTRATOR_REPOSITORY],
    },
    {
      provide: CreateAdministratorUseCase,
      useFactory: (adminRepo: IAdministratorRepository, passwordHasher: IPasswordHasherService) =>
        new CreateAdministratorUseCase(adminRepo, passwordHasher),
      inject: [ADMINISTRATOR_REPOSITORY, PASSWORD_HASHER_SERVICE],
    },
    {
      provide: UpdateAdministratorUseCase,
      useFactory: (adminRepo: IAdministratorRepository) => new UpdateAdministratorUseCase(adminRepo),
      inject: [ADMINISTRATOR_REPOSITORY],
    },
    {
      provide: ToggleAdministratorStatusUseCase,
      useFactory: (adminRepo: IAdministratorRepository) =>
        new ToggleAdministratorStatusUseCase(adminRepo),
      inject: [ADMINISTRATOR_REPOSITORY],
    },
    {
      provide: RequestPasswordRecoveryUseCase,
      useFactory: (adminRepo: IAdministratorRepository) =>
        new RequestPasswordRecoveryUseCase(adminRepo),
      inject: [ADMINISTRATOR_REPOSITORY],
    },
    {
      provide: ResetPasswordUseCase,
      useFactory: (adminRepo: IAdministratorRepository, passwordHasher: IPasswordHasherService) =>
        new ResetPasswordUseCase(adminRepo, passwordHasher),
      inject: [ADMINISTRATOR_REPOSITORY, PASSWORD_HASHER_SERVICE],
    },
  ],
})
export class AdministratorsPresentationModule { }
