import { BadRequestException, Injectable } from '@nestjs/common';
import { extname } from 'node:path';
import { randomBytes } from 'node:crypto';
import type { FileUploadResponse, UploadedFileType } from './upload.dto.js';
import { MinioService, type MinioFileResult } from './minio.service.js';

const ALLOWED_MIMES = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/svg+xml',
  'image/webp',
  'image/x-icon',
  'image/vnd.microsoft.icon',
]);

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

@Injectable()
export class UploadService {
  constructor(private readonly minioService: MinioService) {}

  async handleFileUpload(file?: UploadedFileType): Promise<FileUploadResponse> {
    if (!file) {
      throw new BadRequestException('กรุณาเลือกไฟล์รูปภาพที่ต้องการอัปโหลด');
    }

    if (!ALLOWED_MIMES.has(file.mimetype)) {
      throw new BadRequestException('รูปแบบไฟล์ไม่ถูกต้อง รองรับเฉพาะ PNG, JPG, JPEG, SVG, WebP และ ICO');
    }

    if (file.size > MAX_SIZE) {
      throw new BadRequestException('ขนาดไฟล์เกินกำหนด (สูงสุด 5 MB)');
    }

    let extension = 'png';
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg') extension = 'jpg';
    else if (file.mimetype === 'image/svg+xml') extension = 'svg';
    else if (file.mimetype === 'image/webp') extension = 'webp';
    else if (file.mimetype === 'image/x-icon' || file.mimetype === 'image/vnd.microsoft.icon') extension = 'ico';

    const origExt = extname(file.originalname || '').replace('.', '').toLowerCase();
    if (origExt && ['png', 'jpg', 'jpeg', 'svg', 'webp', 'ico'].includes(origExt)) {
      extension = origExt;
    }

    const uniqueId = randomBytes(4).toString('hex');
    const filename = `site-icon-${Date.now()}-${uniqueId}.${extension}`;

    // Upload directly to MinIO
    await this.minioService.upload(filename, file.buffer, file.mimetype);

    return {
      url: `/api/upload/${filename}`,
      filename,
      size: file.size,
      mimetype: file.mimetype,
    };
  }

  async getFile(filename: string): Promise<MinioFileResult> {
    return this.minioService.getFile(filename);
  }
}
