import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RefreshTokenEntity } from './entities/refresh-token.entity';
import { Repository } from 'typeorm';
import { DI_CONFIG } from 'server/config/constants';
import { EnvConfig } from 'server/config/interfaces';
import { JWTService } from './jwt/jwt.service';
import { RefreshService } from './refresh/refresh.service';
import { UserDto } from '../users/dto/user.dto';
import { SignOptions } from './jwt/interfaces/sign-options.interface';

@Injectable()
export class TokensService {
  constructor(
    @Inject(DI_CONFIG)
    private config: EnvConfig,

    private jwtService: JWTService,

    private refreshService: RefreshService,

    @InjectRepository(RefreshTokenEntity)
    private refreshTokensRepository: Repository<RefreshTokenEntity>,
  ) {}

  public async issueTokensPair(user: UserDto): Promise<[string, string]> {
    const options: SignOptions = {
      expiresIn: this.config.JWT_EXPIRES_IN,
      secret: this.config.JWT_SECRET,
    };

    const accessToken = await this.jwtService.signToken(user, options);
    const refreshToken = await this.refreshService.create(user.id);

    return [`Bearer ${accessToken}`, refreshToken];
  }

  public async refresh(token: string): Promise<[string, string]> {
    const tokenEntity = await this.refreshService.validate(token);

    const tokensPair = await this.issueTokensPair(tokenEntity.user);

    await this.refreshTokensRepository.remove(tokenEntity);

    return tokensPair;
  }
}
