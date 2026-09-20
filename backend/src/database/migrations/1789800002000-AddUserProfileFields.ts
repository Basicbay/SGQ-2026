import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserProfileFields1789800002000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
        ADD COLUMN "role" varchar(32) NOT NULL DEFAULT 'ADMIN',
        ADD COLUMN "full_name" varchar(160),
        ADD COLUMN "nickname" varchar(64),
        ADD COLUMN "phone" varchar(40),
        ADD COLUMN "email" varchar(160),
        ADD COLUMN "citizen_id" varchar(20),
        ADD COLUMN "updated_at" timestamptz NOT NULL DEFAULT now();
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
        DROP COLUMN "role",
        DROP COLUMN "full_name",
        DROP COLUMN "nickname",
        DROP COLUMN "phone",
        DROP COLUMN "email",
        DROP COLUMN "citizen_id",
        DROP COLUMN "updated_at";
    `);
  }
}
