import request from 'supertest';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NestApplication } from '@nestjs/core';
import { ObjectLiteral, Repository } from 'typeorm';

import { AuthModule } from '../auth.module';
import { DataBaseMockModule } from 'server/mocks/database-module.mock';
import { UserEntity } from 'server/domain/users/entities/user.entity';
import { getRepos, resetRepos } from 'server/test-utils/clear-repos';
import { ConfirmationTokenEntity } from 'server/domain/users/entities/confirmation-token.entity';
import { SignUpDto } from '../dto/sign-up.dto';

describe('E2E Auth', () => {
  let app: NestApplication;

  let usersRepo: Repository<UserEntity>;
  let repos: Repository<ObjectLiteral>[];

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AuthModule, DataBaseMockModule],
    }).compile();

    app = moduleRef.createNestApplication();

    usersRepo = moduleRef.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );

    repos = getRepos(moduleRef, [UserEntity, ConfirmationTokenEntity]);

    await app.init();
  });

  beforeEach(async () => {
    await resetRepos(repos);
  });

  afterAll(async () => {
    await resetRepos(repos);
    await app.close();
  });

  it('should be defined', () => {
    expect(app).toBeDefined();
  });

  describe('POST /auth/sign-up', () => {
    describe('STATUS 409', () => {
      afterEach(async () => {
        await resetRepos(repos);
      });

      it('should return an error if user with given username already exist', async () => {
        const username = 'username';

        const userData: SignUpDto = {
          email: 'email',
          username,
          password: 'pass',
        };

        const userToCreate = usersRepo.create({
          username: 'username',
          email: 'email',
          salt: 'salt',
          hash: 'hash',
        });

        await usersRepo.save(userToCreate);

        const { statusCode, body } = await request(app.getHttpServer())
          .post('/auth/sign-up')
          .send(userData);

        expect(statusCode).toBe(409);
        expect(body.message).toBe(`Username ${username} is already taken!`);
      });

      it('should return an error if user with given email already exist', async () => {
        const email = 'email';

        const userData: SignUpDto = {
          email,
          username: 'user',
          password: 'pass',
        };

        const userToCreate = usersRepo.create({
          username: 'username',
          email,
          hash: 'hash',
          salt: 'salt',
        });

        await usersRepo.save(userToCreate);

        const { statusCode, body } = await request(app.getHttpServer())
          .post('/auth/sign-up')
          .send(userData);

        expect(statusCode).toBe(409);
        expect(body.message).toBe(`Email ${email} is already taken!`);
      });
    });

    describe('STATUS 200', () => {
      afterEach(async () => {
        await resetRepos(repos);
      });

      it('should return a created user', async () => {
        const userData: SignUpDto = {
          email: 'email',
          username: 'username',
          password: 'pass',
        };

        const { statusCode, body } = await request(app.getHttpServer())
          .post('/auth/sign-up')
          .send(userData);

        expect(statusCode).toBe(200);

        const user = body.user;

        expect(user.email).toBe('email');
        expect(user.username).toBe('username');
      });
    });
  });
});
