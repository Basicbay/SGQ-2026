import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Customer } from './customer.entity.js';

export enum ProjectType {
  CONSTRUCTION = 'CONSTRUCTION',
  RESIDENTIAL = 'RESIDENTIAL',
  INTERIOR = 'INTERIOR',
  RENOVATION = 'RENOVATION',
  INFRASTRUCTURE = 'INFRASTRUCTURE',
}

export enum ProjectStatus {
  PLANNING = 'PLANNING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ON_HOLD = 'ON_HOLD',
  CANCELLED = 'CANCELLED',
}

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'project_code', type: 'varchar', length: 32, unique: true })
  projectCode!: string;

  @Column({ type: 'varchar', length: 200 })
  name!: string;

  @Column({ name: 'customer_id', type: 'uuid', nullable: true })
  customerId!: string | null;

  @ManyToOne(() => Customer, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'customer_id' })
  customer!: Customer | null;

  @Column({ name: 'project_type', type: 'varchar', length: 50, default: ProjectType.CONSTRUCTION })
  projectType!: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  location!: string | null;

  @Column({ type: 'numeric', precision: 15, scale: 2, default: 0 })
  budget!: number;

  @Column({ name: 'start_date', type: 'date', nullable: true })
  startDate!: string | null;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate!: string | null;

  @Column({ type: 'varchar', length: 32, default: ProjectStatus.PLANNING })
  status!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'text', nullable: true })
  note!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
