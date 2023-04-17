import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfirmationTokenEntity } from '../users/entities/confirmation-token.entity';
import { Repository } from 'typeorm';
import { SignUpCredentials } from './interfaces/sign-up-credentials.interface';
import { UserEntity } from '../users/entities/user.entity';
import { comparePasswords, hashPassword } from 'server/lib/password-hasher';
import { CreateUserData } from '../users/interfaces';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import { SignInCredentials } from './interfaces/sign-in-credentials.interface';
import { authErrorMessages } from './constants/error-messages';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,

    @InjectRepository(ConfirmationTokenEntity)
    private confirmationTokensRepository: Repository<ConfirmationTokenEntity>,
  ) {}

  public async signUp(credentials: SignUpCredentials): Promise<UserEntity> {
    const [hash, salt] = await hashPassword(credentials.password);

    const preparedCredentials: CreateUserData = {
      email: credentials.email,
      username: credentials.username,
      hash,
      salt,
    };

    const user = await this.usersService.create(preparedCredentials);

    const token = randomStringGenerator();

    const confirmationTokenEntity = this.confirmationTokensRepository.create({
      token,
      expirationDate: new Date(Date.now() + 60 * 60 * 1000),
      user,
    });

    await this.confirmationTokensRepository.save(confirmationTokenEntity);

    return user;
  }

  public async verifyCredentianls(
    credentials: SignInCredentials,
  ): Promise<UserEntity> {
    const userEntity = await this.usersService.findOneByUsername(
      credentials.username,
    );

    if (!userEntity) {
      throw new NotFoundException(
        authErrorMessages.getUserNameNotExistErr(credentials.username),
      );
    }

    if (!userEntity.verified) {
      throw new UnauthorizedException(
        authErrorMessages.getAccountNotVerifiedErr(),
      );
    }

    const matches = await comparePasswords({
      salt: userEntity.salt,
      storedPass: userEntity.hash,
      providedPass: credentials.password,
    });

    if (!matches) {
      throw new UnauthorizedException(authErrorMessages.getInvalidPassErr());
    }

    return userEntity;
  }
}
