import request from 'supertest';
import { NestApplication } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { getTestDatabaseTypeOrmOptions } from 'server/mocks/test-database';
import { ObjectLiteral, Repository } from 'typeorm';

import { ConfigModule } from 'server/config/config.module';
import { DI_CONFIG } from 'server/config/constants';
import { resetRepos } from 'server/test-utils/clear-repos';
import { UsersModule } from '../users.module';
import { UserEntity } from '../entities/user.entity';
import { CreateUserData } from '../interfaces';

describe('Users', () => {
  let app: NestApplication;
  let repos: Repository<ObjectLiteral>[];
  let userRepo: Repository<UserEntity>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        UsersModule,
        ConfigModule.forRoot({ folder: './configs' }),
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: getTestDatabaseTypeOrmOptions,
          inject: [DI_CONFIG],
        }),
      ],
    }).compile();

    app = moduleRef.createNestApplication();

    userRepo = moduleRef.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );

    repos = [userRepo];

    await app.init();
  });

  beforeEach(() => {
    resetRepos(repos);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/POST create', () => {
    it('should create a new user', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({
          username: 'username',
          email: 'email@email',
          password: 'password',
          salt: 'salt',
        })
        .expect(201);
    });
  });

  describe('/GET getAll', () => {
    it('should return list of users only with disclosed properties', async () => {
      const userData: CreateUserData = {
        username: 'username',
        email: 'email@email',
        password: 'password',
        salt: 'salt',
      };

      const createdUser = userRepo.create(userData);

      await userRepo.save(createdUser);

      const res = await request(app.getHttpServer()).get('/users');

      const body = res.body;

      expect(res.statusCode).toBe(200);
      expect(body).toHaveLength(1);

      const user = body[0];

      expect(user).not.toHaveProperty('password');
      expect(user).not.toHaveProperty('salt');
    });
  });
});
