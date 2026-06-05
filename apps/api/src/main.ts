import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });
  const config = app.get(ConfigService);
  const logger = new Logger('Bootstrap');
  const port = config.get<number>('PORT', 3001);
  const env = config.get<string>('NODE_ENV', 'development');

  // --- Security ---
  app.use(
    helmet({
      contentSecurityPolicy: env === 'production',
      crossOriginEmbedderPolicy: env === 'production',
    }),
  );

  // --- CORS ---
  const defaultOrigins = [
    'https://pecae.italohub.cloud',
    'https://api-pecae.italohub.cloud',
    'http://localhost:8081',
    'http://localhost:3000',
    'http://localhost:3001',
  ];

  const configuredOrigin = config.get<string>('CORS_ORIGIN');
  let corsOrigin: string | string[] = defaultOrigins;

  if (configuredOrigin) {
    if (configuredOrigin === '*') {
      corsOrigin = '*';
    } else if (configuredOrigin.includes(',')) {
      corsOrigin = configuredOrigin.split(',').map(o => o.trim());
    } else {
      corsOrigin = configuredOrigin;
    }
  }

  app.enableCors({
    origin: corsOrigin,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization, Accept',
    credentials: true,
  });

  // --- Global prefix ---
  app.setGlobalPrefix('api/v1');

  // --- Global validation pipe ---
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // --- Swagger (dev only) ---
  if (env !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('PECAÊ API')
      .setDescription('Automotive scrap marketplace API')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document);
    logger.log(`Swagger docs available at http://localhost:${port}/api/docs`);
  }

  await app.listen(port, '0.0.0.0');
  
  const publicIp = config.get<string>('API_PUBLIC_URL', `http://localhost:${port}`);
  
  logger.log(`🚀 PECAÊ API running on: ${publicIp}/api/v1`);
  if (env !== 'production') {
    logger.log(`📌 Swagger docs: ${publicIp}/api/docs`);
  }
  logger.log(`📌 Environment: ${env}`);
}

bootstrap();
