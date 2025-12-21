import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true, // reflect request origin, effectively allowing all
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: '*',
  });

  const port = process.env.PORT || 3000;
  console.log(`App rodando na porta ${port}`); // Para debug
  await app.listen(port, '0.0.0.0'); // '0.0.0.0' para Docker/Railway
}
bootstrap();
