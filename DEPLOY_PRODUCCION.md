# Guía de Deploy a Producción - Framework Productos

## Información del Servidor

| Componente | Versión/Detalle |
|------------|-----------------|
| OS | Ubuntu 22.04.5 LTS |
| IP | 31.97.20.247 |
| Node.js | v20.19.6 (nvm) |
| pnpm | 10.25.0 |
| PM2 | 6.0.14 |
| Nginx | 1.18.0 |
| PostgreSQL | 14.20 |
| Redis | Instalado (puerto 6379) |

## Conexión al Servidor

```bash
ssh guido@31.97.20.247
sudo -i
# Ingresar contraseña
```

---

## Paso 1: Clonar/Actualizar el Repositorio

```bash
cd /var/www/<nombre de proyecto>

# Si es primera vez:
git clone <url-del-repo> <nombre de proyecto> (en este caso productos)

# Si ya existe:
git pull origin main
```

---

## Paso 2: Instalar Dependencias

```bash
cd /var/www/productos
pnpm install
```

---

## Paso 3: Configurar Variables de Entorno de la API

```bash
cp /var/www/productos/apps/api/.env.example /var/www/productos/apps/api/.env
nano /var/www/productos/apps/api/.env
```

### Variables importantes a configurar:

```env
# Base de datos
DATABASE_URL=postgresql://productos_user:PASSWORD@localhost:5432/productos_db

# JWT
JWT_SECRET=tu_secret_muy_seguro_aqui
JWT_EXPIRATION=1h
JWT_REFRESH_SECRET=otro_secret_seguro
JWT_REFRESH_EXPIRATION=7d

# CORS - Importante para el Admin
CORS_ORIGIN=https://admin.flugio.io,https://productos-admin.flugio.io
SOCKET_IO_CORS_ORIGIN=https://admin.flugio.io

# MercadoPago (requerido en producción)
MERCADOPAGO_ACCESS_TOKEN=tu_access_token
MERCADOPAGO_WEBHOOK_SECRET=tu_webhook_secret

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Puerto
PORT=3010
NODE_ENV=production
```

---

## Paso 4: Configurar Base de Datos PostgreSQL

### Crear usuario y base de datos (si no existen):

```bash
sudo -u postgres psql
```

```sql
CREATE USER productos_user WITH PASSWORD 'tu_password_seguro';
CREATE DATABASE productos_db OWNER productos_user;
GRANT ALL PRIVILEGES ON DATABASE productos_db TO productos_user;
\q
```

### Ejecutar migraciones de Prisma:

```bash
cd /var/www/productos/apps/api
pnpm prisma:generate
pnpm prisma:migrate
```

### Ejecutar Seed (crear administrador inicial):

```bash
cd /var/www/productos/apps/api
node scripts/seed.js
```

Credenciales por defecto:
- **Email:** admin@flugio.io
- **Usuario:** admin
- **Contraseña:** admin123

---

## Paso 5: Build de la API

```bash
cd /var/www/productos/apps/api
pnpm build
```

Verifica que exista la carpeta `dist/`:
```bash
ls -la dist/
```

---

## Paso 6: Configurar Variables de Entorno del Admin

```bash
nano /var/www/productos/apps/admin/.env.production
```

```env
NEXT_PUBLIC_API_URL=https://productos-api.flugio.io
```

---

## Paso 7: Build del Admin

```bash
cd /var/www/productos/apps/admin
pnpm build
```

Verifica que exista la carpeta `.next/`:
```bash
ls -la .next/
```

---

## Paso 8: Configurar PM2

### Crear/Editar ecosystem.config.js:

```bash
nano /var/www/productos/ecosystem.config.js
```

```javascript
module.exports = {
  apps: [
    {
      name: 'productos-api',
      script: 'dist/main.js',
      cwd: '/var/www/productos/apps/api',
      env: {
        NODE_ENV: 'production',
        PORT: 3010
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: '/var/log/pm2/productos-api-error.log',
      out_file: '/var/log/pm2/productos-api-out.log',
      log_file: '/var/log/pm2/productos-api-combined.log',
      time: true
    },
    {
      name: 'productos-admin',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3011',
      cwd: '/var/www/productos/apps/admin',
      env: {
        NODE_ENV: 'production',
        PORT: 3011
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: '/var/log/pm2/productos-admin-error.log',
      out_file: '/var/log/pm2/productos-admin-out.log',
      log_file: '/var/log/pm2/productos-admin-combined.log',
      time: true
    }
  ]
};
```

### Crear directorio de logs:

```bash
mkdir -p /var/log/pm2
```

### Iniciar servicios:

```bash
cd /var/www/productos
pm2 start ecosystem.config.js
```

