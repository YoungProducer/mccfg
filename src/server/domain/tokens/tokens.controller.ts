import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { TokensService } from './tokens.service';
import { RefreshReponseDto } from './dto/refresh-response.dto';
import { RefreshDto } from './dto/refresh.dto';
import { plainToInstance } from 'class-transformer';

@ApiTags('Tokens')
@Controller('tokens')
export class TokensController {
  constructor(private tokensService: TokensService) {}

  @Post()
  @HttpCode(200)
  @ApiResponse({
    type: RefreshReponseDto,
  })
  async refresh(@Body() payload: RefreshDto): Promise<RefreshReponseDto> {
    const [accessToken, refreshToken] = await this.tokensService.refresh(
      payload.refreshToken,
    );

    return plainToInstance(RefreshReponseDto, { accessToken, refreshToken });
  }
}
