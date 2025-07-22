import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAssistantDefinition1751378760345 implements MigrationInterface {
    name = 'AddAssistantDefinition1751378760345'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "assistant" ("id" character varying NOT NULL, "active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "user_id" character varying NOT NULL, "workspace_id" character varying NOT NULL, "name" character varying NOT NULL, "description" character varying NOT NULL, CONSTRAINT "PK_eb7d5dbc702c098df659e65c606" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "assistant" ADD CONSTRAINT "FK_35efe73cda6158d3e3cfeb03d2f" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "assistant" ADD CONSTRAINT "FK_de2f5a7bb566e9b5ee91d99f9bc" FOREIGN KEY ("workspace_id") REFERENCES "workspace"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "assistant" DROP CONSTRAINT "FK_de2f5a7bb566e9b5ee91d99f9bc"`);
        await queryRunner.query(`ALTER TABLE "assistant" DROP CONSTRAINT "FK_35efe73cda6158d3e3cfeb03d2f"`);
        await queryRunner.query(`DROP TABLE "assistant"`);
    }

}
