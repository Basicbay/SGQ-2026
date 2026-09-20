import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateCustomers1789800003000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'customers',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'customer_code',
            type: 'varchar',
            length: '32',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '200',
            isNullable: false,
          },
          {
            name: 'customer_type',
            type: 'varchar',
            length: '32',
            default: "'COMPANY'",
            isNullable: false,
          },
          {
            name: 'tax_id',
            type: 'varchar',
            length: '32',
            isNullable: true,
          },
          {
            name: 'contact_name',
            type: 'varchar',
            length: '160',
            isNullable: true,
          },
          {
            name: 'phone',
            type: 'varchar',
            length: '40',
            isNullable: true,
          },
          {
            name: 'email',
            type: 'varchar',
            length: '160',
            isNullable: true,
          },
          {
            name: 'address',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'note',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '32',
            default: "'ACTIVE'",
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamptz',
            default: 'now()',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamptz',
            default: 'now()',
            isNullable: false,
          },
        ],
      }),
      true,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('customers');
  }
}
