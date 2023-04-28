import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiHeaders,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Req } from '@nestjs/common';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import { extname } from 'path';
import { UserDto } from '../users/dto/user.dto';
import { CreateConfigDto } from './dto/create-config.dto';
import { ConfigsService } from './config.service';
import { RemoveFileOnFailureInterceptor } from 'server/lib/interceptors/remove-file-on-failure/remove-file-on-failure.interceptor';
import { ConfigDto, ConfigPopulatedDto } from './dto/config.dto';
import { plainToInstance } from 'class-transformer';
import { Public } from '../auth/decorators/public.decorator';
import { GetConfigQueryDto } from './dto/get-config-query.dto';

@ApiTags('Configs')
@Controller('configs')
export class ConfigsController {
  constructor(private readonly configsService: ConfigsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('config', {
      storage: diskStorage({
        destination: (req, _file, callback) => {
          const user: UserDto = req['user'];

          // works only because we create a dir for user when creating a user
          const uploadsDir =
            process.env.NODE_ENV === 'test' ? 'test-uploads' : 'uploads';

          const fullPath = `${uploadsDir}/${user.username}/configs`;

          callback(null, fullPath);
        },
        filename: (req, file, cb) => {
          const randFileName = randomStringGenerator();

          const fileName = `${randFileName}${extname(file.originalname)}`;

          req['fileName'] = fileName;

          cb(null, fileName);
        },
      }),
    }),
    RemoveFileOnFailureInterceptor,
  )
  @ApiBody({
    type: CreateConfigDto,
  })
  @ApiBearerAuth('JWT token')
  @ApiHeaders([
    {
      name: 'Authorization',
    },
  ])
  async createConfig(
    @Req() request: Request,
    @Body() dto: CreateConfigDto,
    @UploadedFile() config: Express.Multer.File,
  ): Promise<void> {
    const fileName: string = request['fileName'];
    const initialFileName: string = config.originalname;
    const user: UserDto = request['user'];
    const ownerId = user.id;

    await this.configsService.create({
      fileName,
      initialFileName,
      version: dto.version,
      primaryModId: dto.primaryModId,
      ownerId,
      dependenciesIds: dto.dependenciesIds,
    });
  }

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    type: ConfigDto,
    isArray: true,
  })
  async getAllConfigs(): Promise<ConfigDto[]> {
    const res = await this.configsService.getAll();

    return res.map((e) => plainToInstance(ConfigDto, e));
  }

  @Public()
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({
    name: 'id',
    type: Number,
  })
  @ApiQuery({
    type: GetConfigQueryDto,
  })
  @ApiResponse({
    type: ConfigPopulatedDto,
  })
  async getConfig(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: GetConfigQueryDto,
  ): Promise<ConfigPopulatedDto> {
    const res = await this.configsService.findOneById(id, {
      populate: query,
    });

    return plainToInstance(ConfigPopulatedDto, res);
  }
}
