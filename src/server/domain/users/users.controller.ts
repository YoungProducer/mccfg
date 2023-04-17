import { Controller, HttpCode, Get, Body, Post, Param } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ApiTags, ApiOkResponse, ApiParam } from '@nestjs/swagger';

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

    return users.map((user): UserDto => plainToInstance(UserDto, user));
  }

  @Post('/verify/:token')
  @HttpCode(200)
  @ApiParam({
    name: 'token',
    type: String,
  })
  async verify(@Param('token') token: string): Promise<void> {
    await this.usersService.verify(token);
  }
}
