import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { PrismaModule } from '@infra/database/prisma';
import { QueueModule } from '@infra/queues';
import { ChatRepository } from '@infra/database/repositories';
import { CHAT_REPOSITORY } from '@core/application/ports/repositories';
import { getJwtModuleConfig } from '@shared/config';

/**
 * ChatModule
 *
 * Módulo para el sistema de chat en tiempo real.
 * Usa inyección de dependencias para el repositorio (Clean Architecture).
 */
@Module({
  imports: [
    PrismaModule,
    QueueModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => getJwtModuleConfig(configService),
    }),
  ],
  providers: [
    ChatGateway,
    ChatService,
    {
      provide: CHAT_REPOSITORY,
      useClass: ChatRepository,
    },
  ],
  exports: [ChatGateway, ChatService],
})
export class ChatModule {}
