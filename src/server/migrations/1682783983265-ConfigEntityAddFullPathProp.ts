import { MigrationInterface, QueryRunner } from 'typeorm';

export class ConfigEntityAddFullPathProp1682783983265
  implements MigrationInterface
{
  name = 'ConfigEntityAddFullPathProp1682783983265';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "configs" DROP CONSTRAINT "FK_d5266157103a7599e847448798c"
        `);
    await queryRunner.query(`
            ALTER TABLE "configs"
            ADD "fullPath" character varying(255) NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "configs"
            ADD CONSTRAINT "FK_d5266157103a7599e847448798c" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "configs" DROP CONSTRAINT "FK_d5266157103a7599e847448798c"
        `);
    await queryRunner.query(`
            ALTER TABLE "configs" DROP COLUMN "fullPath"
        `);
    await queryRunner.query(`
            ALTER TABLE "configs"
            ADD CONSTRAINT "FK_d5266157103a7599e847448798c" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }
}
