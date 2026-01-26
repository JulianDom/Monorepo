import { MemberType, MessageType, ChatMessage, MessageAttachment } from '@shared/types';

/**
 * IChatRepository - Puerto de Repositorio de Chat
 *
 * Define el contrato para persistencia de conversaciones y mensajes.
 * Abstrae la implementación de Prisma del dominio.
 */

export interface CreateMessageData {
  conversationId: string;
  authorId: string;
  authorType: MemberType;
  content: string;
  type?: MessageType;
  replyToId?: string;
  attachments?: MessageAttachment[];
}

export interface ConversationData {
  id: string;
  type: string;
  title?: string;
  picture?: string;
  createdAt: Date;
}

export interface ConversationMemberData {
  id: string;
  conversationId: string;
  memberId: string;
  memberType: MemberType;
  role?: string;
  lastReadAt?: Date;
}

export interface AuthorInfo {
  id: string;
  username: string;
  picture?: string;
}

export interface IChatRepository {
  // Conversations
  findConversationById(id: string): Promise<ConversationData | null>;
  getConversationsForMember(memberId: string, memberType: MemberType): Promise<ConversationData[]>;

  // Membership
  isMemberOfConversation(conversationId: string, memberId: string, memberType: MemberType): Promise<boolean>;
  getMembersOfConversation(conversationId: string): Promise<ConversationMemberData[]>;
  updateLastReadAt(conversationId: string, memberId: string, memberType: MemberType): Promise<void>;

  // Messages
  createMessage(data: CreateMessageData): Promise<ChatMessage>;
  findMessageById(id: string): Promise<ChatMessage | null>;
  getMessages(conversationId: string, page?: number, limit?: number): Promise<{ messages: ChatMessage[]; total: number }>;
  markMessageAsRead(messageId: string): Promise<void>;

  // Author validation
  validateAuthorExists(authorId: string, authorType: MemberType): Promise<boolean>;
  getAuthorInfo(authorId: string, authorType: MemberType): Promise<AuthorInfo | null>;

  // User online status
  isUserOnline(userId: string): Promise<boolean>;
  setUserOnline(userId: string, online: boolean): Promise<void>;
}

export const CHAT_REPOSITORY = Symbol('IChatRepository');
