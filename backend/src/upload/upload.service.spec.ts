import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { UploadService } from './upload.service.js';
import { MinioService } from './minio.service.js';
import type { UploadedFileType } from './upload.dto.js';
import { Readable } from 'node:stream';

describe('UploadService', () => {
  let service: UploadService;
  let minioService: MinioService;

  beforeEach(() => {
    minioService = {
      upload: vi.fn().mockResolvedValue(undefined),
      getFile: vi.fn().mockResolvedValue({
        stream: new Readable(),
        size: 1024,
        mimetype: 'image/webp',
        etag: 'test-etag',
      }),
      deleteFile: vi.fn().mockResolvedValue(undefined),
    } as unknown as MinioService;

    service = new UploadService(minioService);
  });

  describe('handleFileUpload', () => {
    it('should upload a valid WebP image to MinIO and return url and metadata', async () => {
      const mockFile: UploadedFileType = {
        fieldname: 'file',
        originalname: 'logo.webp',
        encoding: '7bit',
        mimetype: 'image/webp',
        size: 2048,
        buffer: Buffer.from('fake-webp-data'),
      };

      const result = await service.handleFileUpload(mockFile);

      expect(minioService.upload).toHaveBeenCalledTimes(1);
      expect(result.url).toMatch(/^\/api\/upload\/site-icon-\d+-[a-f0-9]+\.webp$/);
      expect(result.filename).toMatch(/^site-icon-\d+-[a-f0-9]+\.webp$/);
      expect(result.size).toBe(2048);
      expect(result.mimetype).toBe('image/webp');
    });

    it('should throw BadRequestException if no file is provided', async () => {
      await expect(service.handleFileUpload(undefined)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for disallowed mime type', async () => {
      const mockFile: UploadedFileType = {
        fieldname: 'file',
        originalname: 'script.js',
        encoding: '7bit',
        mimetype: 'application/javascript',
        size: 500,
        buffer: Buffer.from('console.log(1)'),
      };

      await expect(service.handleFileUpload(mockFile)).rejects.toThrow(
        'รูปแบบไฟล์ไม่ถูกต้อง รองรับเฉพาะ PNG, JPG, JPEG, SVG, WebP และ ICO',
      );
    });

    it('should throw BadRequestException if file exceeds 5MB', async () => {
      const mockFile: UploadedFileType = {
        fieldname: 'file',
        originalname: 'huge.png',
        encoding: '7bit',
        mimetype: 'image/png',
        size: 6 * 1024 * 1024,
        buffer: Buffer.alloc(100),
      };

      await expect(service.handleFileUpload(mockFile)).rejects.toThrow(
        'ขนาดไฟล์เกินกำหนด (สูงสุด 5 MB)',
      );
    });
  });

  describe('getFile', () => {
    it('should retrieve file stream from MinIO service', async () => {
      const result = await service.getFile('site-icon-123.webp');

      expect(minioService.getFile).toHaveBeenCalledWith('site-icon-123.webp');
      expect(result.size).toBe(1024);
      expect(result.mimetype).toBe('image/webp');
    });
  });
});
