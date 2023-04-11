import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('confirmation_tokens')
export class ConfirmationTokenEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('varchar', { length: 255 })
  token!: string;

  @Column({
    type: 'timestamptz',
    precision: 3,
  })
  expirationDate: Date;

  @OneToOne(() => UserEntity, (user) => user.confirmationToken, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  user!: UserEntity;
}
