const { spawn } = require('child_process');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function startWithSeed() {
  try {
    console.log('🔍 Verificando si existen administradores...');

    const adminCount = await prisma.admin.count();

    if (adminCount === 0) {
      console.log('📱 No hay administradores, ejecutando seed...');

      // Ejecutar seed
      await new Promise((resolve, reject) => {
        const seedProcess = spawn('node', ['scripts/seed.js'], {
          stdio: 'inherit',
          cwd: process.cwd(),
        });

        seedProcess.on('close', (code) => {
          if (code === 0) {
            console.log('✅ Seed completado exitosamente');
            resolve();
          } else {
            console.error('❌ Error en el seed');
            reject(new Error('Seed failed'));
          }
        });
      });
    } else {
      console.log(`✅ Ya existen ${adminCount} administradores`);
    }

    console.log('🚀 Iniciando servidor NestJS...');

    // Iniciar NestJS (producción usa dist/main.js)
    const nestProcess = spawn('node', ['dist/main.js'], {
      stdio: 'inherit',
      cwd: process.cwd(),
      env: {
        ...process.env,
        NODE_ENV: 'production',
      },
    });

    nestProcess.on('close', (code) => {
      console.log(`NestJS process exited with code ${code}`);
      process.exit(code);
    });

    // Manejar señales del sistema
    process.on('SIGTERM', () => {
      console.log('📴 Recibido SIGTERM, apagando servidor...');
      nestProcess.kill('SIGTERM');
    });

    process.on('SIGINT', () => {
      console.log('📴 Recibido SIGINT, apagando servidor...');
      nestProcess.kill('SIGINT');
    });
  } catch (error) {
    console.error('❌ Error al verificar administradores:', error);
    process.exit(1);
  }
}

startWithSeed();
