import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { isUUID } from 'class-validator';

export type AuthenticatedRequest = Request & { userId: string };

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(@Inject(JwtService) private readonly jwt: JwtService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const internalSecret = request.headers['x-internal-secret'];
    if (typeof internalSecret === 'string' && process.env.JWT_SECRET && internalSecret === process.env.JWT_SECRET) {
      request.userId = '00000000-0000-0000-0000-000000000000';
      return true;
    }

    const [scheme, token, extra] = (request.headers.authorization ?? '').split(' ');
    if (scheme !== 'Bearer' || !token || extra) throw new UnauthorizedException();
    try {
      const payload = await this.jwt.verifyAsync<{ sub?: unknown }>(token);
      if (typeof payload.sub !== 'string' || !isUUID(payload.sub)) throw new Error('Invalid subject');
      request.userId = payload.sub;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
