import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../database/customer.entity.js';
import { Project, ProjectStatus, ProjectType } from '../database/project.entity.js';
import type {
  CreateProjectDto,
  DeleteProjectResponse,
  ProjectItemResponse,
  ProjectListResponse,
  ProjectQueryDto,
  UpdateProjectDto,
} from './project.dto.js';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  private mapProjectResponse(project: Project): ProjectItemResponse {
    return {
      id: project.id,
      projectCode: project.projectCode,
      name: project.name,
      customerId: project.customerId ?? null,
      customer: project.customer
        ? {
            id: project.customer.id,
            customerCode: project.customer.customerCode,
            name: project.customer.name,
            customerType: project.customer.customerType,
            phone: project.customer.phone ?? null,
            email: project.customer.email ?? null,
          }
        : null,
      customerName: project.customer?.name ?? null,
      projectType: project.projectType,
      location: project.location ?? null,
      budget: Number(project.budget) || 0,
      startDate: project.startDate ?? null,
      endDate: project.endDate ?? null,
      status: project.status,
      description: project.description ?? null,
      note: project.note ?? null,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    };
  }

  private async generateProjectCode(): Promise<string> {
    const currentYear = new Date().getFullYear();
    const prefix = `PRJ-${currentYear}-`;
    const latest = await this.projectRepository
      .createQueryBuilder('project')
      .where('project.project_code LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('project.project_code', 'DESC')
      .getOne();

    let nextSeq = 1;
    if (latest && latest.projectCode) {
      const parts = latest.projectCode.split('-');
      const num = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(num)) {
        nextSeq = num + 1;
      }
    }
    return `${prefix}${nextSeq.toString().padStart(4, '0')}`;
  }

  async findAll(query: ProjectQueryDto): Promise<ProjectListResponse> {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 10));
    const skip = (page - 1) * limit;

    const qb = this.projectRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.customer', 'customer');

    if (query.search && query.search.trim() !== '') {
      const s = `%${query.search.trim().toLowerCase()}%`;
      qb.andWhere(
        '(LOWER(project.project_code) LIKE :s OR LOWER(project.name) LIKE :s OR LOWER(COALESCE(project.location, \'\')) LIKE :s OR LOWER(COALESCE(customer.name, \'\')) LIKE :s)',
        { s },
      );
    }

    if (query.customerId && query.customerId.trim() !== '') {
      qb.andWhere('project.customer_id = :customerId', {
        customerId: query.customerId.trim(),
      });
    }

    if (query.projectType && query.projectType.trim() !== '') {
      qb.andWhere('project.project_type = :projectType', {
        projectType: query.projectType.trim(),
      });
    }

    if (query.status && query.status.trim() !== '') {
      qb.andWhere('project.status = :status', {
        status: query.status.trim(),
      });
    }

    qb.orderBy('project.createdAt', 'DESC');
    qb.skip(skip).take(limit);

    const [items, total] = await qb.getManyAndCount();

    return {
      items: items.map((p) => this.mapProjectResponse(p)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async findOne(id: string): Promise<ProjectItemResponse> {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: { customer: true },
    });
    if (!project) {
      throw new NotFoundException(`ไม่พบข้อมูลโครงการรหัส ${id}`);
    }
    return this.mapProjectResponse(project);
  }

  async create(dto: CreateProjectDto): Promise<ProjectItemResponse> {
    let projectCode = dto.projectCode?.trim();
    if (!projectCode) {
      projectCode = await this.generateProjectCode();
    } else {
      const existing = await this.projectRepository.findOne({
        where: { projectCode },
      });
      if (existing) {
        throw new ConflictException(`รหัสโครงการ ${projectCode} มีอยู่ในระบบแล้ว`);
      }
    }

    if (dto.customerId) {
      const customer = await this.customerRepository.findOne({
        where: { id: dto.customerId },
      });
      if (!customer) {
        throw new NotFoundException(`ไม่พบข้อมูลลูกค้ารหัส ${dto.customerId}`);
      }
    }

    const project = this.projectRepository.create({
      projectCode,
      name: dto.name.trim(),
      customerId: dto.customerId ?? null,
      projectType: dto.projectType ?? ProjectType.CONSTRUCTION,
      location: dto.location?.trim() || null,
      budget: dto.budget ?? 0,
      startDate: dto.startDate?.trim() || null,
      endDate: dto.endDate?.trim() || null,
      status: dto.status ?? ProjectStatus.PLANNING,
      description: dto.description?.trim() || null,
      note: dto.note?.trim() || null,
    });

    const saved = await this.projectRepository.save(project);
    return this.findOne(saved.id);
  }

  async update(id: string, dto: UpdateProjectDto): Promise<ProjectItemResponse> {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: { customer: true },
    });
    if (!project) {
      throw new NotFoundException(`ไม่พบข้อมูลโครงการรหัส ${id}`);
    }

    if (dto.projectCode && dto.projectCode.trim() !== project.projectCode) {
      const existing = await this.projectRepository.findOne({
        where: { projectCode: dto.projectCode.trim() },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException(`รหัสโครงการ ${dto.projectCode} มีอยู่ในระบบแล้ว`);
      }
      project.projectCode = dto.projectCode.trim();
    }

    if (dto.customerId !== undefined) {
      if (dto.customerId) {
        const customer = await this.customerRepository.findOne({
          where: { id: dto.customerId },
        });
        if (!customer) {
          throw new NotFoundException(`ไม่พบข้อมูลลูกค้ารหัส ${dto.customerId}`);
        }
        project.customerId = dto.customerId;
      } else {
        project.customerId = null;
      }
    }

    if (dto.name !== undefined) project.name = dto.name.trim();
    if (dto.projectType !== undefined) project.projectType = dto.projectType;
    if (dto.location !== undefined) project.location = dto.location ? dto.location.trim() : null;
    if (dto.budget !== undefined) project.budget = dto.budget;
    if (dto.startDate !== undefined) project.startDate = dto.startDate ? dto.startDate.trim() : null;
    if (dto.endDate !== undefined) project.endDate = dto.endDate ? dto.endDate.trim() : null;
    if (dto.status !== undefined) project.status = dto.status;
    if (dto.description !== undefined) project.description = dto.description ? dto.description.trim() : null;
    if (dto.note !== undefined) project.note = dto.note ? dto.note.trim() : null;

    await this.projectRepository.save(project);
    return this.findOne(id);
  }

  async remove(id: string): Promise<DeleteProjectResponse> {
    const project = await this.projectRepository.findOne({ where: { id } });
    if (!project) {
      throw new NotFoundException(`ไม่พบข้อมูลโครงการรหัส ${id}`);
    }
    await this.projectRepository.remove(project);
    return { deleted: true, id };
  }
}
