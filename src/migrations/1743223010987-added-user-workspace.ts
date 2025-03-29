import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedUserWorkspace1743223010987 implements MigrationInterface {
    name = 'AddedUserWorkspace1743223010987'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user_workspace" ("user_id" character varying NOT NULL, "workspace_id" character varying NOT NULL, CONSTRAINT "PK_a007c1434d1433fd63d9e5a27a6" PRIMARY KEY ("user_id", "workspace_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_faf90374b266c152bf3de95eba" ON "user_workspace" ("user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_38805cb60bfb33e754653fbc4f" ON "user_workspace" ("workspace_id") `);
        await queryRunner.query(`ALTER TABLE "user_workspace" ADD CONSTRAINT "FK_faf90374b266c152bf3de95eba8" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_workspace" ADD CONSTRAINT "FK_38805cb60bfb33e754653fbc4f6" FOREIGN KEY ("workspace_id") REFERENCES "workspace"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_workspace" DROP CONSTRAINT "FK_38805cb60bfb33e754653fbc4f6"`);
        await queryRunner.query(`ALTER TABLE "user_workspace" DROP CONSTRAINT "FK_faf90374b266c152bf3de95eba8"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_38805cb60bfb33e754653fbc4f"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_faf90374b266c152bf3de95eba"`);
        await queryRunner.query(`DROP TABLE "user_workspace"`);
    }

}
