import {
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { ApiResponseInterceptor } from '../common/api-response.interceptor.js';
import { UploadService } from './upload.service.js';
import { FileUploadDto, FileUploadResponse, type UploadedFileType } from './upload.dto.js';

@ApiTags('upload')
@UseInterceptors(ApiResponseInterceptor)
@Controller('upload')
export class UploadController {
  constructor(private readonly service: UploadService) {}

  @Post()
  @HttpCode(200)
  @ApiOperation({
    operationId: 'uploadImage',
    summary: 'อัปโหลดรูปภาพไปยัง MinIO (Upload Image to MinIO: PNG, JPG, SVG, WebP, ICO)',
    description: 'อัปโหลดรูปภาพสำหรับไอคอนเว็บไซต์หรือโลโก้ของระบบไปยัง MinIO รองรับขนาดสูงสุด 5MB',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: FileUploadDto,
  })
  @ApiResponse({
    status: 200,
    description: 'อัปโหลดรูปภาพสำเร็จ',
    type: FileUploadResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'ไฟล์ไม่ถูกต้องหรือไม่ตรงตามเงื่อนไข (ขนาดเกิน 5MB หรือชนิดไฟล์ไม่ถูกต้อง)',
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file?: UploadedFileType): Promise<FileUploadResponse> {
    return this.service.handleFileUpload(file);
  }

  @Post('image')
  @HttpCode(200)
  @ApiOperation({
    operationId: 'uploadImageAlias',
    summary: 'อัปโหลดรูปภาพ (Alias: /upload/image)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: FileUploadDto,
  })
  @ApiResponse({
    status: 200,
    description: 'อัปโหลดรูปภาพสำเร็จ',
    type: FileUploadResponse,
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file?: UploadedFileType): Promise<FileUploadResponse> {
    return this.service.handleFileUpload(file);
  }

  @Get(':filename')
  @ApiOperation({
    operationId: 'serveImage',
    summary: 'ดึงและแสดงผลรูปภาพจาก MinIO (Serve Image)',
    description: 'ดึงไฟล์รูปภาพจาก MinIO และส่งกลับเป็น Stream รูปภาพสำหรับนำไปแสดงผลบนเว็บไซต์',
  })
  @ApiParam({
    name: 'filename',
    description: 'ชื่อไฟล์รูปภาพ เช่น site-icon-1789822204284-aazrhb.webp',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'ส่งกลับรูปภาพในรูปแบบ binary stream พร้อม Content-Type ที่ถูกต้อง',
  })
  @ApiResponse({
    status: 404,
    description: 'ไม่พบไฟล์รูปภาพใน MinIO',
  })
  async getFile(
    @Param('filename') filename: string,
    @Res() res: Response,
  ): Promise<void> {
    const file = await this.service.getFile(filename);
    res.setHeader('Content-Type', file.mimetype);
    res.setHeader('Content-Length', file.size);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    if (file.etag) {
      res.setHeader('ETag', file.etag);
    }
    file.stream.pipe(res);
  }

  @Get('file/:filename')
  @ApiOperation({
    operationId: 'serveImageAlias',
    summary: 'ดึงและแสดงผลรูปภาพจาก MinIO (Alias: /upload/file/:filename)',
  })
  @ApiParam({
    name: 'filename',
    description: 'ชื่อไฟล์รูปภาพ',
    type: 'string',
  })
  async getFileAlias(
    @Param('filename') filename: string,
    @Res() res: Response,
  ): Promise<void> {
    return this.getFile(filename, res);
  }
}
