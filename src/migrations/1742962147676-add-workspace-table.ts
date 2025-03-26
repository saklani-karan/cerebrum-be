import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddWorkspaceTable1742962147676 implements MigrationInterface {
    name = 'AddWorkspaceTable1742962147676';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "workspace" ("id" character varying NOT NULL, "active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "name" character varying NOT NULL, "admin_id" character varying NOT NULL, CONSTRAINT "PK_ca86b6f9b3be5fe26d307d09b49" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "first_name"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "last_name"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "name" text`);
        await queryRunner.query(
            `ALTER TABLE "workspace" ADD CONSTRAINT "FK_ff2d638bffa236ebc9e9b867c53" FOREIGN KEY ("admin_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "workspace" DROP CONSTRAINT "FK_ff2d638bffa236ebc9e9b867c53"`,
        );
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "last_name" text`);
        await queryRunner.query(`ALTER TABLE "user" ADD "first_name" text`);
        await queryRunner.query(`DROP TABLE "workspace"`);
    }
}
