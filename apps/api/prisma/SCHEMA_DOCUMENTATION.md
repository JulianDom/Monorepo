# 📊 Documentación del Schema de Base de Datos

## Información General

- **Base de Datos**: PostgreSQL 17/18
- **ORM**: Prisma 7.2.0
- **UUID**: v4 usando `gen_random_uuid()` (PostgreSQL 18 soporta `uuidv7()` nativamente)
- **Estrategia**: Soft Delete (campo `deletedAt`)
- **Timestamps**: Con zona horaria (Timestamptz)
- **JSON**: JsonB para mejor rendimiento

## 📋 Modelos

### 1. Administrator

Administradores del sistema con permisos basados en módulos.

**Campos principales:**
- `id`: UUID (Primary Key)
- `fullName`: Nombre completo
- `emailAddress`: Email único
- `username`: Username único
- `password`: Contraseña hasheada (bcrypt)
- `enabled`: Estado activo/inactivo
- `refreshToken`: Token JWT de refresco
- `recoverPasswordID`: Token de recuperación de contraseña
- `modules`: JsonB con permisos y módulos asignados

**Relaciones:**
- Puede participar en conversaciones (polimórfico)
- Puede enviar mensajes (polimórfico)
- Registra acciones en AuditLog

**Soft Delete**: ✅ Sí

---

### 2. User

Usuarios finales de la aplicación con soporte para biometría.

**Campos principales:**
- `id`: UUID (Primary Key)
- `fullName`: Nombre completo
- `emailAddress`: Email único
- `username`: Username único
- `password`: Contraseña hasheada (bcrypt)
- `online`: Estado de conexión
- `language`: Idioma (default: 'es')
- `picture`: URL de avatar
- `location`: JsonB con `{ lat, lng }`

**WebAuthn (Biometría):**
- `biometricChallenge`: Challenge de autenticación
- `registrationInfo`: JsonB con datos de credencial SimpleWebAuthn

**Relaciones:**
- Puede participar en conversaciones (polimórfico)
- Puede enviar mensajes (polimórfico)
- Tiene notificaciones
- Registra acciones en AuditLog

**Soft Delete**: ✅ Sí

---

### 3. Conversation

Conversaciones: individuales, grupales o con IA.

**Tipos** (Enum ConversationType):
- `INDIVIDUAL`: Chat 1 a 1
- `GROUP`: Chat grupal
- `AI`: Chat con IA

**Campos principales:**
- `id`: UUID (Primary Key)
- `type`: Tipo de conversación
- `title`: Título (para grupos)
- `picture`: Imagen (para grupos)
- `metadata`: JsonB con datos adicionales

**Relaciones:**
- Tiene miembros (ConversationMember)
- Tiene mensajes (Message)

**Soft Delete**: ✅ Sí

---

### 4. ConversationMember

**Tabla polimórfica** que conecta conversaciones con usuarios o administradores.

**Polimorfismo**:
- `memberId`: UUID del miembro
- `memberType`: `USER` o `ADMIN`

**Campos adicionales:**
- `role`: Rol en la conversación (admin, member, viewer)
- `lastReadAt`: Última lectura
- `mutedUntil`: Fecha de silenciamiento

**Constraint único**: `(conversationId, memberId, memberType)`

**Soft Delete**: ✅ Sí

---

### 5. Message

Mensajes dentro de conversaciones.

**Tipos** (Enum MessageType):
- `TEXT`: Mensaje de texto
- `FILE`: Archivo adjunto
- `INFO`: Mensaje del sistema

**Polimorfismo**:
- `authorId`: UUID del autor
- `authorType`: `USER` o `ADMIN`

**Campos principales:**
- `content`: Contenido del mensaje
- `read`: Estado de lectura
- `replyToId`: ID del mensaje al que responde
- `attachments`: JsonB con `[{ url, type, name, size }]`

**Relaciones:**
- Pertenece a una conversación
- Puede tener respuestas (self-relation)

