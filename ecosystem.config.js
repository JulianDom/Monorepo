module.exports = {
  apps: [
    {
      name: 'productos-api',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/framework_1/apps/api',
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
      args: 'start',
      cwd: '/var/www/framework_1/apps/admin',
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
