require('dotenv/config');

/**
 * Prisma 7 Configuration
 *
 * En Prisma 7, la URL de conexión se mueve de schema.prisma a prisma.config.ts
 * y se pasa al constructor de PrismaClient.
 *
 * Documentación: https://pris.ly/d/prisma7-client-config
 */
module.exports = {
  schema: './schema.prisma',
  migrations: {
    path: './migrations',
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
};
