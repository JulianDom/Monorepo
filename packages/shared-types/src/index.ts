/**
 * Tipos compartidos del framework
 * Tipos comunes utilizados entre diferentes aplicaciones
 */

// ==================== TIPOS DE ADMINISTRADORES ====================

/**
 * Administrador - coincide con AdministratorResponseDto de la API
 */
export interface Admin {
  id: string;
  fullName: string;
  email: string;
  username: string;
  enabled: boolean;
}



/**
 * Administrador con detalles - coincide con AdministratorDetailResponseDto
 */
export interface AdminDetail extends Admin {
  modules?: Record<string, { read: boolean; write: boolean; delete: boolean }> | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Respuesta de lista paginada de la API
 */
export interface AdminListResponse {
  data: Admin[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Parámetros de query para listar admins
 */
export interface AdminListParams {
  page?: number;
  limit?: number;
  enabledOnly?: boolean;
}

/**
 * DTO para crear administrador
 */
export interface CreateAdminDTO {
  fullName: string;
  email: string;
  username: string;
  password: string;
  modules?: Record<string, { read: boolean; write: boolean; delete: boolean }>;
}

/**
 * DTO para actualizar administrador
 */
export interface UpdateAdminDTO {
  fullName?: string;
  modules?: Record<string, { read: boolean; write: boolean; delete: boolean }>;
}

/**
 * DTO para cambiar estado
 */
export interface ToggleStatusDTO {
  enable: boolean;
}

export type AdminFilterStatus = 'all' | 'enabled' | 'disabled';

// ==================== TIPOS DE ENTIDADES DE DOMINIO ====================

/**
 * Módulos de permisos de administrador
 */
export interface AdminModules {
  [module: string]: {
    read: boolean;
    write: boolean;
    delete: boolean;
  };
}

// ==================== ADMINISTRATOR ENTITY ====================

/**
 * Propiedades base del administrador (sin id)
 */
export interface AdministratorPropsBase {
  fullName: string;
  emailAddress: string;
  username: string;
  password: string;
  enabled?: boolean;
  refreshToken?: string | null;
  recoverPasswordID?: string | null;
  modules?: AdminModules | null;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

/**
 * Propiedades del administrador con id opcional (para compatibilidad)
 */
export interface AdministratorProps extends AdministratorPropsBase {
  id?: string;
}

/**
 * Propiedades del administrador persistido (id requerido)
 */
export interface PersistedAdministratorProps extends AdministratorPropsBase {
  id: string;
}

// ==================== OPERATIVE USER ENTITY ====================

/**
 * Propiedades base del usuario operativo (sin id)
 */
export interface OperativeUserPropsBase {
  id?: string;
  fullName: string;
  emailAddress: string;
  username: string;
  password: string;
  enabled?: boolean;
  refreshToken?: string | null;
  recoverPasswordID?: string | null;
  createdById?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

/**
 * Propiedades del usuario operativo con id opcional (para compatibilidad)
 */
export interface OperativeUserProps extends OperativeUserPropsBase {
  id?: string;
}

/**
 * Propiedades del usuario operativo persistido (id requerido)
 */
export interface PersistedOperativeUserProps extends OperativeUserPropsBase {
  id: string;
}

// ==================== USER ENTITY ====================

/**
 * Ubicación geográfica
 */
export interface Location {
  lat: number;
  lng: number;
}

/**
 * Propiedades base del usuario (sin id)
 */
export interface UserPropsBase {
  fullName: string;
  emailAddress: string;
  username: string;
  password: string;
  online?: boolean;
  language?: string;
  picture?: string | null;
  location?: Location | null;
  biometricChallenge?: string | null;
  registrationInfo?: Record<string, any> | null;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

/**
 * Propiedades del usuario con id opcional (para compatibilidad)
 */
export interface UserProps extends UserPropsBase {
  id?: string;
}

/**
 * Propiedades del usuario persistido (id requerido)
 */
export interface PersistedUserProps extends UserPropsBase {
  id: string;
}

// ==================== TIPOS COMUNES ====================

/**
 * Estados comunes de entidades
 */
export type EntityStatus = 'active' | 'inactive' | 'deleted';
export type UserStatus = 'online' | 'offline';
export type Language = 'es' | 'en' | 'pt' | 'fr';

/**
 * Interface base para entidades con timestamps
 */
export interface Timestamps {
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

/**
 * Interface base para entidades con soft delete
 */
export interface SoftDeletable {
  deletedAt?: Date | null;
  isDeleted: boolean;
}

/**
 * Interface base para entidades habilitables
 */
export interface Enableable {
  enabled: boolean;
  isActive: boolean;
}

// ==================== DTOS PARA USUARIOS OPERATIVOS ====================

/**
 * DTO para crear usuario operativo (según API)
 * Nota: API usa 'email', la respuesta devuelve 'emailAddress'
 */
export interface CreateOperativeUserDTO {
  fullName: string;
  email: string;
  username: string;
  password: string;
}

/**
 * DTO para actualizar usuario operativo (según API)
 * Nota: API usa 'email', la respuesta devuelve 'emailAddress'
 */
export interface UpdateOperativeUserDTO {
  fullName?: string;
  email?: string;
  username?: string;
}

/**
 * DTO para cambiar estado de usuario operativo
 */
export interface ToggleOperativeUserStatusDTO {
  enable: boolean;
}

/**
 * Respuesta de lista paginada de usuarios operativos
 */
export interface OperativeUserListResponse {
  data: OperativeUserProps[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Parámetros de query para listar usuarios operativos
 */
export interface OperativeUserListParams {
  page?: number;
  limit?: number;
  enabledOnly?: boolean;
  createdById?: string;
}

// ==================== DTOS PARA USUARIOS REGULARES ====================

/**
 * DTO para crear usuario
 */
export interface CreateUserDTO {
  fullName: string;
  emailAddress: string;
  username: string;
  password: string;
  language?: Language;
  picture?: string | null;
  location?: Location | null;
  registrationInfo?: Record<string, any> | null;
}

/**
 * DTO para actualizar usuario
 */
export interface UpdateUserDTO {
  fullName?: string;
  picture?: string | null;
  language?: Language;
  location?: Location | null;
  online?: boolean;
}

/**
 * DTO para actualizar ubicación de usuario
 */
export interface UpdateUserLocationDTO {
  location: Location;
}

/**
 * DTO para cambiar contraseña de usuario
 */
export interface ChangeUserPasswordDTO {
  currentPassword: string;
  newPassword: string;
}

/**
 * Respuesta de lista paginada de usuarios
 */
export interface UserListResponse {
  data: UserProps[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Parámetros de query para listar usuarios
 */
export interface UserListParams {
  page?: number;
  limit?: number;
  onlineOnly?: boolean;
  language?: Language;
}

/**
 * DTO para autenticación
 */
export interface LoginDTO {
  username: string;
  password: string;
}

/**
 * Respuesta de autenticación
 */
export interface LoginResponse {
  user: Omit<UserProps, 'password'>;
  accessToken: string;
  refreshToken: string;
}

/**
 * DTO para refresh token
 */
export interface RefreshTokenDTO {
  refreshToken: string;
}

/**
 * Respuesta de refresh token
 */
export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

// ==================== CHAT SYSTEM ====================

/**
 * Tipos de conversación
 */
export type ConversationType = 'INDIVIDUAL' | 'GROUP' | 'AI';

/**
 * Tipos de miembro
 */
export type MemberType = 'USER' | 'ADMIN';

/**
 * Tipos de mensaje
 */
export type MessageType = 'TEXT' | 'FILE' | 'INFO';

/**
 * Conversación
 */
export interface Conversation {
  id: string;
  type: ConversationType;
  title?: string;
  picture?: string;
  metadata?: Record<string, any> | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

/**
 * Miembro de conversación
 */
export interface ConversationMember {
  id: string;
  conversationId: string;
  memberId: string;
  memberType: MemberType;
  role?: string;
  lastReadAt?: Date;
  mutedUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

/**
 * Adjunto de mensaje
 */
export interface MessageAttachment {
  url: string;
  type: string;
  name: string;
  size: number;
}

/**
 * Mensaje
 */
export interface Message {
  id: string;
  conversationId: string;
  authorId: string;
  authorType: MemberType;
  content: string;
  type: MessageType;
  read: boolean;
  replyToId?: string;
  attachments?: MessageAttachment[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

/**
 * DTO para crear conversación
 */
export interface CreateConversationDTO {
  type: ConversationType;
  title?: string;
  picture?: string;
  metadata?: Record<string, any>;
  memberIds: string[];
  memberTypes: MemberType[];
}

/**
 * DTO para enviar mensaje
 */
export interface SendMessageDTO {
  conversationId: string;
  content: string;
  type?: MessageType;
  replyToId?: string;
  attachments?: MessageAttachment[];
}

/**
 * Respuesta de lista de conversaciones
 */
export interface ConversationListResponse {
  data: Conversation[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Respuesta de lista de mensajes
 */
export interface MessageListResponse {
  data: Message[];
  total: number;
  page: number;
  limit: number;
}

// ==================== AUDIT LOG ====================

/**
 * Niveles de log
 */
export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL';

/**
 * Tipos de actor
 */
export type ActorType = 'USER' | 'ADMIN' | 'OPERATIVE_USER' | 'SYSTEM';

/**
 * Audit Log
 */
export interface AuditLog {
  id: string;
  action: string;
  level: LogLevel;
  message: string;
  actorId?: string;
  actorType?: ActorType;
  ip?: string;
  userAgent?: string;
  meta?: Record<string, any> | null;
  createdAt: Date;
}

/**
 * DTO para crear audit log
 */
export interface CreateAuditLogDTO {
  action: string;
  level?: LogLevel;
  message: string;
  actorId?: string;
  actorType?: ActorType;
  ip?: string;
  userAgent?: string;
  meta?: Record<string, any>;
}

/**
 * Respuesta de lista de audit logs
 */
export interface AuditLogListResponse {
  data: AuditLog[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Parámetros de query para audit logs
 */
export interface AuditLogListParams {
  page?: number;
  limit?: number;
  action?: string;
  level?: LogLevel;
  actorType?: ActorType;
  actorId?: string;
  startDate?: Date;
  endDate?: Date;
}

// ==================== ACTIONS & NOTIFICATIONS ====================

/**
 * Tipos de acción
 */
export type ActionType = 'PUSH' | 'SOCKET' | 'DEEP_LINK' | 'EMAIL' | 'SMS';

/**
 * Acción
 */
export interface Action {
  id: string;
  type: ActionType;
  target: string;
  payload: Record<string, any>;
  executed: boolean;
  executedAt?: Date;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

/**
 * DTO para crear acción
 */
export interface CreateActionDTO {
  type: ActionType;
  target: string;
  payload: Record<string, any>;
}

/**
 * Notificación
 */
export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  picture?: string;
  payload?: Record<string, any> | null;
  read: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

/**
 * DTO para crear notificación
 */
export interface CreateNotificationDTO {
  userId: string;
  title: string;
  body: string;
  picture?: string;
  payload?: Record<string, any>;
}

/**
 * DTO para marcar notificación como leída
 */
export interface MarkNotificationReadDTO {
  notificationIds: string[];
}

/**
 * Respuesta de lista de notificaciones
 */
export interface NotificationListResponse {
  data: Notification[];
  total: number;
  page: number;
  limit: number;
  unreadCount: number;
}

/**
 * Parámetros de query para notificaciones
 */
export interface NotificationListParams {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}

// ==================== PRODUCTS & STORES ====================

/**
 * Producto
 */
export interface Product {
  id: string;
  name: string;
  description?: string;
  brand?: string;
  presentation: string;
  price: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: Date | null;
}

/**
 * Producto con detalles adicionales
 */
export interface ProductDetail extends Product {
  createdAt: string;
  updatedAt: string;
}

/**
 * Local/Store (Punto de venta)
 * Campos según Prisma: name, locality, zone?
 */
export interface Store {
  id: string;
  name: string;
  locality: string;
  zone?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: Date | null;
}

/**
 * Relevamiento de precio con relaciones (según API)
 */
export interface PriceRecord {
  id: string;
  productId: string;
  storeId: string;
  operativeUserId: string;
  price: number;
  recordedAt: string;
  notes?: string;
  photoUrl?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: Date | null;
  // Relaciones pobladas por la API
  product?: {
    id: string;
    name: string;
    presentation: string;
  };
  store?: {
    id: string;
    name: string;
    locality: string;
  };
  operativeUser?: {
    id: string;
    fullName: string;
  };
}

/**
 * DTO para crear producto
 */
export interface CreateProductDTO {
  name: string;
  description?: string;
  brand?: string;
  presentation: string;
  price: number;
}

/**
 * DTO para actualizar producto (según API)
 * Nota: active se cambia via toggleStatus endpoint
 */
export interface UpdateProductDTO {
  name?: string;
  description?: string;
  brand?: string;
  presentation?: string;
  price?: number;
}

/**
 * DTO para crear local (según API)
 */
export interface CreateStoreDTO {
  name: string;
  locality: string;
  zone?: string;
}

/**
 * DTO para actualizar local (según API)
 */
export interface UpdateStoreDTO {
  name?: string;
  locality?: string;
  zone?: string;
}

/**
 * DTO para crear relevamiento de precio
 */
export interface CreatePriceRecordDTO {
  productId: string;
  storeId: string;
  price: number;
  recordedAt?: Date;
  notes?: string;
  photoUrl?: string;
}

/**
 * DTO para actualizar relevamiento de precio
 */
export interface UpdatePriceRecordDTO {
  price?: number;
  recordedAt?: Date;
  notes?: string;
  photoUrl?: string;
}

/**
 * Respuestas de lista
 */
export interface ProductListResponse {
  data: Product[];
  total: number;
  page: number;
  limit: number;
}

export interface StoreListResponse {
  data: Store[];
  total: number;
  page: number;
  limit: number;
}

export interface PriceRecordListResponse {
  data: PriceRecord[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Parámetros de query
 */
export interface ProductListParams {
  page?: number;
  limit?: number;
  enabledOnly?: boolean;
  brand?: string;
  search?: string;
}

export interface StoreListParams {
  page?: number;
  limit?: number;
  activeOnly?: boolean;
  locality?: string;
  zone?: string;
  search?: string;
}

export interface PriceRecordListParams {
  page?: number;
  limit?: number;
  productId?: string;
  storeId?: string;
  operativeUserId?: string;
  startDate?: Date;
  endDate?: Date;
}
