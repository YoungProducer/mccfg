import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class MCVersionEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('varchar', { unique: true, length: 100 })
  version!: string;
}
