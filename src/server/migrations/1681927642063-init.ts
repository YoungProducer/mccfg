import { MigrationInterface, QueryRunner } from 'typeorm';

export class init1681927642063 implements MigrationInterface {
  name = 'init1681927642063';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "mc_versions" (
                "id" SERIAL NOT NULL,
                "version" character varying(100) NOT NULL,
                CONSTRAINT "UQ_9c6fb1df9e6b9216985d48041af" UNIQUE ("version"),
                CONSTRAINT "PK_270aec9224b1bd48b5add77955e" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "confirmation_tokens" (
                "id" SERIAL NOT NULL,
                "token" character varying(255) NOT NULL,
                "expirationDate" TIMESTAMP(3) WITH TIME ZONE NOT NULL,
                CONSTRAINT "PK_e48a0124b300b3b1e14d8b7baa4" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "refresh_tokens" (
                "id" SERIAL NOT NULL,
                "token" character varying NOT NULL,
                "userId" integer,
                CONSTRAINT "PK_7d8bee0204106019488c4c50ffa" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."users_role_enum" AS ENUM('admin', 'read', 'write')
        `);
    await queryRunner.query(`
            CREATE TABLE "users" (
                "id" SERIAL NOT NULL,
                "username" character varying(255) NOT NULL,
                "email" character varying(255) NOT NULL,
                "role" "public"."users_role_enum" NOT NULL DEFAULT 'read',
                "salt" character varying(255) NOT NULL,
                "hash" character varying(255) NOT NULL,
                "verified" boolean NOT NULL DEFAULT false,
                "confirmationTokenId" integer,
                CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"),
                CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"),
                CONSTRAINT "REL_572fe98f67c1ca62780b1a0590" UNIQUE ("confirmationTokenId"),
                CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "mods" (
                "id" SERIAL NOT NULL,
                "name" character varying(255) NOT NULL,
                CONSTRAINT "UQ_4ca222180d660065fb42da97a14" UNIQUE ("name"),
                CONSTRAINT "PK_5e0ced6abe92940577832c70cd4" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "mod_versions" (
                "id" SERIAL NOT NULL,
                "version" character varying(100) NOT NULL,
                "modId" integer,
                CONSTRAINT "PK_25f7b1d3b938cfdcb4fe156ba56" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "configs" (
                "id" SERIAL NOT NULL,
                "fileName" character varying(255) NOT NULL,
                "version" character varying(100) NOT NULL,
                "ownerId" integer,
                "primaryModId" integer,
                CONSTRAINT "PK_002b633ec0d45f5c6f928fea292" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "mod_versions_compatible_mc_versions_mc_versions" (
                "modVersionsId" integer NOT NULL,
                "mcVersionsId" integer NOT NULL,
                CONSTRAINT "PK_18a2d9b0e5c7acd565fcafbee64" PRIMARY KEY ("modVersionsId", "mcVersionsId")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_7e178340007e2783c4c132c974" ON "mod_versions_compatible_mc_versions_mc_versions" ("modVersionsId")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_fdd3bc04153d3b964da5f99fbd" ON "mod_versions_compatible_mc_versions_mc_versions" ("mcVersionsId")
        `);
    await queryRunner.query(`
            CREATE TABLE "configs_dependecies_mod_versions" (
                "configsId" integer NOT NULL,
                "modVersionsId" integer NOT NULL,
                CONSTRAINT "PK_8ede7bb7dbae31f4c75d3ca8340" PRIMARY KEY ("configsId", "modVersionsId")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_6de62388fa21029894007d5a97" ON "configs_dependecies_mod_versions" ("configsId")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_d5fb6a33a544ec544f6a3d0781" ON "configs_dependecies_mod_versions" ("modVersionsId")
        `);
    await queryRunner.query(`
            ALTER TABLE "refresh_tokens"
            ADD CONSTRAINT "FK_610102b60fea1455310ccd299de" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
    await queryRunner.query(`
            ALTER TABLE "users"
            ADD CONSTRAINT "FK_572fe98f67c1ca62780b1a05907" FOREIGN KEY ("confirmationTokenId") REFERENCES "confirmation_tokens"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "mod_versions"
            ADD CONSTRAINT "FK_fa70d042a8436d4d825a567edf9" FOREIGN KEY ("modId") REFERENCES "mods"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
    await queryRunner.query(`
            ALTER TABLE "configs"
            ADD CONSTRAINT "FK_d5266157103a7599e847448798c" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "configs"
            ADD CONSTRAINT "FK_1c4503fcd5400f101638e44c4d8" FOREIGN KEY ("primaryModId") REFERENCES "mod_versions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "mod_versions_compatible_mc_versions_mc_versions"
            ADD CONSTRAINT "FK_7e178340007e2783c4c132c9746" FOREIGN KEY ("modVersionsId") REFERENCES "mod_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
    await queryRunner.query(`
            ALTER TABLE "mod_versions_compatible_mc_versions_mc_versions"
            ADD CONSTRAINT "FK_fdd3bc04153d3b964da5f99fbd4" FOREIGN KEY ("mcVersionsId") REFERENCES "mc_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
    await queryRunner.query(`
            ALTER TABLE "configs_dependecies_mod_versions"
            ADD CONSTRAINT "FK_6de62388fa21029894007d5a974" FOREIGN KEY ("configsId") REFERENCES "configs"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
    await queryRunner.query(`
            ALTER TABLE "configs_dependecies_mod_versions"
            ADD CONSTRAINT "FK_d5fb6a33a544ec544f6a3d07819" FOREIGN KEY ("modVersionsId") REFERENCES "mod_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "configs_dependecies_mod_versions" DROP CONSTRAINT "FK_d5fb6a33a544ec544f6a3d07819"
        `);
    await queryRunner.query(`
            ALTER TABLE "configs_dependecies_mod_versions" DROP CONSTRAINT "FK_6de62388fa21029894007d5a974"
        `);
    await queryRunner.query(`
            ALTER TABLE "mod_versions_compatible_mc_versions_mc_versions" DROP CONSTRAINT "FK_fdd3bc04153d3b964da5f99fbd4"
        `);
    await queryRunner.query(`
            ALTER TABLE "mod_versions_compatible_mc_versions_mc_versions" DROP CONSTRAINT "FK_7e178340007e2783c4c132c9746"
        `);
    await queryRunner.query(`
            ALTER TABLE "configs" DROP CONSTRAINT "FK_1c4503fcd5400f101638e44c4d8"
        `);
    await queryRunner.query(`
            ALTER TABLE "configs" DROP CONSTRAINT "FK_d5266157103a7599e847448798c"
        `);
    await queryRunner.query(`
            ALTER TABLE "mod_versions" DROP CONSTRAINT "FK_fa70d042a8436d4d825a567edf9"
        `);
    await queryRunner.query(`
            ALTER TABLE "users" DROP CONSTRAINT "FK_572fe98f67c1ca62780b1a05907"
        `);
    await queryRunner.query(`
            ALTER TABLE "refresh_tokens" DROP CONSTRAINT "FK_610102b60fea1455310ccd299de"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_d5fb6a33a544ec544f6a3d0781"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_6de62388fa21029894007d5a97"
        `);
    await queryRunner.query(`
            DROP TABLE "configs_dependecies_mod_versions"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_fdd3bc04153d3b964da5f99fbd"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_7e178340007e2783c4c132c974"
        `);
    await queryRunner.query(`
            DROP TABLE "mod_versions_compatible_mc_versions_mc_versions"
        `);
    await queryRunner.query(`
            DROP TABLE "configs"
        `);
    await queryRunner.query(`
            DROP TABLE "mod_versions"
        `);
    await queryRunner.query(`
            DROP TABLE "mods"
        `);
    await queryRunner.query(`
            DROP TABLE "users"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."users_role_enum"
        `);
    await queryRunner.query(`
            DROP TABLE "refresh_tokens"
        `);
    await queryRunner.query(`
            DROP TABLE "confirmation_tokens"
        `);
    await queryRunner.query(`
            DROP TABLE "mc_versions"
        `);
  }
}
