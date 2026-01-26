import { Injectable, Inject } from '@nestjs/common';
import {
  IChatRepository,
  CHAT_REPOSITORY,
} from '@core/application/ports/repositories';
import {
  INotificationQueueService,
  NOTIFICATION_QUEUE_SERVICE,
} from '@core/application/ports/services';
import { SendMessageUseCase, GetMessagesUseCase } from '@core/application/use-cases/chat';
import { MemberType, MessageType, ChatMessage, MessageAttachment } from '@shared/types';

interface SendMessageDto {
  conversationId: string;
  authorId: string;
  authorType: MemberType;
  content: string;
  type?: MessageType;
  replyToId?: string;
  attachments?: MessageAttachment[];
}

/**
 * ChatService
 *
 * Servicio de aplicación para gestión de mensajes y conversaciones.
 * Delega la lógica de negocio a Use Cases en @core.
 *
 * Este servicio actúa como adaptador entre la capa de presentación
 * (Gateway WebSocket) y los casos de uso del dominio.
 */
@Injectable()
export class ChatService {
  private readonly sendMessageUseCase: SendMessageUseCase;
  private readonly getMessagesUseCase: GetMessagesUseCase;

  constructor(
    @Inject(CHAT_REPOSITORY)
    private readonly chatRepository: IChatRepository,
    @Inject(NOTIFICATION_QUEUE_SERVICE)
    private readonly notificationQueue: INotificationQueueService,
  ) {
    // Crear instancias de Use Cases con las dependencias inyectadas
    this.sendMessageUseCase = new SendMessageUseCase(
      this.chatRepository,
      this.notificationQueue,
    );
    this.getMessagesUseCase = new GetMessagesUseCase(this.chatRepository);
  }

  /**
   * Verifica si un actor es miembro de una conversación
   */
  async isMemberOfConversation(
    conversationId: string,
    memberId: string,
    memberType: MemberType,
  ): Promise<boolean> {
    return this.chatRepository.isMemberOfConversation(conversationId, memberId, memberType);
  }

  /**
   * Crear mensaje delegando al Use Case
   */
  async createMessage(dto: SendMessageDto): Promise<ChatMessage> {
    return this.sendMessageUseCase.execute({
      conversationId: dto.conversationId,
      authorId: dto.authorId,
      authorType: dto.authorType,
      content: dto.content,
      type: dto.type,
      replyToId: dto.replyToId,
      attachments: dto.attachments,
    });
  }

  /**
   * Marcar mensajes como leídos y actualizar lastReadAt
   */
  async markAsRead(
    conversationId: string,
    memberId: string,
    memberType: MemberType,
    messageId: string,
  ): Promise<void> {
    // Actualizar lastReadAt del miembro
    await this.chatRepository.updateLastReadAt(conversationId, memberId, memberType);

    // Marcar mensaje como leído
    await this.chatRepository.markMessageAsRead(messageId);
  }

  /**
   * Obtener mensajes delegando al Use Case
   */
  async getMessages(
    conversationId: string,
    memberId: string,
    memberType: MemberType,
    page: number = 1,
    limit: number = 50,
  ): Promise<{ messages: ChatMessage[]; total: number; hasMore: boolean }> {
    return this.getMessagesUseCase.execute({
      conversationId,
      memberId,
      memberType,
      page,
      limit,
    });
  }

  /**
   * Obtener conversaciones de un actor
   */
  async getConversations(memberId: string, memberType: MemberType): Promise<any[]> {
    const conversations = await this.chatRepository.getConversationsForMember(memberId, memberType);

    return conversations.map((conv) => ({
      id: conv.id,
      type: conv.type,
      title: conv.title,
      picture: conv.picture,
      createdAt: conv.createdAt,
    }));
  }
}
