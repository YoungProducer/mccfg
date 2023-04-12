import request from 'supertest';
import { NestApplication } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { ObjectLiteral, Repository } from 'typeorm';

import { ModEntity } from '../entities/mod.entity';
import { MCVersionEntity } from 'server/domain/mcversion/entities/mc-version.entity';
import { ModVersionEntity } from '../entities/mod-version.entity';
import { ModsModule } from '../mods.module';
import { DataBaseMockModule } from 'server/mocks/database-module.mock';
import { getRepos, resetRepos } from 'server/test-utils/clear-repos';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from 'server/domain/users/entities/user.entity';
import { ConfigEntity } from 'server/domain/config/entities/config.entity';
import { CreateModDto } from '../dto/create-mod.dto';
import { CreateModVersionDto } from '../dto/create-mod-version.dto';
import { ModDto } from '../dto/mod.dto';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { GetAllModVersionsResponseDto } from '../dto/mod-version.dto';

describe('E2E Mods', () => {
  let app: NestApplication;
  let repos: Repository<ObjectLiteral>[];
  let modsRepo: Repository<ModEntity>;
  let modVersionsRepo: Repository<ModVersionEntity>;
  let mcVersionsRepo: Repository<MCVersionEntity>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ModsModule, DataBaseMockModule],
    }).compile();

    app = moduleRef.createNestApplication();

    modsRepo = moduleRef.get<Repository<ModEntity>>(
      getRepositoryToken(ModEntity),
    );
    modVersionsRepo = moduleRef.get<Repository<ModVersionEntity>>(
      getRepositoryToken(ModVersionEntity),
    );
    mcVersionsRepo = moduleRef.get<Repository<MCVersionEntity>>(
      getRepositoryToken(MCVersionEntity),
    );

    repos = getRepos(moduleRef, [
      MCVersionEntity,
      ModEntity,
      ModVersionEntity,
      UserEntity,
      ConfigEntity,
    ]);

    await app.init();
  });

  beforeEach(async () => {
    await resetRepos(repos);
  });

  afterAll(async () => {
    await resetRepos(repos);
    await app.close();
  });

  describe('POST /mods', () => {
    it('should create a mod if there are no erros', async () => {
      return request(app.getHttpServer())
        .post('/mods')
        .send({
          name: 'mod',
        })
        .expect(201);
    });

    it('should return 409(Conflict) status if mod with given name already exist', async () => {
      const name = 'name';

      const createDto: CreateModDto = {
        name,
      };

      const modEntityToCreate = modsRepo.create(createDto);

      await modsRepo.save(modEntityToCreate);

      const res = await request(app.getHttpServer())
        .post('/mods')
        .send(createDto);

      expect(res.statusCode).toBe(409);
      expect(res.body.message).toBe(`Mod with name: ${name} already exist.`);
    });
  });

  describe('POST /mods/:id/versions', () => {
    beforeEach(async () => {
      await resetRepos(repos);
    });

    it('should return 409(Conflict) status if mod version already exist', async () => {
      const mcVersion = '2.0';
      const modVersion = '1.0';

      const createDto: CreateModVersionDto = {
        version: modVersion,
        compatibleMCVersions: mcVersion,
      };

      const modVersionToCreate = modVersionsRepo.create({
        version: createDto.version,
        mod: null,
        compatibleMCVersions: [],
      });

      await modVersionsRepo.save(modVersionToCreate);

      const res = await request(app.getHttpServer())
        .post(`/mods/1/versions`)
        .send(createDto);

      expect(res.statusCode).toBe(409);
      expect(res.body.message).toBe(
        `Mod with version: ${modVersion} already exist.`,
      );
    });

    describe(`WHEN typeof "compatibleMCVersions" is "string"`, () => {
      beforeEach(async () => {
        await resetRepos(repos);
      });

      it('should return 404(NotFound) status if mc version does not exist', async () => {
        const mcVersion = '2.0';
        const modVersion = '1.0';

        await modsRepo.delete({});

        const createDto: CreateModVersionDto = {
          version: modVersion,
          compatibleMCVersions: mcVersion,
        };

        const res = await request(app.getHttpServer())
          .post(`/mods/1/versions`)
          .send(createDto);

        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe(
          `Minecraft version: ${mcVersion} doesn't exist.`,
        );
      });

      it(`should return 201(Created) status and create a new mod version`, async () => {
        const mcVersion = '1.0';
        const modVersion = '1.0';

        const mcVersEntityToCreate = mcVersionsRepo.create({
          version: mcVersion,
        });

        await mcVersionsRepo.save(mcVersEntityToCreate);

        const modEntityToCreate = modsRepo.create({
          name: 'name',
          versions: [],
        });

        const mod = await modsRepo.save(modEntityToCreate);

        const createModVersionDto: CreateModVersionDto = {
          version: modVersion,
          compatibleMCVersions: mcVersion,
        };

        const res = await request(app.getHttpServer())
          .post(`/mods/${mod.id}/versions`)
          .send(createModVersionDto);

        expect(res.status).toBe(201);
      });
    });

    describe(`WHEN typeof "compatibleMCVersions" is array`, () => {
      beforeEach(async () => {
        await resetRepos(repos);
      });

      it(`should return 404(NotFound) status if at least one of minecraft versions doesn't exist`, async () => {
        const mcVersions = ['1.0', '2.0'];

        const createDto: CreateModVersionDto = {
          version: '1.0',
          compatibleMCVersions: mcVersions,
        };

        const mcVersionsEntityToCreate = mcVersionsRepo.create({
          version: '1.0',
        });

        await mcVersionsRepo.save(mcVersionsEntityToCreate);

        const res = await request(app.getHttpServer())
          .post(`/mods/1/versions`)
          .send(createDto);

        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe(
          `Following versions of minecraft: 2.0 do not exist.`,
        );
      });

      it(`should return 201(Created) status and create a new mod version`, async () => {
        const mcVersion = '1.0';
        const modVersion = '1.0';

        const mcVersEntityToCreate = mcVersionsRepo.create({
          version: mcVersion,
        });

        await mcVersionsRepo.save(mcVersEntityToCreate);

        const modEntityToCreate = modsRepo.create({
          name: 'name',
          versions: [],
        });

        const mod = await modsRepo.save(modEntityToCreate);

        const createModVersionDto: CreateModVersionDto = {
          version: modVersion,
          compatibleMCVersions: [mcVersion],
        };

        const res = await request(app.getHttpServer())
          .post(`/mods/${mod.id}/versions`)
          .send(createModVersionDto);

        expect(res.status).toBe(201);
      });
    });
  });

  describe('GET /mods', () => {
    beforeEach(async () => {
      await resetRepos(repos);
    });

    it('should return mods without versions if "versions" query param is missing or set to false', async () => {
      const modEntityToCreate = modsRepo.create({
        name: 'name',
      });

      const createdModEntity = await modsRepo.save(modEntityToCreate);

      const { body, statusCode } = await request(app.getHttpServer()).get(
        '/mods',
      );

      expect(statusCode).toBe(200);
      expect(body).toEqual([createdModEntity]);
    });

    it('should return mods with versions populated if "versions" query param is to true', async () => {
      const modEntityToCreate = modsRepo.create({
        name: 'name',
      });

      let createdModEntity = await modsRepo.save(modEntityToCreate);

      const modVersionEntityToCreate = modVersionsRepo.create({
        mod: createdModEntity,
        version: '1.0',
        configs: [],
        compatibleMCVersions: [],
      });

      await modVersionsRepo.save(modVersionEntityToCreate);

      createdModEntity = await modsRepo.findOne({
        where: {
          id: createdModEntity.id,
        },
        relations: {
          versions: true,
        },
      });

      const expected = instanceToPlain(
        plainToInstance(ModDto, createdModEntity),
      ) as ModDto;

      const { body, statusCode } = await request(app.getHttpServer()).get(
        `/mods?versions=true`,
      );

      expect(statusCode).toBe(200);
      expect(body).toEqual([expected]);
    });
  });

  describe('GET /mods/:id', () => {
    describe('STATUS 200', () => {
      beforeEach(async () => {
        await resetRepos(repos);
      });

      describe('QUERY PARAM "versions" is not specified or set to "false"', () => {
        it('should return mod without versions populated', async () => {
          const modEntityToCreate = modsRepo.create({
            name: 'name',
          });

          const createdModEntity = await modsRepo.save(modEntityToCreate);

          const versionEntityToCreate = modVersionsRepo.create({
            mod: createdModEntity,
            version: '1.0',
            configs: [],
            compatibleMCVersions: [],
          });

          await modVersionsRepo.save(versionEntityToCreate);

          const expected = instanceToPlain(
            plainToInstance(ModDto, createdModEntity),
          );

          const res1 = await request(app.getHttpServer()).get(
            `/mods/${createdModEntity.id}`,
          );

          expect(res1.statusCode).toBe(200);
          expect(res1.body).toEqual(expected);

          const res2 = await request(app.getHttpServer()).get(
            `/mods/${createdModEntity.id}?versions=false`,
          );

          expect(res2.statusCode).toBe(200);
          expect(res2.body).toEqual(expected);
        });
      });

      describe('QUERY PARAM "versions" is to "true"', () => {
        it('should return mod with versions populated', async () => {
          const modEntityToCreate = modsRepo.create({
            name: 'name',
          });

          let createdModEntity = await modsRepo.save(modEntityToCreate);

          const versionToCreate = modVersionsRepo.create({
            version: '1.0',
            mod: createdModEntity,
            configs: [],
            compatibleMCVersions: [],
          });

          await modVersionsRepo.save(versionToCreate);

          // refetch mod data so it'll have a versions array
          createdModEntity = await modsRepo.findOne({
            where: {
              id: createdModEntity.id,
            },
            relations: {
              versions: true,
            },
          });

          const expected = instanceToPlain(
            plainToInstance(ModDto, createdModEntity),
          );

          const { statusCode, body } = await request(app.getHttpServer()).get(
            `/mods/${createdModEntity.id}?versions=true`,
          );

          expect(statusCode).toBe(200);
          expect(body).toEqual(expected);
        });
      });
    });
  });

  describe('GET /mods/:id/versions', () => {
    describe('STATUS 200', () => {
      beforeEach(async () => {
        await resetRepos(repos);
      });

      it('should return an array of mod versions', async () => {
        const modEntityToCreate = modsRepo.create({
          name: 'name',
        });

        const createdModEntity = await modsRepo.save(modEntityToCreate);

        const versionToCreate = modVersionsRepo.create({
          version: '1.0',
          mod: createdModEntity,
          configs: [],
          compatibleMCVersions: [],
        });

        const createdModVersionEntity = await modVersionsRepo.save(
          versionToCreate,
        );

        const expected = instanceToPlain(
          plainToInstance(
            GetAllModVersionsResponseDto,
            createdModVersionEntity,
          ),
        );

        const { statusCode, body } = await request(app.getHttpServer()).get(
          `/mods/${createdModEntity.id}/versions`,
        );

        expect(statusCode).toBe(200);
        expect(body).toEqual([expected]);
      });
    });
  });

  describe('GET /mods/versions/:versionId', () => {
    describe('STATUS 200', () => {
      beforeEach(async () => {
        await resetRepos(repos);
      });

      it('should return mod version', async () => {
        const modEntityToCreate = modsRepo.create({
          name: 'name',
        });

        const createdModEntity = await modsRepo.save(modEntityToCreate);

        const versionToCreate = modVersionsRepo.create({
          version: '1.0',
          mod: createdModEntity,
          configs: [],
          compatibleMCVersions: [],
        });

        const createdModVersionEntity = await modVersionsRepo.save(
          versionToCreate,
        );

        const expected = instanceToPlain(
          plainToInstance(
            GetAllModVersionsResponseDto,
            createdModVersionEntity,
          ),
        );

        const { statusCode, body } = await request(app.getHttpServer()).get(
          `/mods/versions/${createdModVersionEntity.id}`,
        );

        expect(statusCode).toBe(200);
        expect(body).toEqual(expected);
      });
    });
  });
});
