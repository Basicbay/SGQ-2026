import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';
import { randomBytes } from 'node:crypto';
import { User } from '../database/user.entity.js';
import type { LoginDto, LoginResponse, UserResponse } from './auth.dto.js';

@Injectable()
export class AuthService {
  private readonly dummyHash = argon2.hash(randomBytes(32));
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @Inject(JwtService) private readonly jwt: JwtService,
  ) {}

  async login(input: LoginDto): Promise<LoginResponse> {
    const user = await this.users.findOne({
      where: { username: input.username },
      select: {
        id: true,
        username: true,
        passwordHash: true,
        role: true,
        status: true,
        fullName: true,
        nickname: true,
        phone: true,
        email: true,
        citizenId: true,
      },
    });
    const valid = await argon2.verify(user?.passwordHash ?? await this.dummyHash, input.password);
    if (!user || !valid) throw new UnauthorizedException('Invalid username or password');
    if (user.status === 'INACTIVE') {
      throw new UnauthorizedException('บัญชีผู้ใช้งานนี้ถูกระงับการใช้งานชั่วคราว');
    }
    const expiresAt = Math.floor(Date.now() / 1000) + 3600;
    const accessToken = await this.jwt.signAsync({ sub: user.id, exp: expiresAt });
    return {
      accessToken,
      expiresAt,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        status: user.status || 'ACTIVE',
        fullName: user.fullName,
        nickname: user.nickname,
        phone: user.phone,
        email: user.email,
        citizenId: user.citizenId,
      },
    };
  }

  async currentUser(id: string): Promise<UserResponse> {
    const user = await this.users.findOneBy({ id });
    if (!user) throw new UnauthorizedException('Invalid session');
    return {
      id: user.id,
      username: user.username,
      role: user.role,
      status: user.status || 'ACTIVE',
      fullName: user.fullName,
      nickname: user.nickname,
      phone: user.phone,
      email: user.email,
      citizenId: user.citizenId,
    };
  }
}
