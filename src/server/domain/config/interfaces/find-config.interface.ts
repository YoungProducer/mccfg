import { FindOptionsRelations } from 'typeorm';
import { ConfigEntity } from '../entities/config.entity';

export type FindConfigOptionsInterface = {
  populate?: FindOptionsRelations<ConfigEntity>;
};
