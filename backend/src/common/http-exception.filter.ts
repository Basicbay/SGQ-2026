import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { STATUS_CODES } from 'node:http';

type ErrorBody = {
  statusCode: number;
  error: string;
  message_code: string;
  message: string | string[];
  data: null;
  metadata: Record<string, unknown>;
};

function errorCode(statusCode: number): string {
  const names: Record<number, string> = {
    400: 'BAD_REQUEST',
    401: 'UNAUTHORIZED',
    403: 'FORBIDDEN',
    404: 'NOT_FOUND',
    409: 'CONFLICT',
    422: 'UNPROCESSABLE_ENTITY',
    429: 'TOO_MANY_REQUESTS',
  };
  return names[statusCode] ?? (statusCode >= 500 ? 'INTERNAL_SERVER_ERROR' : 'HTTP_ERROR');
}

function messageCode(statusCode: number, message: string | string[]): string {
  if (statusCode === 400) return 'VALIDATION_ERROR';
  if (statusCode === 401 && message === 'Invalid username or password') return 'AUTH_INVALID_CREDENTIALS';
  if (statusCode === 429) return 'RATE_LIMIT_EXCEEDED';
  return errorCode(statusCode);
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const isHttpException = exception instanceof HttpException;
    const statusCode = isHttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const exceptionResponse = isHttpException ? exception.getResponse() : undefined;

    let message: string | string[] = 'Internal server error';
    const error = STATUS_CODES[statusCode] ?? 'Error';
    if (statusCode < 500 && typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else if (statusCode < 500 && exceptionResponse && typeof exceptionResponse === 'object') {
      if ('message' in exceptionResponse) {
        const value: unknown = exceptionResponse.message;
        if (typeof value === 'string' || (Array.isArray(value) && value.every((item: unknown) => typeof item === 'string'))) message = value;
      }
    }

    const body: ErrorBody = {
      statusCode,
      error,
      message_code: messageCode(statusCode, message),
      message,
      data: null,
      metadata: {},
    };
    response.status(statusCode).json(body);
  }
}
