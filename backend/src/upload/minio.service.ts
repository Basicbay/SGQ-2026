import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'minio';
import { basename, extname } from 'node:path';
import type { Readable } from 'node:stream';

export interface MinioFileResult {
  stream: Readable;
  size: number;
  mimetype: string;
  etag?: string;
}

@Injectable()
export class MinioService implements OnModuleInit {
  private readonly logger = new Logger(MinioService.name);
  private client!: Client;
  private bucket!: string;

  constructor(private readonly config: ConfigService) {
    this.initClient();
  }

  private initClient(): void {
    let endpoint =
      this.config.get<string>('MINIO_ENDPOINT') ||
      this.config.get<string>('AWS_ENDPOINT_URL_S3') ||
      'localhost';
    let portStr = this.config.get<string>('MINIO_PORT');
    let port = portStr ? parseInt(portStr, 10) : undefined;
    let useSSL =
      this.config.get<string>('MINIO_USE_SSL') !== undefined
        ? this.config.get<string>('MINIO_USE_SSL') === 'true'
        : false;

    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
      try {
        const parsed = new URL(endpoint);
        endpoint = parsed.hostname;
        if (port === undefined && parsed.port) {
          port = parseInt(parsed.port, 10);
        }
        if (this.config.get('MINIO_USE_SSL') === undefined) {
          useSSL = parsed.protocol === 'https:';
        }
        if (port === undefined) {
          port = useSSL ? 443 : 80;
        }
      } catch (err: unknown) {
        this.logger.warn(`Failed to parse endpoint URL '${endpoint}': ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    if (port === undefined) {
      port = useSSL ? 443 : 9000;
    }

    const accessKey =
      this.config.get<string>('MINIO_ACCESS_KEY') ||
      this.config.get<string>('MINIO_ROOT_USER') ||
      this.config.get<string>('AWS_ACCESS_KEY_ID') ||
      '';

    const secretKey =
      this.config.get<string>('MINIO_SECRET_KEY') ||
      this.config.get<string>('MINIO_ROOT_PASSWORD') ||
      this.config.get<string>('AWS_SECRET_ACCESS_KEY') ||
      '';

    this.bucket =
      this.config.get<string>('MINIO_BUCKET') ||
      'obj-sgq';

    this.client = new Client({
      endPoint: endpoint,
      port,
      useSSL,
      accessKey,
      secretKey,
    });

    this.logger.log(
      `MinIO client initialized for endpoint: ${endpoint}:${port} (SSL: ${useSSL}), bucket: ${this.bucket}`,
    );
  }

  async onModuleInit(): Promise<void> {
    try {
      const exists = await this.client.bucketExists(this.bucket);
      if (!exists) {
        await this.client.makeBucket(this.bucket);
        this.logger.log(`Created bucket '${this.bucket}' on MinIO`);
      }
    } catch (err: unknown) {
      this.logger.warn(
        `Bucket existence check or creation failed for '${this.bucket}': ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
    }
  }

  async upload(filename: string, buffer: Buffer, mimetype: string): Promise<void> {
    const cleanName = basename(filename);
    try {
      await this.client.putObject(
        this.bucket,
        cleanName,
        buffer,
        buffer.length,
        {
          'Content-Type': mimetype,
        },
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(`Failed to upload file '${cleanName}' to MinIO: ${msg}`);
      throw new InternalServerErrorException(`ไม่สามารถอัปโหลดไฟล์ไปยัง MinIO: ${msg}`);
    }
  }

  async getFile(filename: string): Promise<MinioFileResult> {
    const cleanName = basename(filename);
    try {
      const stat = await this.client.statObject(this.bucket, cleanName);
      const stream = (await this.client.getObject(this.bucket, cleanName)) as Readable;

      let mimetype =
        stat.metaData?.['content-type'] ||
        stat.metaData?.['Content-Type'];

      if (!mimetype) {
        const ext = extname(cleanName).toLowerCase().replace('.', '');
        const mimeMap: Record<string, string> = {
          png: 'image/png',
          jpg: 'image/jpeg',
          jpeg: 'image/jpeg',
          webp: 'image/webp',
          svg: 'image/svg+xml',
          ico: 'image/x-icon',
        };
        mimetype = mimeMap[ext] || 'application/octet-stream';
      }

      return {
        stream,
        size: stat.size,
        mimetype,
        etag: stat.etag,
      };
    } catch (err: unknown) {
      const errCode = (err as { code?: string })?.code;
      const errMsg = err instanceof Error ? err.message : String(err);
      if (
        errCode === 'NotFound' ||
        errCode === 'NoSuchKey' ||
        errMsg.includes('Not Found') ||
        errMsg.includes('NoSuchKey')
      ) {
        throw new NotFoundException(`ไม่พบไฟล์ '${cleanName}' ในระบบ`);
      }
      this.logger.error(`Error reading file '${cleanName}' from MinIO: ${errMsg}`);
      throw new InternalServerErrorException(`เกิดข้อผิดพลาดในการดึงไฟล์จาก MinIO: ${errMsg}`);
    }
  }

  async deleteFile(filename: string): Promise<void> {
    const cleanName = basename(filename);
    try {
      await this.client.removeObject(this.bucket, cleanName);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.warn(`Failed to delete file '${cleanName}' from MinIO: ${msg}`);
    }
  }
}
