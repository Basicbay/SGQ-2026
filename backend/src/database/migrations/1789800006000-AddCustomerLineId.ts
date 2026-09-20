import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCustomerLineId1789800006000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "customers"
        ADD COLUMN "line_id" varchar(100);
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "customers"
        DROP COLUMN "line_id";
    `);
  }
}
