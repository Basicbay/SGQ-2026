import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ProductCategory {
  ALUMINIUM_PROFILES = 'aluminium-profiles',
  ARCHITECTURAL_GLASS = 'architectural-glass',
  HARDWARE_ACCESSORIES = 'hardware-accessories',
  DIGITAL_DOOR_LOCKS = 'digital-door-locks',
  CUSTOM_ALUMINIUM = 'custom-aluminium',
  ADDITIONAL_PRODUCTS = 'additional-products',
  INSTALLATION_SERVICE = 'installation-service',
}

export enum StockStatus {
  IN_STOCK = 'IN_STOCK',
  LOW_STOCK = 'LOW_STOCK',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  MADE_TO_ORDER = 'MADE_TO_ORDER',
}

export enum ProductStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'product_code', type: 'varchar', length: 32, unique: true })
  productCode!: string;

  @Column({ type: 'varchar', length: 200 })
  name!: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: ProductCategory.ALUMINIUM_PROFILES,
  })
  category!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  brand!: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  color!: string | null;

  @Column({ type: 'varchar', length: 32, default: 'ชิ้น' })
  unit!: string;

  @Column({
    name: 'cost_price',
    type: 'numeric',
    precision: 15,
    scale: 2,
    default: 0,
  })
  costPrice!: number;

  @Column({
    name: 'selling_price',
    type: 'numeric',
    precision: 15,
    scale: 2,
    default: 0,
  })
  sellingPrice!: number;

  @Column({
    name: 'stock_quantity',
    type: 'numeric',
    precision: 12,
    scale: 2,
    default: 0,
  })
  stockQuantity!: number;

  @Column({
    name: 'stock_status',
    type: 'varchar',
    length: 32,
    default: StockStatus.IN_STOCK,
  })
  stockStatus!: string;

  @Column({ type: 'varchar', length: 32, default: ProductStatus.ACTIVE })
  status!: string;

  @Column({ name: 'image_url', type: 'varchar', length: 500, nullable: true })
  imageUrl!: string | null;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'text', nullable: true })
  note!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
