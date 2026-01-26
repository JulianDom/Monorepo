import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OperativeUsersController } from './operative-users.controller';
import { OperativeUsersService } from './operative-users.service';
import { RolesGuard } from '@common/guards';
import { AuthModule, PasswordHasherService } from '@infra/security/authentication';
import { getJwtModuleConfig } from '@shared/config';

@Module({
  imports: [
    AuthModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getJwtModuleConfig,
    })
  ],
  controllers: [OperativeUsersController],
  providers: [OperativeUsersService, RolesGuard, PasswordHasherService],
  exports: [OperativeUsersService],
})
export class OperativeUsersModule { }
