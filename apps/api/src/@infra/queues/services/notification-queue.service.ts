import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bullmq';
import { INotificationQueueService } from '@core/application/ports/services';

/**
 * NotificationQueueService
 *
 * Implementación del puerto INotificationQueueService usando BullMQ.
 */
@Injectable()
export class NotificationQueueService implements INotificationQueueService {
  constructor(
    @InjectQueue('notifications')
    private readonly notificationQueue: Queue,
  ) {}

  async queueNewMessageNotification(data: {
    userId: string;
    messageId: string;
    conversationId: string;
    senderName: string;
    contentPreview: string;
  }): Promise<void> {
    await this.notificationQueue.add(
      'new-message',
      {
        userId: data.userId,
        messageId: data.messageId,
        conversationId: data.conversationId,
        senderName: data.senderName,
        content: data.contentPreview,
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      },
    );
  }
}
