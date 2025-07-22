import { MigrationInterface, QueryRunner } from 'typeorm';

export class OnlyOneTypeOfParams1751383979129 implements MigrationInterface {
    name = 'OnlyOneTypeOfParams1751383979129';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tool" DROP COLUMN "user_params"`);
        await queryRunner.query(`ALTER TABLE "tool" DROP COLUMN "workflow_params"`);
        await queryRunner.query(`ALTER TABLE "tool" ADD "params" jsonb`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tool" DROP COLUMN "params"`);
        await queryRunner.query(`ALTER TABLE "tool" ADD "workflow_params" jsonb NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tool" ADD "user_params" jsonb`);
    }
}
