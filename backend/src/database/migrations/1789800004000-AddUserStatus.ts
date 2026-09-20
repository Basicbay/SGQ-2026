import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserStatus1789800004000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
        ADD COLUMN "status" varchar(32) NOT NULL DEFAULT 'ACTIVE';
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
        DROP COLUMN "status";
    `);
  }
}
