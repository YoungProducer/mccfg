import request from 'supertest';
import { APP_GUARD, NestApplication } from '@nestjs/core';
import { StartedPostgreSqlContainer } from 'testcontainers';
import { ObjectLiteral, Repository } from 'typeorm';
import {
  UserEntity,
  UserRoles,
} from 'server/domain/users/entities/user.entity';
import { createTestContainer } from 'server/test-utils/create-test-container';
import { Test } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { ConfigModule } from 'server/config/config.module';
import { ConfigsModule } from '../config.module';
import { ConfigEntity } from '../entities/config.entity';
import { resetRepos } from 'server/test-utils/clear-repos';
import { rm } from 'node:fs/promises';
import { join } from 'node:path';
import { JWTGuard } from 'server/domain/auth/guards/jwt.guard';
import { getTestAccessToken } from 'server/test-utils/get-test-access-token';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { UserDto } from 'server/domain/users/dto/user.dto';
import { HttpStatus, ValidationPipe } from '@nestjs/common';
import { existsSync } from 'node:fs';
import { JWTModule } from 'server/domain/tokens/jwt/jwt.module';
import { ModVersionEntity } from 'server/domain/mods/entities/mod-version.entity';
import { safeMkdir } from 'server/utils/safe-mkdir';
import { configServiceErrorMessages } from '../constants/error-messages';
import { ConfigDto, ConfigPopulatedDto } from '../dto/config.dto';

