import { MigrationInterface, QueryRunner } from 'typeorm';

export class ConfigUpdate1682094615924 implements MigrationInterface {
  name = 'ConfigUpdate1682094615924';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "configs" ADD "initialFileName" character varying(255) NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "configs" DROP COLUMN "initialFileName"`,
    );
  }
}
