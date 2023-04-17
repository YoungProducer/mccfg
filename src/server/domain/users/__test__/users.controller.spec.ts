import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { UsersController } from '../users.controller';
import { UsersService } from '../users.service';
import { UserDto } from '../dto/user.dto';
import { UserEntity, UserRoles } from '../entities/user.entity';
import { ConfirmationTokenEntity } from '../entities/confirmation-token.entity';
import { Repository } from 'typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { CreateUserData } from '../interfaces';

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

  describe('API create', () => {
    it('should throw an error if service does it', () => {
      jest
        .spyOn(usersService, 'create')
        .mockRejectedValue(new ConflictException('error'));

      const call = usersService.create({} as any);

      expect(call).rejects.toThrow(ConflictException);
      expect(call).rejects.toThrowError('error');
    });

    it('should return created user if there are no errors', async () => {
      const data: CreateUserData = {
        username: 'username',
        email: 'email',
        hash: 'hash',
        salt: 'salt',
      };

      jest.spyOn(usersService, 'create').mockResolvedValue(data as any);

      expect(await usersService.create(data)).toEqual(data);
    });
  });

  describe('API getAll', () => {
    it(`should return users and match the response dto`, async () => {
      const result: UserDto = {
        id: 1,
        email: 'email',
        username: 'username',
        role: UserRoles.READ,
      };

      const serviceFindAllResult: UserEntity = {
        ...result,
        salt: 'salt',
        hash: 'hash',
        configs: [],
        confirmationToken: null,
        verified: false,
        refreshTokens: [],
        role: UserRoles.READ,
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
