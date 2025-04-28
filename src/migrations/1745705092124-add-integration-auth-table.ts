import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIntegrationAuthTable1745705092124 implements MigrationInterface {
    name = 'AddIntegrationAuthTable1745705092124';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "integration_auth" ("id" character varying NOT NULL, "active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "integration_key" character varying NOT NULL, "user_id" character varying NOT NULL, "credentials" jsonb NOT NULL, "account_id" character varying NOT NULL, "display_name" character varying NOT NULL, "profile_image_url" character varying, CONSTRAINT "PK_70731645a72052c6ad83af454c4" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `ALTER TABLE "integration_auth" ADD CONSTRAINT "FK_fc46c5bd2913eac1731948680b7" FOREIGN KEY ("integration_key") REFERENCES "integration"("key") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "integration_auth" ADD CONSTRAINT "FK_ef0508c367f6c73527b9f547152" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "integration_auth" DROP CONSTRAINT "FK_ef0508c367f6c73527b9f547152"`,
        );
        await queryRunner.query(
            `ALTER TABLE "integration_auth" DROP CONSTRAINT "FK_fc46c5bd2913eac1731948680b7"`,
        );
        await queryRunner.query(`DROP TABLE "integration_auth"`);
    }
}
