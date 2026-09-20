import { ApiProperty } from '@nestjs/swagger';

export interface UploadedFileType {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

export class FileUploadDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'ไฟล์รูปภาพ (รองรับ PNG, JPG, JPEG, SVG, WebP, ICO ขนาดสูงสุด 5MB)',
  })
  file!: any;
}

export class FileUploadResponse {
  @ApiProperty({
    example: '/uploads/site-icon-1789822204284-aazrhb.webp',
    description: 'URL ของรูปภาพที่สามารถนำไปใช้งานได้',
  })
  url!: string;

  @ApiProperty({
    example: 'site-icon-1789822204284-aazrhb.webp',
    description: 'ชื่อไฟล์รูปภาพ',
  })
  filename!: string;

  @ApiProperty({
    example: 45678,
    description: 'ขนาดไฟล์ (bytes)',
  })
  size!: number;

  @ApiProperty({
    example: 'image/webp',
    description: 'ประเภท MIME ของไฟล์',
  })
  mimetype!: string;
}
