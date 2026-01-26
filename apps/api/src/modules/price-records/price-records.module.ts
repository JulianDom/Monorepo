import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PriceRecordsController } from './price-records.controller';
import { PriceRecordsService } from './price-records.service';
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
  controllers: [PriceRecordsController],
  providers: [PriceRecordsService, RolesGuard],
  exports: [PriceRecordsService],
})
export class PriceRecordsModule { }
