import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { ModVersionEntity } from 'server/domain/mods/entities/mod-version.entity';

@Entity('configs')
export class ConfigEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('varchar', {
    length: 255,
  })
  fileName!: string;

  @Column('varchar', {
    length: 100,
  })
  version!: string;

  @ManyToOne(() => UserEntity, (user) => user.configs)
  owner: UserEntity;

  @ManyToOne(() => ModVersionEntity, (mod) => mod.configs)
  primaryMod!: ModVersionEntity;

  @ManyToMany(() => ModVersionEntity)
  @JoinTable()
  dependecies!: ModVersionEntity[];
}
