import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/setup.js';
import { UploadService } from '../src/upload/upload.service.js';

describe('UploadController (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();
  }, 30000);

  let uploadedFilename: string | undefined;

  afterAll(async () => {
    if (uploadedFilename && app) {
      try {
        const uploadService = app.get(UploadService);
        const minioService = (uploadService as any).minioService;
        if (minioService) {
          await minioService.deleteFile(uploadedFilename);
        }
      } catch {}
    }
    if (app) {
      await app.close();
    }
  });

  it('should upload an image to MinIO and retrieve it via GET /upload/:filename', async () => {
    const imageBuffer = Buffer.from('RIFF....WEBPVP8 ...fake');

    // 1. Upload
    const uploadRes = await request(app.getHttpServer())
      .post('/upload')
      .attach('file', imageBuffer, {
        filename: 'test-icon.webp',
        contentType: 'image/webp',
      })
      .expect(200);

    expect(uploadRes.body.statusCode).toBe(200);
    expect(uploadRes.body.data.filename).toBeDefined();
    expect(uploadRes.body.data.url).toMatch(/^\/api\/upload\/site-icon-/);
    expect(uploadRes.body.data.mimetype).toBe('image/webp');

    const filename = uploadRes.body.data.filename;
    uploadedFilename = filename;

    // 2. Fetch the image via GET /upload/:filename
    const getRes = await request(app.getHttpServer())
      .get(`/upload/${filename}`)
      .expect(200);

    expect(getRes.headers['content-type']).toContain('image/webp');
    expect(getRes.body).toBeDefined();
  }, 20000);

  it('should return 404 for non-existent file', async () => {
    await request(app.getHttpServer())
      .get('/upload/non-existent-random-file-12345.webp')
      .expect(404);
  }, 10000);
});
