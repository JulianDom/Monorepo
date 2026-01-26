import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infra/database/prisma';
import {
  IChatRepository,
  CreateMessageData,
  ConversationData,
  ConversationMemberData,
  AuthorInfo,
} from '@core/application/ports/repositories';
import { MemberType, MessageType, ChatMessage, MessageAttachment } from '@shared/types';

/**
 * ChatRepository - Implementación Prisma
 *
 * Implementa el puerto IChatRepository usando Prisma como ORM.
 * Maneja el polimorfismo User/Admin para miembros y autores.
 */
@Injectable()
export class ChatRepository implements IChatRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ==================== Conversations ====================

  async findConversationById(id: string): Promise<ConversationData | null> {
    const conversation = await this.prisma.conversation.findFirst({
      where: { id, deletedAt: null },
    });

    if (!conversation) return null;

    return {
      id: conversation.id,
      type: conversation.type,
      title: conversation.title || undefined,
      picture: conversation.picture || undefined,
      createdAt: conversation.createdAt,
    };
  }

  async getConversationsForMember(memberId: string, memberType: MemberType): Promise<ConversationData[]> {
    const memberships = await this.prisma.conversationMember.findMany({
      where: {
        memberId,
        memberType,
        deletedAt: null,
      },
      include: {
        conversation: true,
      },
    });

    return memberships
      .filter((m) => m.conversation.deletedAt === null)
      .map((m) => ({
        id: m.conversation.id,
        type: m.conversation.type,
        title: m.conversation.title || undefined,
        picture: m.conversation.picture || undefined,
        createdAt: m.conversation.createdAt,
      }));
  }

  // ==================== Membership ====================

  async isMemberOfConversation(
    conversationId: string,
    memberId: string,
    memberType: MemberType,
  ): Promise<boolean> {
    const member = await this.prisma.conversationMember.findFirst({
      where: {
        conversationId,
        memberId,
        memberType,
        deletedAt: null,
      },
    });
    return !!member;
  }

  async getMembersOfConversation(conversationId: string): Promise<ConversationMemberData[]> {
    const members = await this.prisma.conversationMember.findMany({
      where: {
        conversationId,
        deletedAt: null,
      },
    });

    return members.map((m) => ({
      id: m.id,
      conversationId: m.conversationId,
      memberId: m.memberId,
      memberType: m.memberType as MemberType,
      role: m.role || undefined,
      lastReadAt: m.lastReadAt || undefined,
    }));
  }

  async updateLastReadAt(
    conversationId: string,
    memberId: string,
    memberType: MemberType,
  ): Promise<void> {
    await this.prisma.conversationMember.updateMany({
      where: {
        conversationId,
        memberId,
        memberType,
        deletedAt: null,
      },
      data: {
        lastReadAt: new Date(),
      },
    });
  }

  // ==================== Messages ====================

  async createMessage(data: CreateMessageData): Promise<ChatMessage> {
    const message = await this.prisma.message.create({
      data: {
        conversationId: data.conversationId,
        authorId: data.authorId,
        authorType: data.authorType,
        content: data.content,
        type: data.type || MessageType.TEXT,
        replyToId: data.replyToId,
        attachments: data.attachments as any,
      },
    });

    const author = await this.getAuthorInfo(data.authorId, data.authorType);

    return {
      id: message.id,
      conversationId: message.conversationId,
      authorId: message.authorId,
      authorType: message.authorType as MemberType,
      content: message.content,
      type: message.type as MessageType,
      read: message.read,
      replyToId: message.replyToId || undefined,
      attachments: message.attachments as unknown as MessageAttachment[] | undefined,
      createdAt: message.createdAt.toISOString(),
      author: author || undefined,
    };
  }

  async findMessageById(id: string): Promise<ChatMessage | null> {
    const message = await this.prisma.message.findFirst({
      where: { id, deletedAt: null },
    });

    if (!message) return null;

    const author = await this.getAuthorInfo(message.authorId, message.authorType as MemberType);

    return {
      id: message.id,
      conversationId: message.conversationId,
      authorId: message.authorId,
      authorType: message.authorType as MemberType,
      content: message.content,
      type: message.type as MessageType,
      read: message.read,
      replyToId: message.replyToId || undefined,
      attachments: message.attachments as unknown as MessageAttachment[] | undefined,
      createdAt: message.createdAt.toISOString(),
      author: author || undefined,
    };
  }

  async getMessages(
    conversationId: string,
    page = 1,
    limit = 50,
  ): Promise<{ messages: ChatMessage[]; total: number }> {
    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      this.prisma.message.findMany({
        where: { conversationId, deletedAt: null },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.message.count({
        where: { conversationId, deletedAt: null },
      }),
    ]);

    // Batch fetch authors to avoid N+1 query problem
    const authorsMap = await this.batchGetAuthors(messages);

    const messagesWithAuthors: ChatMessage[] = messages.map((msg) => {
      const authorKey = `${msg.authorType}:${msg.authorId}`;
      const author = authorsMap.get(authorKey);
      return {
        id: msg.id,
        conversationId: msg.conversationId,
        authorId: msg.authorId,
        authorType: msg.authorType as MemberType,
        content: msg.content,
        type: msg.type as MessageType,
        read: msg.read,
        replyToId: msg.replyToId || undefined,
        attachments: msg.attachments as unknown as MessageAttachment[] | undefined,
        createdAt: msg.createdAt.toISOString(),
        author: author || undefined,
      };
    });

    return {
      messages: messagesWithAuthors.reverse(),
      total,
    };
  }

  /**
   * Batch fetch authors to avoid N+1 queries
   * Groups authors by type and fetches them in 2 queries max (users + admins)
   */
  private async batchGetAuthors(
    messages: { authorId: string; authorType: string }[],
  ): Promise<Map<string, AuthorInfo>> {
    const authorsMap = new Map<string, AuthorInfo>();

    // Group author IDs by type
    const userIds = new Set<string>();
    const adminIds = new Set<string>();

    for (const msg of messages) {
      if (msg.authorType === MemberType.USER) {
        userIds.add(msg.authorId);
      } else if (msg.authorType === MemberType.ADMIN) {
        adminIds.add(msg.authorId);
      }
    }

    // Fetch all users and admins in parallel (max 2 queries)
    const [users, admins] = await Promise.all([
      userIds.size > 0
        ? this.prisma.user.findMany({
            where: { id: { in: Array.from(userIds) } },
            select: { id: true, username: true, picture: true },
          })
        : [],
      adminIds.size > 0
        ? this.prisma.administrator.findMany({
            where: { id: { in: Array.from(adminIds) } },
            select: { id: true, username: true },
          })
        : [],
    ]);

    // Build the map
    for (const user of users) {
      authorsMap.set(`${MemberType.USER}:${user.id}`, {
        id: user.id,
        username: user.username,
        picture: user.picture || undefined,
      });
    }

    for (const admin of admins) {
      authorsMap.set(`${MemberType.ADMIN}:${admin.id}`, {
        id: admin.id,
        username: admin.username,
      });
    }

    return authorsMap;
  }

  async markMessageAsRead(messageId: string): Promise<void> {
    await this.prisma.message.update({
      where: { id: messageId },
      data: { read: true },
    });
  }

  // ==================== Author Validation ====================

  async validateAuthorExists(authorId: string, authorType: MemberType): Promise<boolean> {
    if (authorType === MemberType.USER) {
      const user = await this.prisma.user.findFirst({
        where: { id: authorId, deletedAt: null },
      });
      return !!user;
    } else if (authorType === MemberType.ADMIN) {
      const admin = await this.prisma.administrator.findFirst({
        where: { id: authorId, deletedAt: null },
      });
      return !!admin;
    }
    return false;
  }

  async getAuthorInfo(authorId: string, authorType: MemberType): Promise<AuthorInfo | null> {
    if (authorType === MemberType.USER) {
      const user = await this.prisma.user.findUnique({
        where: { id: authorId },
        select: { id: true, username: true, picture: true },
      });
      if (!user) return null;
      return {
        id: user.id,
        username: user.username,
        picture: user.picture || undefined,
      };
    } else if (authorType === MemberType.ADMIN) {
      const admin = await this.prisma.administrator.findUnique({
        where: { id: authorId },
        select: { id: true, username: true },
      });
      if (!admin) return null;
      return {
        id: admin.id,
        username: admin.username,
      };
    }
    return null;
  }

  // ==================== User Status ====================

  async isUserOnline(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { online: true },
    });
    return user?.online ?? false;
  }

  async setUserOnline(userId: string, online: boolean): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { online },
    });
  }
}
