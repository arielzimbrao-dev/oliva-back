import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { json } from 'express';
import { HttpExceptionFilter } from './common/exceptions/http-exception.filter';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: process.env.ENV === 'development' ? ['log', 'error', 'warn', 'debug', 'verbose'] : ['error', 'warn'],
  });
  // Note: json() middleware configured in AppModule to preserve rawBody for webhooks
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new HttpExceptionFilter());

  const options = new DocumentBuilder()
    .setTitle('Oliva API')
    .setDescription('Oliva api description')
    .setVersion('1.0')
    .addTag('oliva-api')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);

  SwaggerModule.setup('api_doc', app, document, {
    customSiteTitle: 'Oliva API Doc.',
  });

  const port = process.env.APP_PORT
    ? parseInt(process.env.APP_PORT, 10)
    : process.env.PORT
      ? parseInt(process.env.PORT, 10)
      : 3000;
  await app.listen(port, '0.0.0.0');
}
bootstrap();
