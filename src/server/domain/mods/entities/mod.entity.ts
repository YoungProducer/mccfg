import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ConfigEntity } from '../../config/entities/config.entity';

@Entity('mods')
export class ModEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('varchar', { length: 255 })
  name!: string;

  @OneToMany(() => ConfigEntity, (config) => config.primaryMod)
  config!: ConfigEntity[];
}
