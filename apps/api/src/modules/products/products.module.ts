import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { RolesGuard } from '@common/guards';
// Importamos desde la ubicacion existente por ahora
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
    }),
  ],
  controllers: [ProductsController],
  providers: [
    ProductsService,
    RolesGuard,
  ],
  exports: [ProductsService],
})
export class ProductsModule { }
