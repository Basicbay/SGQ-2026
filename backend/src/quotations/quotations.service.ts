import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../database/customer.entity.js';
import { Project } from '../database/project.entity.js';
import { Product } from '../database/product.entity.js';
import {
  Quotation,
  QuotationDiscountType,
  QuotationItem,
  QuotationItemType,
  QuotationStatus,
} from '../database/quotation.entity.js';
import { User, UserRole } from '../database/user.entity.js';
import type {
  ChangeQuotationStatusDto,
  CreateQuotationDto,
  DeleteQuotationResponse,
  QuotationDetailResponse,
  QuotationItemInputDto,
  QuotationListItemResponse,
  QuotationListResponse,
  QuotationQueryDto,
  UpdateQuotationDto,
} from './quotation.dto.js';

@Injectable()
export class QuotationsService {
  constructor(
    @InjectRepository(Quotation)
    private readonly quotationRepository: Repository<Quotation>,
    @InjectRepository(QuotationItem)
    private readonly quotationItemRepository: Repository<QuotationItem>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  private round(value: number, decimals: number = 2): number {
    const factor = Math.pow(10, decimals);
    return Math.round((value + Number.EPSILON) * factor) / factor;
  }

  private async generateQuotationNumber(): Promise<string> {
    const currentYear = new Date().getFullYear();
    const prefix = `QT-${currentYear}-`;
    const latest = await this.quotationRepository
      .createQueryBuilder('quotation')
      .where('quotation.quotation_number LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('quotation.quotation_number', 'DESC')
      .getOne();

    let nextSeq = 1;
    if (latest && latest.quotationNumber) {
      const parts = latest.quotationNumber.split('-');
      const num = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(num)) {
        nextSeq = num + 1;
      }
    }
    return `${prefix}${nextSeq.toString().padStart(4, '0')}`;
  }

  private calculateTotals(
    items: QuotationItemInputDto[],
    discountType: string = QuotationDiscountType.AMOUNT,
    discountRate: number = 0,
    vatRate: number = 7.0,
  ) {
    let subtotal = 0;
    let totalCost = 0;

    const calculatedItems = items.map((item, index) => {
      const quantity = Math.max(0.01, Number(item.quantity) || 1);
      const unitPrice = Math.max(0, Number(item.unitPrice) || 0);
      const unitCost = Math.max(0, Number(item.unitCost) || 0);
      const discountAmount = Math.max(0, Number(item.discountAmount) || 0);
      const lineTotal = this.round(Math.max(0, quantity * unitPrice - discountAmount));

      subtotal += lineTotal;
      totalCost += this.round(quantity * unitCost);

      return {
        ...item,
        quantity,
        unitPrice,
        unitCost,
        discountAmount,
        lineTotal,
        sortOrder: item.sortOrder ?? index + 1,
      };
    });

    subtotal = this.round(subtotal);
    totalCost = this.round(totalCost);

    let calculatedDiscountAmount = 0;
    if (discountType === QuotationDiscountType.PERCENT) {
      calculatedDiscountAmount = this.round((subtotal * (Number(discountRate) || 0)) / 100);
    } else {
      calculatedDiscountAmount = this.round(Math.min(subtotal, Math.max(0, Number(discountRate) || 0)));
    }

    const totalAfterDiscount = this.round(Math.max(0, subtotal - calculatedDiscountAmount));
    const effectiveVatRate = Math.max(0, Number(vatRate) || 0);
    const vatAmount = this.round((totalAfterDiscount * effectiveVatRate) / 100);
    const grandTotal = this.round(totalAfterDiscount + vatAmount);

    const estimatedProfit = this.round(totalAfterDiscount - totalCost);
    const profitMarginPercent = totalAfterDiscount > 0
      ? this.round((estimatedProfit / totalAfterDiscount) * 100)
      : 0;

    return {
      calculatedItems,
      subtotal,
      discountType,
      discountRate: Number(discountRate) || 0,
      discountAmount: calculatedDiscountAmount,
      totalAfterDiscount,
      vatRate: effectiveVatRate,
      vatAmount,
      grandTotal,
      totalCost,
      estimatedProfit,
      profitMarginPercent,
    };
  }

  private mapQuotationListItem(quotation: Quotation, itemCount: number = 0): QuotationListItemResponse {
    return {
      id: quotation.id,
      quotationNumber: quotation.quotationNumber,
      customerId: quotation.customerId,
      customerName: quotation.customerName,
      projectId: quotation.projectId ?? null,
      projectName: quotation.projectName ?? null,
      status: quotation.status,
      issueDate: quotation.issueDate,
      validUntil: quotation.validUntil,
      validDays: quotation.validDays,
      subtotal: Number(quotation.subtotal) || 0,
      discountAmount: Number(quotation.discountAmount) || 0,
      totalAfterDiscount: Number(quotation.totalAfterDiscount) || 0,
      vatAmount: Number(quotation.vatAmount) || 0,
      grandTotal: Number(quotation.grandTotal) || 0,
      itemCount: quotation.items ? quotation.items.length : itemCount,
      seller: quotation.seller
        ? {
            id: quotation.seller.id,
            username: quotation.seller.username,
            fullName: quotation.seller.fullName || quotation.seller.username,
            role: quotation.seller.role,
          }
        : null,
      createdAt: quotation.createdAt,
      updatedAt: quotation.updatedAt,
    };
  }

  private mapQuotationDetail(quotation: Quotation): QuotationDetailResponse {
    const listPart = this.mapQuotationListItem(quotation, quotation.items ? quotation.items.length : 0);

    const sortedItems = (quotation.items || []).sort((a, b) => a.sortOrder - b.sortOrder);

    return {
      ...listPart,
      customerAddress: quotation.customerAddress ?? null,
      customerPhone: quotation.customerPhone ?? null,
      customerTaxId: quotation.customerTaxId ?? null,
      customerContact: quotation.customerContact ?? null,
      discountType: quotation.discountType,
      discountRate: Number(quotation.discountRate) || 0,
      vatRate: Number(quotation.vatRate) || 0,
      totalCost: Number(quotation.totalCost) || 0,
      estimatedProfit: Number(quotation.estimatedProfit) || 0,
      profitMarginPercent: Number(quotation.profitMarginPercent) || 0,
      paymentTerms: quotation.paymentTerms ?? null,
      deliveryTerms: quotation.deliveryTerms ?? null,
      warrantyTerms: quotation.warrantyTerms ?? null,
      notes: quotation.notes ?? null,
      rejectionReason: quotation.rejectionReason ?? null,
      approvedBy: quotation.approvedBy
        ? {
            id: quotation.approvedBy.id,
            username: quotation.approvedBy.username,
            fullName: quotation.approvedBy.fullName || quotation.approvedBy.username,
            role: quotation.approvedBy.role,
          }
        : null,
      items: sortedItems.map((item) => ({
        id: item.id,
        quotationId: item.quotationId,
        productId: item.productId ?? null,
        itemType: item.itemType,
        itemCode: item.itemCode ?? null,
        itemName: item.itemName,
        description: item.description ?? null,
        quantity: Number(item.quantity) || 0,
        unit: item.unit,
        unitCost: Number(item.unitCost) || 0,
        unitPrice: Number(item.unitPrice) || 0,
        discountAmount: Number(item.discountAmount) || 0,
        lineTotal: Number(item.lineTotal) || 0,
        sortOrder: item.sortOrder,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
    };
  }

  async findAll(query: QuotationQueryDto): Promise<QuotationListResponse> {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 10));
    const skip = (page - 1) * limit;

    const qb = this.quotationRepository
      .createQueryBuilder('quotation')
      .leftJoinAndSelect('quotation.seller', 'seller')
      .leftJoinAndSelect('quotation.items', 'items');

    if (query.search && query.search.trim() !== '') {
      const s = `%${query.search.trim().toLowerCase()}%`;
      qb.andWhere(
        '(LOWER(quotation.quotation_number) LIKE :s OR LOWER(quotation.customer_name) LIKE :s OR LOWER(COALESCE(quotation.project_name, \'\')) LIKE :s)',
        { s },
      );
    }

    if (query.status && query.status.trim() !== '' && query.status !== 'ALL') {
      qb.andWhere('quotation.status = :status', { status: query.status.trim() });
    }

    if (query.customerId && query.customerId.trim() !== '') {
      qb.andWhere('quotation.customer_id = :customerId', {
        customerId: query.customerId.trim(),
      });
    }

    if (query.projectId && query.projectId.trim() !== '') {
      qb.andWhere('quotation.project_id = :projectId', {
        projectId: query.projectId.trim(),
      });
    }

    if (query.startDate && query.startDate.trim() !== '') {
      qb.andWhere('quotation.issue_date >= :startDate', {
        startDate: query.startDate.trim(),
      });
    }

    if (query.endDate && query.endDate.trim() !== '') {
      qb.andWhere('quotation.issue_date <= :endDate', {
        endDate: query.endDate.trim(),
      });
    }

    qb.orderBy('quotation.issue_date', 'DESC');
    qb.addOrderBy('quotation.created_at', 'DESC');
    qb.skip(skip);
    qb.take(limit);

    const [items, total] = await qb.getManyAndCount();

    // Summary statistics for dashboard cards
    const allQuotes = await this.quotationRepository.find({
      select: { status: true, grandTotal: true },
    });

    let pendingCount = 0;
    let approvedCount = 0;
    let totalValue = 0;

    for (const q of allQuotes) {
      const status = q.status;
      const totalAmount = Number(q.grandTotal) || 0;
      totalValue += totalAmount;

      if (status === QuotationStatus.PENDING_REVIEW || status === QuotationStatus.PENDING_APPROVAL) {
        pendingCount++;
      } else if (
        status === QuotationStatus.APPROVED ||
        status === QuotationStatus.SENT ||
        status === QuotationStatus.ACCEPTED
      ) {
        approvedCount++;
      }
    }

    return {
      items: items.map((q) => this.mapQuotationListItem(q)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
      stats: {
        totalQuotations: allQuotes.length,
        pendingCount,
        approvedCount,
        totalValue: this.round(totalValue),
      },
    };
  }

  async findOne(id: string): Promise<QuotationDetailResponse> {
    const quotation = await this.quotationRepository.findOne({
      where: { id },
      relations: {
        customer: true,
        project: true,
        seller: true,
        approvedBy: true,
        items: true,
      },
    });

    if (!quotation) {
      throw new NotFoundException(`ไม่พบข้อมูลใบเสนอราคาตามรหัสที่ระบุ`);
    }

    return this.mapQuotationDetail(quotation);
  }

  async create(dto: CreateQuotationDto, currentUser?: { id: string; role: string }): Promise<QuotationDetailResponse> {
    const customer = await this.customerRepository.findOne({
      where: { id: dto.customerId },
    });

    if (!customer) {
      throw new NotFoundException(`ไม่พบข้อมูลลูกค้าตามรหัสที่ระบุ`);
    }

    let projectName: string | null = dto.projectName?.trim() || null;
    let projectId: string | null = null;

    if (dto.projectId) {
      const project = await this.projectRepository.findOne({
        where: { id: dto.projectId },
      });
      if (!project) {
        throw new NotFoundException(`ไม่พบข้อมูลโครงการตามรหัสที่ระบุ`);
      }
      projectId = project.id;
      projectName = projectName || project.name;
    }

    let quotationNumber = dto.quotationNumber?.trim();
    if (!quotationNumber) {
      quotationNumber = await this.generateQuotationNumber();
    } else {
      const existing = await this.quotationRepository.findOne({
        where: { quotationNumber },
      });
      if (existing) {
        throw new ConflictException(`เลขที่ใบเสนอราคา "${quotationNumber}" มีอยู่ในระบบแล้ว`);
      }
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const issueDate = dto.issueDate || todayStr;
    const validDays = Math.max(1, dto.validDays ?? 30);

    let validUntil = dto.validUntil;
    if (!validUntil) {
      const d = new Date(issueDate);
      d.setDate(d.getDate() + validDays);
      validUntil = d.toISOString().split('T')[0];
    }

    const sellerId = dto.sellerId || (currentUser ? currentUser.id : null);

    const calculation = this.calculateTotals(
      dto.items || [],
      dto.discountType || QuotationDiscountType.AMOUNT,
      dto.discountRate ?? 0,
      dto.vatRate ?? 7.0,
    );

    const quotation = this.quotationRepository.create({
      quotationNumber,
      customerId: customer.id,
      projectId,
      sellerId,
      approvedById: null,
      status: dto.status?.trim() || QuotationStatus.DRAFT,
      issueDate,
      validUntil,
      validDays,
      customerName: dto.customerName?.trim() || customer.name,
      customerAddress: dto.customerAddress?.trim() || customer.address,
      customerPhone: dto.customerPhone?.trim() || customer.phone,
      customerTaxId: dto.customerTaxId?.trim() || customer.taxId,
      customerContact: dto.customerContact?.trim() || customer.contactName,
      projectName,
      subtotal: calculation.subtotal,
      discountType: calculation.discountType,
      discountRate: calculation.discountRate,
      discountAmount: calculation.discountAmount,
      totalAfterDiscount: calculation.totalAfterDiscount,
      vatRate: calculation.vatRate,
      vatAmount: calculation.vatAmount,
      grandTotal: calculation.grandTotal,
      totalCost: calculation.totalCost,
      estimatedProfit: calculation.estimatedProfit,
      profitMarginPercent: calculation.profitMarginPercent,
      paymentTerms: dto.paymentTerms?.trim() || null,
      deliveryTerms: dto.deliveryTerms?.trim() || null,
      warrantyTerms: dto.warrantyTerms?.trim() || null,
      notes: dto.notes?.trim() || null,
      rejectionReason: null,
    });

    const savedQuotation = await this.quotationRepository.save(quotation);

    if (calculation.calculatedItems.length > 0) {
      const itemsToSave = calculation.calculatedItems.map((item) => {
        return this.quotationItemRepository.create({
          quotationId: savedQuotation.id,
          productId: item.productId || null,
          itemType: item.itemType || QuotationItemType.PRODUCT,
          itemCode: item.itemCode?.trim() || null,
          itemName: item.itemName.trim(),
          description: item.description?.trim() || null,
          quantity: item.quantity,
          unit: item.unit?.trim() || 'ชิ้น',
          unitCost: item.unitCost,
          unitPrice: item.unitPrice,
          discountAmount: item.discountAmount,
          lineTotal: item.lineTotal,
          sortOrder: item.sortOrder,
        });
      });
      await this.quotationItemRepository.save(itemsToSave);
    }

    return this.findOne(savedQuotation.id);
  }

  async update(
    id: string,
    dto: UpdateQuotationDto,
    currentUser?: { id: string; role: string },
  ): Promise<QuotationDetailResponse> {
    const quotation = await this.quotationRepository.findOne({
      where: { id },
      relations: { items: true },
    });

    if (!quotation) {
      throw new NotFoundException(`ไม่พบข้อมูลใบเสนอราคาตามรหัสที่ระบุ`);
    }

    if (dto.quotationNumber && dto.quotationNumber.trim() !== quotation.quotationNumber) {
      const existing = await this.quotationRepository.findOne({
        where: { quotationNumber: dto.quotationNumber.trim() },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException(`เลขที่ใบเสนอราคา "${dto.quotationNumber.trim()}" ซ้ำกับเอกสารอื่นในระบบ`);
      }
      quotation.quotationNumber = dto.quotationNumber.trim();
    }

    if (dto.customerId && dto.customerId !== quotation.customerId) {
      const customer = await this.customerRepository.findOne({
        where: { id: dto.customerId },
      });
      if (!customer) {
        throw new NotFoundException(`ไม่พบข้อมูลลูกค้าตามรหัสที่ระบุ`);
      }
      quotation.customerId = customer.id;
      if (!dto.customerName) quotation.customerName = customer.name;
      if (!dto.customerAddress) quotation.customerAddress = customer.address;
      if (!dto.customerPhone) quotation.customerPhone = customer.phone;
      if (!dto.customerTaxId) quotation.customerTaxId = customer.taxId;
      if (!dto.customerContact) quotation.customerContact = customer.contactName;
    }

    if (dto.projectId !== undefined) {
      if (dto.projectId) {
        const project = await this.projectRepository.findOne({
          where: { id: dto.projectId },
        });
        if (!project) {
          throw new NotFoundException(`ไม่พบข้อมูลโครงการตามรหัสที่ระบุ`);
        }
        quotation.projectId = project.id;
        if (!dto.projectName) quotation.projectName = project.name;
      } else {
        quotation.projectId = null;
        if (!dto.projectName) quotation.projectName = null;
      }
    }

    if (dto.sellerId !== undefined) quotation.sellerId = dto.sellerId;
    if (dto.status !== undefined) quotation.status = dto.status.trim();
    if (dto.issueDate !== undefined) quotation.issueDate = dto.issueDate;
    if (dto.validDays !== undefined) quotation.validDays = dto.validDays;
    if (dto.validUntil !== undefined) quotation.validUntil = dto.validUntil;

    if (dto.customerName !== undefined) quotation.customerName = dto.customerName.trim();
    if (dto.customerAddress !== undefined) quotation.customerAddress = dto.customerAddress ? dto.customerAddress.trim() : null;
    if (dto.customerPhone !== undefined) quotation.customerPhone = dto.customerPhone ? dto.customerPhone.trim() : null;
    if (dto.customerTaxId !== undefined) quotation.customerTaxId = dto.customerTaxId ? dto.customerTaxId.trim() : null;
    if (dto.customerContact !== undefined) quotation.customerContact = dto.customerContact ? dto.customerContact.trim() : null;
    if (dto.projectName !== undefined) quotation.projectName = dto.projectName ? dto.projectName.trim() : null;

    if (dto.paymentTerms !== undefined) quotation.paymentTerms = dto.paymentTerms ? dto.paymentTerms.trim() : null;
    if (dto.deliveryTerms !== undefined) quotation.deliveryTerms = dto.deliveryTerms ? dto.deliveryTerms.trim() : null;
    if (dto.warrantyTerms !== undefined) quotation.warrantyTerms = dto.warrantyTerms ? dto.warrantyTerms.trim() : null;
    if (dto.notes !== undefined) quotation.notes = dto.notes ? dto.notes.trim() : null;

    // Recalculate items and totals if items or discount/vat settings provided
    const itemsDto = dto.items !== undefined
      ? dto.items
      : quotation.items.map((i) => ({
          productId: i.productId ?? undefined,
          itemType: i.itemType,
          itemCode: i.itemCode ?? undefined,
          itemName: i.itemName,
          description: i.description ?? undefined,
          quantity: Number(i.quantity),
          unit: i.unit,
          unitCost: Number(i.unitCost),
          unitPrice: Number(i.unitPrice),
          discountAmount: Number(i.discountAmount),
          sortOrder: i.sortOrder,
        }));

    const discountType = dto.discountType !== undefined ? dto.discountType : quotation.discountType;
    const discountRate = dto.discountRate !== undefined ? dto.discountRate : Number(quotation.discountRate);
    const vatRate = dto.vatRate !== undefined ? dto.vatRate : Number(quotation.vatRate);

    const calculation = this.calculateTotals(itemsDto, discountType, discountRate, vatRate);

    quotation.subtotal = calculation.subtotal;
    quotation.discountType = calculation.discountType;
    quotation.discountRate = calculation.discountRate;
    quotation.discountAmount = calculation.discountAmount;
    quotation.totalAfterDiscount = calculation.totalAfterDiscount;
    quotation.vatRate = calculation.vatRate;
    quotation.vatAmount = calculation.vatAmount;
    quotation.grandTotal = calculation.grandTotal;
    quotation.totalCost = calculation.totalCost;
    quotation.estimatedProfit = calculation.estimatedProfit;
    quotation.profitMarginPercent = calculation.profitMarginPercent;

    await this.quotationRepository.save(quotation);

    if (dto.items !== undefined) {
      await this.quotationItemRepository.delete({ quotationId: quotation.id });
      if (calculation.calculatedItems.length > 0) {
        const newItems = calculation.calculatedItems.map((item) =>
          this.quotationItemRepository.create({
            quotationId: quotation.id,
            productId: item.productId || null,
            itemType: item.itemType || QuotationItemType.PRODUCT,
            itemCode: item.itemCode?.trim() || null,
            itemName: item.itemName.trim(),
            description: item.description?.trim() || null,
            quantity: item.quantity,
            unit: item.unit?.trim() || 'ชิ้น',
            unitCost: item.unitCost,
            unitPrice: item.unitPrice,
            discountAmount: item.discountAmount,
            lineTotal: item.lineTotal,
            sortOrder: item.sortOrder,
          }),
        );
        await this.quotationItemRepository.save(newItems);
      }
    }

    return this.findOne(quotation.id);
  }

  async changeStatus(
    id: string,
    dto: ChangeQuotationStatusDto,
    currentUser?: { id: string; role: string },
  ): Promise<QuotationDetailResponse> {
    const quotation = await this.quotationRepository.findOne({
      where: { id },
    });

    if (!quotation) {
      throw new NotFoundException(`ไม่พบข้อมูลใบเสนอราคาตามรหัสที่ระบุ`);
    }

    quotation.status = dto.status;

    if (dto.status === QuotationStatus.APPROVED) {
      quotation.approvedById = currentUser ? currentUser.id : quotation.approvedById;
    } else if (dto.status === QuotationStatus.REJECTED) {
      quotation.rejectionReason = dto.rejectionReason?.trim() || 'ลูกค้าไม่อนุมัติใบเสนอราคา';
    } else if (dto.status === QuotationStatus.CANCELLED) {
      quotation.rejectionReason = dto.rejectionReason?.trim() || 'ยกเลิกใบเสนอราคา';
    }

    await this.quotationRepository.save(quotation);
    return this.findOne(id);
  }

  async remove(id: string, currentUser?: { id: string; role: string }): Promise<DeleteQuotationResponse> {
    const quotation = await this.quotationRepository.findOne({
      where: { id },
    });

    if (!quotation) {
      throw new NotFoundException(`ไม่พบข้อมูลใบเสนอราคาตามรหัสที่ระบุ`);
    }

    // Business check: Non-admins can only delete DRAFT or CANCELLED quotations
    const isAdmin = currentUser && (currentUser.role === UserRole.SUPER_ADMIN || currentUser.role === UserRole.ADMIN);
    if (!isAdmin && quotation.status !== QuotationStatus.DRAFT && quotation.status !== QuotationStatus.CANCELLED) {
      throw new BadRequestException(`ไม่สามารถลบใบเสนอราคาที่มีสถานะ "${quotation.status}" ได้`);
    }

    await this.quotationRepository.remove(quotation);

    return {
      id,
      message: 'ลบข้อมูลใบเสนอราคาเรียบร้อยแล้ว',
    };
  }
}
