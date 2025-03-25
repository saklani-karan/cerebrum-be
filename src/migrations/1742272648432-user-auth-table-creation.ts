import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserAuthTableCreation1742272648432 implements MigrationInterface {
  name = 'UserAuthTableCreation1742272648432';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user" ("id" character varying NOT NULL, "active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "email" character varying NOT NULL, "first_name" text, "last_name" text, "dp_url" character varying, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "auth_config" ("id" character varying NOT NULL, "active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "provider" character varying NOT NULL, "user_id" character varying NOT NULL, "config" jsonb NOT NULL, CONSTRAINT "PK_7153b5a2a61e88effb31ae394a9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "auth_config" ADD CONSTRAINT "FK_ed3c139d35cedc052a5ba1832f7" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "auth_config" DROP CONSTRAINT "FK_ed3c139d35cedc052a5ba1832f7"`,
    );
    await queryRunner.query(`DROP TABLE "auth_config"`);
    await queryRunner.query(`DROP TABLE "user"`);
  }
}
