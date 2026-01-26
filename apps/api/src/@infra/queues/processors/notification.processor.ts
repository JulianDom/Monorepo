import { Processor, Process, OnQueueActive, OnQueueCompleted, OnQueueFailed } from '@nestjs/bull';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { PrismaService } from '@infra/database/prisma';

interface NewMessageJob {
  userId: string;
  messageId: string;
  conversationId: string;
  senderName: string;
  content: string;
}

interface PushNotificationJob {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, any>;
}

/**
 * NotificationProcessor
 *
 * Procesador de cola para notificaciones.
 * Maneja envío de push notifications cuando usuarios están offline.
 *
 * Jobs:
 * - new-message: Notificación de nuevo mensaje en chat
 * - push: Notificación push genérica
 */
@Processor('notifications')
export class NotificationProcessor {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Procesar notificación de nuevo mensaje
   */
  @Process('new-message')
  async handleNewMessage(job: Job<NewMessageJob>) {
    const { userId, messageId, conversationId, senderName, content } = job.data;

    this.logger.debug(`Processing new-message notification for user ${userId}`);

    try {
      // Verificar si el usuario está online
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { online: true, deletedAt: true },
      });

      if (!user || user.deletedAt) {
        this.logger.warn(`User ${userId} not found or deleted`);
        return { skipped: true, reason: 'user_not_found' };
      }

      // Solo enviar push si el usuario está offline
      if (user.online) {
        this.logger.debug(`User ${userId} is online, skipping push notification`);
        return { skipped: true, reason: 'user_online' };
      }

      // Crear notificación en base de datos
      const notification = await this.prisma.notification.create({
        data: {
          userId,
          title: `Nuevo mensaje de ${senderName}`,
          body: content,
          payload: {
            type: 'new_message',
            conversationId,
            messageId,
          },
        },
      });

      // Simular envío de push notification
      // TODO: Integrar con Firebase Cloud Messaging
      await this.sendPushNotification({
        userId,
        title: `Nuevo mensaje de ${senderName}`,
        body: content,
        data: {
          type: 'new_message',
          conversationId,
          messageId,
          notificationId: notification.id,
        },
      });

      this.logger.log(`Push notification sent to user ${userId} for message ${messageId}`);

      return {
        success: true,
        notificationId: notification.id,
      };
    } catch (error) {
      this.logger.error(`Failed to process new-message notification: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * Procesar notificación push genérica
   */
  @Process('push')
  async handlePush(job: Job<PushNotificationJob>) {
    const { userId, title, body, data } = job.data;

    this.logger.debug(`Processing push notification for user ${userId}`);

    try {
      // Crear notificación en base de datos
      const notification = await this.prisma.notification.create({
        data: {
          userId,
          title,
          body,
          payload: data,
        },
      });

      // Simular envío de push notification
      await this.sendPushNotification({
        userId,
        title,
        body,
        data: { ...data, notificationId: notification.id },
      });

      this.logger.log(`Push notification sent to user ${userId}`);

      return {
        success: true,
        notificationId: notification.id,
      };
    } catch (error) {
      this.logger.error(`Failed to send push notification: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * Simular envío de push notification
   * TODO: Implementar con Firebase Cloud Messaging
   */
  private async sendPushNotification(payload: PushNotificationJob): Promise<void> {
    // Simulación - en producción se usaría firebase-admin
    this.logger.debug(`[SIMULATED] Push notification to ${payload.userId}:`);
    this.logger.debug(`  Title: ${payload.title}`);
    this.logger.debug(`  Body: ${payload.body}`);
    this.logger.debug(`  Data: ${JSON.stringify(payload.data)}`);

    // Simular latencia de red
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Registrar en Action para auditoría
    await this.prisma.action.create({
      data: {
        type: 'PUSH',
        target: payload.userId,
        payload: {
          title: payload.title,
          body: payload.body,
          data: payload.data,
        },
        executed: true,
        executedAt: new Date(),
      },
    });
  }

  // ==================== Event Handlers ====================

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.debug(`Processing job ${job.id} of type ${job.name}...`);
  }

  @OnQueueCompleted()
  onCompleted(job: Job, result: any) {
    this.logger.debug(`Job ${job.id} completed with result: ${JSON.stringify(result)}`);
  }

  @OnQueueFailed()
  onFailed(job: Job, error: Error) {
    this.logger.error(`Job ${job.id} failed with error: ${error.message}`);
  }
}
