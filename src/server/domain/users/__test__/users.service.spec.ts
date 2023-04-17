import { Repository } from 'typeorm';
import { UsersService } from '../users.service';
import { UserEntity } from '../entities/user.entity';
import { ConfirmationTokenEntity } from '../entities/confirmation-token.entity';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateUserData } from '../interfaces';
import { userErrorMessages } from '../constants/error-messages';

describe('SERVICE Users', () => {
  let userService: UsersService;

  let usersRepo: Repository<UserEntity>;
  let confirmationTokensRepo: Repository<ConfirmationTokenEntity>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
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

    userService = moduleRef.get<UsersService>(UsersService);

    usersRepo = moduleRef.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );
    confirmationTokensRepo = moduleRef.get<Repository<ConfirmationTokenEntity>>(
      getRepositoryToken(ConfirmationTokenEntity),
    );
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('METHOD create', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should throw ConflictException if user with given username already exist', () => {
      const username = 'username';

      jest.spyOn(usersRepo, 'findOne').mockResolvedValue({
        username,
      } as any);

      const call = userService.create({
        email: '',
        hash: '',
        salt: '',
        username,
      });

      expect(call).rejects.toThrow(ConflictException);
      expect(call).rejects.toThrowError(
        userErrorMessages.getUsernameAlreadyTakenErr(username),
      );
    });

    it('should throw ConflictException if user with given email already exist', () => {
      const email = 'email';

      jest.spyOn(usersRepo, 'findOne').mockResolvedValue({ email } as any);

      const call = userService.create({
        email,
        hash: '',
        salt: '',
        username: '',
      });

      expect(call).rejects.toThrow(ConflictException);
      expect(call).rejects.toThrowError(
        userErrorMessages.getEmailAlreadyTakenErr(email),
      );
    });

    it('should return created user if there are no erros', async () => {
      jest.spyOn(usersRepo, 'findOne').mockResolvedValue(undefined);
      jest.spyOn(usersRepo, 'create').mockImplementation((e: any) => e);
      jest.spyOn(usersRepo, 'save').mockImplementation((e: any) => e);

      const data: CreateUserData = {
        email: 'email',
        hash: 'hash',
        salt: 'salt',
        username: 'username',
      };

      expect(await userService.create(data)).toEqual(data);
    });
  });

  describe('METHOD verify', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return NotFoundException if token was not found', () => {
      jest
        .spyOn(confirmationTokensRepo, 'findOne')
        .mockResolvedValue(undefined);

      const call = userService.verify('token');

      expect(call).rejects.toThrow(NotFoundException);
      expect(call).rejects.toThrowError(
        userErrorMessages.getConfTokenInvalidErr(),
      );
    });

    it('should return BadRequestException if token has no related users', () => {
      jest.spyOn(confirmationTokensRepo, 'findOne').mockResolvedValue({
        id: 1,
        expirationDate: new Date(),
        token: 'token',
        user: null,
      });

      const call = userService.verify('token');

      expect(call).rejects.toThrow(BadRequestException);
      expect(call).rejects.toThrowError(
        userErrorMessages.getConfTokenNoUserErr(),
      );
    });

    it('should return BadRequestException if token is expired', () => {
      jest.spyOn(confirmationTokensRepo, 'findOne').mockResolvedValue({
        id: 1,
        expirationDate: new Date(Date.now() - 10000),
        token: 'token',
        user: {} as UserEntity,
      });

      const call = userService.verify('token');

      expect(call).rejects.toThrow(BadRequestException);
      expect(call).rejects.toThrowError(
        userErrorMessages.getConfTokenExpiredErr(),
      );
    });

    it('should remove confirmation token and update user if there are no errors', async () => {
      jest.spyOn(confirmationTokensRepo, 'findOne').mockResolvedValue({
        id: 1,
        expirationDate: new Date(Date.now() + 10000),
        token: 'token',
        user: {
          verified: false,
        } as UserEntity,
      });

      const removeSpy = jest
        .spyOn(confirmationTokensRepo, 'remove')
        .mockResolvedValue(undefined);

      const saveSpy = jest
        .spyOn(usersRepo, 'save')
        .mockResolvedValue(undefined);

      expect(await userService.verify('token')).toBeUndefined();
      expect(removeSpy).toBeCalled();
      expect(saveSpy).toBeCalledWith({
        verified: true,
        confirmationToken: null,
      });
    });
  });
});
