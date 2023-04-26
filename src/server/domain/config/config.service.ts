import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import _difference from 'lodash/difference';

import { ConfigEntity } from './entities/config.entity';
import { CreateConfigPayload } from './interfaces/create-config.interface';
import { UsersService } from '../users/users.service';
import { configServiceErrorMessages } from './constants/error-messages';
import { ModsService } from '../mods/mods.service';
import { FindConfigOptionsInterface } from './interfaces/find-config.interface';

@Injectable()
export class ConfigsService {
  constructor(
    private readonly usersService: UsersService,

    private readonly modsService: ModsService,

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

    const entityToCreate = this.configsRepository.create({
      owner,
      primaryMod,
      dependencies,
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
}
