import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Customer } from './customer.entity.js';
import { Project } from './project.entity.js';
import { Product } from './product.entity.js';
import { User } from './user.entity.js';

export enum QuotationStatus {
  DRAFT = 'DRAFT',
  PENDING_REVIEW = 'PENDING_REVIEW',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  SENT = 'SENT',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

export enum QuotationDiscountType {
  AMOUNT = 'AMOUNT',
  PERCENT = 'PERCENT',
}

export enum QuotationItemType {
  PRODUCT = 'PRODUCT',
  SERVICE = 'SERVICE',
  CUSTOM = 'CUSTOM',
  LABOR = 'LABOR',
}

@Entity('quotations')
export class Quotation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'quotation_number', type: 'varchar', length: 32, unique: true })
  quotationNumber!: string;

  @Column({ name: 'customer_id', type: 'uuid' })
  customerId!: string;

  @ManyToOne(() => Customer, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'customer_id' })
  customer!: Customer;

  @Column({ name: 'project_id', type: 'uuid', nullable: true })
  projectId!: string | null;

  @ManyToOne(() => Project, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'project_id' })
  project!: Project | null;

  @Column({ name: 'seller_id', type: 'uuid', nullable: true })
  sellerId!: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'seller_id' })
  seller!: User | null;

  @Column({ name: 'approved_by_id', type: 'uuid', nullable: true })
  approvedById!: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'approved_by_id' })
  approvedBy!: User | null;

  @Column({
    type: 'varchar',
    length: 32,
    default: QuotationStatus.DRAFT,
  })
  status!: string;

  @Column({ name: 'issue_date', type: 'date' })
  issueDate!: string;

  @Column({ name: 'valid_until', type: 'date' })
  validUntil!: string;

  @Column({ name: 'valid_days', type: 'integer', default: 30 })
  validDays!: number;

  // Snapshot customer details at issuance time
  @Column({ name: 'customer_name', type: 'varchar', length: 200 })
  customerName!: string;

  @Column({ name: 'customer_address', type: 'text', nullable: true })
  customerAddress!: string | null;

  @Column({ name: 'customer_phone', type: 'varchar', length: 40, nullable: true })
  customerPhone!: string | null;

  @Column({ name: 'customer_tax_id', type: 'varchar', length: 32, nullable: true })
  customerTaxId!: string | null;

  @Column({ name: 'customer_contact', type: 'varchar', length: 160, nullable: true })
  customerContact!: string | null;

  // Snapshot project name at issuance time
  @Column({ name: 'project_name', type: 'varchar', length: 200, nullable: true })
  projectName!: string | null;

  // Financial Calculations
  @Column({
    type: 'numeric',
    precision: 15,
    scale: 2,
    default: 0,
  })
  subtotal!: number;

  @Column({
    name: 'discount_type',
    type: 'varchar',
    length: 20,
    default: QuotationDiscountType.AMOUNT,
  })
  discountType!: string;

  @Column({
    name: 'discount_rate',
    type: 'numeric',
    precision: 8,
    scale: 2,
    default: 0,
  })
  discountRate!: number;

  @Column({
    name: 'discount_amount',
    type: 'numeric',
    precision: 15,
    scale: 2,
    default: 0,
  })
  discountAmount!: number;

  @Column({
    name: 'total_after_discount',
    type: 'numeric',
    precision: 15,
    scale: 2,
    default: 0,
  })
  totalAfterDiscount!: number;

  @Column({
    name: 'vat_rate',
    type: 'numeric',
    precision: 5,
    scale: 2,
    default: 7.0,
  })
  vatRate!: number;

  @Column({
    name: 'vat_amount',
    type: 'numeric',
    precision: 15,
    scale: 2,
    default: 0,
  })
  vatAmount!: number;

  @Column({
    name: 'grand_total',
    type: 'numeric',
    precision: 15,
    scale: 2,
    default: 0,
  })
  grandTotal!: number;

  @Column({
    name: 'total_cost',
    type: 'numeric',
    precision: 15,
    scale: 2,
    default: 0,
  })
  totalCost!: number;

  @Column({
    name: 'estimated_profit',
    type: 'numeric',
    precision: 15,
    scale: 2,
    default: 0,
  })
  estimatedProfit!: number;

  @Column({
    name: 'profit_margin_percent',
    type: 'numeric',
    precision: 8,
    scale: 2,
    default: 0,
  })
  profitMarginPercent!: number;

  // Terms and Notes
  @Column({ name: 'payment_terms', type: 'text', nullable: true })
  paymentTerms!: string | null;

  @Column({ name: 'delivery_terms', type: 'text', nullable: true })
  deliveryTerms!: string | null;

  @Column({ name: 'warranty_terms', type: 'text', nullable: true })
  warrantyTerms!: string | null;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason!: string | null;

  @OneToMany(() => QuotationItem, (item) => item.quotation, {
    cascade: true,
  })
  items!: QuotationItem[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}

@Entity('quotation_items')
export class QuotationItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'quotation_id', type: 'uuid' })
  quotationId!: string;

  @ManyToOne(() => Quotation, (quotation) => quotation.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'quotation_id' })
  quotation!: Quotation;

  @Column({ name: 'product_id', type: 'uuid', nullable: true })
  productId!: string | null;

  @ManyToOne(() => Product, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'product_id' })
  product!: Product | null;

  @Column({
    name: 'item_type',
    type: 'varchar',
    length: 32,
    default: QuotationItemType.PRODUCT,
  })
  itemType!: string;

  @Column({ name: 'item_code', type: 'varchar', length: 50, nullable: true })
  itemCode!: string | null;

  @Column({ name: 'item_name', type: 'varchar', length: 250 })
  itemName!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
    default: 1,
  })
  quantity!: number;

  @Column({ type: 'varchar', length: 32, default: 'ชิ้น' })
  unit!: string;

  @Column({
    name: 'unit_cost',
    type: 'numeric',
    precision: 15,
    scale: 2,
    default: 0,
  })
  unitCost!: number;

  @Column({
    name: 'unit_price',
    type: 'numeric',
    precision: 15,
    scale: 2,
    default: 0,
  })
  unitPrice!: number;

  @Column({
    name: 'discount_amount',
    type: 'numeric',
    precision: 15,
    scale: 2,
    default: 0,
  })
  discountAmount!: number;

  @Column({
    name: 'line_total',
    type: 'numeric',
    precision: 15,
    scale: 2,
    default: 0,
  })
  lineTotal!: number;

  @Column({ name: 'sort_order', type: 'integer', default: 0 })
  sortOrder!: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
