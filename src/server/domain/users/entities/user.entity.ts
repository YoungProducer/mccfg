import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ConfigEntity } from '../../config/entities/config.entity';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('varchar', {
    length: 255,
    unique: true,
  })
  username!: string;

  @Column('varchar', {
    length: 255,
    unique: true,
  })
  email!: string;

  @Column('varchar', {
    length: 255,
  })
  password!: string;

  @Column('varchar', {
    length: 255,
  })
  salt!: string;

  @OneToMany(() => ConfigEntity, (config) => config.owner, {
    cascade: true,
  })
  configs!: ConfigEntity[];
}
