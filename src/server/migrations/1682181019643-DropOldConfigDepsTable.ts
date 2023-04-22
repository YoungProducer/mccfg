import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropOldConfigDepsTable1682181019643 implements MigrationInterface {
  name = 'DropOldConfigDepsTable1682181019643';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "configs_dependecies_mod_versions" DROP CONSTRAINT "FK_d5fb6a33a544ec544f6a3d07819"
    `);
    await queryRunner.query(`
      ALTER TABLE "configs_dependecies_mod_versions" DROP CONSTRAINT "FK_6de62388fa21029894007d5a974"
    `);
    await queryRunner.query(
      `DROP TABLE IF EXISTS "configs_dependecies_mod_versions"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "configs_dependecies_mod_versions" (
        "configsId" integer NOT NULL,
        "modVersionsId" integer NOT NULL,
        CONSTRAINT "PK_8ede7bb7dbae31f4c75d3ca8340" PRIMARY KEY ("configsId", "modVersionsId")
      )
    `);
  }
}
