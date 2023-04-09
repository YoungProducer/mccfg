import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ModVersionEntity } from './mod-version.entity';

@Entity('mods')
export class ModEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('varchar', {
    length: 255,
    unique: true,
  })
  name!: string;

  @OneToMany(() => ModVersionEntity, (version) => version.mod, {
    cascade: ['insert', 'update'],
  })
  versions!: ModVersionEntity[];
}
