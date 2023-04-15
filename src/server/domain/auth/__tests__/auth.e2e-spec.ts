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
import { RefreshTokenEntity } from 'server/domain/tokens/entities/refresh-token.entity';
import { HttpStatus } from '@nestjs/common';

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

    repos = getRepos(moduleRef, [
      UserEntity,
      ConfirmationTokenEntity,
      RefreshTokenEntity,
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

  describe('POST /auth/sign-in', () => {
    beforeEach(async () => {
      await resetRepos(repos);
    });

    describe('STATUS 401', () => {
      beforeEach(async () => {
        await resetRepos(repos);
      });

      it('should return an error if account is not verified', async () => {
        const username = 'username';
        const password = 'password';

        const signUpRes = await request(app.getHttpServer())
          .post('/auth/sign-up')
          .send({
            username,
            password,
            email: 'email',
          });

        expect(signUpRes.statusCode).toBe(200);

        const signInRes = await request(app.getHttpServer())
          .post('/auth/sign-in')
          .send({
            username,
            password,
          });

        expect(signInRes.statusCode).toBe(HttpStatus.UNAUTHORIZED);
        expect(signInRes.body.message).toBe(
          'Account is not verified. Please check your inbox!',
        );
      });

      it('should return an error if password is invalid', async () => {
        const username = 'username';
        const password = 'password';

        const signUpRes = await request(app.getHttpServer())
          .post('/auth/sign-up')
          .send({
            username,
            password,
            email: 'email',
          });

        expect(signUpRes.statusCode).toBe(200);

        await usersRepo.update(
          {
            username,
          },
          {
            verified: true,
          },
        );

        const signInRes = await request(app.getHttpServer())
          .post('/auth/sign-in')
          .send({
            username,
            password: 'pass',
          });

        expect(signInRes.statusCode).toBe(HttpStatus.UNAUTHORIZED);
        expect(signInRes.body.message).toBe('Invalid password!');
      });
    });

    describe('STATUS 404', () => {
      beforeEach(async () => {
        await resetRepos(repos);
      });

      it('should return an error if user does not exist', async () => {
        const username = 'username';

        const { statusCode, body } = await request(app.getHttpServer())
          .post('/auth/sign-in')
          .send({
            username,
            password: 'password',
          });

        expect(statusCode).toBe(HttpStatus.NOT_FOUND);
        expect(body.message).toBe(
          `User with given username: ${username} does not exist!`,
        );
      });
    });

    describe('STATUS 200', () => {
      beforeEach(async () => {
        await resetRepos(repos);
      });

      it('should return a user and a pair of tokens', async () => {
        const username = 'username';
        const password = 'password';

        const signUpRes = await request(app.getHttpServer())
          .post('/auth/sign-up')
          .send({
            username,
            password,
            email: 'email',
          });

        expect(signUpRes.statusCode).toBe(200);

        await usersRepo.update(
          {
            username,
          },
          {
            verified: true,
          },
        );

        const signInRes = await request(app.getHttpServer())
          .post('/auth/sign-in')
          .send({
            username,
            password,
          });

        const body = signInRes.body;
        const statusCode = signInRes.statusCode;

        expect(statusCode).toBe(HttpStatus.OK);
        expect(body).toHaveProperty('user');
        expect(body).toHaveProperty('accessToken');
        expect(body).toHaveProperty('refreshToken');
      });
    });
  });
});
