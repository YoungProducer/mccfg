import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ModEntity } from './mod.entity';
import { MCVersionEntity } from 'server/domain/mcversion/entities/mc-version.entity';
import { ConfigEntity } from 'server/domain/config/entities/config.entity';

@Entity('mod_versions')
export class ModVersionEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('varchar', { length: 100 })
  version!: string;

  @ManyToMany(() => MCVersionEntity)
  @JoinTable()
  compatibleMCVersions: MCVersionEntity[];

  @ManyToOne(() => ModEntity, (mod) => mod.versions, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  mod: ModEntity;

  @OneToMany(() => ConfigEntity, (config) => config.primaryMod)
  configs!: ConfigEntity[];
}
