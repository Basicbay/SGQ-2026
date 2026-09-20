import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller.js';
import { UploadService } from './upload.service.js';
import { MinioService } from './minio.service.js';

@Module({
  controllers: [UploadController],
  providers: [UploadService, MinioService],
  exports: [UploadService, MinioService],
})
export class UploadModule {}
