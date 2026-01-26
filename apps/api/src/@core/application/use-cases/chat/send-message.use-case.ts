import { IChatRepository } from '@core/application/ports/repositories';
import { INotificationQueueService } from '@core/application/ports/services';
import { MemberType, MessageType, ChatMessage, MessageAttachment } from '@shared/types';
import {
  EntityNotFoundException,
  ForbiddenOperationException,
  BusinessValidationException,
} from '@shared/exceptions';

/**
 * DTO de entrada para enviar mensaje
 */
export interface SendMessageInput {
  conversationId: string;
  authorId: string;
  authorType: MemberType;
  content: string;
  type?: MessageType;
  replyToId?: string;
  attachments?: MessageAttachment[];
}

/**
 * SendMessageUseCase
 *
 * Caso de uso para enviar mensajes en una conversación.
 * Contiene la lógica de negocio: validar membresía, crear mensaje, notificar.
 */
export class SendMessageUseCase {
  constructor(
    private readonly chatRepository: IChatRepository,
    private readonly notificationQueue: INotificationQueueService,
  ) {}

  async execute(input: SendMessageInput): Promise<ChatMessage> {
    const { conversationId, authorId, authorType, content, type, replyToId, attachments } = input;

    // 1. Verificar que la conversación existe
    const conversation = await this.chatRepository.findConversationById(conversationId);
    if (!conversation) {
      throw new EntityNotFoundException('Conversation', conversationId);
    }

    // 2. Verificar que el autor es miembro de la conversación
    const isMember = await this.chatRepository.isMemberOfConversation(
      conversationId,
      authorId,
      authorType,
    );
    if (!isMember) {
      throw new ForbiddenOperationException('Author is not a member of this conversation');
    }

    // 3. Validar que el autor existe
    const authorExists = await this.chatRepository.validateAuthorExists(authorId, authorType);
    if (!authorExists) {
      throw new EntityNotFoundException('Author', authorId);
    }

    // 4. Verificar replyTo si existe
    if (replyToId) {
      const replyMessage = await this.chatRepository.findMessageById(replyToId);
      if (!replyMessage || replyMessage.conversationId !== conversationId) {
        throw new BusinessValidationException('Reply message not found in this conversation');
      }
    }

    // 5. Crear mensaje
    const message = await this.chatRepository.createMessage({
      conversationId,
      authorId,
      authorType,
      content,
      type: type || MessageType.TEXT,
      replyToId,
      attachments,
    });

    // 6. Encolar notificaciones para miembros offline
    await this.queueNotifications(conversationId, authorId, authorType, message.id, content);

    return message;
  }

  private async queueNotifications(
    conversationId: string,
    senderId: string,
    senderType: MemberType,
    messageId: string,
    content: string,
  ): Promise<void> {
    const members = await this.chatRepository.getMembersOfConversation(conversationId);
    const otherMembers = members.filter(
      (m) => !(m.memberId === senderId && m.memberType === senderType),
    );

    const sender = await this.chatRepository.getAuthorInfo(senderId, senderType);
    if (!sender) return;

    for (const member of otherMembers) {
      if (member.memberType === MemberType.USER) {
        const isOnline = await this.chatRepository.isUserOnline(member.memberId);

        if (!isOnline) {
          await this.notificationQueue.queueNewMessageNotification({
            userId: member.memberId,
            messageId,
            conversationId,
            senderName: sender.username,
            contentPreview: content.substring(0, 100),
          });
        }
      }
    }
  }
}
