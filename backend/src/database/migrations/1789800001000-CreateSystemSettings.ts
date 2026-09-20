import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateSystemSettings1789800001000 implements MigrationInterface {
  async up(queryRunner: QueryRunner) {
    await queryRunner.createTable(new Table({ name: 'system_settings', columns: [
      { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid', default: 'gen_random_uuid()' },
      { name: 'site_name', type: 'varchar', length: '160', default: "'SGQ '" }, { name: 'site_description', type: 'varchar', length: '500', default: "''" },
      { name: 'icon_url', type: 'varchar', length: '500', isNullable: true }, { name: 'address', type: 'varchar', length: '500', default: "''" },
      { name: 'tax_id', type: 'varchar', length: '32', default: "''" }, { name: 'company_name', type: 'varchar', length: '200', default: "''" },
      { name: 'website', type: 'varchar', length: '300', default: "''" }, { name: 'email', type: 'varchar', length: '160', default: "''" },
      { name: 'phone', type: 'varchar', length: '40', default: "''" }, { name: 'updated_at', type: 'timestamptz', default: 'now()' },
    ] }), true);
  }
  async down(queryRunner: QueryRunner) { await queryRunner.dropTable('system_settings'); }
}
