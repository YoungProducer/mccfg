import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixedConfigDepsSpelling1682180545668
  implements MigrationInterface
{
  name = 'FixedConfigDepsSpelling1682180545668';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "configs_dependencies_mod_versions" ("configsId" integer NOT NULL, "modVersionsId" integer NOT NULL, CONSTRAINT "PK_cfe56703467f386a74b510a3c8a" PRIMARY KEY ("configsId", "modVersionsId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f28600e232c43e0229e62b6518" ON "configs_dependencies_mod_versions" ("configsId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f6227970f85647bd138bb3de46" ON "configs_dependencies_mod_versions" ("modVersionsId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "configs_dependencies_mod_versions" ADD CONSTRAINT "FK_f28600e232c43e0229e62b65183" FOREIGN KEY ("configsId") REFERENCES "configs"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "configs_dependencies_mod_versions" ADD CONSTRAINT "FK_f6227970f85647bd138bb3de464" FOREIGN KEY ("modVersionsId") REFERENCES "mod_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "configs_dependencies_mod_versions" DROP CONSTRAINT "FK_f6227970f85647bd138bb3de464"`,
    );
    await queryRunner.query(
      `ALTER TABLE "configs_dependencies_mod_versions" DROP CONSTRAINT "FK_f28600e232c43e0229e62b65183"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f6227970f85647bd138bb3de46"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f28600e232c43e0229e62b6518"`,
    );
    await queryRunner.query(`DROP TABLE "configs_dependencies_mod_versions"`);
  }
}
