import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StoresController } from './stores.controller';
import { StoresService } from './stores.service';
import { RolesGuard } from '@common/guards';
import { AuthModule } from '@infra/security/authentication';
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
  controllers: [StoresController],
  providers: [StoresService, RolesGuard],
  exports: [StoresService],
})
export class StoresModule { }
