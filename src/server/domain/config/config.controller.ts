import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiHeaders, ApiTags } from '@nestjs/swagger';
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

    await this.configsService.create({
      fileName,
      initialFileName,
      version: dto.version,
      primaryModId: dto.primaryModId,
      ownerId: dto.ownerId,
      dependenciesIds: dto.dependenciesIds,
    });
  }
}
