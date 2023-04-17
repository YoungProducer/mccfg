import request from 'supertest';
import { NestApplication } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { ObjectLiteral, Repository } from 'typeorm';
import { MCVersionModule } from '../mcversion.module';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { resetRepos } from 'server/test-utils/clear-repos';
import { MCVersionEntity } from '../entities/mc-version.entity';
import { StartedPostgreSqlContainer } from 'testcontainers';
import { createTestContainer } from 'server/test-utils/create-test-container';
import { HttpStatus } from '@nestjs/common';
import { mcVersionErrorMessages } from '../constants/error-messages';

describe('E2E MCVersion', () => {
  jest.setTimeout(180_000);

  let pgContainer: StartedPostgreSqlContainer;
  let app: NestApplication;
  let repos: Repository<ObjectLiteral>[];
  let versionsRepo: Repository<MCVersionEntity>;

  beforeAll(async () => {
    const containerData = await createTestContainer();

    pgContainer = containerData.pgContainer;

    const moduleRef = await Test.createTestingModule({
      imports: [MCVersionModule, TypeOrmModule.forRoot(containerData.options)],
    }).compile();

    app = moduleRef.createNestApplication();

    versionsRepo = moduleRef.get<Repository<MCVersionEntity>>(
      getRepositoryToken(MCVersionEntity),
    );

    repos = [versionsRepo];

    await app.init();
  });

  beforeEach(async () => {
    await resetRepos(repos);
  });

  afterAll(async () => {
    await resetRepos(repos);
    await app.close();
    await pgContainer.stop();
  });

  it('should be defined', () => {
    expect(app).toBeDefined();
  });

  describe('POST /mc-versions', () => {
    beforeEach(async () => {
      await resetRepos(repos);
    });

    it('should create a user if there are no erros', async () => {
      return request(app.getHttpServer())
        .post('/mc-versions')
        .send({
          version: '1.0',
        })
        .expect(HttpStatus.CREATED);
    });

    it('should return an error if version already exist', async () => {
      const entityData = {
        version: '1.0',
      };

      const entity = versionsRepo.create(entityData);

      await versionsRepo.save(entity);

      const res = await request(app.getHttpServer())
        .post('/mc-versions')
        .send(entityData);

      expect(res.statusCode).toBe(HttpStatus.CONFLICT);
      expect(res.body.message).toBe(
        mcVersionErrorMessages.getVersionExistErr(entityData.version),
      );
    });
  });

  describe('GET /mc-versions', () => {
    beforeEach(async () => {
      await resetRepos(repos);
    });

    it('should return a list of all versions', async () => {
      const entityData = {
        version: '1.0',
      };

      const entity = versionsRepo.create(entityData);

      const resultEntity = await versionsRepo.save(entity);

      const res = await request(app.getHttpServer()).get('/mc-versions');

      expect(res.statusCode).toBe(HttpStatus.OK);
      expect(res.body).toEqual([resultEntity]);
    });
  });
});