**Soft Delete**: ✅ Sí

---

### 6. AuditLog

Registro de auditoría de todas las acciones del sistema.

**Niveles** (Enum LogLevel):
- `DEBUG`
- `INFO`
- `WARN`
- `ERROR`
- `CRITICAL`

**Tipos de Actor** (Enum ActorType):
- `USER`: Usuario final
- `ADMIN`: Administrador
- `SYSTEM`: Sistema automático

**Polimorfismo**:
- `actorId`: UUID del actor
- `actorType`: Tipo de actor

**Campos principales:**
- `action`: Acción realizada (ej: "user.login", "admin.delete_user")
- `level`: Nivel de log
- `message`: Mensaje descriptivo
- `ip`: IP del actor
- `userAgent`: User agent
- `meta`: JsonB con datos adicionales

**Soft Delete**: ❌ No (se mantiene para auditoría)

---

### 7. Action

Acciones programadas para ejecutar (push, socket, deep-link, email, SMS).

**Tipos** (Enum ActionType):
- `PUSH`: Notificación push
- `SOCKET`: Evento Socket.IO
- `DEEP_LINK`: Redirección deep link
- `EMAIL`: Email
- `SMS`: SMS

**Campos principales:**
- `type`: Tipo de acción
- `target`: Destino (user ID, topic, channel)
- `payload`: JsonB con datos de la acción
- `executed`: Estado de ejecución
- `executedAt`: Fecha de ejecución
- `error`: Mensaje de error si falló

**Soft Delete**: ✅ Sí

---

### 8. Notification

Notificaciones in-app para usuarios.

**Campos principales:**
- `userId`: Usuario destinatario
- `title`: Título
- `body`: Cuerpo
- `picture`: URL de imagen
- `payload`: JsonB con datos adicionales (deep link, etc.)
- `read`: Estado de lectura
- `readAt`: Fecha de lectura

**Relaciones:**
- Pertenece a un usuario

**Soft Delete**: ✅ Sí

---

## 🔗 Relaciones Polimórficas

El schema implementa relaciones polimórficas usando el patrón `entityId + entityType`:

### ConversationMember (USER o ADMIN)
```prisma
memberId: String
memberType: MemberType (USER | ADMIN)
```

### Message (autor: USER o ADMIN)
```prisma
authorId: String
authorType: MemberType (USER | ADMIN)
```

### AuditLog (actor: USER, ADMIN o SYSTEM)
```prisma
actorId: String?
actorType: ActorType? (USER | ADMIN | SYSTEM)
```

---

## 📊 Índices

Todos los modelos tienen índices optimizados para:

✅ Campos únicos (`emailAddress`, `username`)
✅ Foreign keys (relaciones)
✅ Campos de búsqueda frecuente (`online`, `read`, `executed`)
✅ Soft delete (`deletedAt`)
✅ Ordenamiento temporal (`createdAt`)

---

## 🗑️ Soft Delete

Todos los modelos (excepto `AuditLog`) implementan Soft Delete:

```prisma
deletedAt DateTime? @map("deleted_at") @db.Timestamptz(3)
```

Para queries que excluyan registros eliminados:

```typescript
// Buscar solo activos
await prisma.user.findMany({
  where: { deletedAt: null }
});

// Soft delete
await prisma.user.update({
  where: { id },
  data: { deletedAt: new Date() }
});
```

---

## 🔐 UUID v7 (PostgreSQL 18)

**Nota importante**: Actualmente usando `gen_random_uuid()` (UUID v4) para compatibilidad con PostgreSQL 17.

Si usas **PostgreSQL 18**, puedes cambiar a UUID v7:

```prisma
// En lugar de:
@default(dbgenerated("gen_random_uuid()"))

// Usar:
@default(dbgenerated("uuidv7()"))
```

**Ventajas de UUID v7:**
- ✅ Ordenamiento temporal
- ✅ Mejor rendimiento en índices B-tree
- ✅ Cacheo más eficiente

