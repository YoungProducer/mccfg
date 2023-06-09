import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { MCVersionService } from './mcversion.service';
import { plainToInstance } from 'class-transformer';
import { VersionResponseDto } from './dto/version.response.dto';
import { CreateVersionDto } from './dto/create-version.dto';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('MC Versions')
@Controller('mc-versions')
export class MCVersionController {
  constructor(private mcVersionService: MCVersionService) {}

  @Public()
  @Get()
  @HttpCode(200)
  @ApiOkResponse({
    type: VersionResponseDto,
    isArray: true,
  })
  async getAll(): Promise<VersionResponseDto[]> {
    const versions = await this.mcVersionService.findAll();

    return versions.map((version) =>
      plainToInstance(VersionResponseDto, version),
    );
  }

  @Public()
  @Post()
  @HttpCode(201)
  async createVersion(@Body() versionDto: CreateVersionDto): Promise<void> {
    await this.mcVersionService.create(versionDto.version);
  }
}
