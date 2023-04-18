import {
  Controller,
  HttpCode,
  Get,
  Body,
  Post,
  Param,
  UseGuards,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import {
  ApiTags,
  ApiOkResponse,
  ApiParam,
  ApiBearerAuth,
  ApiHeaders,
} from '@nestjs/swagger';

import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserDto } from './dto/user.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRoles } from './entities/user.entity';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Users')
@UseGuards(RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  @HttpCode(201)
  @Roles(UserRoles.ADMIN)
  @ApiBearerAuth('JWT token')
  @ApiHeaders([
    {
      name: 'Authorization',
    },
  ])
  async createUser(@Body() body: CreateUserDto): Promise<void> {
    await this.usersService.create(body);
  }

  @Public()
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

  @Public()
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
