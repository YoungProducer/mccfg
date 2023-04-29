import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import _difference from 'lodash/difference';

import { ConfigEntity } from './entities/config.entity';
import { CreateConfigPayload } from './interfaces/create-config.interface';
import { UsersService } from '../users/users.service';
import { configServiceErrorMessages } from './constants/error-messages';
import { ModsService } from '../mods/mods.service';
import { FindConfigOptionsInterface } from './interfaces/find-config.interface';
import { DI_CONFIG } from 'server/config/constants';
import { EnvConfig } from 'server/config/interfaces';
import { join } from 'path';
import { createReadStream } from 'fs';
import { GetConfigFileResponse } from './interfaces/get-config-file.response.interface';

@Injectable()
export class ConfigsService {
  constructor(
    private readonly usersService: UsersService,

    private readonly modsService: ModsService,

    @Inject(DI_CONFIG)
    private readonly config: EnvConfig,

    @InjectRepository(ConfigEntity)
    private readonly configsRepository: Repository<ConfigEntity>,
  ) {}

  public async create(payload: CreateConfigPayload): Promise<void> {
    const owner = await this.usersService.findOneById(payload.ownerId);

    if (!owner) {
      throw new NotFoundException(
        configServiceErrorMessages.userNotFoundErr(payload.ownerId),
      );
    }

    const primaryMod = await this.modsService.findModVersion(
      payload.primaryModId,
    );

    if (!primaryMod) {
      throw new NotFoundException(
        configServiceErrorMessages.primaryModNotFoundErr(payload.primaryModId),
      );
    }

    const dependencies = await this.modsService.findAllModVersionsById(
      payload.dependenciesIds,
    );

    const diff = _difference(
      payload.dependenciesIds,
      dependencies.map((el) => el.id),
    );

    if (diff.length > 0) {
      throw new NotFoundException(
        configServiceErrorMessages.dependenciesNotFoundErr(diff.join(', ')),
      );
    }

    const userUploads = this.usersService.getUserUploadsPath(owner);

    const fullPath = join(userUploads, 'configs', payload.fileName);

    const entityToCreate = this.configsRepository.create({
      owner,
      primaryMod,
      dependencies,
      fullPath,
      fileName: payload.fileName,
      initialFileName: payload.initialFileName,
      version: payload.version,
    });

    await this.configsRepository.save(entityToCreate);
  }

  public async findOneById(
    id: number,
    options?: FindConfigOptionsInterface,
  ): Promise<ConfigEntity> {
    return await this.configsRepository.findOne({
      where: { id },
      relations: options?.populate,
    });
  }

  public async getAll(): Promise<ConfigEntity[]> {
    return await this.configsRepository.find();
  }

  public async getConfigFile(userId: number): Promise<GetConfigFileResponse> {
    const res = await this.findOneById(userId, {
      populate: {
        owner: true,
      },
    });

    const owner = res.owner;

    const uploadsDir = this.config.FILE_UPLOAD_DIR;

    const filePath = join(
      process.cwd(),
      uploadsDir,
      owner.username,
      'configs',
      res.fileName,
    );

    const file = createReadStream(filePath);

    return {
      file,
      fileName: res.initialFileName,
    };
  }
}
