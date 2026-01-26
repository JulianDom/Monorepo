import { Module, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NotificationQueueService } from './services';
import { NOTIFICATION_QUEUE_SERVICE } from '@core/application/ports/services';

/**
 * QueueModule
 *
 * Módulo global para configuración de BullMQ con Redis.
 * Registra las colas necesarias para procesamiento asíncrono.
 *
 * Colas disponibles:
 * - notifications: Procesamiento de notificaciones push
 * - emails: Envío de correos electrónicos
 * - exports: Generación de reportes y exportaciones
 */
@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const host = configService.get<string>('REDIS_HOST', 'localhost');
        const port = configService.get<number>('REDIS_PORT', 6380);
        const password = configService.get<string>('REDIS_PASSWORD');
        const db = configService.get<number>('REDIS_DB', 0);

        // Build Redis URL
        const auth = password ? `:${password}@` : '';
        const url = `redis://${auth}${host}:${port}/${db}`;

        return {
          url,
          defaultJobOptions: {
            attempts: 3,
            backoff: {
              type: 'exponential',
              delay: 1000,
            },
            removeOnComplete: {
              age: 3600,
              count: 1000,
            },
            removeOnFail: {
              age: 86400,
            },
          },
        };
      },
    }),
    // Registrar colas
    BullModule.registerQueue(
      { name: 'notifications' },
      { name: 'emails' },
      { name: 'exports' },
    ),
  ],
  providers: [
    NotificationQueueService,
    {
      provide: NOTIFICATION_QUEUE_SERVICE,
      useExisting: NotificationQueueService,
    },
  ],
  exports: [BullModule, NOTIFICATION_QUEUE_SERVICE],
})
export class QueueModule {}
