import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ConfigEntity } from '../../config/entities/config.entity';
import { ConfirmationTokenEntity } from './confirmation-token.entity';

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
  salt!: string;

  @Column('varchar', {
    length: 255,
    nullable: false,
  })
  hash!: string;

  @Column('boolean', { default: false })
  verified!: boolean;

  @OneToMany(() => ConfigEntity, (config) => config.owner, {
    cascade: true,
  })
  configs!: ConfigEntity[];

  @OneToOne(() => ConfirmationTokenEntity, (token) => token.user, {
    cascade: true,
    nullable: true,
  })
  @JoinColumn()
  confirmationToken: ConfirmationTokenEntity;
}
