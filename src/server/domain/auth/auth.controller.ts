import { Controller, Body, Post, HttpCode } from '@nestjs/common';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { SignUpResponseDto } from './dto/sign-up-response.dto';
import { SignInDto } from './dto/sign-in.dto';
import { SignInResponseDto } from './dto/sign-in-response.dto';
import { TokensService } from '../tokens/tokens.service';
import { UserDto } from '../users/dto/user.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private tokensService: TokensService,
  ) {}

  @Post('/sign-up')
  @HttpCode(200)
  @ApiBody({
    type: SignUpDto,
  })
  @ApiResponse({
    type: SignUpResponseDto,
  })
  async signUp(@Body() body: SignUpDto): Promise<SignUpResponseDto> {
    const user = await this.authService.signUp(body);

    return plainToInstance(SignUpResponseDto, { user });
  }

  @Post('/sign-in')
  @HttpCode(200)
  @ApiBody({
    type: SignInDto,
  })
  @ApiResponse({
    type: SignInResponseDto,
  })
  async signIn(@Body() body: SignInDto): Promise<SignInResponseDto> {
    const user = await this.authService.verifyCredentianls(body);

    const [accessToken, refreshToken] =
      await this.tokensService.issueTokensPair(<UserDto>instanceToPlain(user));

    const preparedResponse: SignInResponseDto = {
      accessToken,
      refreshToken,
      user,
    };

    return plainToInstance(SignInResponseDto, preparedResponse);
  }
}
