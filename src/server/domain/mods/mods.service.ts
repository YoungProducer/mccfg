import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ModEntity } from './entities/mod.entity';
import { Repository } from 'typeorm';
import { ModVersionEntity } from './entities/mod-version.entity';
import { CreateModVersionPayload } from './interfaces/create-mod-version.interface';
import { MCVersionEntity } from '../mcversion/entities/mc-version.entity';
import { CreateModPayload } from './interfaces/create-mod.interface';
import { MCVersionService } from '../mcversion/mcversion.service';
import { FindModOptionsInterface } from './interfaces/find-mod.inteface';
import { modErrorMessages } from './constants/error-messages';

@Injectable()
export class ModsService {
  constructor(
    private mcVersionService: MCVersionService,

    @InjectRepository(ModEntity)
    private modsRepository: Repository<ModEntity>,

    @InjectRepository(ModVersionEntity)
    private modVersionsRepository: Repository<ModVersionEntity>,

    @InjectRepository(MCVersionEntity)
    private mcVersionsRepository: Repository<MCVersionEntity>,
  ) {}

  public async create(payload: CreateModPayload): Promise<void> {
    // check for duplicates
    const existingModEntity = await this.findModByName(payload.name);

    if (existingModEntity) {
      throw new ConflictException(
        modErrorMessages.getModNameExistErr(payload.name),
      );
    }

    const modEntity = this.modsRepository.create({
      name: payload.name,
      versions: [],
    });

    await this.modsRepository.save(modEntity);
  }

  public async createModVersion(
    payload: CreateModVersionPayload,
  ): Promise<void> {
    // check for mod versions duplicate
    const existingModVersion = await this.findModVersionByVersion(
      payload.version,
    );

    if (existingModVersion) {
      throw new ConflictException(
        modErrorMessages.getModVersionExistErr(payload.version),
      );
    }

    // we will reuse this variable for creating of mod version entity
    let mcVersionsEntities: MCVersionEntity[] = [];

    if (Array.isArray(payload.compatibleMCVersion)) {
      // find all minecraft versions based on payload data
      mcVersionsEntities = await this.mcVersionsRepository
        .createQueryBuilder()
        .where(`version IN (:...versions)`, {
          versions: payload.compatibleMCVersion,
        })
        .getMany();

      // if number of found minecraft versions entities doesn't equal
      // to the number of versions given in payload
      // that means that some of given versions don't exist
      if (mcVersionsEntities.length !== payload.compatibleMCVersion.length) {
        const compatibleVersionsCopy = [...payload.compatibleMCVersion];

        // go through entities that we got from database
        // and remove those versions from given array of versions
        mcVersionsEntities.forEach((entity) => {
          const index = compatibleVersionsCopy.indexOf(entity.version);

          if (index === -1) {
            return;
          }

          compatibleVersionsCopy[index] = undefined;
        });

        // filter and create a string of versions that don't exist
        const notFoundVersionsString = compatibleVersionsCopy
          .filter(Boolean)
          .join(', ');

        throw new NotFoundException(
          modErrorMessages.getMultipleMCVersionsNotExistErr(
            notFoundVersionsString,
          ),
        );
      }
    }

    if (!Array.isArray(payload.compatibleMCVersion)) {
      // check whether given minecraft version exist or not
      const mcVersionEntity = await this.mcVersionService.find(
        payload.compatibleMCVersion,
      );

      if (!mcVersionEntity) {
        throw new NotFoundException(
          modErrorMessages.getMCVersionNotExistErr(payload.compatibleMCVersion),
        );
      }

      mcVersionsEntities = [mcVersionEntity];
    }

    // check if mod with given id exist
    const modEntity = await this.findMod(payload.modId, {
      populate: {
        versions: true,
      },
    });

    if (!modEntity) {
      throw new NotFoundException(
        modErrorMessages.getModIdNotExistErr(payload.modId),
      );
    }

    // create a new mod version
    const newModVersionEntity = this.modVersionsRepository.create({
      version: payload.version,
      compatibleMCVersions: mcVersionsEntities,
      mod: modEntity,
    });

    await this.modVersionsRepository.save(newModVersionEntity);
  }

  public async getAll(options?: FindModOptionsInterface): Promise<ModEntity[]> {
    return await this.modsRepository.find({
      relations: options?.populate,
    });
  }

  public async getAllModVersions(modId: number): Promise<ModVersionEntity[]> {
    const mod = await this.modsRepository.findOne({
      where: {
        id: modId,
      },
      relations: {
        versions: true,
      },
    });

    return mod.versions;
  }

  public async findModVersion(id: number): Promise<ModVersionEntity> {
    return await this.modVersionsRepository.findOne({
      where: {
        id: id,
      },
    });
  }

  public async findMod(
    id: number,
    options?: FindModOptionsInterface,
  ): Promise<ModEntity> {
    return await this.modsRepository.findOne({
      where: {
        id,
      },
      relations: options.populate,
    });
  }

  private async findModByName(name: string): Promise<ModEntity> {
    return await this.modsRepository.findOne({
      where: {
        name,
      },
    });
  }

  private async findModVersionByVersion(
    version: string,
  ): Promise<ModVersionEntity> {
    return await this.modVersionsRepository.findOne({
      where: {
        version,
      },
    });
  }
}
