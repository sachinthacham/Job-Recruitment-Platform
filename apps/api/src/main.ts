import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TimeoutInterceptor } from './common/interceptors/timeout.interceptor';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    logger:
      process.env.NODE_ENV === 'production'
        ? ['error', 'warn', 'log']
        : ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('APP_PORT', 3000);
  const apiPrefix = configService.get<string>('API_PREFIX', 'api/v1');
  const corsOrigins = configService.get<string>('CORS_ORIGINS', 'http://localhost:4200');

  // ─── Global Prefix ─────────────────────────────────────
  app.setGlobalPrefix(apiPrefix, {
    exclude: ['health', 'health/live', 'health/ready'],
  });

  // ─── API Versioning ─────────────────────────────────────
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // ─── Security ──────────────────────────────────────────
  app.use(helmet());
  app.use(compression());
  app.use(cookieParser());

  // ─── CORS ──────────────────────────────────────────────
  app.enableCors({
    origin: corsOrigins.split(',').map((o) => o.trim()),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Correlation-ID',
      'X-Tenant-ID',
    ],
  });

  // ─── Global Pipes ─────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,          // Strip properties not in DTO
      forbidNonWhitelisted: true, // Throw on unknown properties
      transform: true,          // Auto-transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // ─── Global Filters ───────────────────────────────────
  app.useGlobalFilters(new AllExceptionsFilter());

  // ─── Global Interceptors ──────────────────────────────
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TimeoutInterceptor(30000),
    new TransformInterceptor(),
  );

  // ─── Swagger / OpenAPI ────────────────────────────────
  if (process.env.NODE_ENV !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('RecruitPro API')
      .setDescription(
        'Enterprise Job Recruitment Platform — REST API Documentation',
      )
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'Authorization',
          description: 'Enter your JWT access token',
          in: 'header',
        },
        'access-token',
      )
      .addTag('Health', 'System health and readiness endpoints')
      .addTag('Auth', 'Authentication and authorization')
      .addTag('Users', 'User management')
      .addTag('Companies', 'Company management')
      .addTag('Jobs', 'Job posting and management')
      .addTag('Applications', 'Job applications')
      .addTag('Interviews', 'Interview scheduling and feedback')
      .addTag('Offers', 'Job offer management')
      .addTag('Notifications', 'Notification management')
      .addTag('Messages', 'Messaging system')
      .addTag('Admin', 'Platform administration')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
      },
    });
  }

  // ─── Graceful Shutdown ────────────────────────────────
  app.enableShutdownHooks();

  await app.listen(port);

  console.log(`
  ╔══════════════════════════════════════════════╗
  ║       RecruitPro API Server                  ║
  ║──────────────────────────────────────────────║
  ║  Environment: ${(process.env.NODE_ENV || 'development').padEnd(30)}║
  ║  Port:        ${String(port).padEnd(30)}║
  ║  API:         http://localhost:${port}/${apiPrefix}${' '.repeat(Math.max(0, 11 - String(port).length - apiPrefix.length))}║
  ║  Swagger:     http://localhost:${port}/docs${' '.repeat(Math.max(0, 16 - String(port).length))}║
  ║  Health:      http://localhost:${port}/health${' '.repeat(Math.max(0, 14 - String(port).length))}║
  ╚══════════════════════════════════════════════╝
  `);
}

bootstrap();
