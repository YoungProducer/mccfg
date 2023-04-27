import {
  Controller,
  Post,
  HttpCode,
  Body,
  Param,
  ParseIntPipe,
  ParseBoolPipe,
  DefaultValuePipe,
  Get,
  Query,
} from '@nestjs/common';
import { ModsService } from './mods.service';
import { ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateModDto } from './dto/create-mod.dto';
import { CreateModVersionDto } from './dto/create-mod-version.dto';
import { ModDto } from './dto/mod.dto';
import { ModVersionDto, ModVersionPopulatedDto } from './dto/mod-version.dto';
import { plainToInstance } from 'class-transformer';
import { GetAllModsQueryDto } from './dto/get-all-mods-query.dto';
import { GetModQueryDto } from './dto/get-mod-query.dto';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Mods')
@Controller('mods')
export class ModsController {
  constructor(private modsService: ModsService) {}

  @Public()
  @Post()
  @HttpCode(201)
  async createMod(@Body() modDto: CreateModDto): Promise<void> {
    await this.modsService.create(modDto);
  }

  @Public()
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

  @Public()
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
    @Query('versions', new DefaultValuePipe(false), ParseBoolPipe)
    versions = false,
  ): Promise<ModDto[]> {
    const res = await this.modsService.getAll({
      populate: {
        versions,
      },
    });

    return res.map((entity) => plainToInstance(ModDto, entity));
  }

  @Public()
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
    @Param('id', ParseIntPipe) id: number,
    @Query('versions', new DefaultValuePipe(false), ParseBoolPipe)
    versions = false,
  ): Promise<ModDto> {
    const res = await this.modsService.findMod(id, {
      populate: {
        versions,
      },
    });

    return plainToInstance(ModDto, res);
  }

  @Public()
  @Get(':id/versions')
  @HttpCode(200)
  @ApiParam({
    name: 'id',
    type: Number,
  })
  @ApiResponse({
    type: ModVersionDto,
    isArray: true,
  })
  async getAllModVersions(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ModVersionDto[]> {
    const res = await this.modsService.getAllModVersions(id);

    return res.map((entity) => plainToInstance(ModVersionDto, entity));
  }

  @Public()
  @Get('versions/:versionId')
  @HttpCode(200)
  @ApiParam({
    name: 'versionId',
    type: Number,
  })
  @ApiResponse({
    type: ModVersionPopulatedDto,
  })
  async getModVersion(
    @Param('versionId', ParseIntPipe) modVersionId: number,
  ): Promise<ModVersionPopulatedDto> {
    const res = await this.modsService.findModVersion(modVersionId);
    return plainToInstance(ModVersionPopulatedDto, res);
  }
}
