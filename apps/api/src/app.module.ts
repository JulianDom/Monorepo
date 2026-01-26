import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Nueva arquitectura - Database
import { PrismaModule } from '@database/prisma.module';

// Nueva arquitectura - Modulos de negocio simplificados
import { ProductsModule } from '@modules/products';
import { StoresModule } from '@modules/stores';
import { OperativeUsersModule } from '@modules/operative-users';
import { PriceRecordsModule } from '@modules/price-records';

// Modulos existentes (pendientes de migracion)
import { AuthModule } from '@infra/security/auth.module';
import { AuthPresentationModule } from '@presentation/controllers/auth/auth.module';
import { AdministratorsPresentationModule } from '@presentation/controllers/administrators/administrators.module';
import { QueueModule } from '@infra/queues';
import { NotificationProcessor } from '@infra/queues/processors';
import { ChatModule } from '@presentation/gateways';
import { ProvidersModule } from '@infra/providers';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Database
    PrismaModule,

    // Auth (mantiene estructura existente)
    AuthModule,
    AuthPresentationModule,

    // Modulos migrados a nueva arquitectura
    ProductsModule,
    StoresModule,
    OperativeUsersModule,
    PriceRecordsModule,

    // Modulos pendientes de migracion
    AdministratorsPresentationModule,

    // Servicios
    QueueModule,
    ChatModule,
    ProvidersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    NotificationProcessor,
    // ThrottlerGuard global - aplica rate limiting a todos los endpoints
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
