import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { UsersController } from '../users.controller';
import { UsersService } from '../users.service';
import { UserDto } from '../dto/user.dto';
import { UserEntity } from '../entities/user.entity';
import { repositoryMockFactory } from 'server/mocks/repository-mock';

describe('UsersController', () => {
  let usersController: UsersController;
  let usersService: UsersService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(UserEntity),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile();

    usersService = moduleRef.get<UsersService>(UsersService);
    usersController = moduleRef.get<UsersController>(UsersController);
  });

  describe('API getAll', () => {
    it(`should exclude 'password' and 'salt' props from response`, async () => {
      const result: UserDto = {
        id: 1,
        email: 'email',
        username: 'username',
      };

      const serviceFindAllResult: UserEntity = {
        ...result,
        password: 'password',
        salt: 'salt',
        configs: [],
      };

      jest
        .spyOn(usersService, 'findAll')
        .mockImplementation(async () => [serviceFindAllResult]);

      expect(await usersController.getAll()).toEqual([result]);
    });
  });
});
