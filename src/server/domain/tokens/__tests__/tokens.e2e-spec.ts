import request from 'supertest';
import { NestApplication } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { TokensModule } from '../tokens.module';
import { ObjectLiteral, Repository } from 'typeorm';
import { RefreshTokenEntity } from '../entities/refresh-token.entity';
import { UserEntity } from 'server/domain/users/entities/user.entity';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { resetRepos } from 'server/test-utils/clear-repos';
import { HttpStatus } from '@nestjs/common';
import { createTestContainer } from 'server/test-utils/create-test-container';
import { StartedPostgreSqlContainer } from 'testcontainers';
import { ConfigModule } from '../../../config/config.module';

describe('E2E Tokens', () => {
  jest.setTimeout(180_000);

  let pgContainer: StartedPostgreSqlContainer;
  let app: NestApplication;

  let refreshTokensRepo: Repository<RefreshTokenEntity>;
  let usersRepo: Repository<UserEntity>;

  let repos: Repository<ObjectLiteral>[];

  beforeAll(async () => {
    const containerData = await createTestContainer();

    pgContainer = containerData.pgContainer;

    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ folder: './configs' }),
        TokensModule,
        TypeOrmModule.forRoot(containerData.options),
      ],
    }).compile();

    refreshTokensRepo = moduleRef.get<Repository<RefreshTokenEntity>>(
      getRepositoryToken(RefreshTokenEntity),
    );
    usersRepo = moduleRef.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );

    repos = [refreshTokensRepo, usersRepo];

    app = moduleRef.createNestApplication();

    await app.init();
  });

  afterAll(async () => {
    await resetRepos(repos);
    await app.close();
    await pgContainer.stop();
  });

  describe('POST /tokens/refresh', () => {
    beforeEach(async () => {
      await resetRepos(repos);
    });

    it('should return a 401 UnathorizedException if token is invalid', async () => {
      const { statusCode, body } = await request(app.getHttpServer())
        .post('/tokens/refresh')
        .send({
          refreshToken: 'token',
        });

      expect(statusCode).toBe(HttpStatus.UNAUTHORIZED);
      expect(body.message).toBe(`Invalid refresh token!`);
    });

    it('should a tokens pair if refresh token has passed validation', async () => {
      const userToCreate = usersRepo.create({
        email: 'email',
        username: 'username',
        hash: 'hash',
        salt: 'salt',
      });

      const createdUser = await usersRepo.save(userToCreate);

      const token = 'token';

      const tokenToCreate = refreshTokensRepo.create({
        token,
        user: createdUser,
      });

      await refreshTokensRepo.save(tokenToCreate);

      const { statusCode, body } = await request(app.getHttpServer())
        .post('/tokens/refresh')
        .send({
          refreshToken: token,
        });

      expect(statusCode).toBe(HttpStatus.OK);
      expect(body).toHaveProperty('accessToken');
      expect(body).toHaveProperty('refreshToken');
      expect(body.accessToken).toBeDefined();
      expect(body.refreshToken).toBeDefined();
      expect(body.accessToken).toEqual(expect.stringContaining('Bearer '));
    });
  });
});
