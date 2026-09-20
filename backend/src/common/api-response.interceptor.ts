import { CallHandler, ExecutionContext, Injectable, NestInterceptor, StreamableFile } from '@nestjs/common';
import { map, Observable } from 'rxjs';
import type { Response } from 'express';

@Injectable()
export class ApiResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const res = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      map((data: unknown) => {
        if (res.headersSent || data instanceof StreamableFile) {
          return data;
        }

        return {
          statusCode: res.statusCode ?? 200,
          error: null,
          message_code: 'SUCCESS',
          message: 'Success',
          data: data ?? null,
          metadata: {},
        };
      }),
    );
  }
}
