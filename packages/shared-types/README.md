# @framework/shared-types

Paquete de tipos compartidos del framework. Contiene todas las interfaces y tipos comunes utilizados entre las diferentes aplicaciones del proyecto.

## Instalación

```bash
pnpm add @framework/shared-types
```

## Uso

### Importar tipos específicos

```typescript
import type {
  Admin,
  CreateAdminDTO,
  UpdateAdminDTO,
  User,
  CreateUserDTO,
  OperativeUser,
  CreateOperativeUserDTO,
  Conversation,
  Message,
  Product,
  Store,
  PriceRecord
} from '@framework/shared-types';
```

### Importar todos los tipos

```typescript
import * as SharedTypes from '@framework/shared-types';
```

## Tipos Disponibles

### 📋 Administradores

- `Admin` - Interfaz básica de administrador
- `AdminDetail` - Administrador con detalles extendidos
- `CreateAdminDTO` - DTO para crear administrador
- `UpdateAdminDTO` - DTO para actualizar administrador
- `ToggleStatusDTO` - DTO para cambiar estado
- `AdminListResponse` - Respuesta paginada de administradores
- `AdminListParams` - Parámetros de listado
- `AdminFilterStatus` - Tipo de filtro de estado

### 👥 Usuarios Operativos

- `OperativeUserProps` - Propiedades de usuario operativo
- `CreateOperativeUserDTO` - DTO para crear usuario operativo
- `UpdateOperativeUserDTO` - DTO para actualizar usuario operativo
- `ToggleOperativeUserStatusDTO` - DTO para cambiar estado
- `OperativeUserListResponse` - Respuesta paginada
- `OperativeUserListParams` - Parámetros de listado

### 👤 Usuarios Regulares

- `UserProps` - Propiedades de usuario
- `CreateUserDTO` - DTO para crear usuario
- `UpdateUserDTO` - DTO para actualizar usuario
- `UpdateUserLocationDTO` - DTO para actualizar ubicación
- `ChangeUserPasswordDTO` - DTO para cambiar contraseña
- `UserListResponse` - Respuesta paginada
- `UserListParams` - Parámetros de listado

### 💬 Chat System

- `Conversation` - Conversación (individual, grupo, AI)
- `ConversationMember` - Miembro de conversación
- `Message` - Mensaje con adjuntos y respuestas
- `MessageAttachment` - Adjunto de mensaje
- `CreateConversationDTO` - DTO para crear conversación
- `SendMessageDTO` - DTO para enviar mensaje
- `ConversationListResponse` - Respuesta paginada de conversaciones
- `MessageListResponse` - Respuesta paginada de mensajes

#### Enums de Chat

- `ConversationType` - 'INDIVIDUAL' | 'GROUP' | 'AI'
- `MemberType` - 'USER' | 'ADMIN'
- `MessageType` - 'TEXT' | 'FILE' | 'INFO'

### 🔐 Autenticación

- `LoginDTO` - DTO para inicio de sesión
- `LoginResponse` - Respuesta de autenticación
- `RefreshTokenDTO` - DTO para refresh token
- `RefreshTokenResponse` - Respuesta de refresh token

### 📊 Audit Log

- `AuditLog` - Registro de auditoría
- `CreateAuditLogDTO` - DTO para crear audit log
- `AuditLogListResponse` - Respuesta paginada de audit logs
- `AuditLogListParams` - Parámetros de filtrado

#### Enums de Audit

- `LogLevel` - 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL'
- `ActorType` - 'USER' | 'ADMIN' | 'OPERATIVE_USER' | 'SYSTEM'

### 🔔 Actions & Notifications

- `Action` - Acción a ejecutar (push, socket, email, etc.)
- `CreateActionDTO` - DTO para crear acción
- `Notification` - Notificación para usuarios
- `CreateNotificationDTO` - DTO para crear notificación
- `MarkNotificationReadDTO` - DTO para marcar como leída
- `NotificationListResponse` - Respuesta paginada con contador de no leídas
- `NotificationListParams` - Parámetros de filtrado

#### Enums de Actions

- `ActionType` - 'PUSH' | 'SOCKET' | 'DEEP_LINK' | 'EMAIL' | 'SMS'

### 🛒 Products & Stores

- `Product` - Producto con precio y presentación
- `Store` - Local/store con ubicación
- `PriceRecord` - Relevamiento de precios
- `CreateProductDTO` - DTO para crear producto
- `UpdateProductDTO` - DTO para actualizar producto
- `CreateStoreDTO` - DTO para crear local
- `UpdateStoreDTO` - DTO para actualizar local
- `CreatePriceRecordDTO` - DTO para crear relevamiento
- `UpdatePriceRecordDTO` - DTO para actualizar relevamiento

#### Respuestas y Parámetros

