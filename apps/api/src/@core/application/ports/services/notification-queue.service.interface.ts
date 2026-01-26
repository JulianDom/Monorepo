/**
 * Puerto para servicio de cola de notificaciones
 *
 * Abstrae la implementación de la cola (BullMQ, RabbitMQ, etc.)
 * para que el dominio no dependa de infraestructura específica.
 */
export interface INotificationQueueService {
  /**
   * Encola una notificación de nuevo mensaje para un usuario
   */
  queueNewMessageNotification(data: {
    userId: string;
    messageId: string;
    conversationId: string;
    senderName: string;
    contentPreview: string;
  }): Promise<void>;
}

export const NOTIFICATION_QUEUE_SERVICE = Symbol('INotificationQueueService');
