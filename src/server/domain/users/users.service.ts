import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserEntity } from './entities/user.entity';
import { CreateUserData } from './interfaces';
import { ConfirmationTokenEntity } from './entities/confirmation-token.entity';
import { userErrorMessages } from './constants/error-messages';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,

    @InjectRepository(ConfirmationTokenEntity)
    private confirmatinTokensRepository: Repository<ConfirmationTokenEntity>,
  ) {}

  public async create(data: CreateUserData): Promise<UserEntity> {
    const existingUser = await this.usersRepository.findOne({
      where: [{ username: data.username }, { email: data.email }],
    });

    if (existingUser?.username === data.username) {
      throw new ConflictException(
        userErrorMessages.getUsernameAlreadyTakenErr(data.username),
      );
    }

    if (existingUser?.email === data.email) {
      throw new ConflictException(
        userErrorMessages.getEmailAlreadyTakenErr(data.email),
      );
    }

    const user = this.usersRepository.create({
      username: data.username,
      email: data.email,
      hash: data.hash,
      salt: data.salt,
    });

    await this.usersRepository.save(user);

    return user;
  }

  public async verify(token: string): Promise<void> {
    const tokenEntity = await this.confirmatinTokensRepository.findOne({
      where: {
        token,
      },
      relations: {
        user: true,
      },
    });

    if (!tokenEntity) {
      throw new NotFoundException(userErrorMessages.getConfTokenInvalidErr());
    }

    const user = tokenEntity.user;

    if (!tokenEntity.user) {
      throw new BadRequestException(userErrorMessages.getConfTokenNoUserErr());
    }

    if (Number(Date.now()) > Number(tokenEntity.expirationDate)) {
      throw new BadRequestException(userErrorMessages.getConfTokenExpiredErr());
    }

    user.verified = true;
    user.confirmationToken = null;

    await this.usersRepository.save(user);
    await this.confirmatinTokensRepository.remove(tokenEntity);
  }

  public async findAll(): Promise<UserEntity[]> {
    return await this.usersRepository.find();
  }

  public async findOneById(id: number): Promise<UserEntity | undefined> {
    return await this.usersRepository.findOne({
      where: {
        id,
      },
    });
  }

  public async findOneByEmail(email: string): Promise<UserEntity | undefined> {
    return await this.usersRepository.findOne({
      where: {
        email,
      },
    });
  }

  public async findOneByUsername(
    username: string,
  ): Promise<UserEntity | undefined> {
    return await this.usersRepository.findOne({
      where: {
        username,
      },
    });
  }
}
