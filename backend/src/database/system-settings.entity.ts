import { Column, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'system_settings' })
export class SystemSettings {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'site_name', length: 160, default: 'Site Name' }) siteName!: string;
  @Column({ name: 'site_description', length: 500, default: 'Site Description' }) siteDescription!: string;
  // Explicit type is required because reflected metadata for `string | null` is `Object`.
  @Column({ name: 'icon_url', type: 'varchar', length: 500, nullable: true }) iconUrl!: string | null;
  @Column({ length: 500, default: '' }) address!: string;
  @Column({ name: 'tax_id', length: 32, default: '' }) taxId!: string;
  @Column({ name: 'company_name', length: 200, default: '' }) companyName!: string;
  @Column({ length: 300, default: '' }) website!: string;
  @Column({ length: 160, default: '' }) email!: string;
  @Column({ length: 40, default: '' }) phone!: string;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt!: Date;
}
