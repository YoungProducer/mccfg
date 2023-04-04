import { Controller, HttpCode, Get, Body, Post } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { ApiTags, ApiOkResponse } from '@nestjs/swagger';

import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserDto } from './dto/user.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  @HttpCode(201)
  async createUser(@Body() body: CreateUserDto): Promise<void> {
    await this.usersService.create(body);
  }

  @Get()
  @HttpCode(200)
  @ApiOkResponse({
    type: UserDto,
    isArray: true,
  })
  async getAll(): Promise<UserDto[]> {
    const users = await this.usersService.findAll();

    return users.map((user) => plainToClass(UserDto, user));
  }
}