describe('E2E Confis', () => {
  jest.setTimeout(180_000);

  let app: NestApplication;
  let pgContainer: StartedPostgreSqlContainer;
  let repos: Repository<ObjectLiteral>[];
  let userRepo: Repository<UserEntity>;
  let configsRepo: Repository<ConfigEntity>;
  let modVersionsRepo: Repository<ModVersionEntity>;

  beforeAll(async () => {
    const containerData = await createTestContainer();

    pgContainer = containerData.pgContainer;

    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(containerData.options),
        ConfigModule.forRoot({ folder: './configs' }),
        JWTModule,
        ConfigsModule,
      ],
      providers: [
        {
          provide: APP_GUARD,
          useClass: JWTGuard,
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
      }),
    );

    userRepo = moduleRef.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );

    configsRepo = moduleRef.get<Repository<ConfigEntity>>(
      getRepositoryToken(ConfigEntity),
    );

    modVersionsRepo = moduleRef.get<Repository<ModVersionEntity>>(
      getRepositoryToken(ModVersionEntity),
    );

    repos = [userRepo, configsRepo];

    await app.init();
  });

  afterAll(async () => {
    await resetRepos(repos);
    await app.close();
    await pgContainer.stop();

    await rm(join(process.cwd(), 'test-uploads'), { recursive: true });
  });

  describe('POST /configs', () => {
    describe('STATUS 201', () => {
      beforeEach(async () => {
        await resetRepos(repos);
      });

      it('should create a new config', async () => {
        const username = 'user1';

        const userToCreate = userRepo.create({
          email: 'email',
          role: UserRoles.READ,
          username,
          verified: true,
          hash: 'hash',
          salt: 'salt',
        });

        const userEntity = await userRepo.save(userToCreate);

        const userDto = <UserDto>(
          instanceToPlain(plainToInstance(UserDto, userEntity))
        );

        const modVersionToCreate = modVersionsRepo.create({
          mod: null,
          version: '1.0',
          compatibleMCVersions: [],
        });

        const modVersionEntity = await modVersionsRepo.save(modVersionToCreate);

        const userToken = await getTestAccessToken(userDto, '1m');

        const buffer = Buffer.from('some data');

        const filename = 'config.txt';

        const { statusCode } = await request(app.getHttpServer())
          .post('/configs')
          .set('Authorization', `Bearer ${userToken}`)
          .attach('config', buffer, filename)
          .field('primaryModId', modVersionEntity.id)
          .field('dependenciesIds', JSON.stringify([]))
          .field('version', '1.0');

        expect(statusCode).toBe(HttpStatus.CREATED);

        const expectedDir = join(
          process.cwd(),
          'test-uploads',
          username,
          'configs',
        );

        expect(existsSync(expectedDir)).toBeTruthy();
      });
    });

    describe('STATUS 404', () => {
      beforeEach(async () => {
        await resetRepos(repos);
      });

      it('should return "NotFoundException" if owner with given id does not exist', async () => {
        const userId = 1;
        const username = 'user-1';

        const userDto: UserDto = {
          email: 'email',
          id: userId,
          username,
          role: UserRoles.WRITE,
        };

        const userToken = await getTestAccessToken(userDto, '1m');

        await safeMkdir(
          join(process.cwd(), 'test-uploads', username, 'configs'),
        );

        const buffer = Buffer.from('some data');

        const filename = 'config.txt';

        const { statusCode, body } = await request(app.getHttpServer())
          .post('/configs')
          .set('Authorization', `Bearer ${userToken}`)
          .attach('config', buffer, filename)
          .field('primaryModId', 1)
          .field('dependenciesIds', JSON.stringify([]))
          .field('version', '1.0');

        expect(statusCode).toBe(HttpStatus.NOT_FOUND);
        expect(body.message).toBe(
          configServiceErrorMessages.userNotFoundErr(userId),
        );
      });

      it('should return "NotFoundException" if mod with given id does not exist', async () => {
        const userToCreate = userRepo.create({
          email: 'email',
          role: UserRoles.READ,
          username: 'user-2',
          verified: true,
          hash: 'hash',
          salt: 'salt',
        });

        const userEntity = await userRepo.save(userToCreate);

        const userDto = <UserDto>(
          instanceToPlain(plainToInstance(UserDto, userEntity))
        );

        const userToken = await getTestAccessToken(userDto, '1m');

        const buffer = Buffer.from('some data');

        const filename = 'config.txt';

        const primaryModId = 123;

        const { statusCode, body } = await request(app.getHttpServer())
          .post('/configs')
          .set('Authorization', `Bearer ${userToken}`)
          .attach('config', buffer, filename)
          .field('primaryModId', primaryModId)
          .field('dependenciesIds', JSON.stringify([]))
          .field('version', '1.0');

        expect(statusCode).toBe(HttpStatus.NOT_FOUND);
        expect(body.message).toBe(
          configServiceErrorMessages.primaryModNotFoundErr(primaryModId),
        );
      });

      it('should return "NotFoundException" if one of the dependencies was not found', async () => {
        const userToCreate = userRepo.create({
          email: 'email',
          role: UserRoles.READ,
          username: 'user-2',
          verified: true,
          hash: 'hash',
          salt: 'salt',
        });

        const userEntity = await userRepo.save(userToCreate);

        const userDto = <UserDto>(
          instanceToPlain(plainToInstance(UserDto, userEntity))
        );

        const userToken = await getTestAccessToken(userDto, '1m');

        const buffer = Buffer.from('some data');

        const filename = 'config.txt';

        const modVersionToCreate = modVersionsRepo.create({
          compatibleMCVersions: [],
          mod: null,
          version: '1.0',
          configs: [],
        });

        const modVersionEntity = await modVersionsRepo.save(modVersionToCreate);

        const deps = [123];

        const { statusCode, body } = await request(app.getHttpServer())
          .post('/configs')
          .set('Authorization', `Bearer ${userToken}`)
          .attach('config', buffer, filename)
          .field('primaryModId', modVersionEntity.id)
          .field('dependenciesIds', JSON.stringify(deps))
          .field('version', '1.0');

        expect(statusCode).toBe(HttpStatus.NOT_FOUND);
        expect(body.message).toBe(
          configServiceErrorMessages.dependenciesNotFoundErr(deps.join(', ')),
        );
      });
    });
  });

  describe('GET /configs', () => {
    describe('STATUS 200', () => {
      beforeEach(async () => {
        await resetRepos(repos);
      });

      it('should return all configs', async () => {
        const configToCreate = configsRepo.create({
          fileName: 'file',
          dependencies: [],
          initialFileName: 'initial',
          owner: null,
          version: '1.0',
          primaryMod: null,
        });

        const configEntity = await configsRepo.save(configToCreate);

        const { statusCode, body } = await request(app.getHttpServer()).get(
          '/configs',
        );

        const expectedDto = plainToInstance(ConfigDto, configEntity);

        expect(statusCode).toBe(HttpStatus.OK);
        expect(body).toEqual([expectedDto]);
      });
    });
  });

  describe('GET /configs/:id', () => {
    describe('STATUS 200', () => {
      beforeEach(async () => {
        await resetRepos(repos);
      });

      it('should return a config by id', async () => {
        const configToCreate = configsRepo.create({
          fileName: 'file',
          dependencies: [],
          initialFileName: 'initial',
          owner: null,
          version: '1.0',
          primaryMod: null,
        });

        const configEntity = await configsRepo.save(configToCreate);

        const { statusCode, body } = await request(app.getHttpServer()).get(
          `/configs/${configEntity.id}`,
        );

        const expectedDto = plainToInstance(ConfigPopulatedDto, configEntity);

        expect(statusCode).toBe(HttpStatus.OK);
        expect(body).toEqual(expectedDto);
      });

      it('should return a config with user populated', async () => {
        const userToCreate = userRepo.create({
          email: 'email',
          username: 'username',
          salt: 'salt',
          hash: 'hash',
        });

        const userEntity = await userRepo.save(userToCreate);

        const configToCreate = configsRepo.create({
          fileName: 'file',
          dependencies: [],
          initialFileName: 'initial',
          owner: userEntity,
          version: '1.0',
          primaryMod: null,
        });

        const configEntity = await configsRepo.save(configToCreate);

        const { statusCode, body } = await request(app.getHttpServer()).get(
          `/configs/${configEntity.id}?owner=true`,
        );

        const userDto = plainToInstance(UserDto, userEntity);

        expect(statusCode).toBe(HttpStatus.OK);
        expect(body.owner).toEqual(expect.objectContaining(userDto));
      });
    });
  });
});