**Referencias:**
- [UUIDv7 Comes to PostgreSQL 18](https://www.thenile.dev/blog/uuidv7)
- [PostgreSQL 18 Release Notes](https://www.postgresql.org/docs/current/release-18.html)
- [Better Stack: UUID v7 in PostgreSQL 18](https://betterstack.com/community/guides/databases/postgresql-18-uuid/)

---

## 📝 Migraciones

### Crear la primera migración

```bash
# Generar el cliente Prisma
pnpm prisma:generate

# Crear migración
pnpm prisma:migrate

# Se te pedirá un nombre, por ejemplo: "init"
```

### Aplicar migraciones

```bash
# Desarrollo
pnpm prisma:migrate

# Producción
npx prisma migrate deploy
```

### Ver base de datos

```bash
# Abrir Prisma Studio (GUI)
pnpm prisma:studio
```

---

## 🧪 Seed Data

El archivo `prisma/seed.ts` contiene datos de ejemplo. Ejecutar:

```bash
pnpm prisma:seed
```

---

## 📚 Queries de Ejemplo

### Crear un usuario con biometría

```typescript
const user = await prisma.user.create({
  data: {
    fullName: 'John Doe',
    emailAddress: 'john@example.com',
    username: 'johndoe',
    password: await bcrypt.hash('password123', 10),
    location: { lat: -34.603722, lng: -58.381592 },
    registrationInfo: {
      credentialID: 'base64...',
      credentialPublicKey: 'base64...',
      counter: 0
    }
  }
});
```

### Crear una conversación grupal

```typescript
const conversation = await prisma.conversation.create({
  data: {
    type: 'GROUP',
    title: 'Equipo de Desarrollo',
    picture: 'https://...',
    members: {
      create: [
        { memberId: user1Id, memberType: 'USER', role: 'admin' },
        { memberId: user2Id, memberType: 'USER', role: 'member' },
        { memberId: adminId, memberType: 'ADMIN', role: 'admin' }
      ]
    }
  }
});
```

### Enviar un mensaje con respuesta

```typescript
const message = await prisma.message.create({
  data: {
    conversationId: conversationId,
    authorId: userId,
    authorType: 'USER',
    content: 'Hola equipo!',
    type: 'TEXT',
    replyToId: previousMessageId // Opcional
  }
});
```

### Crear notificación

```typescript
const notification = await prisma.notification.create({
  data: {
    userId: userId,
    title: 'Nuevo mensaje',
    body: 'Tienes un nuevo mensaje de John',
    payload: {
      type: 'MESSAGE',
      conversationId: conversationId,
      messageId: messageId
    }
  }
});
```

### Audit Log

```typescript
await prisma.auditLog.create({
  data: {
    action: 'user.login',
    level: 'INFO',
    message: 'User logged in successfully',
    actorId: userId,
    actorType: 'USER',
    ip: '192.168.1.1',
    userAgent: 'Mozilla/5.0...',
    meta: { loginMethod: 'biometric' }
  }
});
```

---

## 🚨 Consideraciones Importantes

1. **Passwords**: SIEMPRE hashear con bcrypt antes de guardar
2. **Soft Delete**: Implementar en queries de la aplicación
3. **JsonB**: Validar estructura antes de guardar
4. **Índices**: Monitorear rendimiento y ajustar según necesidad
5. **Polimorfismo**: Validar `entityType` en lógica de aplicación
6. **Cascadas**: `onDelete: Cascade` en relaciones críticas (notificaciones, mensajes)

---

## 📖 Referencias

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL UUID Type](https://www.postgresql.org/docs/current/datatype-uuid.html)
- [Prisma Schema Reference](https://www.prisma.io/docs/orm/reference/prisma-schema-reference)
- [Soft Delete Pattern](https://www.prisma.io/docs/orm/prisma-schema/data-model/relations/referential-actions#soft-delete)
