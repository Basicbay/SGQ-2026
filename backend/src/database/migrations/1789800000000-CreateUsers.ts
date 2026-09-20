import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsers1789800000000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "users" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "username" varchar(64) NOT NULL UNIQUE,
      "password_hash" text NOT NULL,
      "created_at" timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT "users_username_format" CHECK (username ~ '^[a-z0-9_.-]{3,64}$')
    )`);
  }
  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "users"');
  }
}
