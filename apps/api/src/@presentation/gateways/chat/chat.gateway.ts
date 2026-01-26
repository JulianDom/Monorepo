import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@infra/database/prisma';
import { getJwtSecret } from '@shared/config';
import {
  ActorType,
  JwtPayload,
  MemberType,
  SendMessagePayload,
  ChatMessage,
  ServerToClientEvents,
  ClientToServerEvents,
  JoinRoomResponse,
  ReadReceiptPayload,
} from '@shared/types';
import { ChatService } from './chat.service';

interface AuthenticatedSocket extends Socket {
  data: {
    actorId: string;
    actorType: ActorType;
    username: string;
  };
}

/**
 * ChatGateway
 *
 * Gateway de WebSocket para comunicación en tiempo real.
 * Maneja autenticación JWT, rooms por conversación, y eventos de chat.
 *
 * Eventos:
 * - room:join - Unirse a una conversación
 * - room:leave - Salir de una conversación
 * - message:send - Enviar mensaje
 * - typing:start/stop - Indicadores de escritura
 * - message:read - Marcar mensaje como leído
 */
@WebSocketGateway({
  namespace: '/chat',
  cors: {
    origin: process.env['CORS_ORIGIN'] || 'http://localhost:3000',
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server<ClientToServerEvents, ServerToClientEvents>;

  private readonly logger = new Logger(ChatGateway.name);
  private connectedUsers: Map<string, Set<string>> = new Map(); // actorId -> Set<socketId>

  // Memory limits to prevent unbounded growth
  private readonly MAX_CONNECTIONS_PER_USER = 5;
  private readonly MAX_TOTAL_USERS = 10000;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly chatService: ChatService,
  ) {}

  afterInit() {
    this.logger.log('ChatGateway initialized');
  }

  /**
   * Autenticación JWT en conexión
   */
  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token = this.extractToken(client);
      if (!token) {
        this.logger.warn(`Connection rejected: No token provided (${client.id})`);
        client.emit('error', { message: 'Authentication required', code: 'AUTH_REQUIRED' });
        client.disconnect();
        return;
      }

      const payload = await this.verifyToken(token);
      if (!payload) {
        this.logger.warn(`Connection rejected: Invalid token (${client.id})`);
        client.emit('error', { message: 'Invalid token', code: 'INVALID_TOKEN' });
        client.disconnect();
        return;
      }

      // Almacenar datos del actor en el socket
      client.data.actorId = payload.sub;
      client.data.actorType = payload.type;
      client.data.username = payload.username;

      // Registrar conexión (with memory limits)
      const connectionAdded = this.addConnection(payload.sub, client.id);
      if (!connectionAdded) {
        this.logger.warn(`Connection rejected: Server at capacity (${client.id})`);
        client.emit('error', { message: 'Server at capacity', code: 'SERVER_FULL' });
        client.disconnect();
        return;
      }

      // Actualizar estado online si es USER
      if (payload.type === ActorType.USER) {
        await this.prisma.user.update({
          where: { id: payload.sub },
          data: { online: true },
        });
      }

      // Notificar a otros usuarios
      this.server.emit('user:online', {
        userId: payload.sub,
        userType: payload.type === ActorType.USER ? MemberType.USER : MemberType.ADMIN,
        online: true,
      });

      this.logger.log(`Client connected: ${client.id} (${payload.username})`);
    } catch (error) {
      this.logger.error(`Connection error: ${(error as Error).message}`);
      client.emit('error', { message: 'Authentication failed', code: 'AUTH_FAILED' });
      client.disconnect();
    }
  }

  /**
   * Manejo de desconexión
   */
  async handleDisconnect(client: AuthenticatedSocket) {
    const { actorId, actorType, username } = client.data || {};

    if (actorId) {
      this.removeConnection(actorId, client.id);

      // Si no hay más conexiones, marcar como offline
      if (!this.hasConnections(actorId)) {
        if (actorType === ActorType.USER) {
          await this.prisma.user.update({
            where: { id: actorId },
            data: { online: false },
          });
        }

        this.server.emit('user:offline', {
          userId: actorId,
          userType: actorType === ActorType.USER ? MemberType.USER : MemberType.ADMIN,
          online: false,
          lastSeen: new Date().toISOString(),
        });
      }

      this.logger.log(`Client disconnected: ${client.id} (${username})`);
    }
  }

  /**
   * Unirse a una room de conversación
   */
  @SubscribeMessage('room:join')
  async handleJoinRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() conversationId: string,
  ): Promise<JoinRoomResponse> {
    try {
      const { actorId, actorType } = client.data;

      // Verificar que el actor es miembro de la conversación
      const isMember = await this.chatService.isMemberOfConversation(
        conversationId,
        actorId,
        actorType === ActorType.USER ? MemberType.USER : MemberType.ADMIN,
      );

      if (!isMember) {
        return {
          success: false,
          conversationId,
          error: 'Not a member of this conversation',
        };
      }

      // Unirse a la room
      const roomName = `conversation:${conversationId}`;
      await client.join(roomName);

      this.logger.debug(`${client.data.username} joined room ${roomName}`);

      return { success: true, conversationId };
    } catch (error) {
      this.logger.error(`Error joining room: ${(error as Error).message}`);
      return {
        success: false,
        conversationId,
        error: 'Failed to join room',
      };
    }
  }

  /**
   * Salir de una room
   */
  @SubscribeMessage('room:leave')
  async handleLeaveRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() conversationId: string,
  ) {
    const roomName = `conversation:${conversationId}`;
    await client.leave(roomName);
    this.logger.debug(`${client.data.username} left room ${roomName}`);
  }

  /**
   * Enviar mensaje
   */
  @SubscribeMessage('message:send')
  async handleSendMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: SendMessagePayload,
  ): Promise<{ success: boolean; message?: ChatMessage; error?: string }> {
    try {
      const { actorId, actorType } = client.data;

      // Crear mensaje usando el servicio
      const message = await this.chatService.createMessage({
        conversationId: payload.conversationId,
        authorId: actorId,
        authorType: actorType === ActorType.USER ? MemberType.USER : MemberType.ADMIN,
        content: payload.content,
        type: payload.type,
        replyToId: payload.replyToId,
        attachments: payload.attachments,
      });

      // Emitir a todos en la room (excepto el remitente)
      const roomName = `conversation:${payload.conversationId}`;
      client.to(roomName).emit('message:new', message);

      this.logger.debug(`Message sent to ${roomName} by ${client.data.username}`);

      return { success: true, message };
    } catch (error) {
      this.logger.error(`Error sending message: ${(error as Error).message}`);
      return { success: false, error: 'Failed to send message' };
    }
  }

  /**
   * Indicador de escritura - inicio
   */
  @SubscribeMessage('typing:start')
  handleTypingStart(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() conversationId: string,
  ) {
    const roomName = `conversation:${conversationId}`;
    client.to(roomName).emit('typing:start', {
      conversationId,
      userId: client.data.actorId,
      username: client.data.username,
    });
  }

  /**
   * Indicador de escritura - fin
   */
  @SubscribeMessage('typing:stop')
  handleTypingStop(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() conversationId: string,
  ) {
    const roomName = `conversation:${conversationId}`;
    client.to(roomName).emit('typing:stop', {
      conversationId,
      userId: client.data.actorId,
    });
  }

  /**
   * Marcar mensaje como leído
   */
  @SubscribeMessage('message:read')
  async handleMessageRead(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: ReadReceiptPayload,
  ) {
    try {
      const { actorId, actorType } = client.data;

      await this.chatService.markAsRead(
        payload.conversationId,
        actorId,
        actorType === ActorType.USER ? MemberType.USER : MemberType.ADMIN,
        payload.messageId,
      );

      // Emitir receipt a la room
      const roomName = `conversation:${payload.conversationId}`;
      client.to(roomName).emit('read:receipt', {
        conversationId: payload.conversationId,
        userId: actorId,
        messageId: payload.messageId,
      });
    } catch (error) {
      this.logger.error(`Error marking message as read: ${(error as Error).message}`);
    }
  }

  // ==================== Helpers ====================

  private extractToken(client: Socket): string | null {
    // Intentar obtener del header Authorization
    const authHeader = client.handshake.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // Intentar obtener de query params
    const token = client.handshake.auth?.['token'] || client.handshake.query?.['token'];
    return token as string || null;
  }

  private async verifyToken(token: string): Promise<JwtPayload | null> {
    try {
      const secret = getJwtSecret(this.configService);
      return await this.jwtService.verifyAsync<JwtPayload>(token, { secret });
    } catch {
      return null;
    }
  }

  private addConnection(actorId: string, socketId: string): boolean {
    // Check total users limit
    if (!this.connectedUsers.has(actorId) && this.connectedUsers.size >= this.MAX_TOTAL_USERS) {
      this.logger.warn(`Max total users (${this.MAX_TOTAL_USERS}) reached, rejecting new user ${actorId}`);
      return false;
    }

    if (!this.connectedUsers.has(actorId)) {
      this.connectedUsers.set(actorId, new Set());
    }

    const connections = this.connectedUsers.get(actorId)!;

    // Check per-user connection limit
    if (connections.size >= this.MAX_CONNECTIONS_PER_USER) {
      // Remove oldest connection (first in set) to make room for new one
      const oldestSocketId = connections.values().next().value;
      if (oldestSocketId) {
        connections.delete(oldestSocketId);
        this.logger.debug(`Removed oldest connection ${oldestSocketId} for user ${actorId} (limit reached)`);
      }
    }

    connections.add(socketId);
    return true;
  }

  private removeConnection(actorId: string, socketId: string) {
    const connections = this.connectedUsers.get(actorId);
    if (connections) {
      connections.delete(socketId);
      if (connections.size === 0) {
        this.connectedUsers.delete(actorId);
      }
    }
  }

  private hasConnections(actorId: string): boolean {
    return (this.connectedUsers.get(actorId)?.size || 0) > 0;
  }

  /**
   * Verificar si un usuario está online
   */
  isUserOnline(actorId: string): boolean {
    return this.hasConnections(actorId);
  }

  /**
   * Emitir evento a un usuario específico (todas sus conexiones)
   */
  emitToUser<K extends keyof ServerToClientEvents>(
    actorId: string,
    event: K,
    ...args: Parameters<ServerToClientEvents[K]>
  ) {
    const connections = this.connectedUsers.get(actorId);
    if (connections) {
      connections.forEach((socketId) => {
        this.server.to(socketId).emit(event, ...args);
      });
    }
  }
}
