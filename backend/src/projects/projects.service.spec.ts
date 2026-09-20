import { ConflictException, NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Customer } from '../database/customer.entity.js';
import { Project, ProjectStatus, ProjectType } from '../database/project.entity.js';
import { ProjectsService } from './projects.service.js';

describe('ProjectsService', () => {
  let service: ProjectsService;
  let mockProjectRepo: any;
  let mockCustomerRepo: any;

  const mockCustomer: Customer = {
    id: '73ede89f-7227-4563-9d60-57544ae4ec31',
    customerCode: 'CUST-2026-0001',
    name: 'บริษัท พราวด์ บิลด์ดิ้ง จำกัด',
    customerType: 'COMPANY',
    taxId: '0105558123456',
    contactName: 'คุณสมชาย',
    phone: '0812345678',
    email: 'contact@example.com',
    lineId: '@proudbuilding',
    address: 'บางนา',
    note: null,
    status: 'ACTIVE',
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
  };

  const mockProject: Project = {
    id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    projectCode: 'PRJ-2026-0001',
    name: 'งานก่อสร้างอาคารสำนักงาน 3 ชั้น',
    customerId: mockCustomer.id,
    customer: mockCustomer,
    projectType: ProjectType.CONSTRUCTION,
    location: 'ถนนบางนา-ตราด',
    budget: 18500000.0,
    startDate: '2026-02-01',
    endDate: '2026-11-30',
    status: ProjectStatus.IN_PROGRESS,
    description: 'ก่อสร้างโครงสร้างอาคาร',
    note: 'โครงการเฟส 1',
    createdAt: new Date('2026-02-01T00:00:00Z'),
    updatedAt: new Date('2026-02-01T00:00:00Z'),
  };

  beforeEach(() => {
    const qb: any = {
      leftJoinAndSelect: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      andWhere: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      take: vi.fn().mockReturnThis(),
      getOne: vi.fn().mockResolvedValue(null),
      getManyAndCount: vi.fn().mockResolvedValue([[mockProject], 1]),
    };

    mockProjectRepo = {
      createQueryBuilder: vi.fn().mockReturnValue(qb),
      findOne: vi.fn(),
      create: vi.fn((dto) => ({
        ...dto,
        id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
      save: vi.fn((entity) => Promise.resolve({ ...mockProject, ...entity })),
      remove: vi.fn((entity) => Promise.resolve(entity)),
    };

    mockCustomerRepo = {
      findOne: vi.fn().mockResolvedValue(mockCustomer),
    };

    service = new ProjectsService(mockProjectRepo, mockCustomerRepo);
  });

  describe('findAll', () => {
    it('should return paginated list of projects with search and filters', async () => {
      const qb: any = {
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        take: vi.fn().mockReturnThis(),
        getManyAndCount: vi.fn().mockResolvedValue([[mockProject], 1]),
      };
      mockProjectRepo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.findAll({
        search: 'สำนักงาน',
        projectType: 'CONSTRUCTION',
        status: 'IN_PROGRESS',
        page: 1,
        limit: 10,
      });

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.items[0].projectCode).toBe('PRJ-2026-0001');
      expect(result.items[0].customerName).toBe('บริษัท พราวด์ บิลด์ดิ้ง จำกัด');
    });
  });

  describe('findOne', () => {
    it('should return project when found', async () => {
      mockProjectRepo.findOne.mockResolvedValue(mockProject);
      const result = await service.findOne(mockProject.id);
      expect(result.id).toBe(mockProject.id);
      expect(result.name).toBe(mockProject.name);
    });

    it('should throw NotFoundException when project not found', async () => {
      mockProjectRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a project with manual project code', async () => {
      mockProjectRepo.findOne
        .mockResolvedValueOnce(null) // uniqueness check
        .mockResolvedValueOnce({ ...mockProject, customer: mockCustomer }); // findOne after save

      const result = await service.create({
        projectCode: 'PRJ-2026-0099',
        name: 'โครงการทดสอบ',
        customerId: mockCustomer.id,
        projectType: 'RESIDENTIAL',
        budget: 5000000,
        status: 'PLANNING',
      });

      expect(result).toBeDefined();
      expect(mockProjectRepo.create).toHaveBeenCalled();
      expect(mockProjectRepo.save).toHaveBeenCalled();
    });

    it('should throw ConflictException if projectCode already exists', async () => {
      mockProjectRepo.findOne.mockResolvedValueOnce(mockProject);

      await expect(
        service.create({
          projectCode: 'PRJ-2026-0001',
          name: 'โครงการซ้ำ',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException if customerId does not exist', async () => {
      mockProjectRepo.findOne.mockResolvedValueOnce(null);
      mockCustomerRepo.findOne.mockResolvedValueOnce(null);

      await expect(
        service.create({
          name: 'โครงการลูกค้าไม่มีจริง',
          customerId: '00000000-0000-0000-0000-000000000000',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update project successfully', async () => {
      mockProjectRepo.findOne
        .mockResolvedValueOnce({ ...mockProject }) // initial find
        .mockResolvedValueOnce({ ...mockProject, name: 'แก้ไขชื่อโครงการ' }); // findOne return

      const result = await service.update(mockProject.id, {
        name: 'แก้ไขชื่อโครงการ',
        budget: 20000000,
      });

      expect(result).toBeDefined();
      expect(mockProjectRepo.save).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove project successfully', async () => {
      mockProjectRepo.findOne.mockResolvedValue(mockProject);

      const result = await service.remove(mockProject.id);
      expect(result).toEqual({ deleted: true, id: mockProject.id });
      expect(mockProjectRepo.remove).toHaveBeenCalledWith(mockProject);
    });
  });
});
