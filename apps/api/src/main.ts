import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import compression from 'compression';
import hpp from 'hpp';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from '@presentation/filters';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);

  // Global prefix
  const globalPrefix = configService.get<string>('API_PREFIX', 'api');
  app.setGlobalPrefix(globalPrefix);

  // API Versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Trust proxy (para obtener IP real detrás de load balancer)
  app.set('trust proxy', 1);

  // Security middleware - Helmet con configuración detallada
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          scriptSrc: ["'self'", "'unsafe-inline'"],
        },
      },
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      dnsPrefetchControl: { allow: false },
      frameguard: { action: 'deny' },
      hidePoweredBy: true,
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
      ieNoOpen: true,
      noSniff: true,
      originAgentCluster: true,
      permittedCrossDomainPolicies: { permittedPolicies: 'none' },
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
      xssFilter: true,
    }),
  );

  // HTTP Parameter Pollution protection
  app.use(hpp());

  // Compression
  app.use(compression());

  // CORS
  const corsOrigin = configService.get<string>('CORS_ORIGIN', 'http://localhost:3000');
  app.enableCors({
    origin: corsOrigin.split(',').map((o) => o.trim()),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Request-Id'],
    exposedHeaders: ['X-Request-Id', 'X-RateLimit-Limit', 'X-RateLimit-Remaining'],
  });

  // Global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Global validation pipe con class-validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      validationError: {
        target: false,
        value: false,
      },
    }),
  );

  // Swagger documentation (solo en desarrollo)
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');
  if (nodeEnv !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Cervak Framework API')
      .setDescription(
        `## Framework Empresarial con Clean Architecture

### Características
- **Clean Architecture**: Separación clara de capas (Domain, Application, Infrastructure, Presentation)
- **Autenticación JWT**: Tokens de acceso y refresh
- **WebAuthn/Passkeys**: Autenticación biométrica con SimpleWebAuthn
- **Rate Limiting**: Protección contra abuso de API
- **WebSockets**: Comunicación en tiempo real para chat

### Autenticación
Usa el botón **Authorize** para ingresar tu JWT token.
El token debe obtenerse del endpoint \`/api/v1/auth/login\`.
`,
      )
      .setVersion('1.0.0')
      .setContact('Cervak Team', 'https://cervak.com', 'dev@cervak.com')
      .setLicense('MIT', 'https://opensource.org/licenses/MIT')
      .addServer(`http://localhost:${configService.get('PORT', 3000)}`, 'Local Development')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'Authorization',
          description: 'Enter your JWT access token',
          in: 'header',
        },
        'JWT-auth',
      )
      .addApiKey(
        {
          type: 'apiKey',
          name: 'X-API-Key',
          in: 'header',
          description: 'API Key for external integrations',
        },
        'API-key',
      )
      .addTag('health', 'Health Check')
      .addTag('auth', 'Authentication & Authorization')
      .addTag('administrators', 'Épica 4: Gestión de Administradores')
      .addTag('operative-users', 'Épica 5: Gestión de Usuarios Operativos')
      .addTag('products', 'Épica 6: Gestión de Productos')
      .addTag('stores', 'Épica 7: Gestión de Locales')
      .addTag('price-records', 'Épica 8: Visualización de Precios')
      .addTag('chat', 'Real-time Chat & Messaging')
      .addTag('notifications', 'Push Notifications')
      .addTag('payments', 'MercadoPago Integration')
      .addTag('files', 'File Upload & Export')
      .addTag('webhooks', 'External Webhooks')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig, {
      operationIdFactory: (_controllerKey: string, methodKey: string) => methodKey,
    });

    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        docExpansion: 'none',
        filter: true,
        showRequestDuration: true,
        syntaxHighlight: {
          theme: 'monokai',
        },
      },
      customSiteTitle: 'Cervak Framework API',
      customCss: '.swagger-ui .topbar { display: none }',
    });

    logger.log(`Swagger documentation available at: http://localhost:${configService.get('PORT', 3000)}/api/docs`);
  }

  // Graceful shutdown
  app.enableShutdownHooks();

  // Start server
  const port = configService.get<number>('PORT', 3000);
  const host = configService.get<string>('HOST', '0.0.0.0');

  await app.listen(port, host);

  logger.log(`Application running on: http://${host}:${port}`);
  logger.log(`Environment: ${nodeEnv}`);
  logger.log(`API Prefix: /${globalPrefix}/v1`);
}

bootstrap().catch((error) => {
  const logger = new Logger('Bootstrap');
  logger.error('Failed to start application', error);
  process.exit(1);
});
