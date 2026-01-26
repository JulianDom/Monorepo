import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

/**
 * PrismaService - Servicio de Base de Datos
 *
 * Extiende PrismaClient con lifecycle hooks de NestJS.
 *
 * NOTA: En Prisma 7+, se requiere un adapter para conectar con la base de datos.
 * Usamos @prisma/adapter-pg para PostgreSQL.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private readonly pool: Pool;

  constructor() {
    const connectionString = process.env['DATABASE_URL'];

    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    // Crear pool de conexiones de PostgreSQL
    const pool = new Pool({ connectionString });

    // Crear adapter de Prisma para PostgreSQL
    const adapter = new PrismaPg(pool);

    // Prisma 7: requiere adapter para conectar
    super({
      adapter,
      log:
        process.env['NODE_ENV'] === 'development'
          ? [
              { emit: 'stdout', level: 'query' },
              { emit: 'stdout', level: 'info' },
              { emit: 'stdout', level: 'warn' },
              { emit: 'stdout', level: 'error' },
            ]
          : [{ emit: 'stdout', level: 'error' }],
    });

    this.pool = pool;
  }

  async onModuleInit() {
    await this.$connect();
    // Log seguro: mostrar host pero ocultar credenciales
    const dbUrl = process.env['DATABASE_URL'] || '';
    const safeUrl = dbUrl.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
    this.logger.log(`Database connected: ${safeUrl.split('?')[0]}`);
  }

  async onModuleDestroy() {
    await this.$disconnect();
    await this.pool.end();
    this.logger.log('Database disconnected');
  }
}
