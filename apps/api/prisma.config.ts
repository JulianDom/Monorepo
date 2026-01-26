import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

/**
 * Prisma 7 Configuration
 *
 * En Prisma 7, la URL de conexión se configura aquí en lugar del schema.prisma.
 * Este archivo debe estar en la raíz del proyecto.
 *
 * Documentación: https://pris.ly/d/prisma7-client-config
 */
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
