import request from 'supertest';
import { NestApplication } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { DeepPartial, ObjectLiteral, Repository } from 'typeorm';

import { resetRepos } from 'server/test-utils/clear-repos';
import { UsersModule } from '../users.module';
import { UserEntity } from '../entities/user.entity';
import { ConfirmationTokenEntity } from '../entities/confirmation-token.entity';
import { CreateUserData } from '../interfaces';
import { createTestContainer } from 'server/test-utils/create-test-container';
import { StartedPostgreSqlContainer } from 'testcontainers';
import { userErrorMessages } from '../constants/error-messages';
import { HttpStatus } from '@nestjs/common';

describe('Users', () => {
  jest.setTimeout(180_000);

  let pgContainer: StartedPostgreSqlContainer;
  let app: NestApplication;
  let repos: Repository<ObjectLiteral>[];
  let userRepo: Repository<UserEntity>;
  let confirmationsTokensRepo: Repository<ConfirmationTokenEntity>;

  beforeAll(async () => {
    const containerData = await createTestContainer();

    pgContainer = containerData.pgContainer;

    const moduleRef = await Test.createTestingModule({
      imports: [TypeOrmModule.forRoot(containerData.options), UsersModule],
    }).compile();

    app = moduleRef.createNestApplication();

    userRepo = moduleRef.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );

    confirmationsTokensRepo = moduleRef.get<
      Repository<ConfirmationTokenEntity>
    >(getRepositoryToken(ConfirmationTokenEntity));

    repos = [userRepo, confirmationsTokensRepo];

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

  describe('POST /users', () => {
    beforeEach(async () => {
      await resetRepos(repos);
    });

    it('should create a new user', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({
          username: 'username',
          email: 'email@email',
          hash: 'hash',
          salt: 'salt',
        })
        .expect(201);
    });

    describe('STATUS 409', () => {
      beforeEach(async () => {
        await resetRepos(repos);
      });

      it('should return an error if user with given "username" already exist', async () => {
        const username = 'username';

        const data: CreateUserData = {
          username,
          email: 'email',
          hash: 'hash',
          salt: 'salt',
        };

        const userToCreate = userRepo.create({ ...data });

        await userRepo.save(userToCreate);

        const { statusCode, body } = await request(app.getHttpServer())
          .post('/users')
          .send(data);

        expect(statusCode).toBe(HttpStatus.CONFLICT);
        expect(body.message).toBe(
          userErrorMessages.getUsernameAlreadyTakenErr(username),
        );
      });

      it('should return an error if user with given "email" already exist', async () => {
        const email = 'email';

        const data: CreateUserData = {
          username: 'username',
          email,
          hash: 'hash',
          salt: 'salt',
        };

        const userToCreate = userRepo.create({
          ...data,
          username: 'user',
        });

        await userRepo.save(userToCreate);

        const { statusCode, body } = await request(app.getHttpServer())
          .post('/users')
          .send(data);

        expect(statusCode).toBe(HttpStatus.CONFLICT);
        expect(body.message).toBe(
          userErrorMessages.getEmailAlreadyTakenErr(email),
        );
      });

      it('should reutrn an error if user with both "email" and "username" already exist', async () => {
        const username = 'username';
        const email = 'email';

        const data: CreateUserData = {
          username,
          email,
          hash: 'hash',
          salt: 'salt',
        };

        const userToCreate = userRepo.create(data);

        await userRepo.save(userToCreate);

        const { statusCode, body } = await request(app.getHttpServer())
          .post('/users')
          .send(data);

        expect(statusCode).toBe(HttpStatus.CONFLICT);
        expect(body.message).toBe(
          userErrorMessages.getUsernameAlreadyTakenErr(username),
        );
      });
    });
  });

  describe('GET /users', () => {
    beforeEach(async () => {
      await resetRepos(repos);
    });

    it('should return list of users only with disclosed properties', async () => {
      const userData: DeepPartial<UserEntity> = {
        username: 'username',
        email: 'email@email',
        hash: 'hash',
        salt: 'salt',
        confirmationToken: null,
        configs: [],
      };

      const createdUser = userRepo.create(userData);

      await userRepo.save(createdUser);

      const res = await request(app.getHttpServer()).get('/users');

      const body = res.body;

      expect(res.statusCode).toBe(HttpStatus.OK);
      expect(body).toHaveLength(1);

      const user = body[0];

      expect(user).not.toHaveProperty('hash');
      expect(user).not.toHaveProperty('salt');
    });
  });

  describe('POST /users/verify/:token', () => {
    describe('STATUS 404', () => {
      beforeEach(async () => {
        await resetRepos(repos);
      });

      it('should return an error if token was not found', async () => {
        const { statusCode, body } = await request(app.getHttpServer())
          .post('/users/verify/token')
          .send();

        expect(statusCode).toBe(HttpStatus.NOT_FOUND);
        expect(body.message).toBe(userErrorMessages.getConfTokenInvalidErr());
      });
    });

    describe('STATUS 400', () => {
      beforeEach(async () => {
        await resetRepos(repos);
      });

      it('should return an error if token is not binded to any of users', async () => {
        const token = 'token';

        const tokenEntityToCreate = confirmationsTokensRepo.create({
          token,
          expirationDate: new Date(Date.now() + 10000),
          user: null,
        });

        await confirmationsTokensRepo.save(tokenEntityToCreate);

        const { statusCode, body } = await request(app.getHttpServer())
          .post(`/users/verify/${token}`)
          .send();

        expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
        expect(body.message).toBe(userErrorMessages.getConfTokenNoUserErr());
      });

      it('should return an error if token is expired', async () => {
        const userEntityToCreate = userRepo.create({
          username: 'username',
          email: 'email@email',
          hash: 'hash',
          salt: 'salt',
          confirmationToken: null,
        });

        const createdUser = await userRepo.save(userEntityToCreate);

        const token = 'token';

        const tokenEntityToCreate = confirmationsTokensRepo.create({
          token,
          expirationDate: new Date(Date.now() - 1000000),
          user: createdUser,
        });

        await confirmationsTokensRepo.save(tokenEntityToCreate);

        const { statusCode, body } = await request(app.getHttpServer())
          .post(`/users/verify/${token}`)
          .send();

        expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
        expect(body.message).toBe(userErrorMessages.getConfTokenExpiredErr());
      });
    });

    describe('STATUS 200', () => {
      beforeEach(async () => {
        await resetRepos(repos);
      });

      it('should updated user and delete token if data is correct', async () => {
        const userEntityToCreate = userRepo.create({
          username: 'username',
          email: 'email@email',
          hash: 'hash',
          salt: 'salt',
        });

        const createdUser = await userRepo.save(userEntityToCreate);

        const token = 'token';

        const tokenEntityToCreate = confirmationsTokensRepo.create({
          token,
          expirationDate: new Date(Date.now() + 10000),
          user: createdUser,
        });

        await confirmationsTokensRepo.save(tokenEntityToCreate);

        const { statusCode } = await request(app.getHttpServer())
          .post(`/users/verify/${token}`)
          .send();

        expect(statusCode).toBe(HttpStatus.OK);

        const updatedUserEntity = await userRepo.findOne({
          where: {
            id: createdUser.id,
          },
        });

        expect(updatedUserEntity.verified).toBeTruthy();
        expect(updatedUserEntity.confirmationToken).toBeUndefined();
      });
    });
  });
});
