import { Controller, Inject, Body, Post, HttpCode } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { plainToInstance } from 'class-transformer';
import { SignUpResponseDto } from './dto/sign-up-response.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(@Inject(AuthService) private authService: AuthService) {}

  @Post('/sign-up')
  @HttpCode(200)
  @ApiBody({
    type: SignUpDto,
  })
  async signUp(@Body() body: SignUpDto): Promise<SignUpResponseDto> {
    const user = await this.authService.signUp(body);

    return plainToInstance(SignUpResponseDto, { user });
  }
}
