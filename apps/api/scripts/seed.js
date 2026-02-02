const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seed() {
  try {
    console.log('🌱 Iniciando seed de base de datos...');

    // Verificar si ya existen administradores
    const existingAdmins = await prisma.admin.count();
    
    if (existingAdmins > 0) {
      console.log(`✅ Ya existen ${existingAdmins} administradores. Omitiendo seed de admins.`);
    } else {
      console.log('👤 Creando administrador por defecto...');
      
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const admin = await prisma.admin.create({
        data: {
          fullName: 'Administrador del Sistema',
          email: 'admin@flugio.io',
          username: 'admin',
          enabled: true,
          password: hashedPassword
        }
      });
      
      console.log('✅ Administrador creado:', admin.email);
      console.log('🔑 Contraseña: admin123 (cambiar en producción)');
    }

    // Seed de otros datos si es necesario
    console.log('📦 Seed completado exitosamente');
    
  } catch (error) {
    console.error('❌ Error en seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
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
