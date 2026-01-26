# 🚀 Pasos de Instalación - Cervak Framework

## ✅ Lo que ya está listo

Se ha completado la configuración inicial del framework:

- ✅ Estructura de carpetas Clean Architecture
- ✅ Configuración de TypeScript con path aliases
- ✅ Configuración de ESLint y Prettier
- ✅ Schema de Prisma completo con todos los modelos
- ✅ Documentación del schema y diagramas ER
- ✅ Archivos de configuración (.nvmrc, nest-cli.json, etc.)
- ✅ Package.json con todas las dependencias

## 📦 Pasos siguientes (Ejecutar manualmente)

### 1. Instalar Node.js 22 LTS

```bash
# Si usas nvm (recomendado)
nvm install 22
nvm use 22

# O descarga desde: https://nodejs.org/
```

### 2. Instalar pnpm

```bash
npm install -g pnpm@9.15.0
```

### 3. Instalar dependencias del proyecto

```bash
cd "c:\Users\Julian\Documents\Cervak\Framework 1"
pnpm install
```

**Esto instalará:**
- NestJS 11
- Prisma 7.2.0
- TypeScript 5.7.3
- Socket.IO 4.8.1
- BullMQ 5.66.5
- Y todas las demás dependencias del stack

### 4. Configurar variables de entorno

```bash
# Copia el archivo de ejemplo
copy .env.example .env

# Edita .env con tu configuración
# Especialmente importante: DATABASE_URL
```

Ejemplo de DATABASE_URL para PostgreSQL local:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/cervak_db?schema=public"
```

### 5. Iniciar PostgreSQL

Asegúrate de tener PostgreSQL 17 o 18 instalado y corriendo.

**PostgreSQL 18 recomendado** para soporte nativo de UUID v7.

**Descargar:** https://www.postgresql.org/download/

### 6. Generar cliente de Prisma

```bash
pnpm prisma:generate
```

Este comando:
- Lee el schema de `prisma/schema.prisma`
- Genera el cliente TypeScript de Prisma
- Crea los tipos para TypeScript

### 7. Crear base de datos y ejecutar migraciones

```bash
# Crear la primera migración
pnpm prisma:migrate

# Se te pedirá un nombre, escribe: init
# Esto creará las tablas en la base de datos
```

### 8. (Opcional) Ejecutar seed

```bash
pnpm prisma:seed
```

Esto poblará la base de datos con datos de ejemplo.

### 9. Ejecutar la aplicación

```bash
# Modo desarrollo (con hot-reload)
pnpm start:dev
```

La aplicación estará disponible en:
- **API**: http://localhost:3000
- **Swagger Docs**: http://localhost:3000/api/docs
- **Health Check**: http://localhost:3000

### 10. (Opcional) Prisma Studio

Abre una GUI para ver y editar datos:

```bash
pnpm prisma:studio
```

## 🔧 Comandos útiles

```bash
# Verificar tipos TypeScript
pnpm typecheck

# Linter
pnpm lint

# Formatear código
pnpm format

# Tests
pnpm test
pnpm test:e2e

# Build para producción
pnpm build
pnpm start:prod
```

## 🗄️ Información del Schema de Prisma

### Modelos creados:

1. **Administrator** - Administradores del sistema
2. **User** - Usuarios con soporte de biometría WebAuthn
3. **Conversation** - Conversaciones (individual, group, AI)
4. **ConversationMember** - Tabla polimórfica de miembros
5. **Message** - Mensajes con soporte de respuestas
6. **AuditLog** - Registro de auditoría
7. **Action** - Acciones programadas (push, socket, email, etc.)
8. **Notification** - Notificaciones in-app

### Características del Schema:

✅ **UUID v4** usando `gen_random_uuid()` (PostgreSQL 17+)
✅ **Soft Delete** en todos los modelos (campo `deletedAt`)
✅ **Relaciones polimórficas** (User/Admin pueden ser miembros de chat)
✅ **Timestamps con zona horaria** (`Timestamptz`)
✅ **JsonB** para datos flexibles
✅ **Índices optimizados** para queries frecuentes

### Documentación:

- 📄 [Schema Documentation](prisma/SCHEMA_DOCUMENTATION.md) - Documentación detallada
- 🗺️ [Schema Diagram](prisma/SCHEMA_DIAGRAM.md) - Diagramas ER y flujos

## 🎯 Siguientes Pasos Después de la Instalación

Una vez que la aplicación esté corriendo:

1. **Crear tu primera feature**
   - Sigue la guía en [NEXT_STEPS.md](NEXT_STEPS.md)
   - Ejemplo completo de cómo crear un módulo User

2. **Implementar autenticación**
   - JWT con Passport
   - WebAuthn biométrico
   - Refresh tokens

3. **Implementar el sistema de chat**
   - Conversaciones polimórficas
   - Mensajes en tiempo real con Socket.IO
   - Notificaciones

4. **Configurar servicios externos**
   - MercadoPago (pagos)
   - Google Maps (geolocalización)
   - Firebase (notificaciones push)

## ⚠️ Notas Importantes

### UUID v7 (PostgreSQL 18)

Si usas **PostgreSQL 18**, puedes cambiar a UUID v7 nativo:

En `prisma/schema.prisma`, cambiar:
```prisma
// De:
@default(dbgenerated("gen_random_uuid()"))

// A:
@default(dbgenerated("uuidv7()"))
```

**Ventajas:**
- Ordenamiento temporal automático
- Mejor rendimiento en índices
- Mejor cacheo

**Referencias:**
- [UUIDv7 Comes to PostgreSQL 18](https://www.thenile.dev/blog/uuidv7)
- [PostgreSQL 18 Release](https://www.postgresql.org/about/news/postgresql-18-released-3142/)

### Soft Delete

Todos los modelos tienen `deletedAt`. Recuerda excluir eliminados en tus queries:

```typescript
// Ejemplo: buscar usuarios activos
const users = await prisma.user.findMany({
  where: { deletedAt: null }
});

// Soft delete
await prisma.user.update({
  where: { id },
  data: { deletedAt: new Date() }
});
```

### Passwords

SIEMPRE hashear con bcrypt:

```typescript
import * as bcrypt from 'bcrypt';

// Hash
const hashedPassword = await bcrypt.hash(password, 10);

// Verificar
const isValid = await bcrypt.compare(password, hashedPassword);
```

## 🆘 Troubleshooting

### Error: Cannot connect to database

```bash
# Verificar que PostgreSQL esté corriendo
# Windows: Services -> PostgreSQL

# Verificar DATABASE_URL en .env
```

### Error: Prisma Client not generated

```bash
pnpm prisma:generate
```

### Error: Module not found '@core/*'

```bash
# Reiniciar el servidor de desarrollo
# Ctrl+C y luego:
pnpm start:dev
```

### Error de tipos TypeScript

```bash
pnpm typecheck
```

## 📚 Recursos

- [NestJS Documentation](https://docs.nestjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

---

**¡Listo para comenzar! 🎉**

Si tienes problemas, revisa:
1. [NEXT_STEPS.md](NEXT_STEPS.md) - Guía de desarrollo
2. [prisma/SCHEMA_DOCUMENTATION.md](prisma/SCHEMA_DOCUMENTATION.md) - Documentación del schema
3. [README.md](README.md) - Documentación general