### Guardar configuración de PM2:

```bash
pm2 save
pm2 startup
```

### Verificar estado:

```bash
pm2 list
pm2 logs productos-api --lines 20
pm2 logs productos-admin --lines 20
```

---

## Paso 9: Configurar Nginx

### Crear archivo de configuración:

```bash
nano /etc/nginx/sites-available/productos.flugio.io
```

```nginx
# API - api.flugio.io y productos-api.flugio.io
server {
    listen 80;
    server_name api.flugio.io productos-api.flugio.io;

    location / {
        proxy_pass http://127.0.0.1:3010;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
}

# Admin - admin.flugio.io
server {
    listen 80;
    server_name admin.flugio.io;

    location / {
        proxy_pass http://127.0.0.1:3011;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Habilitar sitio:

```bash
ln -s /etc/nginx/sites-available/productos.flugio.io /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

---

## Paso 10: Configurar DNS en Cloudflare

En el panel de Cloudflare para `flugio.io`, agregar estos registros A:

| Tipo | Nombre | Contenido | Proxy |
|------|--------|-----------|-------|
| A | api | 31.97.20.247 | Proxied |
| A | admin | 31.97.20.247 | Proxied |
| A | productos-api | 31.97.20.247 | Proxied |

### Configurar SSL en Cloudflare:

- Ir a **SSL/TLS → Overview**
- Seleccionar **"Full"** (no "Full strict" a menos que tengas certificado en el servidor)

---

## Paso 11: SSL con Certbot (Opcional)

Si quieres SSL directo en el servidor:

```bash
apt install certbot python3-certbot-nginx -y
certbot --nginx -d admin.flugio.io -d api.flugio.io -d productos-api.flugio.io
```

---

## URLs Finales

| Servicio | URL |
|----------|-----|
| Admin | https://admin.flugio.io |
| API | https://api.flugio.io |
| API (alternativa) | https://productos-api.flugio.io |

---

## Comandos Útiles

### PM2

```bash
# Ver estado
pm2 list

# Ver logs en tiempo real
pm2 logs productos-api
pm2 logs productos-admin

# Reiniciar servicios
pm2 restart productos-api
pm2 restart productos-admin

# Reiniciar con nuevas variables de entorno
pm2 restart productos-api --update-env

# Ver detalles de un proceso
pm2 describe productos-api

# Monitoreo
pm2 monit
```

### Nginx

```bash
# Verificar configuración
nginx -t

# Recargar configuración
systemctl reload nginx

# Ver logs
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log
```

### PostgreSQL

```bash
# Conectar a la base de datos
sudo -u postgres psql -d productos_db

# Ver tablas
\dt

# Salir
\q
```

### Actualizar Código

```bash
cd /var/www/productos
git pull origin main
pnpm install

# Rebuild API
cd apps/api
pnpm build
pm2 restart productos-api

# Rebuild Admin
cd ../admin
pnpm build
pm2 restart productos-admin
```

---

## Troubleshooting

### Error 502 Bad Gateway
- Verificar que PM2 esté corriendo: `pm2 list`
- Verificar logs: `pm2 logs productos-api`

### Error CORS
- Verificar CORS_ORIGIN en `.env` de la API
- Reiniciar: `pm2 restart productos-api --update-env`

### API no inicia (crashea)
- Ver logs: `pm2 logs productos-api --lines 100`
- Verificar variables de entorno en `.env`
- Verificar que todas las variables requeridas estén configuradas

### Error de conexión a base de datos
- Verificar DATABASE_URL en `.env`
- Verificar que PostgreSQL esté corriendo: `systemctl status postgresql`
- Probar conexión: `psql -U productos_user -d productos_db -h localhost`

### Admin no carga estilos
- Verificar que el build esté completo: `ls -la apps/admin/.next/`
- Rebuild: `cd apps/admin && pnpm build && pm2 restart productos-admin`

---

## Conectarse a PostgreSQL Remotamente

### Opción 1: Túnel SSH (Recomendada)

Desde tu PC local:
```bash
ssh -L 5432:localhost:5432 guido@31.97.20.247
```

Luego conectar con:
- Host: `localhost`
- Port: `5432`
- Database: `productos_db`
- User: `productos_user`

### Opción 2: Abrir PostgreSQL (menos seguro)

```bash
# Editar postgresql.conf
nano /etc/postgresql/14/main/postgresql.conf
# Cambiar: listen_addresses = '*'

# Editar pg_hba.conf
nano /etc/postgresql/14/main/pg_hba.conf
# Agregar: host all all 0.0.0.0/0 scram-sha-256

# Reiniciar y abrir firewall
systemctl restart postgresql
ufw allow 5432/tcp
```
