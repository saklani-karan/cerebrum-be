import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIntegrationToolTable1745075402716 implements MigrationInterface {
    name = 'AddIntegrationToolTable1745075402716';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "integration" ("key" character varying NOT NULL, "name" character varying NOT NULL, "description" text, "iconUrl" text NOT NULL, CONSTRAINT "PK_a73c2a5aeda66bb6b2e3af023fc" PRIMARY KEY ("key"))`,
        );
        await queryRunner.query(
            `CREATE TABLE "tool" ("action" character varying NOT NULL, "integration_key" character varying NOT NULL, "name" character varying NOT NULL, "description" text NOT NULL, "user_params" jsonb NOT NULL, "workflow_params" jsonb NOT NULL, CONSTRAINT "PK_e4fd1f61005371ae9912dd5a00f" PRIMARY KEY ("action", "integration_key"))`,
        );
        await queryRunner.query(
            `ALTER TABLE "tool" ADD CONSTRAINT "FK_31597871c49e1bd6b7be3d35da5" FOREIGN KEY ("integration_key") REFERENCES "integration"("key") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "tool" DROP CONSTRAINT "FK_31597871c49e1bd6b7be3d35da5"`,
        );
        await queryRunner.query(`DROP TABLE "tool"`);
        await queryRunner.query(`DROP TABLE "integration"`);
    }
}
