/**
 * Tipos para el Sistema de Chat
 */

import { ActorType } from './auth.types';

export enum ConversationType {
  INDIVIDUAL = 'INDIVIDUAL',
  GROUP = 'GROUP',
  AI = 'AI',
}

export enum MemberType {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export enum MessageType {
  TEXT = 'TEXT',
  FILE = 'FILE',
  INFO = 'INFO',
}

/**
 * Payload para enviar mensaje via WebSocket
 */
export interface SendMessagePayload {
  conversationId: string;
  content: string;
  type?: MessageType;
  replyToId?: string;
  attachments?: MessageAttachment[];
}

/**
 * Mensaje recibido del servidor
 */
export interface ChatMessage {
  id: string;
  conversationId: string;
  authorId: string;
  authorType: MemberType;
  content: string;
  type: MessageType;
  read: boolean;
  replyToId?: string;
  attachments?: MessageAttachment[];
  createdAt: string;
  author?: {
    id: string;
    username: string;
    picture?: string;
  };
}

/**
 * Adjunto de mensaje
 */
export interface MessageAttachment {
  url: string;
  type: 'image' | 'video' | 'audio' | 'document';
  name: string;
  size: number;
}

/**
 * Evento de typing
 */
export interface TypingPayload {
  conversationId: string;
  isTyping: boolean;
}

/**
 * Evento de lectura
 */
export interface ReadReceiptPayload {
  conversationId: string;
  messageId: string;
}

/**
 * Evento de usuario conectado/desconectado
 */
export interface UserPresencePayload {
  userId: string;
  userType: MemberType;
  online: boolean;
  lastSeen?: string;
}

/**
 * Socket autenticado con datos del actor
 */
export interface AuthenticatedSocket {
  id: string;
  actorId: string;
  actorType: ActorType;
  username: string;
  rooms: Set<string>;
}

/**
 * Respuesta de join a room
 */
export interface JoinRoomResponse {
  success: boolean;
  conversationId: string;
  error?: string;
}

/**
 * Eventos del servidor al cliente
 */
export interface ServerToClientEvents {
  'message:new': (message: ChatMessage) => void;
  'message:updated': (message: ChatMessage) => void;
  'message:deleted': (data: { messageId: string; conversationId: string }) => void;
  'typing:start': (data: { conversationId: string; userId: string; username: string }) => void;
  'typing:stop': (data: { conversationId: string; userId: string }) => void;
  'user:online': (data: UserPresencePayload) => void;
  'user:offline': (data: UserPresencePayload) => void;
  'read:receipt': (data: { conversationId: string; userId: string; messageId: string }) => void;
  error: (data: { message: string; code?: string }) => void;
}

/**
 * Eventos del cliente al servidor
 */
export interface ClientToServerEvents {
  'room:join': (conversationId: string, callback: (response: JoinRoomResponse) => void) => void;
  'room:leave': (conversationId: string) => void;
  'message:send': (payload: SendMessagePayload, callback: (response: { success: boolean; message?: ChatMessage; error?: string }) => void) => void;
  'typing:start': (conversationId: string) => void;
  'typing:stop': (conversationId: string) => void;
  'message:read': (payload: ReadReceiptPayload) => void;
}
