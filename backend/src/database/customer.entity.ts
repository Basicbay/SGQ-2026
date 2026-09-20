import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export enum CustomerType {
  COMPANY = 'COMPANY',
  INDIVIDUAL = 'INDIVIDUAL',
}

export enum CustomerStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'customer_code', type: 'varchar', length: 32, unique: true })
  customerCode!: string;

  @Column({ type: 'varchar', length: 200 })
  name!: string;

  @Column({ name: 'customer_type', type: 'varchar', length: 32, default: CustomerType.COMPANY })
  customerType!: string;

  @Column({ name: 'tax_id', type: 'varchar', length: 32, nullable: true })
  taxId!: string | null;

  @Column({ name: 'contact_name', type: 'varchar', length: 160, nullable: true })
  contactName!: string | null;

  @Column({ type: 'varchar', length: 40, nullable: true })
  phone!: string | null;

  @Column({ type: 'varchar', length: 160, nullable: true })
  email!: string | null;

  @Column({ name: 'line_id', type: 'varchar', length: 100, nullable: true })
  lineId!: string | null;

  @Column({ type: 'text', nullable: true })
  address!: string | null;

  @Column({ type: 'text', nullable: true })
  note!: string | null;

  @Column({ type: 'varchar', length: 32, default: CustomerStatus.ACTIVE })
  status!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
