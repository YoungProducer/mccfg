import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MCVersionEntity } from './entities/mc-version.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MCVersionService {
  constructor(
    @InjectRepository(MCVersionEntity)
    private mcVersionsRepository: Repository<MCVersionEntity>,
  ) {}

  public async create(version: string): Promise<MCVersionEntity> {
    const exsistingVersion = await this.find(version);

    if (exsistingVersion) {
      throw new ConflictException(
        `Minecraft with version ${version} already exist.`,
      );
    }

    const entity = this.mcVersionsRepository.create({
      version,
    });

    return await this.mcVersionsRepository.save(entity);
  }

  public async find(version: string): Promise<MCVersionEntity> {
    return await this.mcVersionsRepository.findOne({
      where: {
        version,
      },
    });
  }

  public async findAll(): Promise<MCVersionEntity[]> {
    return await this.mcVersionsRepository.find();
  }
}
