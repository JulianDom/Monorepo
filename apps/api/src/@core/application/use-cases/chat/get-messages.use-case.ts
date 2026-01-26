import { IChatRepository } from '@core/application/ports/repositories';
import { MemberType, ChatMessage } from '@shared/types';
import { ForbiddenOperationException } from '@shared/exceptions';

/**
 * DTO de entrada para obtener mensajes
 */
export interface GetMessagesInput {
  conversationId: string;
  memberId: string;
  memberType: MemberType;
  page?: number;
  limit?: number;
}

/**
 * DTO de salida para obtener mensajes
 */
export interface GetMessagesOutput {
  messages: ChatMessage[];
  total: number;
  hasMore: boolean;
}

/**
 * GetMessagesUseCase
 *
 * Caso de uso para obtener mensajes de una conversación con paginación.
 */
export class GetMessagesUseCase {
  constructor(private readonly chatRepository: IChatRepository) {}

  async execute(input: GetMessagesInput): Promise<GetMessagesOutput> {
    const { conversationId, memberId, memberType, page = 1, limit = 50 } = input;

    // Verificar membresía
    const isMember = await this.chatRepository.isMemberOfConversation(
      conversationId,
      memberId,
      memberType,
    );
    if (!isMember) {
      throw new ForbiddenOperationException('Not a member of this conversation');
    }

    const result = await this.chatRepository.getMessages(conversationId, page, limit);
    const skip = (page - 1) * limit;

    return {
      messages: result.messages,
      total: result.total,
      hasMore: skip + result.messages.length < result.total,
    };
  }
}
