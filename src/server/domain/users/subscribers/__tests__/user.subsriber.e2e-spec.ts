import { NestApplication } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { StartedPostgreSqlContainer } from 'testcontainers';
import { UserSubscriber } from '../user.subscriber';
import { ConfigModule } from 'server/config/config.module';
import { createTestContainer } from 'server/test-utils/create-test-container';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from '../../entities/user.entity';
import { Repository } from 'typeorm';
import { resetRepos } from 'server/test-utils/clear-repos';
import { join } from 'path';
import { existsSync } from 'fs';
import { clearTestUploadsDir } from 'server/test-utils/clear-test-uploads-dir';
import { UsersModule } from '../../users.module';

describe('SUBSCRIBER User', () => {
  jest.setTimeout(180_000);

  let app: NestApplication;
  let container: StartedPostgreSqlContainer;
  let usersRepo: Repository<UserEntity>;

  beforeAll(async () => {
    const { pgContainer, options } = await createTestContainer();

    container = pgContainer;

    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ folder: './configs' }),
        TypeOrmModule.forRoot(options),
        UsersModule,
      ],
      providers: [UserSubscriber],
    }).compile();

    app = moduleRef.createNestApplication();

    usersRepo = moduleRef.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );

    await app.init();
  });

  afterAll(async () => {
    await resetRepos([usersRepo]);
    await app.close();
    await container.stop();

    await clearTestUploadsDir();
  });

  beforeEach(async () => {
    await resetRepos([usersRepo]);

    await clearTestUploadsDir();
  });

  it('should create a new folder when user created', async () => {
    const userToCreate = usersRepo.create({
      email: 'email',
      username: 'test-user-create',
      hash: 'hash',
      salt: 'salt',
    });

    await usersRepo.save(userToCreate);

    const folder = join(
      process.cwd(),
      'test-uploads',
      userToCreate.username,
      'configs',
    );

    expect(existsSync(folder)).toBeTruthy();
  });

  it('should delete a user folder when user deleted', async () => {
    const userToCreate = usersRepo.create({
      email: 'email',
      username: 'test-user-delete',
      hash: 'hash',
      salt: 'salt',
    });

    const userEntity = await usersRepo.save(userToCreate);

    await usersRepo.remove(userEntity);

    const folder = join(process.cwd(), 'test-uploads', userToCreate.username);

    expect(existsSync(folder)).toBeFalsy();
  });

  it('should rename user uploads dir when user has been updated', async () => {
    const userToCreate = usersRepo.create({
      email: 'email',
      username: 'test-user-update',
      hash: 'hash',
      salt: 'salt',
    });

    await usersRepo.save(userToCreate);

    const createdFolder = join(
      process.cwd(),
      'test-uploads',
      userToCreate.username,
    );

    expect(existsSync(createdFolder)).toBeTruthy();

    const userEntity = await usersRepo.findOne({
      where: { username: userToCreate.username },
    });

    userEntity.username = 'test-user-update-1';

    await usersRepo.save(userEntity);

    const updatedFolder = join(
      process.cwd(),
      'test-uploads',
      userEntity.username,
    );

    expect(existsSync(createdFolder)).toBeFalsy();
    expect(existsSync(updatedFolder)).toBeTruthy();
  });
});
