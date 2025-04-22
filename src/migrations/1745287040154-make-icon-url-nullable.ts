import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeIconUrlNullable1745287040154 implements MigrationInterface {
    name = 'MakeIconUrlNullable1745287040154';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "integration" ALTER COLUMN "description" SET NOT NULL`,
        );
        await queryRunner.query(`ALTER TABLE "integration" ALTER COLUMN "iconUrl" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "integration" ALTER COLUMN "iconUrl" SET NOT NULL`);
        await queryRunner.query(
            `ALTER TABLE "integration" ALTER COLUMN "description" DROP NOT NULL`,
        );
    }
}
