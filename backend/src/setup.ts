import { ValidationPipe } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { HttpExceptionFilter } from './common/http-exception.filter.js';

export function configureApp(app: INestApplication) {
  app.enableCors({ origin: true, credentials: true });
  app.use(helmet({ crossOriginResourcePolicy: false }));
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));

  // Backward-compatibility: redirect /uploads/:filename to /upload/:filename
  const expressApp = app.getHttpAdapter().getInstance();
  if (expressApp && typeof expressApp.get === 'function') {
    expressApp.get('/uploads/:filename', (req: any, res: any) => {
      res.redirect(301, `/upload/${req.params.filename}`);
    });
  }
}

export function createApiDocument(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('SGQ API')
    .setDescription('SGQ API สำหรับ Authentication และการตั้งค่าระบบ')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  return SwaggerModule.createDocument(app, config);
}
