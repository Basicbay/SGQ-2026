import { NestFactory } from '@nestjs/core';
import { AppModule, ObserveInstrument } from './app.module.js';
import { configureApp, createApiDocument } from './setup.js';
import { SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });
  configureApp(app);
  SwaggerModule.setup('docs', app, createApiDocument(app));
  await app.listen(process.env.PORT ?? 4000);
}
await bootstrap();
