import {
  Controller,
  Post,
  HttpCode,
  Body,
  Param,
  ParseIntPipe,
  Get,
  Query,
} from '@nestjs/common';
import { ModsService } from './mods.service';
import { ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateModDto } from './dto/create-mod.dto';
import { CreateModVersionDto } from './dto/create-mod-version.dto';
import { ParseBoolPipe } from 'server/lib/pipes/parse-bool-pipe';
import { ModDto } from './dto/mod.dto';
import {
  GetAllModVersionsResponseDto,
  GetModVersionResponseDto,
} from './dto/mod-version.dto';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { GetAllModsQueryDto } from './dto/get-all-mods-query.dto';
import { GetModQueryDto } from './dto/get-mod-query.dto';

@ApiTags('Mods')
@Controller('mods')
export class ModsController {
  constructor(private modsService: ModsService) {}

  @Post()
  @HttpCode(201)
  async createMod(@Body() modDto: CreateModDto): Promise<void> {
    await this.modsService.create(modDto);
  }

  @Post(':id/versions')
  @HttpCode(201)
  @ApiParam({
    name: 'id',
    type: Number,
    required: true,
  })
  async createModVersion(
    @Body() modVersionDto: CreateModVersionDto,
    @Param('id', new ParseIntPipe()) id: number,
  ): Promise<void> {
    await this.modsService.createModVersion({
      modId: id,
      version: modVersionDto.version,
      compatibleMCVersion: modVersionDto.compatibleMCVersions,
    });
  }

  @Get()
  @HttpCode(200)
  @ApiQuery({
    type: GetAllModsQueryDto,
    required: false,
  })
  @ApiResponse({
    type: ModDto,
    isArray: true,
  })
  async getAllMods(
    @Query(
      'versions',
      new ParseBoolPipe({
        optional: true,
        defaultValue: false,
      }),
    )
    versions = false,
  ): Promise<ModDto[]> {
    const res = await this.modsService.getAll({
      populate: {
        versions,
      },
    });

    return res.map(
      (entity) => instanceToPlain(plainToInstance(ModDto, entity)) as ModDto,
    );
  }

  @Get(':id')
  @HttpCode(200)
  @ApiParam({
    name: 'id',
    type: Number,
  })
  @ApiQuery({
    type: GetModQueryDto,
    required: false,
  })
  @ApiResponse({
    type: ModDto,
  })
  async getMod(
    @Param('id', new ParseIntPipe()) id: number,
    @Query(
      'versions',
      new ParseBoolPipe({
        optional: true,
        defaultValue: false,
      }),
    )
    versions = false,
  ): Promise<ModDto> {
    const res = await this.modsService.findMod(id, {
      populate: {
        versions,
      },
    });

    return instanceToPlain(plainToInstance(ModDto, res)) as ModDto;
  }

  @Get(':id/versions')
  @HttpCode(200)
  @ApiParam({
    name: 'id',
    type: Number,
  })
  @ApiResponse({
    type: GetAllModVersionsResponseDto,
    isArray: true,
  })
  async getAllModVersions(
    @Param('id', new ParseIntPipe()) id: number,
  ): Promise<GetAllModVersionsResponseDto[]> {
    const res = await this.modsService.getAllModVersions(id);

    return res.map(
      (entity) =>
        instanceToPlain(
          plainToInstance(GetAllModVersionsResponseDto, entity),
        ) as GetAllModVersionsResponseDto,
    );
  }

  @Get('versions/:versionId')
  @HttpCode(200)
  @ApiParam({
    name: 'versionId',
    type: Number,
  })
  @ApiResponse({
    type: GetModVersionResponseDto,
  })
  async getModVersion(
    @Param('versionId', new ParseIntPipe()) modVersionId: number,
  ): Promise<GetModVersionResponseDto> {
    const res = await this.modsService.findModVersion(modVersionId);
    return instanceToPlain(
      plainToInstance(GetModVersionResponseDto, res),
    ) as GetModVersionResponseDto;
  }
}
