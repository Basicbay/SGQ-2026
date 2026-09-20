import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserLineId1789800005000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
        ADD COLUMN "line_id" varchar(100);
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
        DROP COLUMN "line_id";
    `);
  }
}
