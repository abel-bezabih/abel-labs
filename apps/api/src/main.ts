import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  try {
    console.log('🚀 Starting API server...');
    const app = await NestFactory.create(AppModule, {
      logger: WinstonModule.createLogger({
        transports: [
          new winston.transports.Console({
            format: winston.format.combine(
              winston.format.timestamp(),
              winston.format.colorize(),
              winston.format.printf(({ timestamp, level, message, context }) => {
                return `${timestamp} [${context}] ${level}: ${message}`;
              })
            ),
          }),
        ],
      }),
      rawBody: true, // Enable raw body for webhook signature verification
    });

  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') || '*',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        const messages = errors.map((error) => {
          return Object.values(error.constraints || {}).join(', ');
        });
        return new HttpException(
          {
            statusCode: 400,
            message: messages.length > 0 ? messages : 'Validation failed',
            error: 'Bad Request',
          },
          400,
        );
      },
    })
  );

  // Global exception filter for better error handling
  app.useGlobalFilters(new AllExceptionsFilter());

  const config = new DocumentBuilder()
    .setTitle('Abel Labs API')
    .setDescription('API for Abel Labs software company platform')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

    const port = process.env.PORT || 3001;
    await app.listen(port);
    console.log(`🚀 API server running on http://localhost:${port}`);
    console.log(`📚 API docs available at http://localhost:${port}/api/docs`);
  } catch (error) {
    console.error('❌ Failed to start API server:', error);
    process.exit(1);
  }
}

bootstrap();

