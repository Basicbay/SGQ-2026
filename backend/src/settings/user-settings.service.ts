import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as argon2 from 'argon2';
import { Repository } from 'typeorm';
import { User, UserRole } from '../database/user.entity.js';
import type {
  CreateUserDto,
  DeleteUserResponse,
  UpdateUserDto,
  UserItemResponse,
  UserListResponse,
  UserQueryDto,
} from './user.dto.js';

@Injectable()
export class UserSettingsService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  private mapUserResponse(user: User): UserItemResponse {
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
      lineId: user.lineId ?? null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async findAll(query: UserQueryDto): Promise<UserListResponse> {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 10));
    const skip = (page - 1) * limit;

    const qb = this.userRepository.createQueryBuilder('user');

    if (query.search && query.search.trim() !== '') {
      const s = `%${query.search.trim().toLowerCase()}%`;
      qb.andWhere(
        '(LOWER(user.username) LIKE :s OR LOWER(COALESCE(user.full_name, \'\')) LIKE :s OR LOWER(COALESCE(user.nickname, \'\')) LIKE :s OR LOWER(COALESCE(user.phone, \'\')) LIKE :s OR LOWER(COALESCE(user.email, \'\')) LIKE :s OR LOWER(COALESCE(user.citizen_id, \'\')) LIKE :s OR LOWER(COALESCE(user.line_id, \'\')) LIKE :s)',
        { s },
      );
    }

    if (query.role && query.role.trim() !== '') {
      qb.andWhere('user.role = :role', { role: query.role.trim() });
    }

    if (query.status && query.status.trim() !== '') {
      qb.andWhere('user.status = :status', { status: query.status.trim() });
    }

    qb.orderBy('user.createdAt', 'DESC');
    qb.skip(skip).take(limit);

    const [items, total] = await qb.getManyAndCount();

    return {
      items: items.map((user) => this.mapUserResponse(user)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async findOne(id: string): Promise<UserItemResponse> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('ไม่พบข้อมูลผู้ใช้งานที่ระบุ');
    }
    return this.mapUserResponse(user);
  }

  async create(dto: CreateUserDto): Promise<UserItemResponse> {
    const normalizedUsername = dto.username.trim().toLowerCase();
    if (normalizedUsername === 'admin' && dto.status === 'INACTIVE') {
      throw new BadRequestException('ไม่สามารถระงับการใช้งานบัญชีผู้ดูแลระบบหลัก (admin) ได้');
    }

    const existing = await this.userRepository.findOne({
      where: { username: normalizedUsername },
    });
    if (existing) {
      throw new ConflictException('ชื่อผู้ใช้งานนี้มีอยู่ในระบบแล้ว');
    }

    const passwordHash = await argon2.hash(dto.password);

    const user = this.userRepository.create({
      username: normalizedUsername,
      passwordHash,
      role: dto.role || UserRole.ADMIN,
      status: dto.status || 'ACTIVE',
      fullName: dto.fullName?.trim() || null,
      nickname: dto.nickname?.trim() || null,
      phone: dto.phone?.trim() || null,
      email: dto.email?.trim() || null,
      citizenId: dto.citizenId?.trim() || null,
      lineId: dto.lineId?.trim() || null,
    });

    const saved = await this.userRepository.save(user);
    return this.mapUserResponse(saved);
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserItemResponse> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('ไม่พบข้อมูลผู้ใช้งานที่ระบุ');
    }

    if (user.username.toLowerCase() === 'admin' && dto.status === 'INACTIVE') {
      throw new BadRequestException('ไม่สามารถระงับการใช้งานบัญชีผู้ดูแลระบบหลัก (admin) ได้');
    }

    if (dto.password && dto.password.trim() !== '') {
      user.passwordHash = await argon2.hash(dto.password);
    }

    if (dto.role !== undefined) {
      user.role = dto.role;
    }
    if (dto.status !== undefined) {
      user.status = dto.status;
    }
    if (dto.fullName !== undefined) {
      user.fullName = dto.fullName?.trim() || null;
    }
    if (dto.nickname !== undefined) {
      user.nickname = dto.nickname?.trim() || null;
    }
    if (dto.phone !== undefined) {
      user.phone = dto.phone?.trim() || null;
    }
    if (dto.email !== undefined) {
      user.email = dto.email?.trim() || null;
    }
    if (dto.citizenId !== undefined) {
      user.citizenId = dto.citizenId?.trim() || null;
    }
    if (dto.lineId !== undefined) {
      user.lineId = dto.lineId?.trim() || null;
    }

    const updated = await this.userRepository.save(user);
    return this.mapUserResponse(updated);
  }

  async delete(id: string, currentUserId?: string): Promise<DeleteUserResponse> {
    if (currentUserId && id === currentUserId) {
      throw new BadRequestException('ไม่สามารถลบบัญชีผู้ใช้งานของตนเองที่กำลังเข้าสู่ระบบอยู่ได้');
    }

    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('ไม่พบข้อมูลผู้ใช้งานที่ระบุ');
    }

    if (user.username.toLowerCase() === 'admin') {
      throw new BadRequestException('ไม่สามารถลบบัญชีผู้ดูแลระบบหลัก (admin) ได้');
    }

    await this.userRepository.remove(user);
    return {
      deleted: true,
      id,
    };
  }
}
