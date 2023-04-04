import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserEntity } from './entities/user.entity';
import { CreateUserData } from './interfaces';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
  ) {}

  public async create(data: CreateUserData): Promise<UserEntity> {
    const user = this.usersRepository.create({
      username: data.username,
      email: data.email,
      password: data.password,
      salt: data.salt,
    });

    await this.usersRepository.save(user);

    return user;
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
