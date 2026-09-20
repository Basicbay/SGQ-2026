import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { User, UserRole } from '../database/user.entity.js';
import { UserSettingsService } from './user-settings.service.js';

describe('UserSettingsService', () => {
  let service: UserSettingsService;
  let mockRepository: any;

  const mockUser: User = {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    username: 'somchai',
    passwordHash: 'hashed_password',
    role: UserRole.ADMIN,
    status: 'ACTIVE',
    fullName: 'สมชาย เข็มกลัด',
    nickname: 'เต๋า',
    phone: '0812345678',
    email: 'somchai@example.com',
    citizenId: '1100400123456',
    lineId: '@somchai_line',
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
  };

  beforeEach(() => {
    mockRepository = {
      createQueryBuilder: vi.fn(),
      findOne: vi.fn(),
      findOneBy: vi.fn(),
      create: vi.fn((dto) => ({ ...dto, id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', createdAt: new Date(), updatedAt: new Date() })),
      save: vi.fn((entity) => Promise.resolve({ ...mockUser, ...entity })),
      remove: vi.fn((entity) => Promise.resolve(entity)),
    };

    service = new UserSettingsService(mockRepository);
  });

  describe('findAll', () => {
    it('should return a paginated list of users', async () => {
      const qb: any = {
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        take: vi.fn().mockReturnThis(),
        getManyAndCount: vi.fn().mockResolvedValue([[mockUser], 1]),
      };
      mockRepository.createQueryBuilder.mockReturnValue(qb);

      const result = await service.findAll({ search: 'somchai', role: 'ADMIN', page: 1, limit: 10 });

      expect(qb.andWhere).toHaveBeenCalledTimes(2);
      expect(result.items).toHaveLength(1);
      expect(result.items[0].username).toBe('somchai');
      expect(result.items[0].role).toBe(UserRole.ADMIN);
      expect(result.total).toBe(1);
      expect(result.totalPages).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return user details by id', async () => {
      mockRepository.findOneBy.mockResolvedValue(mockUser);

      const result = await service.findOne(mockUser.id);
      expect(result.id).toBe(mockUser.id);
      expect(result.username).toBe('somchai');
      expect(result.fullName).toBe('สมชาย เข็มกลัด');
      expect((result as any).passwordHash).toBeUndefined();
    });

    it('should throw NotFoundException if user is not found', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create and return a new user', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const dto = {
        username: 'newuser',
        password: 'Password!2026Secure',
        role: UserRole.SALES,
        fullName: 'ขายดี มีสุข',
        nickname: 'ดี',
        phone: '0899999999',
        email: 'sales@example.com',
        citizenId: '1234567890123',
        lineId: '@newuser_line',
      };

      const result = await service.create(dto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { username: 'newuser' } });
      expect(mockRepository.create).toHaveBeenCalled();
      expect(result.username).toBe('newuser');
    });

    it('should throw ConflictException if username already exists', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);

      await expect(
        service.create({
          username: 'somchai',
          password: 'Password!2026Secure',
          role: UserRole.ADMIN,
          fullName: 'สมชาย เข็มกลัด',
        }),
      ).rejects.toThrow(ConflictException);
    });
    it('should throw BadRequestException if creating admin with INACTIVE status', async () => {
      await expect(
        service.create({
          username: 'admin',
          password: 'Password!2026Secure',
          status: 'INACTIVE',
          role: UserRole.ADMIN,
          fullName: 'ผู้ดูแลระบบ',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('should update user fields and return updated user', async () => {
      mockRepository.findOneBy.mockResolvedValue({ ...mockUser });

      const result = await service.update(mockUser.id, {
        fullName: 'สมชาย คนใหม่',
        role: UserRole.SUPER_ADMIN,
      });

      expect(mockRepository.save).toHaveBeenCalled();
      expect(result.fullName).toBe('สมชาย คนใหม่');
    });

    it('should throw BadRequestException if updating admin to INACTIVE status', async () => {
      const adminUser = { ...mockUser, username: 'admin' };
      mockRepository.findOneBy.mockResolvedValue(adminUser);

      await expect(
        service.update(adminUser.id, { status: 'INACTIVE' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if updating non-existent user', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.update('non-existent', { role: UserRole.ADMIN })).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should throw BadRequestException if user tries to delete their own account', async () => {
      await expect(service.delete('user-123', 'user-123')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if trying to delete admin user', async () => {
      const adminUser = { ...mockUser, username: 'admin' };
      mockRepository.findOneBy.mockResolvedValue(adminUser);

      await expect(service.delete(adminUser.id, 'other-user')).rejects.toThrow(BadRequestException);
    });

    it('should delete user if exists', async () => {
      mockRepository.findOneBy.mockResolvedValue(mockUser);

      const result = await service.delete(mockUser.id, 'other-user');
      expect(result.deleted).toBe(true);
      expect(result.id).toBe(mockUser.id);
      expect(mockRepository.remove).toHaveBeenCalled();
    });

    it('should throw NotFoundException if deleting non-existent user', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.delete('non-existent', 'other-user')).rejects.toThrow(NotFoundException);
    });
  });
});
