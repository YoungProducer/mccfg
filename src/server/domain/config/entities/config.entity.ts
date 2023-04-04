import {
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { ModEntity } from '../../mods/entities/mod.entity';

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

  @ManyToOne(() => UserEntity, (user) => user.configs, {
    cascade: true,
  })
  owner: UserEntity;

  @ManyToOne(() => ModEntity, (mod) => mod.config)
  primaryMod!: ModEntity;

  @ManyToMany(() => ModEntity)
  dependecies!: ModEntity[];
}
