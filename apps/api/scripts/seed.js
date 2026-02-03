const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv/config');

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('❌ DATABASE_URL environment variable is not set');
  process.exit(1);
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function seed() {
  try {
    console.log('🌱 Iniciando seed de base de datos...');

    // Verificar si ya existen administradores
    const existingAdmins = await prisma.administrator.count();

    if (existingAdmins > 0) {
      console.log(`✅ Ya existen ${existingAdmins} administradores. Omitiendo seed de admins.`);
    } else {
      console.log('👤 Creando administrador por defecto...');

      const hashedPassword = await bcrypt.hash('admin123', 10);

      const admin = await prisma.administrator.create({
        data: {
          fullName: 'Administrador del Sistema',
          emailAddress: 'admin@flugio.io',
          username: 'admin',
          enabled: true,
          password: hashedPassword
        }
      });

      console.log('✅ Administrador creado:', admin.emailAddress);
      console.log('🔑 Contraseña: admin123 (cambiar en producción)');
    }

    // Seed de otros datos si es necesario
    console.log('📦 Seed completado exitosamente');

  } catch (error) {
    console.error('❌ Error en seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  seed()
    .then(() => {
      console.log('🎉 Seed finalizado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error fatal en seed:', error);
      process.exit(1);
    });
}

module.exports = { seed };
