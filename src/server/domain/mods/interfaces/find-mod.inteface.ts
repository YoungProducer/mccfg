import { FindOptionsRelations } from 'typeorm';
import { ModEntity } from '../entities/mod.entity';

export interface FindModOptionsInterface {
  populate?: FindOptionsRelations<ModEntity>;
}
