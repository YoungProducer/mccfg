import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RefreshTokenEntity } from '../entities/refresh-token.entity';
import { Repository } from 'typeorm';
import { UsersService } from 'server/domain/users/users.service';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import { refreshErrorMessages } from './constants/error-messages';

@Injectable()
export class RefreshService {
  constructor(
    private usersService: UsersService,

    @InjectRepository(RefreshTokenEntity)
    private refreshTokensRepository: Repository<RefreshTokenEntity>,
  ) {}

  public async create(userId: number): Promise<string> {
    const user = await this.usersService.findOneById(userId);

    if (!user) {
      throw new NotFoundException(
        refreshErrorMessages.getUserNotFoundErr(userId),
      );
    }

    const token = randomStringGenerator();

    const entity = this.refreshTokensRepository.create({
      token,
      user,
    });

    await this.refreshTokensRepository.save(entity);

    return token;
  }

  public async validate(token: string): Promise<RefreshTokenEntity> {
    const entity = await this.refreshTokensRepository.findOne({
      where: {
        token,
      },
      relations: ['user'],
    });

    if (!entity) {
      throw new UnauthorizedException(
        refreshErrorMessages.getInvalidTokenErr(),
      );
    }

    return entity;
  }
}
