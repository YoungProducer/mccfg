import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { UsersController } from '../users.controller';
import { UsersService } from '../users.service';
import { UserDto } from '../dto/user.dto';
import { UserEntity } from '../entities/user.entity';
import { ConfirmationTokenEntity } from '../entities/confirmation-token.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

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
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(ConfirmationTokenEntity),
          useClass: Repository,
        },
      ],
    }).compile();

    usersService = moduleRef.get<UsersService>(UsersService);
    usersController = moduleRef.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(usersController).toBeDefined();
    expect(usersService).toBeDefined();
  });

  describe('API getAll', () => {
    it(`should return users and match the response dto`, async () => {
      const result: UserDto = {
        id: 1,
        email: 'email',
        username: 'username',
      };

      const serviceFindAllResult: UserEntity = {
        ...result,
        salt: 'salt',
        hash: 'hash',
        configs: [],
        confirmationToken: null,
        verified: false,
      };

      jest
        .spyOn(usersService, 'findAll')
        .mockImplementation(async () => [serviceFindAllResult]);

      expect(await usersController.getAll()).toEqual([result]);
    });
  });

  describe('API verify', () => {
    it('should throw an error if service throws it', () => {
      jest
        .spyOn(usersService, 'verify')
        .mockRejectedValue(new NotFoundException('error'));

      const call = usersController.verify('token');

      expect(call).rejects.toThrow(NotFoundException);
      expect(call).rejects.toThrowError('error');
    });

    it('should return void if there are no errors', async () => {
      jest.spyOn(usersService, 'verify').mockResolvedValue(undefined);

      expect(await usersController.verify('token')).toBeUndefined();
    });
  });
});