- `ProductListResponse` / `ProductListParams`
- `StoreListResponse` / `StoreListParams`
- `PriceRecordListResponse` / `PriceRecordListParams`

### 🏗️ Entidades de Dominio

#### Administrator Entity

- `AdministratorPropsBase` - Propiedades base
- `AdministratorProps` - Propiedades con id opcional
- `PersistedAdministratorProps` - Propiedades persistidas
- `AdminModules` - Módulos de permisos

#### Operative User Entity

- `OperativeUserPropsBase` - Propiedades base
- `OperativeUserProps` - Propiedades con id opcional
- `PersistedOperativeUserProps` - Propiedades persistidas

#### User Entity

- `UserPropsBase` - Propiedades base
- `UserProps` - Propiedades con id opcional
- `PersistedUserProps` - Propiedades persistidas
- `Location` - Ubicación geográfica

### 🛠️ Tipos Comunes

- `EntityStatus` - Estados de entidades: 'active' | 'inactive' | 'deleted'
- `UserStatus` - Estados de usuario: 'online' | 'offline'
- `Language` - Idiomas: 'es' | 'en' | 'pt' | 'fr'
- `Timestamps` - Interface base para timestamps
- `SoftDeletable` - Interface base para soft delete
- `Enableable` - Interface base para entidades habilitables

## Ejemplos de Uso

### Crear un nuevo administrador

```typescript
import type { CreateAdminDTO } from '@framework/shared-types';

const newAdmin: CreateAdminDTO = {
  fullName: 'Juan Pérez',
  email: 'juan@example.com',
  username: 'jperez',
  password: 'securePassword123',
  modules: {
    users: { read: true, write: true, delete: false },
    reports: { read: true, write: false, delete: false }
  }
};
```

### Enviar un mensaje en chat

```typescript
import type { SendMessageDTO, MessageType } from '@framework/shared-types';

const message: SendMessageDTO = {
  conversationId: 'conv-123',
  content: 'Hola, ¿cómo estás?',
  type: 'TEXT',
  attachments: [
    {
      url: 'https://example.com/file.pdf',
      type: 'application/pdf',
      name: 'documento.pdf',
      size: 1024000
    }
  ]
};
```

### Crear un producto

```typescript
import type { CreateProductDTO } from '@framework/shared-types';

const product: CreateProductDTO = {
  name: 'Arroz Blanco',
  description: 'Arroz de primera calidad',
  brand: 'Marca Premium',
  presentation: '1kg',
  price: 150.5
};
```

### Registrar un relevamiento de precio

```typescript
import type { CreatePriceRecordDTO } from '@framework/shared-types';

const priceRecord: CreatePriceRecordDTO = {
  productId: 'product-123',
  storeId: 'store-456',
  price: 145.75,
  recordedAt: new Date(),
  notes: 'Precio en promoción',
  photoUrl: 'https://example.com/photo.jpg'
};
```

### Tipar una respuesta de API

```typescript
import type { AdminListResponse } from '@framework/shared-types';

const response: AdminListResponse = {
  data: [
    {
      id: '1',
      fullName: 'Admin User',
      email: 'admin@example.com',
      username: 'admin',
      enabled: true
    }
  ],
  total: 1,
  page: 1,
  limit: 10
};
```

### Usar tipos de entidad de dominio

```typescript
import type { AdministratorProps, AdminModules } from '@framework/shared-types';

const modules: AdminModules = {
  users: { read: true, write: true, delete: true },
  settings: { read: true, write: false, delete: false }
};

const adminProps: AdministratorProps = {
  id: 'admin-123',
  fullName: 'System Admin',
  emailAddress: 'admin@system.com',
  username: 'admin',
  password: 'hashedPassword',
  enabled: true,
  modules,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null
};
```

## Desarrollo

Para construir el paquete:

```bash
pnpm run build
```

Esto generará los archivos en la carpeta `dist/` con las definiciones de tipo listas para ser consumidas por otras aplicaciones.

## Estructura Completa

El paquete incluye tipos para todos los modelos del schema Prisma:

- ✅ **Administrators** - Gestión de administradores del sistema
- ✅ **Users** - Usuarios regulares con perfil y ubicación
- ✅ **Operative Users** - Personal operativo que realiza relevamientos
- ✅ **Chat System** - Conversaciones, mensajes y miembros (polimórfico)
- ✅ **Audit Log** - Registro de auditoría con actores polimórficos
- ✅ **Actions** - Sistema de acciones (push, socket, email, etc.)
- ✅ **Notifications** - Notificaciones para usuarios
- ✅ **Products** - Catálogo de productos con precios
- ✅ **Stores** - Locales/comercios con ubicación
- ✅ **Price Records** - Relevamientos de precios con fotos y notas

Todos los tipos incluyen sus respectivos DTOs para operaciones CRUD y respuestas paginadas.
