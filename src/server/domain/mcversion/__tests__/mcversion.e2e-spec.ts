import request from 'supertest';
import { NestApplication } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { ObjectLiteral, Repository } from 'typeorm';
import { MCVersionModule } from '../mcversion.module';
import { ConfigModule } from 'server/config/config.module';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { getTestDatabaseTypeOrmOptions } from 'server/mocks/test-database';
import { DI_CONFIG } from 'server/config/constants';
import { resetRepos } from 'server/test-utils/clear-repos';
import { MCVersionEntity } from '../entities/mc-version.entity';

describe('MCVersion', () => {
  let app: NestApplication;
  let repos: Repository<ObjectLiteral>[];
  let versionsRepo: Repository<MCVersionEntity>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        MCVersionModule,
        ConfigModule.forRoot({ folder: './configs' }),
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: getTestDatabaseTypeOrmOptions,
          inject: [DI_CONFIG],
        }),
      ],
    }).compile();

    app = moduleRef.createNestApplication();

    versionsRepo = moduleRef.get<Repository<MCVersionEntity>>(
      getRepositoryToken(MCVersionEntity),
    );

    repos = [versionsRepo];

    await app.init();
  });

  beforeEach(() => {
    resetRepos(repos);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/POST create', () => {
    it('should create a user if there are no erros', async () => {
      return request(app.getHttpServer())
        .post('/mc-versions')
        .send({
          version: '1.0',
        })
        .expect(201);
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

      expect(res.statusCode).toBe(409);
      expect(res.body.message).toBe(
        'Minecraft with version 1.0 already exist.',
      );
    });
  });

  describe('/GET getAll', () => {
    it('should return a list of all versions', async () => {
      const entityData = {
        version: '1.0',
      };

      const entity = versionsRepo.create(entityData);

      const resultEntity = await versionsRepo.save(entity);

      const res = await request(app.getHttpServer()).get('/mc-versions');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual([resultEntity]);
    });
  });
});