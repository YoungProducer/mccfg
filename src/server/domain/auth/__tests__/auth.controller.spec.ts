import { Test } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { UsersService } from 'server/domain/users/users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfirmationTokenEntity } from 'server/domain/users/entities/confirmation-token.entity';
import { Repository } from 'typeorm';
import { UserEntity } from 'server/domain/users/entities/user.entity';
import { ConflictException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { SignUpResponseDto } from '../dto/sign-up-response.dto';
import { UserDto } from 'server/domain/users/dto/user.dto';

describe('CONTROLLER Auth', () => {
  let authController: AuthController;
  let authService: AuthService;
  let usersService: UsersService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        UsersService,
        {
          provide: getRepositoryToken(ConfirmationTokenEntity),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(UserEntity),
          useClass: Repository,
        },
      ],
    }).compile();

    authController = moduleRef.get<AuthController>(AuthController);
    authService = moduleRef.get<AuthService>(AuthService);
    usersService = moduleRef.get<UsersService>(UsersService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
    expect(authService).toBeDefined();
    expect(usersService).toBeDefined();
  });

  describe('API signUp', () => {
    it('should throw an error if error occurs', async () => {
      jest
        .spyOn(authService, 'signUp')
        .mockRejectedValue(new ConflictException('error'));

      const call = authController.signUp({
        email: 'email',
        password: 'password',
        username: 'username',
      });

      expect(call).rejects.toThrow(ConflictException);
      expect(call).rejects.toThrowError('error');
    });

    it('should return an expected dto if there are no erros', async () => {
      const expectedUser: UserDto = {
        email: 'email',
        id: 1,
        username: 'username',
      };

      const userToReturn: UserEntity = {
        ...expectedUser,
        configs: [],
        confirmationToken: null,
        hash: 'hash',
        salt: 'salt',
        verified: false,
      };

      jest.spyOn(authService, 'signUp').mockResolvedValue(userToReturn);

      const expectedValue = plainToInstance(SignUpResponseDto, {
        user: expectedUser,
      });

      expect(
        await authController.signUp({
          email: 'email',
          password: 'pass',
          username: 'username',
        }),
      ).toEqual(expectedValue);
    });
  });
});
